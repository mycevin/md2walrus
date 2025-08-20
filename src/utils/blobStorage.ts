import type { BlobItem } from "../components/BlobList";

const STORAGE_KEY = "md2walrus_blobs";

export interface BlobStorageService {
  saveBlob: (blob: BlobItem) => void;
  getBlobs: () => BlobItem[];
  getBlobById: (blobId: string) => BlobItem | null;
  deleteBlob: (blobId: string) => void;
  clearAll: () => void;
}

class LocalBlobStorage implements BlobStorageService {
  private getStorage(): BlobItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to read blob storage:", error);
      return [];
    }
  }

  private setStorage(blobs: BlobItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(blobs));
    } catch (error) {
      console.error("Failed to write blob storage:", error);
    }
  }

  saveBlob(blob: BlobItem): void {
    const blobs = this.getStorage();
    const existingIndex = blobs.findIndex(b => b.blobId === blob.blobId);
    
    if (existingIndex >= 0) {
      // 更新现有记录
      blobs[existingIndex] = { ...blobs[existingIndex], ...blob };
    } else {
      // 添加新记录
      blobs.push(blob);
    }
    
    this.setStorage(blobs);
  }

  getBlobs(): BlobItem[] {
    return this.getStorage().sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getBlobById(blobId: string): BlobItem | null {
    const blobs = this.getStorage();
    return blobs.find(b => b.blobId === blobId) || null;
  }

  deleteBlob(blobId: string): void {
    const blobs = this.getStorage();
    const filteredBlobs = blobs.filter(b => b.blobId !== blobId);
    this.setStorage(filteredBlobs);
  }

  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}

// 创建全局实例
export const blobStorage = new LocalBlobStorage();

// 工具函数
export const createBlobItem = (
  blobId: string,
  filename: string,
  content: string,
  owner: string
): BlobItem => {
  return {
    blobId,
    filename,
    size: new Blob([content]).size,
    createdAt: new Date().toISOString(),
    owner,
    content
  };
};

export const formatBlobId = (blobId: string): string => {
  return `${blobId.slice(0, 8)}...${blobId.slice(-8)}`;
};

export const getWalruscanUrl = (blobId: string, network: 'mainnet' | 'testnet' = 'mainnet'): string => {
  return `https://walruscan.com/${network}/blob/${blobId}`;
};
