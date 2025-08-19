import { Wifi, Loader2 } from "lucide-react";
import {
  useCurrentAccount,
  useCurrentWallet,
  useSuiClient,
} from "@mysten/dapp-kit";
import { useState, useEffect } from "react";
import "./NetworkStatus.css";

interface NetworkStatusProps {
  className?: string;
}

const NetworkStatus = ({ className = "" }: NetworkStatusProps) => {
  const currentAccount = useCurrentAccount();
  const { currentWallet } = useCurrentWallet();
  const suiClient = useSuiClient();
  const [networkInfo, setNetworkInfo] = useState<{
    network: string;
    isConnected: boolean;
    isLoading: boolean;
  }>({
    network: "Checking...",
    isConnected: false,
    isLoading: true,
  });

  useEffect(() => {
    const updateNetworkInfo = async () => {
      if (!currentAccount || !currentWallet) {
        setNetworkInfo({
          network: "Not Connected",
          isConnected: false,
          isLoading: false,
        });
        return;
      }

      try {
        // 尝试从钱包获取真实的网络信息
        let networkName = "Sui Network";

        // 方法1: 通过 Sui 客户端的 RPC URL 检测网络
        try {
          const rpcUrl =
            (suiClient as unknown as { transport?: { url?: string } }).transport
              ?.url || "";
          console.log("Sui client RPC URL:", rpcUrl);

          if (rpcUrl.includes("testnet")) {
            networkName = "Sui Testnet";
          } else if (rpcUrl.includes("devnet")) {
            networkName = "Sui Devnet";
          } else if (rpcUrl.includes("mainnet")) {
            networkName = "Sui Mainnet";
          } else if (
            rpcUrl.includes("localhost") ||
            rpcUrl.includes("127.0.0.1") ||
            rpcUrl.includes("localnet")
          ) {
            networkName = "Sui Localnet";
          }
        } catch (rpcError) {
          console.log("RPC URL detection failed:", rpcError);
        }

        // 方法2: 调试钱包信息
        console.log("Current wallet info:", {
          name: currentWallet.name,
          chains: currentWallet.chains,
          features: Object.keys(currentWallet.features || {}),
          accounts: currentWallet.accounts?.length || 0,
        });

        // 方法3: 从钱包的 chains 属性获取网络信息
        if (currentWallet.chains && currentWallet.chains.length > 0) {
          const chain = currentWallet.chains[0].toLowerCase();
          console.log("Detected wallet chain:", chain);

          // 使用更精确的匹配
          if (chain === "sui:testnet" || chain.endsWith("testnet")) {
            networkName = "Sui Testnet";
          } else if (chain === "sui:devnet" || chain.endsWith("devnet")) {
            networkName = "Sui Devnet";
          } else if (chain === "sui:mainnet" || chain.endsWith("mainnet")) {
            networkName = "Sui Mainnet";
          } else if (chain === "sui:localnet" || chain.endsWith("localnet")) {
            networkName = "Sui Localnet";
          }
        }

        // 方法4: 尝试从钱包的 features 获取网络信息
        if (
          currentWallet.features &&
          currentWallet.features["standard:network"]
        ) {
          const networkFeature = currentWallet.features["standard:network"];
          const networkData = networkFeature as Record<string, unknown>;
          if (
            networkData.currentNetwork &&
            typeof networkData.currentNetwork === "string"
          ) {
            const currentNetwork = networkData.currentNetwork.toLowerCase();
            console.log("Detected wallet network feature:", currentNetwork);

            // 使用更精确的匹配
            if (
              currentNetwork === "sui:testnet" ||
              currentNetwork.endsWith("testnet")
            ) {
              networkName = "Sui Testnet";
            } else if (
              currentNetwork === "sui:devnet" ||
              currentNetwork.endsWith("devnet")
            ) {
              networkName = "Sui Devnet";
            } else if (
              currentNetwork === "sui:mainnet" ||
              currentNetwork.endsWith("mainnet")
            ) {
              networkName = "Sui Mainnet";
            } else if (
              currentNetwork === "sui:localnet" ||
              currentNetwork.endsWith("localnet")
            ) {
              networkName = "Sui Localnet";
            }
          }
        }

        console.log("Final detected network:", networkName);

        setNetworkInfo({
          network: networkName,
          isConnected: true,
          isLoading: false,
        });
      } catch (error) {
        console.log("Network detection error:", error);
        setNetworkInfo({
          network: "Unknown Network",
          isConnected: !!currentAccount,
          isLoading: false,
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
    ? `Connected to ${networkInfo.network}`
    : "Wallet not connected";

  // 如果钱包未连接，不显示网络状态
  if (!networkInfo.isConnected) {
    return null;
  }

  return (
    <div
      className={`network-status ${className} connected`}
      data-tooltip={tooltip}
    >
      <div className="network-indicator">
        {networkInfo.isLoading ? (
          <Loader2 size={16} className="network-icon loading" />
        ) : (
          <Wifi size={16} className="network-icon connected" />
        )}
        <span className="network-name" data-network={networkType}>
          {networkInfo.network}
        </span>
      </div>
    </div>
  );
};

export default NetworkStatus;
