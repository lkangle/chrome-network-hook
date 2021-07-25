chrome.devtools.panels.create('NetHooks', null, './index.html', panel => {
  let panelWindow: Window = null;
  panel.onShown.addListener(window => {
    if (window) {
      panelWindow = window;
    }
  });

  let tabId = chrome.devtools.inspectedWindow.tabId;
  chrome.webRequest.onBeforeRequest.addListener(
    details => {
      panelWindow?.postMessage('---- panel ----', '*');

      console.log(details.tabId, details.url);
      // return {redirectUrl: ''}
    },
    { tabId, urls: ['<all_urls>'] },
    ['requestBody', 'blocking']
  );
});
