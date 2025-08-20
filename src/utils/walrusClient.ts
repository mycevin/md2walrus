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
export const createSuiClient = (network: "testnet" | "mainnet" = "mainnet") => {
  return new SuiClient({
    url: getFullnodeUrl(network),
  });
};

// 创建 Walrus 客户端
export const createWalrusClient = (
  network: "testnet" | "mainnet" = "mainnet"
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

// Blob 对象类型
const BLOB_OBJECT_TYPE =
  "0xfdc88f7d7cf30afab2f82e8380d11ee8f70efb90e863d1de8616fae1bb09ea77::blob::Blob";

// 查询用户拥有的 Blob 对象
export const queryUserBlobs = async (
  ownerAddress: string,
  network: "testnet" | "mainnet" = "mainnet"
): Promise<any[]> => {
  try {
    const suiClient = createSuiClient(network);

    console.log(`🔍 查询地址: ${ownerAddress}`);
    console.log(`🔍 查询网络: ${network}`);
    console.log(`🔍 查询类型: ${BLOB_OBJECT_TYPE}`);

    let allObjects: any[] = [];
    let cursor: string | null = null;
    let hasNextPage = true;

    // 分页查询所有 Blob 对象
    while (hasNextPage) {
      const queryParams: any = {
        owner: ownerAddress,
        filter: {
          StructType: BLOB_OBJECT_TYPE,
        },
        options: {
          showContent: true,
          showDisplay: true,
          showOwner: true,
        },
      };

      if (cursor) {
        queryParams.cursor = cursor;
      }

      const objects = await suiClient.getOwnedObjects(queryParams);

      console.log(`📄 分页查询结果:`, {
        pageCount: objects.data?.length || 0,
        hasNextPage: objects.hasNextPage,
        nextCursor: objects.nextCursor,
      });

      if (objects.data) {
        allObjects = allObjects.concat(objects.data);
      }

      hasNextPage = objects.hasNextPage;
      cursor = objects.nextCursor || null;
    }

    console.log("📊 总查询结果:", {
      totalCount: allObjects.length,
      objectIds: allObjects.map((obj) => obj.data?.objectId),
    });

    return allObjects;
  } catch (error) {
    console.error("❌ Error querying user blobs:", error);
    throw error;
  }
};

// 从 Blob 对象中提取信息
export const extractBlobInfo = (blobObject: any) => {
  try {
    console.log("Processing blob object:", blobObject);

    const content = blobObject.data?.content;
    if (!content) {
      console.log("No content found in blob object");
      return null;
    }

    const fields = content.fields || {};
    const display = blobObject.data?.display || {};

    // 获取真正的 Walrus blob_id（u256 类型）
    const walrusBlobId = fields.blob_id || fields.blobId;
    // Sui 对象 ID
    const suiObjectId = blobObject.data?.objectId;

    // 如果 walrusBlobId 是十进制格式，转换为多种格式
    let convertedBlobId = walrusBlobId;
    let urlSafeBase64Id = null;

    if (walrusBlobId && /^\d+$/.test(walrusBlobId)) {
      try {
        // 转换为十六进制
        const bigInt = BigInt(walrusBlobId);
        convertedBlobId = "0x" + bigInt.toString(16);
        console.log(`🔄 转换 blob ID: ${walrusBlobId} -> ${convertedBlobId}`);

        // 转换为 URL-safe Base64
        urlSafeBase64Id = decimalToUrlSafeBase64(walrusBlobId);
        if (urlSafeBase64Id) {
          console.log(`🔄 URL-safe Base64: ${urlSafeBase64Id}`);
        }
      } catch (error) {
        console.error("❌ blob ID 转换失败:", error);
      }
    }

    // 检测 ID 格式
    const walrusBlobIdFormat = walrusBlobId
      ? detectIdFormat(walrusBlobId)
      : "none";
    const suiObjectIdFormat = suiObjectId
      ? detectIdFormat(suiObjectId)
      : "none";

    console.log("🔍 ID 信息:", {
      suiObjectId,
      suiObjectIdFormat,
      walrusBlobId,
      walrusBlobIdFormat,
      fieldsKeys: Object.keys(fields),
      allFields: fields,
    });

    // 优先使用转换后的 blob_id，如果找不到则使用 Sui 对象 ID 作为备选
    const finalBlobId = convertedBlobId || walrusBlobId || suiObjectId;

    // 从不同字段获取文件信息
    const filename =
      fields.filename || fields.name || display.name || "unknown.md";
    const size = fields.size || fields.length || fields.content_length || 0;
    const createdAt =
      fields.created_at ||
      fields.createdAt ||
      fields.timestamp ||
      new Date().toISOString();
    const owner = blobObject.data?.owner?.AddressOwner || "unknown";

    // 尝试获取内容
    let contentText = "";
    if (fields.content) {
      contentText = fields.content;
    } else if (fields.data) {
      contentText = fields.data;
    } else if (fields.text) {
      contentText = fields.text;
    } else if (fields.body) {
      contentText = fields.body;
    }

    const result = {
      blobId: finalBlobId,
      walrusBlobId: walrusBlobId, // 保留 Walrus 原始 blob_id（十进制）
      convertedBlobId: convertedBlobId, // 转换后的 blob_id（十六进制）
      urlSafeBase64Id: urlSafeBase64Id, // URL-safe Base64 格式
      suiObjectId: suiObjectId, // 保留 Sui 对象 ID
      filename,
      size: parseInt(size) || 0,
      createdAt,
      owner,
      content: contentText,
      // 其他可能的字段
      epochs: fields.epochs,
      deletable: fields.deletable,
      storage_size: fields.storage_size,
      // 添加更多调试信息
      rawFields: fields,
      rawDisplay: display,
    };

    console.log("✅ Extracted blob info:", result);
    return result;
  } catch (error) {
    console.error("❌ Error extracting blob info:", error);
    return null;
  }
};

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
        network: "mainnet",
        suiClient: new SuiClient({ url: getFullnodeUrl("mainnet") }) as never,
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
  network: "testnet" | "mainnet" = "mainnet"
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
    const client = await getWalrusClient("mainnet");
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

// 通过 Walrus blob ID 读取内容
export const readBlobContent = async (
  blobId: string,
  network: "testnet" | "mainnet" = "mainnet"
): Promise<string | null> => {
  try {
    console.log(`📖 正在读取 Blob 内容: ${blobId}`);
    console.log(`📖 ID 格式: ${detectIdFormat(blobId)}`);

    const walrusClient = await getWalrusClient(network);

    // 使用 Walrus SDK 读取 blob 内容
    const content = await walrusClient.readBlob({ blobId });

    if (content) {
      // 将 Uint8Array 转换为字符串
      const decoder = new TextDecoder();
      const text = decoder.decode(content);
      console.log(`✅ 成功读取 Blob 内容: ${text.length} 字符`);
      return text;
    }

    return null;
  } catch (error) {
    console.error(`❌ 读取 Blob 内容失败:`, error);
    return null;
  }
};

// 测试读取特定的 blob ID
export const testReadBlob = async (blobId: string) => {
  console.log(`🧪 测试读取 Blob: ${blobId}`);
  console.log(`🧪 ID 格式检测: ${detectIdFormat(blobId)}`);

  try {
    const content = await readBlobContent(blobId, "mainnet");
    if (content) {
      console.log(`✅ 测试成功，内容长度: ${content.length}`);
      console.log(`📄 内容预览: ${content.substring(0, 200)}...`);
    } else {
      console.log(`❌ 测试失败，无法读取内容`);
    }
    return content;
  } catch (error) {
    console.error(`❌ 测试失败:`, error);
    return null;
  }
};

// ID 格式检测和转换
export const detectIdFormat = (id: string) => {
  // Sui 对象 ID 格式：Base58 编码，通常 32 字节
  const suiObjectIdPattern = /^[1-9A-HJ-NP-Za-km-z]{32,}$/;

  // 十六进制格式（可能是 u256 的 hex 表示）
  const hexPattern = /^0x[a-fA-F0-9]+$/;

  // 纯数字（可能是 u256 的十进制表示）
  const decimalPattern = /^\d+$/;

  if (suiObjectIdPattern.test(id)) {
    return "sui-object-id";
  } else if (hexPattern.test(id)) {
    return "hex-u256";
  } else if (decimalPattern.test(id)) {
    return "decimal-u256";
  } else {
    return "unknown";
  }
};

// 转换为 URL-safe Base64 (no padding)
export const decimalToUrlSafeBase64 = (
  decimalString: string
): string | null => {
  try {
    const bigInt = BigInt(decimalString);

    // 转换为字节数组
    const bytes: number[] = [];
    let temp = bigInt;

    while (temp > 0n) {
      bytes.unshift(Number(temp & 0xffn));
      temp = temp >> 8n;
    }

    // 转换为 Base64
    const base64 = btoa(String.fromCharCode(...bytes));

    // 转换为 URL-safe Base64 (no padding)
    const urlSafeBase64 = base64
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    return urlSafeBase64;
  } catch (error) {
    console.error("❌ URL-safe Base64 转换失败:", error);
    return null;
  }
};

// 转换 ID 格式
export const convertIdFormat = (
  id: string,
  targetFormat: "hex" | "base58" | "decimal" | "urlsafe-base64"
) => {
  try {
    const currentFormat = detectIdFormat(id);
    console.log(`🔄 ID 格式转换: ${id} (${currentFormat} -> ${targetFormat})`);

    if (targetFormat === "urlsafe-base64" && currentFormat === "decimal-u256") {
      return decimalToUrlSafeBase64(id);
    }

    // 这里可以添加其他转换逻辑
    // 目前先返回原始 ID，后续可以根据需要添加转换
    return id;
  } catch (error) {
    console.error("❌ ID 格式转换失败:", error);
    return id;
  }
};

// 获取 Walruscan URL
export const getWalruscanUrl = (
  blobId: string,
  network: "mainnet" | "testnet" = "mainnet"
): string => {
  return `https://walruscan.com/${network}/blob/${blobId}`;
};
