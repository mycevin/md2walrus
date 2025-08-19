import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  WalletProvider,
  SuiClientProvider,
  createNetworkConfig,
} from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@mysten/dapp-kit/dist/index.css";
import "./index.css";
import App from "./App.tsx";

const queryClient = new QueryClient();

const { networkConfig } = createNetworkConfig({
  localnet: { url: "http://127.0.0.1:9000" },
  devnet: { url: "https://fullnode.devnet.sui.io:443" },
  testnet: { url: "https://fullnode.testnet.sui.io:443" },
  mainnet: { url: "https://fullnode.mainnet.sui.io:443" },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="mainnet">
        <WalletProvider
          autoConnect
          storageKey="md2walrus-wallet"
          enableUnsafeBurner
        >
          <App />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </StrictMode>
);
