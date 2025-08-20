import React from "react";
import {
  WalletProvider as SuiWalletProvider,
  SuiClientProvider,
  createNetworkConfig,
} from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@mysten/dapp-kit/dist/index.css";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { registerEnokiWallets } from "@mysten/enoki";

const queryClient = new QueryClient();

const { networkConfig } = createNetworkConfig({
  localnet: { url: "http://127.0.0.1:9000" },
  devnet: { url: "https://fullnode.devnet.sui.io:443" },
  testnet: { url: "https://fullnode.testnet.sui.io:443" },
  mainnet: { url: "https://fullnode.mainnet.sui.io:443" },
});

// 简化：始终使用 mainnet
const getDefaultNetwork = (): "mainnet" => {
  return "mainnet";
};

interface WalletProviderProps {
  children: React.ReactNode;
}

// 创建 Sui 客户端
const suiClient = new SuiClient({
  url: getFullnodeUrl("mainnet"),
});

let reigstered = false;

if (!reigstered) {
  // 注册 Enoki 钱包
  registerEnokiWallets({
    apiKey: "your-enoki-api-key",
    client: suiClient,
    network: "mainnet",
    providers: {
      google: {
        clientId: "your-google-oauth-client-id",
      },
    },
  });
  reigstered = true;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider
        networks={networkConfig}
        defaultNetwork={getDefaultNetwork()}
      >
        <SuiWalletProvider autoConnect storageKey="md2walrus-wallet">
          {children}
        </SuiWalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
};
