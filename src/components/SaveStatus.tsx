import { CheckCircle, AlertCircle, Loader2, X } from "lucide-react";
import type { SaveFlowState } from "../utils/walrusClient";
import "./SaveStatus.css";

interface SaveStatusProps {
  saveState: SaveFlowState;
  onClose: () => void;
}

const SaveStatus = ({ saveState, onClose }: SaveStatusProps) => {
  if (saveState.stage === "idle") {
    return null;
  }

  const getIcon = () => {
    switch (saveState.stage) {
      case "encoding":
      case "registering":
      case "uploading":
      case "certifying":
        return <Loader2 size={20} className="save-status-icon loading" />;
      case "completed":
        return <CheckCircle size={20} className="save-status-icon success" />;
      case "error":
        return <AlertCircle size={20} className="save-status-icon error" />;
      default:
        return null;
    }
  };

  const getStatusClass = () => {
    switch (saveState.stage) {
      case "completed":
        return "success";
      case "error":
        return "error";
      default:
        return "loading";
    }
  };

  const getMessage = () => {
    switch (saveState.stage) {
      case "encoding":
        return "正在编码文件...";
      case "registering":
        return "正在注册到链上...";
      case "uploading":
        return "正在上传到存储节点...";
      case "certifying":
        return "正在认证...";
      case "completed":
        return saveState.blobId
          ? `保存成功！Blob ID: ${saveState.blobId.slice(0, 8)}...`
          : "保存成功！";
      case "error":
        const errorMessage = saveState.error || "未知错误";
        // 检查是否是WAL代币余额不足错误
        if (errorMessage.includes("WAL代币余额不足")) {
          return errorMessage;
        }
        return `保存失败: ${errorMessage}`;
      default:
        return saveState.message;
    }
  };

  return (
    <div className={`save-status ${getStatusClass()}`}>
      <div className="save-status-content">
        {getIcon()}
        <div className="save-status-text">
          <div className="save-status-message">{getMessage()}</div>
          {(saveState.stage === "encoding" ||
            saveState.stage === "registering" ||
            saveState.stage === "uploading" ||
            saveState.stage === "certifying") && (
            <div className="save-status-progress">
              <div
                className="save-status-progress-bar"
                style={{ width: `${saveState.progress}%` }}
              />
            </div>
          )}
        </div>
        <button className="save-status-close" onClick={onClose} title="关闭">
          <X size={16} />
        </button>
      </div>
      {saveState.blobId && saveState.stage === "completed" && (
        <div className="save-status-details">
          <div className="save-status-blob-id">
            <span className="save-status-label">Blob ID:</span>
            <code className="save-status-code">{saveState.blobId}</code>
          </div>
          <div className="save-status-actions">
            <button
              className="save-status-copy-btn"
              onClick={() => navigator.clipboard.writeText(saveState.blobId!)}
              title="复制 Blob ID"
            >
              复制 ID
            </button>
            <a
              href={`https://walruscan.com/mainnet/blob/${saveState.blobId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="save-status-view-btn"
              title="在 Walruscan 中查看"
            >
              查看详情
            </a>
          </div>
        </div>
      )}
      {saveState.stage === "error" &&
        saveState.error?.includes("WAL代币余额不足") && (
          <div className="save-status-error-details">
            <div className="save-status-error-message">
              <p>💡 获取 WAL 代币的方法：</p>
              <ul>
                <li>
                  <a
                    href="https://walruscan.com/mainnet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="save-status-faucet-link"
                  >
                    🔗 Walrus 主网浏览器
                  </a>
                </li>
                <li>
                  您需要在 Sui 主网上拥有 WAL 代币才能使用 Walrus 存储服务
                </li>
              </ul>
            </div>
          </div>
        )}
    </div>
  );
};

export default SaveStatus;
