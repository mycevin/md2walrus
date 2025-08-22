import { Wifi, Loader2, ChevronDown, AlertTriangle } from "lucide-react";
import {
  useCurrentAccount,
  useCurrentWallet,
  useSuiClientContext,
} from "@mysten/dapp-kit";
import { useState, useEffect } from "react";
import "./NetworkStatus.css";

interface NetworkStatusProps {
  className?: string;
}

const NetworkStatus = ({ className = "" }: NetworkStatusProps) => {
  const currentAccount = useCurrentAccount();
  const { currentWallet } = useCurrentWallet();
  const { network } = useSuiClientContext();
  const [networkInfo, setNetworkInfo] = useState<{
    network: string;
    isConnected: boolean;
    isLoading: boolean;
    connectionQuality: "good" | "poor" | "unknown";
  }>({
    network: "Checking...",
    isConnected: false,
    isLoading: true,
    connectionQuality: "unknown",
  });
  const [showNetworkSelector, setShowNetworkSelector] = useState(false);

  // 检查网络连接质量
  const checkConnectionQuality = async (): Promise<"good" | "poor"> => {
    try {
      const startTime = Date.now();
      await fetch("https://httpbin.org/get", {
        method: "GET",
        mode: "no-cors",
        cache: "no-cache",
      });
      const responseTime = Date.now() - startTime;

      // 如果响应时间超过2秒，认为网络质量较差
      return responseTime < 2000 ? "good" : "poor";
    } catch {
      return "poor";
    }
  };

  // 点击外部区域关闭网络选择器
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".network-status")) {
        setShowNetworkSelector(false);
      }
    };

    if (showNetworkSelector) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNetworkSelector]);

  useEffect(() => {
    const updateNetworkInfo = async () => {
      if (!currentAccount || !currentWallet) {
        setNetworkInfo({
          network: "Not Connected",
          isConnected: false,
          isLoading: false,
          connectionQuality: "unknown",
        });
        return;
      }

      try {
        // 尝试从钱包获取真实的网络信息
        let networkName = "Sui Network";

        // 调试钱包信息
        console.log("Current wallet info:", {
          name: currentWallet.name,
          chains: currentWallet.chains,
          features: Object.keys(currentWallet.features || {}),
          accounts: currentWallet.accounts?.length || 0,
        });

        // 调试 SuiClientContext 网络信息
        console.log("SuiClientContext network:", network);

        // 详细调试 chains 信息
        if (currentWallet.chains && currentWallet.chains.length > 0) {
          console.log("Wallet chains details:", currentWallet.chains);
          currentWallet.chains.forEach((chain, index) => {
            console.log(`Chain ${index}:`, chain);
          });
        }

        // 详细调试 features 信息
        if (currentWallet.features) {
          console.log("Wallet features details:", currentWallet.features);
          Object.entries(currentWallet.features).forEach(([key, value]) => {
            console.log(`Feature ${key}:`, value);
          });
        }

        // 简化：始终显示 Mainnet
        networkName = "Sui Mainnet";
        console.log("✅ Set network to Mainnet (simplified)");

        // 简化：移除复杂的网络检测逻辑
        console.log("Final detected network:", networkName);

        // 检查网络连接质量
        const quality = await checkConnectionQuality();

        setNetworkInfo({
          network: networkName,
          isConnected: true,
          isLoading: false,
          connectionQuality: quality,
        });
      } catch (error) {
        console.log("Network detection error:", error);
        setNetworkInfo({
          network: "Sui Mainnet",
          isConnected: !!currentAccount,
          isLoading: false,
          connectionQuality: "unknown",
        });
      }
    };

    // 延迟更新，确保所有上下文都已加载
    const timer = setTimeout(updateNetworkInfo, 500);

    // 监听钱包网络变化事件
    const handleNetworkChange = () => {
      updateNetworkInfo();
    };

    // 监听钱包连接状态变化
    const handleAccountChange = () => {
      updateNetworkInfo();
    };

    // 添加事件监听器
    if (typeof window !== "undefined") {
      window.addEventListener("wallet-network-changed", handleNetworkChange);
      window.addEventListener("wallet-account-changed", handleAccountChange);
    }

    return () => {
      clearTimeout(timer);
      if (typeof window !== "undefined") {
        window.removeEventListener(
          "wallet-network-changed",
          handleNetworkChange
        );
        window.removeEventListener(
          "wallet-account-changed",
          handleAccountChange
        );
      }
    };
  }, [currentAccount, currentWallet]);

  // 获取网络类型用于样式
  const getNetworkType = () => {
    if (!networkInfo.isConnected) return "";
    if (networkInfo.network.toLowerCase().includes("testnet")) return "testnet";
    if (networkInfo.network.toLowerCase().includes("devnet")) return "devnet";
    if (networkInfo.network.toLowerCase().includes("mainnet")) return "mainnet";
    if (networkInfo.network.toLowerCase().includes("localnet"))
      return "localnet";
    return "";
  };

  const networkType = getNetworkType();
  const tooltip = networkInfo.isConnected
    ? `Connected to ${networkInfo.network}${
        networkInfo.connectionQuality === "poor" ? " (Poor connection)" : ""
      }`
    : "Wallet not connected";

  // 简化：移除网络切换功能
  const handleNetworkChange = async () => {
    // 简化版本：只显示提示，不实际切换
    console.log(`Network switching disabled - always using Mainnet`);
    setShowNetworkSelector(false);
  };

  // 如果钱包未连接，不显示网络状态
  if (!networkInfo.isConnected) {
    return null;
  }

  const availableNetworks = [{ id: "mainnet", name: "Sui Mainnet (Current)" }];

  return (
    <div className={`network-status ${className} connected`}>
      <div
        className="network-indicator"
        onClick={() => setShowNetworkSelector(!showNetworkSelector)}
        style={{ cursor: "pointer" }}
        data-tooltip={tooltip}
      >
        {networkInfo.isLoading ? (
          <Loader2 size={16} className="network-icon loading" />
        ) : networkInfo.connectionQuality === "poor" ? (
          <AlertTriangle size={16} className="network-icon poor" />
        ) : (
          <Wifi size={16} className="network-icon connected" />
        )}
        <span className="network-name" data-network={networkType}>
          {networkInfo.network}
        </span>
        <ChevronDown size={12} className="network-dropdown-icon" />
      </div>

      {showNetworkSelector && (
        <div className="network-selector">
          {availableNetworks.map((net) => (
            <div
              key={net.id}
              className={`network-option ${network === net.id ? "active" : ""}`}
              onClick={() => handleNetworkChange()}
            >
              {net.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NetworkStatus;
