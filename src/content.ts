import { DOM_BEFORE_UNLOAD_MSG } from '@/utils/types';

window.addEventListener('beforeunload', () => {
  chrome.runtime.sendMessage({ type: DOM_BEFORE_UNLOAD_MSG });
});
