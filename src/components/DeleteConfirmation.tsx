import React from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import type { BlobItem } from "./BlobList";
import "./DeleteConfirmation.css";

interface DeleteConfirmationProps {
  isOpen: boolean;
  blob: BlobItem | null;
  onConfirm: () => void;
  onCancel: () => void;
  formatFileSize: (bytes: number) => string;
  formatDate: (dateString: string) => string;
  isDeleting?: boolean;
  error?: string | null;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  isOpen,
  blob,
  onConfirm,
  onCancel,
  formatFileSize,
  formatDate,
  isDeleting = false,
  error = null,
}) => {
  if (!isOpen || !blob) return null;

  return (
    <div className="delete-confirmation-overlay">
      <div className="delete-confirmation">
        <div className="delete-confirmation-header">
          <Trash2 size={24} className="delete-icon" />
          <h3>从链上永久删除文档</h3>
        </div>

        <div className="warning">
          <div className="warning-header">
            <AlertTriangle size={16} />
            <span>警告：此操作不可撤销！</span>
          </div>
          <p>删除后，该文档将从区块链上永久移除，无法恢复。此操作需要支付少量 gas 费用。</p>
        </div>

        <div className="blob-info">
          <div className="info-row">
            <span>文件名：</span>
            <span className="filename">{blob.filename}</span>
          </div>
          <div className="info-row">
            <span>大小：</span>
            <span>{formatFileSize(blob.size)}</span>
          </div>
          <div className="info-row">
            <span>创建时间：</span>
            <span>{formatDate(blob.createdAt)}</span>
          </div>
          <div className="info-row">
            <span>所有者：</span>
            <span className="owner">
              {blob.owner.slice(0, 6)}...{blob.owner.slice(-4)}
            </span>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="actions">
          <button className="btn btn-cancel" onClick={onCancel} disabled={isDeleting}>
            取消
          </button>
          <button 
            className="btn btn-delete" 
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="loading-spinner-small"></div>
                删除中...
              </>
            ) : (
              <>
                <Trash2 size={14} />
                永久删除
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
