export function evalOnWebsite<R extends string | number>(
  js: string
): Promise<R> {
  return new Promise<R>((resolve, reject) => {
    if (chrome.devtools) {
      try {
        chrome.devtools.inspectedWindow.eval<R>(js, (result, exceptionInfo) => {
          if (exceptionInfo) {
            reject(exceptionInfo);
          } else {
            resolve(result);
          }
        });
      } catch {
        reject(-1);
      }
    } else {
      reject(-1);
    }
  });
}

export function getWebOrigin(): Promise<string> {
  return evalOnWebsite<string>('window.location.origin').catch(_ =>
    Promise.resolve('http://localhost')
  );
}

export function setStorage<D>(key: string, data: D): void {
  key = 'CHF:' + key;
  if (window.localStorage) {
    return window.localStorage.setItem(key, JSON.stringify(data));
  }
}

export function getStorage<R>(key: string): R {
  key = 'CHF:' + key;
  if (window.localStorage) {
    return JSON.parse(window.localStorage.getItem(key));
  }
  return undefined;
}
