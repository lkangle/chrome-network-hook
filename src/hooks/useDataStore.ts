import { getStorage, setStorage } from '@/utils';
import {
  FileData,
  FileStatus,
  MarkItemFunc,
  FILE_DATA_MSG,
  RemoveItemFunc,
  DOM_BEFORE_UNLOAD_MSG
} from '@/utils/types';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface ReplaceGroup {
  [key: string]: FileData[];
}

const groupCache: ReplaceGroup = {};

function readReplacesByInitiator(initiator: string): FileData[] {
  let replaces = groupCache[initiator];
  if (!replaces) {
    replaces = groupCache[initiator] = getStorage<FileData[]>(initiator) || [];
  }
  return replaces;
}

function writeReplaceFileData(initiator: string, data: FileData[]) {
  groupCache[initiator] = data;
  setStorage(
    initiator,
    data.map(v => ({
      url: v.url,
      status: v.status,
      redirectUrl: v.redirectUrl
    }))
  );
}

/**
 * 从缓存中获取当前文件的替换文件，如果缓存中没有就从存储中读取，并更新缓存
 * @param file
 */
function findByCacheOrUpdate(file: FileData): FileData {
  const cache = readReplacesByInitiator(file.initiator);
  return cache?.find(v => v.url === file.url);
}

function useDataStore(): [FileData[], MarkItemFunc, RemoveItemFunc] {
  const [fileData, setFileData] = useState<FileData[]>(() => []);
  const [count, setCount] = useState(0);

  // 用于触发组件重新渲染
  const updateCount = () => setCount(prev => prev + 1);

  const receiveMessage = useCallback(message => {
    const msg = message.data || message;
    if (!msg) return;

    switch (msg.type) {
      case FILE_DATA_MSG: {
        if (msg.payload) {
          setFileData(prev => {
            return prev.concat(msg.payload);
          });
        }
        break;
      }
      // 网页卸载之前清空文件列表
      case DOM_BEFORE_UNLOAD_MSG: {
        setFileData([]);
        break;
      }
    }
  }, []);

  useEffect(() => {
    chrome.runtime.onMessage.addListener(receiveMessage);
    window.addEventListener('message', receiveMessage);
    return () => {
      chrome.runtime.onMessage.removeListener(receiveMessage);
      window.removeEventListener('message', receiveMessage);
    };
  }, [receiveMessage]);

  /**
   * 添加一条替换记录，如果存在则会刷新
   *
   * @param initiator 请求发起网站地址
   * @param item 要标记的项目
   */
  function markReplaceItem(initiator: string, item: FileData) {
    const replaces = readReplacesByInitiator(initiator);

    // url是唯一的，可以用来检索
    const idx = replaces.findIndex(v => v.url === item.url);
    if (idx !== -1) {
      const replace = replaces[idx];
      // 若本次item没有redirectUrl可以尝试用上一次的
      const redirectUrl = item.redirectUrl || replace.redirectUrl;
      replaces.splice(idx, 1, { ...item, redirectUrl });
    } else {
      replaces.push(item);
    }

    writeReplaceFileData(initiator, replaces);
    updateCount();
  }

  /**
   * 删除一条替换记录
   *
   * 删除路径为 block -> replace -> empty
   * 如果存在redirect但是状态是block，则第一次删除先降级到replace
   * @param initiator 请求发起网站地址
   * @param url  要删除记录的url
   */
  function removeReplaceItem(initiator: string, url: string) {
    const replaces = readReplacesByInitiator(initiator);
    const idx = replaces.findIndex(v => v.url === url);
    if (idx !== -1) {
      const item = replaces[idx];
      if (item.redirectUrl && item.status === FileStatus.BLOCK) {
        replaces.splice(idx, 1, {
          ...item,
          status: FileStatus.REPLACE
        });
      } else {
        replaces.splice(idx, 1);
      }

      writeReplaceFileData(initiator, replaces);
    }
    updateCount();
  }

  // 在生成合成数据的同时会更新替换数据的缓存
  const combineData = useMemo<FileData[]>(() => {
    return fileData.map(v => {
      const rp = findByCacheOrUpdate(v);
      // 根据替换的文件设置状态
      return Object.assign({}, v, {
        ...rp,
        status: rp?.status || FileStatus.ORIGIN,
        count
      });
    });
  }, [fileData, count]);

  return [combineData, markReplaceItem, removeReplaceItem];
}

export default useDataStore;
