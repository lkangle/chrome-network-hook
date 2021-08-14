import { getStorage, getWebOrigin, setStorage } from '@/utils';
import {
  FileData,
  FileStatus,
  MarkItemFunc,
  FILE_DATA_MSG,
  RemoveItemFunc,
  DOM_BEFORE_UNLOAD_MSG
} from '@/utils/types';
import { useCallback, useEffect, useMemo, useState } from 'react';

async function readFileData(): Promise<FileData[]> {
  const domain = await getWebOrigin();
  return getStorage<FileData[]>(domain);
}

async function writeFileData(data: FileData[]) {
  const domain = await getWebOrigin();
  setStorage(
    domain,
    data.map(v => ({
      url: v.url,
      status: v.status,
      redirectUrl: v.redirectUrl
    }))
  );
}

function useDataStore(): [FileData[], MarkItemFunc, RemoveItemFunc] {
  const [fileData, setFileData] = useState<FileData[]>(() => []);
  const [replaceData, setReplace] = useState<FileData[]>([]);

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
    readFileData().then(data => {
      if (data) setReplace(data);
    });
    chrome.runtime.onMessage.addListener(receiveMessage);
    window.addEventListener('message', receiveMessage);
    return () => {
      chrome.runtime.onMessage.removeListener(receiveMessage);
      window.removeEventListener('message', receiveMessage);
    };
  }, []);

  /**
   * 添加一条替换记录，如果存在则会刷新
   *
   * @param item 要标记的项目
   */
  function markReplaceItem(item: FileData) {
    setReplace(prev => {
      // url是唯一的，可以用来检索
      const idx = prev.findIndex(v => v.url === item.url);
      if (idx !== -1) {
        const replace = prev[idx];
        // 若本次item没有redirectUrl可以尝试用上一次的
        const redirectUrl = item.redirectUrl || replace.redirectUrl;
        prev.splice(idx, 1, { ...item, redirectUrl });
      } else {
        prev.push(item);
      }

      const nd = [...prev];
      writeFileData(nd);
      return nd;
    });
  }

  /**
   * 删除一条替换记录
   *
   * 删除路径为 block -> replace -> empty
   * 如果存在redirect但是状态是block，则第一次删除先降级到replace
   * @param url  要删除记录的url
   */
  function removeReplaceItem(url: string) {
    setReplace(prev => {
      const idx = prev.findIndex(v => v.url === url);
      if (idx !== -1) {
        const item = prev[idx];
        if (item.redirectUrl && item.status === FileStatus.BLOCK) {
          prev.splice(idx, 1, {
            ...item,
            status: FileStatus.REPLACE
          });
        } else {
          prev.splice(idx, 1);
        }
      }

      const nd = [...prev];
      writeFileData(nd);
      return nd;
    });
  }

  // 合成后的数据，结合了替换的文件
  const combineData = useMemo<FileData[]>(() => {
    return fileData.map(v => {
      const rp = replaceData.find(rv => rv.url === v.url);
      // 根据替换的文件设置状态
      return Object.assign({}, v, {
        ...rp,
        status: rp?.status || FileStatus.ORIGIN
      });
    });
  }, [fileData, replaceData]);

  return [combineData, markReplaceItem, removeReplaceItem];
}

export default useDataStore;
