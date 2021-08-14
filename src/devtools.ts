import { getStorage } from '@/utils';
import { FileData, FileStatus, FILE_DATA_MSG, TYPE_MAP } from '@/utils/types';
import WebRequestBodyDetails = chrome.webRequest.WebRequestBodyDetails;

const typeMap = {
  txt: 'text/plain',
  html: 'text/html',
  css: 'text/css',
  js: 'text/javascript',
  json: 'text/json',
  xml: 'text/xml',
  jpg: 'image/jpeg',
  gif: 'image/gif',
  png: 'image/png',
  webp: 'image/webp'
};

function clearUrl(url: string): string {
  if (url.endsWith('/')) {
    return url.slice(0, -1);
  }
  return url;
}

chrome.devtools.panels.create('NetHook', null, './index.html', panel => {
  let panelWindow: Window = null;
  panel.onShown.addListener(window => {
    if (window) {
      panelWindow = window;
    }
  });

  function createFileData(detail: WebRequestBodyDetails): FileData {
    const type = TYPE_MAP[detail.type] ? TYPE_MAP[detail.type] : 'Other';
    const url = clearUrl(detail.url);
    const idx = url.lastIndexOf('/');
    const filename = url.slice(idx + 1);
    return {
      initiator: detail.initiator,
      url,
      filename,
      method: detail.method,
      type: type,
      timestamp: detail.timeStamp,
      requestBody: detail.requestBody,
      detail
    } as FileData;
  }

  function syncReadLocalFile(fileurl): string {
    const arr = fileurl.split('.');
    const type = arr[arr.length - 1];
    const xhr = new XMLHttpRequest();
    xhr.open('get', fileurl, false);
    xhr.send(null);
    let content: any = xhr.responseText || xhr.responseXML;
    if (!content) {
      return '';
    }
    content = encodeURIComponent(
      type === 'js'
        ? content.replace(/[\u0080-\uffff]/g, function ($0) {
            const str = $0.charCodeAt(0).toString(16);
            return '\\u' + '00000'.substr(0, 4 - str.length) + str;
          })
        : content
    );
    return (
      'data:' + (typeMap[type] || typeMap.txt) + ';charset=utf-8,' + content
    );
  }

  const tabId = chrome.devtools.inspectedWindow.tabId;
  chrome.webRequest.onBeforeRequest.addListener(
    details => {
      // 将当前请求发送给devtool
      panelWindow?.postMessage(
        { type: FILE_DATA_MSG, payload: createFileData(details) },
        '*'
      );

      // 判断是否进行文件替换
      const replaces = getStorage<FileData[]>(details.initiator);
      if (replaces?.length) {
        const replace = replaces.find(v => v.url === details.url);
        if (replace) {
          // 优先阻止请求
          if (replace.status === FileStatus.BLOCK) {
            return { cancel: true };
          }

          let redirectUrl = replace.redirectUrl;
          // 可以直接读取本地文件，路径要以file://开头才会识别本地文件
          if (redirectUrl.startsWith('file://')) {
            redirectUrl = syncReadLocalFile(replace.redirectUrl);
          }
          if (redirectUrl) {
            return { redirectUrl: redirectUrl };
          }
        }
      }
    },
    { tabId, urls: ['<all_urls>'] },
    ['requestBody', 'blocking']
  );
});
