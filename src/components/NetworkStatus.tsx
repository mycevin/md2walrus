import { Wifi, Loader2 } from "lucide-react";
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

        // 方法0: 优先使用 SuiClientContext 的网络信息（最准确）
        if (network) {
          console.log("Using SuiClientContext network:", network);
          const contextNetwork = network.toLowerCase();

          if (contextNetwork === "testnet") {
            networkName = "Sui Testnet";
            console.log("✅ Set network to Testnet (from context)");
          } else if (contextNetwork === "devnet") {
            networkName = "Sui Devnet";
            console.log("✅ Set network to Devnet (from context)");
          } else if (contextNetwork === "mainnet") {
            networkName = "Sui Mainnet";
            console.log("✅ Set network to Mainnet (from context)");
          } else if (contextNetwork === "localnet") {
            networkName = "Sui Localnet";
            console.log("✅ Set network to Localnet (from context)");
          } else {
            console.log("❌ Context network not recognized:", contextNetwork);
          }
        }

        // 方法1: 如果 SuiClientContext 没有网络信息，从钱包的 chains 属性获取
        if (
          networkName === "Sui Network" &&
          currentWallet.chains &&
          currentWallet.chains.length > 0
        ) {
          console.log("All available chains:", currentWallet.chains);

          // 尝试从钱包的 features 获取当前网络信息
          let currentChain = null;

          // 检查是否有 standard:network 功能来获取当前网络
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
              currentChain = networkData.currentNetwork;
              console.log("Current network from features:", currentChain);
            }
          }

          // 如果没有从 features 获取到，尝试从 accounts 或其他方式获取
          if (!currentChain && currentAccount) {
            // 尝试从账户信息推断当前网络
            console.log(
              "Trying to infer network from account:",
              currentAccount
            );

            // 检查账户地址格式或其他标识
            if (currentAccount.address) {
              console.log("Account address:", currentAccount.address);

              // 尝试从账户地址推断网络
              // 注意：Sui 地址在不同网络上是相同的，所以这个方法可能不可靠
              // 但我们可以尝试其他方法

              // 检查是否有其他网络相关的信息
              if (currentAccount.publicKey) {
                console.log("Account public key:", currentAccount.publicKey);
              }
            }

            // 尝试从钱包的其他属性推断
            if (currentWallet.accounts && currentWallet.accounts.length > 0) {
              console.log("Wallet accounts:", currentWallet.accounts);
            }
          }

          // 如果仍然没有确定，尝试使用 SuiClientContext 的网络信息
          if (!currentChain && network) {
            console.log("Using SuiClientContext network:", network);
            currentChain = `sui:${network}`;
          }

          // 如果仍然没有确定，尝试从钱包的当前状态推断
          if (!currentChain) {
            // 尝试从钱包的其他属性推断当前网络
            console.log("Attempting to infer network from wallet state...");

            // 检查钱包是否有当前网络的状态
            if (currentWallet.version) {
              console.log("Wallet version:", currentWallet.version);
            }

            // 如果钱包支持多个网络，尝试找到当前活跃的网络
            // 这里我们可以尝试一个更智能的方法
            const availableChains = currentWallet.chains || [];
            console.log("Available chains for selection:", availableChains);

            // 使用第一个链作为默认值
            currentChain = availableChains[0];
            console.log("Using first chain as default:", currentChain);
          }

          const chain = currentChain.toLowerCase();
          console.log("Final detected wallet chain:", chain);
          console.log("Chain type check:", {
            isTestnet: chain === "sui:testnet" || chain.endsWith("testnet"),
            isDevnet: chain === "sui:devnet" || chain.endsWith("devnet"),
            isMainnet: chain === "sui:mainnet" || chain.endsWith("mainnet"),
            isLocalnet: chain === "sui:localnet" || chain.endsWith("localnet"),
          });

          // 使用更精确的匹配
          if (chain === "sui:testnet" || chain.endsWith("testnet")) {
            networkName = "Sui Testnet";
            console.log("✅ Set network to Testnet");
          } else if (chain === "sui:devnet" || chain.endsWith("devnet")) {
            networkName = "Sui Devnet";
            console.log("✅ Set network to Devnet");
          } else if (chain === "sui:mainnet" || chain.endsWith("mainnet")) {
            networkName = "Sui Mainnet";
            console.log("✅ Set network to Mainnet");
          } else if (chain === "sui:localnet" || chain.endsWith("localnet")) {
            networkName = "Sui Localnet";
            console.log("✅ Set network to Localnet");
          } else {
            console.log("❌ Chain not recognized:", chain);
          }
        } else {
          console.log("❌ No chains found in wallet");
        }

        // 如果仍然无法确定网络，使用默认值
        if (networkName === "Sui Network") {
          console.log("Could not determine network from wallet, using default");
          networkName = "Sui Mainnet"; // 默认使用 Mainnet
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
