export type FileType = 'XHR' | 'JS' | 'CSS' | 'Img' | 'Other';

export type MarkItemFunc = (
  url: string,
  redirectUrl: string | null,
  status?: FileStatus,
  item?: FileData
) => void;
export type RemoveItemFunc = (url: string, item?: FileData) => void;

export const TYPE_MAP = {
  xmlhttprequest: 'XHR',
  script: 'JS',
  stylesheet: 'CSS',
  image: 'Img',
  font: 'Font',
  other: 'Other'
};

export enum FileStatus {
  ORIGIN,
  REPLACE,
  BLOCK
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
