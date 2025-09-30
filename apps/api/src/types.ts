export interface Context {
  user: {
    id: string;
  };
}

export interface Asset {
  id: string;
  filename: string;
  mime: string;
  size: number;
  sha256?: string;
  status: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface UploadTicket {
  assetId: string;
  storagePath: string;
  uploadUrl: string;
  expiresAt: string;
  nonce: string;
}

export interface DownloadLink {
  url: string;
  expiresAt: string;
}
