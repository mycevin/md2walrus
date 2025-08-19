import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { WalrusClient, WalrusFile } from "@mysten/walrus";

// 获取 WASM 文件的正确 URL
const getWasmUrl = () => {
  // 在开发环境中，使用相对路径
  if (import.meta.env.DEV) {
    return "/node_modules/.pnpm/@mysten+walrus-wasm@0.1.1/node_modules/@mysten/walrus-wasm/web/walrus_wasm_bg.wasm";
  }
  // 在生产环境中，使用 CDN 或打包后的路径
  return "https://unpkg.com/@mysten/walrus-wasm@0.1.1/web/walrus_wasm_bg.wasm";
};

// 创建 Sui 客户端
export const createSuiClient = (network: "testnet" | "mainnet" = "testnet") => {
  return new SuiClient({
    url: getFullnodeUrl(network),
  });
};

// 创建 Walrus 客户端
export const createWalrusClient = (
  network: "testnet" | "mainnet" = "testnet"
) => {
  const suiClient = new SuiClient({
    url: getFullnodeUrl(network),
  });

  try {
    // 使用最简配置，让 SDK 自动处理 WASM 加载
    return new WalrusClient({
      network,
      suiClient: suiClient as never,
      wasmUrl: getWasmUrl(),
    });
  } catch (error) {
    console.error("Error creating WalrusClient:", error);
    throw new Error(
      `Failed to create Walrus client: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

// 保存文件到 Walrus 的接口
export interface SaveToWalrusOptions {
  content: string;
  filename?: string;
  epochs?: number;
  deletable?: boolean;
}

// 保存结果接口
export interface SaveResult {
  success: boolean;
  blobId?: string;
  error?: string;
  transactionDigest?: string;
}

// 保存流程状态
export interface SaveFlowState {
  stage:
    | "idle"
    | "encoding"
    | "registering"
    | "uploading"
    | "certifying"
    | "completed"
    | "error";
  progress: number;
  message: string;
  blobId?: string;
  error?: string;
}

// 创建 WalrusFile 从 markdown 内容
export const createWalrusFileFromMarkdown = (
  content: string,
  filename = "document.md"
): WalrusFile => {
  const encoder = new TextEncoder();
  const contentBytes = encoder.encode(content);

  return WalrusFile.from({
    contents: contentBytes,
    identifier: filename,
    tags: {
      "content-type": "text/markdown",
      "created-at": new Date().toISOString(),
      app: "md2walrus",
    },
  });
};

// 延迟创建 Walrus 客户端实例
let _walrusClient: WalrusClient | null = null;
let _initializationPromise: Promise<WalrusClient> | null = null;

// 检查 WASM 支持
const checkWasmSupport = () => {
  if (typeof WebAssembly === "undefined") {
    throw new Error("WebAssembly is not supported in this browser");
  }

  if (typeof SharedArrayBuffer === "undefined") {
    console.warn(
      "SharedArrayBuffer is not available. This may cause issues with Walrus client."
    );
  }
};

// 等待 WASM 模块加载
const waitForWasmLoad = async (maxRetries = 5, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      // 检查 WASM 模块是否已经加载
      if (typeof WebAssembly === "undefined") {
        throw new Error("WebAssembly is not available");
      }

      // 尝试创建一个简单的 WalrusClient 实例来检查 WASM 是否已加载
      new WalrusClient({
        network: "testnet",
        suiClient: new SuiClient({ url: getFullnodeUrl("testnet") }) as never,
        wasmUrl: getWasmUrl(),
      });

      // 如果成功创建，说明 WASM 已加载
      console.log("WASM modules loaded successfully");
      return;
    } catch (error) {
      console.log(`WASM load attempt ${i + 1}/${maxRetries} failed:`, error);
      if (i < maxRetries - 1) {
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw new Error(
          `Failed to load WASM modules after ${maxRetries} attempts: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }
  }
};

export const getWalrusClient = async (
  network: "testnet" | "mainnet" = "testnet"
): Promise<WalrusClient> => {
  if (_walrusClient) {
    return _walrusClient;
  }

  if (_initializationPromise) {
    return _initializationPromise;
  }

  _initializationPromise = (async () => {
    try {
      console.log("Initializing Walrus client for network:", network);

      // 确保在浏览器环境中
      if (typeof window === "undefined") {
        throw new Error(
          "Walrus client can only be initialized in browser environment"
        );
      }

      // 检查浏览器支持
      checkWasmSupport();

      // 检查 Walrus 库是否正确加载
      if (typeof WalrusClient === "undefined") {
        throw new Error(
          "WalrusClient is not available. Please check if @mysten/walrus is properly installed."
        );
      }

      // 等待 WASM 模块加载
      console.log("Waiting for WASM modules to load...");
      await waitForWasmLoad();

      console.log("Creating Walrus client...");
      _walrusClient = createWalrusClient(network);

      // 验证客户端是否正确创建
      if (!_walrusClient) {
        throw new Error("Failed to create Walrus client: client is null");
      }

      // 尝试访问客户端的基本属性来验证初始化
      if (typeof _walrusClient.writeFilesFlow !== "function") {
        throw new Error(
          "Walrus client is not properly initialized: writeFilesFlow method is missing"
        );
      }

      console.log("Walrus client initialized successfully");
      return _walrusClient;
    } catch (error) {
      console.error("Failed to create Walrus client:", error);
      _initializationPromise = null;
      _walrusClient = null;
      throw error;
    }
  })();

  return _initializationPromise;
};

// 重置客户端（用于测试或重新初始化）
export const resetWalrusClient = () => {
  _walrusClient = null;
  _initializationPromise = null;
  console.log("Walrus client reset");
};

// 测试 Walrus 客户端初始化
export const testWalrusClient = async () => {
  try {
    console.log("Testing Walrus client initialization...");
    const client = await getWalrusClient("testnet");
    console.log("✅ Walrus client test successful:", client);
    return { success: true, client };
  } catch (error) {
    console.error("❌ Walrus client test failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
