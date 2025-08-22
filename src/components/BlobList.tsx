import React, { useState, useEffect } from "react";
import {
  ExternalLink,
  Copy,
  FileText,
  Calendar,
  User,
  Download,
  Trash2,
  RefreshCw,
} from "lucide-react";
import {
  useSignAndExecuteTransaction,
  useCurrentAccount,
} from "@mysten/dapp-kit";
import { blobStorage } from "../utils/blobStorage";
import {
  queryUserBlobs,
  extractBlobInfo,
  deleteBlobFromChain,
  checkBlobDeletable,
} from "../utils/walrusClient";
import DeleteConfirmation from "./DeleteConfirmation";
import "./BlobList.css";
import { SUI_EXPLORER_URL } from "../utils/config";

export interface BlobItem {
  blobId: string; // 优先使用 Walrus blob_id，备选 Sui 对象 ID
  walrusBlobId?: string; // Walrus 原始 blob_id (u256)
  convertedBlobId?: string; // 转换后的 blob_id ()
  suiObjectId?: string; // Sui 对象 ID
  filename: string;
  size: number;
  createdAt: string;
  owner: string;
  content?: string;
}

interface BlobListProps {
  isOpen: boolean;
  onClose: () => void;
  currentAccount?: string;
}

const BlobList: React.FC<BlobListProps> = ({
  isOpen,
  onClose,
  currentAccount,
}) => {
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();
  const connectedAccount = useCurrentAccount();
  const [blobs, setBlobs] = useState<BlobItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBlob, setSelectedBlob] = useState<BlobItem | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    blob: BlobItem | null;
  }>({
    isOpen: false,
    blob: null,
  });
  const [deletingBlob, setDeletingBlob] = useState<{
    isDeleting: boolean;
    blobId: string | null;
    error: string | null;
  }>({
    isDeleting: false,
    blobId: null,
    error: null,
  });

  useEffect(() => {
    if (isOpen) {
      // 重置状态
      setError(null);
      setSelectedBlob(null);

      if (currentAccount) {
        loadBlobs();
      } else {
        setLoading(false);
        setError("请先连接钱包");
        setBlobs([]);
      }
    }
  }, [isOpen, currentAccount]);

  const loadBlobs = async () => {
    setLoading(true);
    setError(null);
    setBlobs([]); // 清空当前列表，显示加载状态

    try {
      if (!currentAccount) {
        setError("请先连接钱包");
        return;
      }

      console.log("Loading blobs for address:", currentAccount);

      // 查询链上的 Blob 对象
      const blobObjects = await queryUserBlobs(currentAccount, "mainnet");
      console.log("Found blob objects from chain:", blobObjects);

      // 提取 Blob 信息
      const chainBlobs = blobObjects
        .map(extractBlobInfo)
        .filter((blob) => blob !== null) as BlobItem[];

      console.log("Extracted blob info:", chainBlobs);

      // 暂时只显示链上数据，不合并本地数据
      console.log("Chain blobs count:", chainBlobs.length);

      // 按创建时间排序
      const sortedBlobs = chainBlobs.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      console.log("Final sorted blobs:", sortedBlobs);
      setBlobs(sortedBlobs);

      // 将链上数据保存到本地存储
      chainBlobs.forEach((blob) => {
        blobStorage.saveBlob(blob);
      });

      // 显示结果统计
      if (chainBlobs.length > 0) {
        console.log(`✅ 成功加载 ${chainBlobs.length} 个链上文档`);
      } else {
        console.log("ℹ️ 当前用户在链上没有 Blob 文档");
      }
    } catch (err) {
      console.error("Failed to load blobs from chain:", err);
      setError(`加载失败: ${err instanceof Error ? err.message : "未知错误"}`);

      // 如果链上查询失败，显示空列表
      console.log("❗ 链上查询失败，显示空列表");
      setBlobs([]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // 可以添加一个临时的成功提示
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const shortenAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const shortenBlobId = (blobId: string): string => {
    return `${blobId.slice(0, 10)}...${blobId.slice(-10)}`;
  };

  const openInWalruscan = (blobId: string) => {
    window.open(`https://walruscan.com/mainnet/blob/${blobId}`, "_blank");
  };

  const downloadBlob = (blob: BlobItem) => {
    if (!blob.content) return;

    const blobData = new Blob([blob.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blobData);
    const a = document.createElement("a");
    a.href = url;
    a.download = blob.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const showDeleteConfirmation = (blob: BlobItem) => {
    setDeleteConfirmation({
      isOpen: true,
      blob,
    });
  };

  const hideDeleteConfirmation = () => {
    setDeleteConfirmation({
      isOpen: false,
      blob: null,
    });
  };

  const confirmDelete = async () => {
    const { blob } = deleteConfirmation;
    if (!blob || !connectedAccount) return;

    // 开始删除流程
    setDeletingBlob({
      isDeleting: true,
      blobId: blob.blobId,
      error: null,
    });

    try {
      // 检查 blob 是否可删除
      const isDeletable = await checkBlobDeletable(
        blob.suiObjectId || blob.blobId,
        "mainnet"
      );

      if (!isDeletable) {
        throw new Error("该文档不支持链上删除，或您没有删除权限");
      }

      // 使用 dapp-kit 的签名方法执行删除
      const deleteResult = await deleteBlobFromChain(
        blob.suiObjectId || blob.blobId,
        signAndExecuteTransaction,
        connectedAccount.address,
        "mainnet"
      );

      if (!deleteResult.success) {
        throw new Error(deleteResult.error || "删除失败");
      }

      // 从本地存储中删除
      blobStorage.deleteBlob(blob.blobId);
      // 从当前列表中移除
      setBlobs(blobs.filter((b) => b.blobId !== blob.blobId));

      // 显示删除成功提示
      console.log(`✅ 文档 "${blob.filename}" 已从链上永久删除`);
      console.log(`📝 交易哈希: ${deleteResult.transactionDigest}`);

      // 关闭确认对话框
      hideDeleteConfirmation();
    } catch (error) {
      console.error("❌ 删除失败:", error);
      setDeletingBlob({
        isDeleting: false,
        blobId: null,
        error: error instanceof Error ? error.message : "删除失败",
      });
    } finally {
      setDeletingBlob({
        isDeleting: false,
        blobId: null,
        error: null,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="blob-list-overlay">
      <div className="blob-list-modal">
        <div className="blob-list-header">
          <h2>我的文档列表</h2>
          <div className="blob-list-header-actions">
            <button
              className="blob-list-refresh-btn"
              onClick={loadBlobs}
              title="刷新列表"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? "spinning" : ""} />
            </button>
            <button className="blob-list-close" onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        <div className="blob-list-content">
          {loading && (
            <div className="blob-list-loading">
              <div className="loading-spinner"></div>
              <p>正在加载文档列表...</p>
            </div>
          )}

          {error && (
            <div className="blob-list-error">
              <p>❌ {error}</p>
              <button onClick={loadBlobs}>重试</button>
            </div>
          )}

          {!loading && !error && blobs.length === 0 && currentAccount && (
            <div className="blob-list-empty">
              <FileText size={48} />
              <p>还没有找到保存的文档</p>
              <p>在链上没有找到属于当前钱包的 Blob 文档</p>
              <p>保存第一个文档后，它将出现在这里</p>
            </div>
          )}

          {!loading && !error && !currentAccount && (
            <div className="blob-list-empty">
              <FileText size={48} />
              <p>请先连接钱包</p>
              <p>连接钱包后即可查看您的文档列表</p>
            </div>
          )}

          {!loading && !error && blobs.length > 0 && (
            <div className="blob-list-items">
              {blobs.map((blob) => (
                <div key={blob.blobId} className="blob-list-item">
                  <div className="blob-item-header">
                    <div className="blob-item-title">
                      <FileText size={16} />
                      <span className="blob-filename">{blob.filename}</span>
                    </div>
                    <div className="blob-item-actions">
                      <button
                        className="blob-action-btn"
                        onClick={() =>
                          copyToClipboard(
                            blob.convertedBlobId ||
                              blob.walrusBlobId ||
                              blob.blobId
                          )
                        }
                        title="复制 Blob ID (优先 URL-safe Base64)"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        className="blob-action-btn"
                        onClick={() =>
                          openInWalruscan(
                            blob.convertedBlobId ||
                              blob.walrusBlobId ||
                              blob.blobId
                          )
                        }
                        title="在 Walruscan 中查看 (优先 URL-safe Base64)"
                      >
                        <ExternalLink size={14} />
                      </button>
                      <button
                        className="blob-action-btn"
                        onClick={() => downloadBlob(blob)}
                        title="下载文档"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        className="blob-action-btn delete-btn"
                        onClick={() => showDeleteConfirmation(blob)}
                        title="从链上永久删除文档（不可恢复）"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="blob-item-details">
                    {blob.convertedBlobId && (
                      <div className="blob-detail-row">
                        <span className="blob-detail-label">
                          Field Blob ID:
                        </span>
                        <code className="blob-detail-value">
                          {shortenBlobId(blob.convertedBlobId)}
                        </code>
                      </div>
                    )}
                    {blob.walrusBlobId && (
                      <div className="blob-detail-row">
                        <span className="blob-detail-label">
                          Decimal Blob ID:
                        </span>
                        <code className="blob-detail-value">
                          {shortenBlobId(blob.walrusBlobId)}
                        </code>
                      </div>
                    )}
                    {blob.suiObjectId && (
                      <div className="blob-detail-row">
                        <span className="blob-detail-label">
                          Sui Object ID:
                        </span>
                        <a
                          href={`${SUI_EXPLORER_URL}/object/${blob.suiObjectId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="blob-detail-value"
                        >
                          {shortenBlobId(blob.suiObjectId)}
                        </a>
                      </div>
                    )}
                    <div className="blob-detail-row">
                      <span className="blob-detail-label">大小:</span>
                      <span className="blob-detail-value">
                        {formatFileSize(blob.size)}
                      </span>
                    </div>
                    <div className="blob-detail-row">
                      <span className="blob-detail-label">创建时间:</span>
                      <span className="blob-detail-value">
                        <Calendar size={12} />
                        {formatDate(blob.createdAt)}
                      </span>
                    </div>
                    <div className="blob-detail-row">
                      <span className="blob-detail-label">所有者:</span>
                      <span className="blob-detail-value">
                        <a
                          href={`${SUI_EXPLORER_URL}/address/${blob.owner}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <User size={12} />
                          {shortenAddress(blob.owner)}
                        </a>
                      </span>
                    </div>
                  </div>

                  {selectedBlob?.blobId === blob.blobId && blob.content && (
                    <div className="blob-item-preview">
                      <div className="blob-preview-header">
                        <span>文档预览</span>
                        <button
                          className="blob-preview-close"
                          onClick={() => setSelectedBlob(null)}
                        >
                          ×
                        </button>
                      </div>
                      <div className="blob-preview-content">
                        <pre>{blob.content}</pre>
                      </div>
                    </div>
                  )}

                  {blob.content && (
                    <button
                      className="blob-preview-toggle"
                      onClick={() =>
                        setSelectedBlob(
                          selectedBlob?.blobId === blob.blobId ? null : blob
                        )
                      }
                    >
                      {selectedBlob?.blobId === blob.blobId
                        ? "隐藏预览"
                        : "显示预览"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="blob-list-footer">
          <p>文档存储在 Walrus 分布式网络中，通过 Blob ID 可以永久访问</p>
          <a
            href="https://walruscan.com/mainnet"
            target="_blank"
            rel="noopener noreferrer"
            className="blob-list-walruscan-link"
          >
            在 Walruscan 中查看所有文档
          </a>
        </div>
      </div>

      {/* 删除确认对话框 */}
      <DeleteConfirmation
        isOpen={deleteConfirmation.isOpen}
        blob={deleteConfirmation.blob}
        onConfirm={confirmDelete}
        onCancel={hideDeleteConfirmation}
        formatFileSize={formatFileSize}
        formatDate={formatDate}
        isDeleting={deletingBlob.isDeleting}
        error={deletingBlob.error}
      />
    </div>
  );
};

export default BlobList;
