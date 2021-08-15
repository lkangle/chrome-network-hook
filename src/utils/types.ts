export type FileType = 'XHR' | 'JS' | 'CSS' | 'Img' | 'Other';

export const FILE_DATA_MSG = 'FILE_HOOK::file-data';
export const DOM_BEFORE_UNLOAD_MSG = 'FILE_HOOK::DOM_BEFORE_UNLOAD_MSG';
export const SERVICE_URL = 'FILE_HOOK::BACKEND_SERVICE';

export type MarkItemFunc = (item: FileData) => void;
export type RemoveItemFunc = (url: string, item?: FileData) => void;

export const TYPE_MAP = {
  xmlhttprequest: 'XHR',
  script: 'JS',
  stylesheet: 'CSS',
  image: 'Img',
  other: 'Other'
};

export enum FileStatus {
  ORIGIN = 'og',
  REPLACE = 'rp',
  REPLACE_STOP = 'rps',
  BLOCK = 'bk'
}

export interface FileData {
  // 请求发起者，即是当前网站
  readonly initiator: string;
  readonly url: string;
  readonly filename: string;
  readonly method: string;
  type: FileType;
  status?: FileStatus;
  timestamp: number | string;
  // 替换用的url地址
  redirectUrl?: string;
  readonly requestBody?: any;
}

export interface ModelControl {
  show: (item: FileData) => void;
  hide: () => void;
}
