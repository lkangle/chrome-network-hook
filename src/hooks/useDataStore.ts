import { getStorage, getWebOrigin, setStorage } from '@/utils';
import {
  FileData,
  FileStatus,
  MarkItemFunc,
  RemoveItemFunc
} from '@/utils/types';
import { useCallback, useEffect, useMemo, useState } from 'react';

async function readFileData(): Promise<FileData[]> {
  const domain = await getWebOrigin();
  return getStorage<FileData[]>(domain);
}

async function writeFileData(data) {
  const domain = await getWebOrigin();
  setStorage(domain, data);
}

function useDataStore(): [FileData[], MarkItemFunc, RemoveItemFunc] {
  const [data, setFileData] = useState<FileData[]>([]);
  const [replace, setReplace] = useState<FileData[]>([]);

  const receiveMessage = useCallback(message => {
    const msg = message.data;
    if (msg) {
      setFileData(prev => {
        return prev.concat(msg);
      });
    }
  }, []);

  useEffect(() => {
    readFileData().then(data => {
      if (data) setReplace(data);
    });
    window.addEventListener('message', receiveMessage);
    return () => {
      window.removeEventListener('message', receiveMessage);
    };
  }, []);

  /**
   * 添加一条替换记录，如果存在则会刷新
   *
   * @param url         要标记的url
   * @param redirectUrl 重定向的地址
   * @param status      标记的状态（没有这是Block）
   */
  function markReplaceItem(
    url: string,
    redirectUrl: string | null,
    status?: FileStatus
  ) {
    setReplace(prev => {
      if (!status) {
        status = redirectUrl ? FileStatus.REPLACE : FileStatus.BLOCK;
      }
      // url是唯一的，可以用来检索
      const idx = prev.findIndex(v => v.url === url);
      if (idx !== -1) {
        const item = prev[idx];
        prev.splice(idx, 1, {
          ...item,
          status,
          redirectUrl: redirectUrl || item.redirectUrl
        });
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
    return data.map(v => {
      const rp = replace.find(rv => rv.url === v.url);
      return Object.assign(rp || v, {
        status: rp?.status || FileStatus.ORIGIN
      });
    });
  }, [data, replace]);

  return [combineData, markReplaceItem, removeReplaceItem];
}

export default useDataStore;
