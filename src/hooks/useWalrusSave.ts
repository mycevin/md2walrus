import { useState, useCallback, useEffect } from "react";
import {
  useSignAndExecuteTransaction,
  useCurrentAccount,
  useSuiClient,
} from "@mysten/dapp-kit";
import {
  getWalrusClient,
  createWalrusFileFromMarkdown,
  type SaveFlowState,
  type SaveResult,
} from "../utils/walrusClient";
import { blobStorage, createBlobItem } from "../utils/blobStorage";
import { defaultSaveEpoch } from "../utils/config";
import { SuiClient } from "@mysten/sui/client";

// WAL 代币类型
const WAL_COIN_TYPE =
  "0x356a26eb9e012a68958082340d4c4116e7f55615cf27affcff209cf0ae544f59::wal::WAL";

export const useWalrusSave = () => {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();
  const suiClient = useSuiClient();

  const [saveState, setSaveState] = useState<SaveFlowState>({
    stage: "idle",
    progress: 0,
    message: "准备保存...",
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [walBalance, setWalBalance] = useState<string | null>(null);
  const [estimatedCost, setEstimatedCost] = useState<string | null>(null);

  // 初始化 Walrus 客户端
  useEffect(() => {
    const initWalrusClient = async () => {
      try {
        console.log("Initializing Walrus client...");
        await getWalrusClient("mainnet");
        setIsInitialized(true);
        setInitError(null);
        console.log("Walrus client ready");
      } catch (error) {
        console.error("Failed to initialize Walrus client:", error);
        setInitError(error instanceof Error ? error.message : "Unknown error");
        setIsInitialized(false);
      }
    };

    initWalrusClient();
  }, []);

  // 检查 WAL 代币余额
  const checkWalBalance = useCallback(async () => {
    if (!currentAccount) {
      console.error("No account connected");
      return;
    }

    try {
      console.log("Checking WAL balance for address:", currentAccount.address);

      const coins = await suiClient.getCoins({
        owner: currentAccount.address,
        coinType: WAL_COIN_TYPE,
      });

      const totalBalance = coins.data.reduce((sum, coin) => {
        return sum + BigInt(coin.balance);
      }, BigInt(0));

      const balanceString = totalBalance.toString();
      setWalBalance(balanceString);

      console.log("WAL balance:", balanceString);
      return balanceString;
    } catch (error) {
      console.error("Failed to check WAL balance:", error);
      setWalBalance(null);
      return null;
    }
  }, [currentAccount, suiClient]);

  // 估算保存成本
  const estimateSaveCost = useCallback(
    async (content: string) => {
      if (!currentAccount || !isInitialized) {
        console.error("Account not connected or Walrus not initialized");
        return;
      }

      try {
        console.log("Estimating save cost for content length:", content.length);

        // 创建临时文件来估算成本
        const file = createWalrusFileFromMarkdown(content, "temp.md");

        const walrusClient = await getWalrusClient("mainnet");
        const flow = walrusClient.writeFilesFlow({
          files: [file],
        });

        // 编码文件以获取大小信息
        await flow.encode();

        // 尝试获取估算成本（这里可能需要根据实际的 Walrus API 调整）
        // 由于 Walrus API 可能不直接提供成本估算，我们使用一个基于文件大小和存储时间的估算
        const contentSize = new TextEncoder().encode(content).length;
        const estimatedWAL =
          Math.ceil(contentSize / 1024) * 1000000 * defaultSaveEpoch; // 每KB约1 WAL，乘以存储时间

        setEstimatedCost(estimatedWAL.toString());
        console.log("Estimated cost:", estimatedWAL, "WAL");

        return estimatedWAL.toString();
      } catch (error) {
        console.error("Failed to estimate save cost:", error);
        setEstimatedCost("unknown");
        return "unknown";
      }
    },
    [currentAccount, isInitialized]
  );

  // 解析错误信息，提取需要的WAL数量
  const parseWalrusError = (
    errorMessage: string
  ): { message: string; requiredWAL?: string } => {
    // 检查是否是网络写入失败错误
    if (errorMessage.includes("Too many failures while writing blob")) {
      return {
        message:
          "网络连接不稳定，存储节点暂时不可用。请稍后重试，或检查您的网络连接。",
      };
    }

    // 检查是否是余额不足错误
    if (
      errorMessage.includes("Not enough coins") &&
      errorMessage.includes("WAL")
    ) {
      console.log("解析WAL余额不足错误:", errorMessage);

      // 尝试多种正则表达式来提取需要的数量
      const patterns = [
        /requested balance[^0-9]*([0-9]+)/i,
        /balance[^0-9]*([0-9]+)/i,
        /to satisfy[^0-9]*([0-9]+)/i,
        /needed[^0-9]*([0-9]+)/i,
        /required[^0-9]*([0-9]+)/i,
        /([0-9]+)[^0-9]*balance/i,
      ];

      for (const pattern of patterns) {
        const match = errorMessage.match(pattern);
        if (match) {
          const requiredAmount = match[1];
          console.log("找到需要的数量:", requiredAmount);

          // 转换为WAL单位（假设原始单位是MIST，1 WAL = 1,000,000,000 MIST）
          const requiredWAL = (
            BigInt(requiredAmount) / BigInt(1000000000)
          ).toString();
          console.log("转换后的WAL数量:", requiredWAL);

          return {
            message: `WAL代币余额不足。需要: ${requiredWAL} WAL`,
            requiredWAL,
          };
        }
      }

      // 如果没有找到具体数字，显示通用错误信息
      console.log("未能从错误信息中提取具体数量");
      return {
        message: "WAL代币余额不足，请确保有足够的WAL代币",
      };
    }

    // 检查其他网络相关错误
    if (
      errorMessage.includes("network") ||
      errorMessage.includes("connection")
    ) {
      return {
        message: "网络连接问题，请检查您的网络连接后重试",
      };
    }

    if (errorMessage.includes("timeout")) {
      return {
        message: "请求超时，请稍后重试",
      };
    }

    return { message: errorMessage };
  };

  // 检查网络连接状态
  const checkNetworkConnection = async (): Promise<{
    success: boolean;
    details: string;
  }> => {
    const testEndpoints = [
      { name: "基础网络", url: "https://httpbin.org/get" },
      { name: "Google DNS", url: "https://8.8.8.8/resolve?name=google.com" },
      {
        name: "Cloudflare",
        url: "https://1.1.1.1/dns-query?name=cloudflare.com",
      },
    ];

    const results = [];

    for (const endpoint of testEndpoints) {
      try {
        const startTime = Date.now();
        const response = await fetch(endpoint.url, {
          method: "GET",
          mode: "no-cors",
          cache: "no-cache",
          signal: AbortSignal.timeout(5000), // 5秒超时
        });
        const responseTime = Date.now() - startTime;

        results.push({
          name: endpoint.name,
          success: true,
          responseTime,
          status: response.status || "unknown",
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "未知错误";
        results.push({
          name: endpoint.name,
          success: false,
          error: errorMessage,
        });
      }
    }

    // 分析结果
    const successfulTests = results.filter((r) => r.success);
    const failedTests = results.filter((r) => !r.success);

    if (successfulTests.length === 0) {
      const errorDetails = failedTests
        .map((test) => `${test.name}: ${test.error}`)
        .join("; ");

      return {
        success: false,
        details: `所有网络连接测试失败: ${errorDetails}`,
      };
    }

    if (failedTests.length > 0) {
      const errorDetails = failedTests
        .map((test) => `${test.name}: ${test.error}`)
        .join("; ");

      console.warn("部分网络连接测试失败:", errorDetails);
    }

    // 检查响应时间
    const avgResponseTime =
      successfulTests.reduce((sum, test) => sum + (test.responseTime || 0), 0) /
      successfulTests.length;

    if (avgResponseTime > 3000) {
      return {
        success: true,
        details: `网络连接正常但响应较慢 (平均${avgResponseTime.toFixed(0)}ms)`,
      };
    }

    return {
      success: true,
      details: `网络连接正常 (平均响应时间${avgResponseTime.toFixed(0)}ms)`,
    };
  };

  // 检查 Sui 网络连接
  const checkSuiNetworkConnection = async (): Promise<{
    success: boolean;
    details: string;
  }> => {
    const suiEndpoints = [
      { name: "Sui Mainnet RPC", url: "https://sui-mainnet.blockvision.org" },
      { name: "Sui Mainnet Fullnode", url: "https://fullnode.mainnet.sui.io" },
      {
        name: "Sui Mainnet Alternative",
        url: "https://sui-mainnet-rpc.allthatnode.com",
      },
    ];

    const results = [];

    for (const endpoint of suiEndpoints) {
      try {
        const suiClient = new SuiClient({
          url: endpoint.url,
        });

        const startTime = Date.now();
        // 尝试获取最新的检查点
        await suiClient.getCheckpoint({ id: "latest" });
        const responseTime = Date.now() - startTime;

        results.push({
          name: endpoint.name,
          success: true,
          responseTime,
          url: endpoint.url,
        });

        // 如果第一个端点成功，就不需要测试其他端点了
        break;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "未知错误";
        results.push({
          name: endpoint.name,
          success: false,
          error: errorMessage,
          url: endpoint.url,
        });
      }
    }

    const successfulTests = results.filter((r) => r.success);
    const failedTests = results.filter((r) => !r.success);

    if (successfulTests.length === 0) {
      const errorDetails = failedTests
        .map((test) => `${test.name}: ${test.error}`)
        .join("; ");

      return {
        success: false,
        details: `所有 Sui 网络端点不可达: ${errorDetails}`,
      };
    }

    const bestEndpoint = successfulTests[0];
    return {
      success: true,
      details: `Sui 网络连接正常 (${bestEndpoint.name}, 响应时间${bestEndpoint.responseTime}ms)`,
    };
  };

  const saveToWalrus = useCallback(
    async (content: string, filename = "document.md"): Promise<SaveResult> => {
      if (!currentAccount) {
        return {
          success: false,
          error: "请先连接钱包",
        };
      }

      if (!isInitialized) {
        return {
          success: false,
          error: initError || "Walrus 客户端正在初始化中，请稍后重试",
        };
      }

      // 检查网络连接
      setSaveState({
        stage: "encoding",
        progress: 5,
        message: "正在检查网络连接...",
      });

      const [basicNetworkOk, suiNetworkOk] = await Promise.all([
        checkNetworkConnection(),
        checkSuiNetworkConnection(),
      ]);

      if (!basicNetworkOk.success) {
        return {
          success: false,
          error: basicNetworkOk.details,
        };
      }

      if (!suiNetworkOk.success) {
        return {
          success: false,
          error: suiNetworkOk.details,
        };
      }

      // 添加重试机制
      const maxRetries = 3;
      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          setSaveState({
            stage: "encoding",
            progress: 10,
            message:
              attempt > 1
                ? `正在重试 (${attempt}/${maxRetries})...`
                : "正在编码文件...",
          });

          // 创建 WalrusFile
          const file = createWalrusFileFromMarkdown(content, filename);

          // 创建保存流程
          let walrusClient;
          try {
            console.log("Getting Walrus client...");
            walrusClient = await getWalrusClient("mainnet");
            console.log("Walrus client obtained successfully");
          } catch (clientError) {
            console.error("Failed to get Walrus client:", clientError);
            throw new Error(
              `Walrus 客户端初始化失败: ${
                clientError instanceof Error ? clientError.message : "未知错误"
              }`
            );
          }

          console.log("Creating write files flow...");
          const flow = walrusClient.writeFilesFlow({
            files: [file],
          });

          // 步骤 1: 编码文件
          await flow.encode();

          setSaveState({
            stage: "registering",
            progress: 25,
            message:
              attempt > 1
                ? `正在重试注册 (${attempt}/${maxRetries})...`
                : "正在注册文件...",
          });

          // 步骤 2: 注册文件
          const registerTx = flow.register({
            epochs: defaultSaveEpoch, // 使用配置中的默认存储时间
            owner: currentAccount.address,
            deletable: true,
          });
          const registerResult = await signAndExecuteTransaction({
            transaction: registerTx,
          });

          setSaveState({
            stage: "uploading",
            progress: 50,
            message:
              attempt > 1
                ? `正在重试上传 (${attempt}/${maxRetries})...`
                : "正在上传到存储节点...",
          });

          // 步骤 3: 上传数据 - 添加超时处理
          const uploadPromise = flow.upload({
            digest: registerResult.digest,
          });

          // 设置上传超时（30秒）
          const uploadTimeout = new Promise((_, reject) => {
            setTimeout(
              () => reject(new Error("上传超时，请检查网络连接")),
              30000
            );
          });

          await Promise.race([uploadPromise, uploadTimeout]);

          setSaveState({
            stage: "certifying",
            progress: 75,
            message:
              attempt > 1
                ? `正在重试认证 (${attempt}/${maxRetries})...`
                : "正在认证...",
          });

          // 步骤 4: 认证 blob
          const certifyTx = flow.certify();
          const certifyResult = await signAndExecuteTransaction({
            transaction: certifyTx,
          });

          // 步骤 5: 获取文件列表
          const files = await flow.listFiles();
          const blobId = files[0]?.blobId;

          // 保存到本地存储
          if (blobId && currentAccount) {
            const blobItem = createBlobItem(
              blobId,
              filename,
              content,
              currentAccount.address
            );
            blobStorage.saveBlob(blobItem);
            console.log("Blob saved to local storage:", blobItem);
          }

          setSaveState({
            stage: "completed",
            progress: 100,
            message: "保存成功！",
            blobId,
          });

          return {
            success: true,
            blobId,
            transactionDigest: certifyResult.digest,
          };
        } catch (error) {
          console.error(
            `保存到 Walrus 失败 (尝试 ${attempt}/${maxRetries}):`,
            error
          );
          lastError = error instanceof Error ? error : new Error("未知错误");

          const errorMessage = lastError.message;

          // 检查是否是网络相关错误
          const isNetworkError =
            errorMessage.includes("Too many failures") ||
            errorMessage.includes("network") ||
            errorMessage.includes("timeout") ||
            errorMessage.includes("connection") ||
            errorMessage.includes("fetch");

          if (isNetworkError && attempt < maxRetries) {
            // 网络错误，等待后重试
            const retryDelay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // 指数退避，最大5秒
            console.log(`网络错误，${retryDelay}ms 后重试...`);

            setSaveState({
              stage: "error",
              progress: 0,
              message: `网络错误，正在重试 (${attempt}/${maxRetries})...`,
              error: "网络连接不稳定，正在重试",
            });

            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            continue;
          }

          // 非网络错误或已达到最大重试次数
          const parsedError = parseWalrusError(errorMessage);

          setSaveState({
            stage: "error",
            progress: 0,
            message: `保存失败: ${parsedError.message}`,
            error: parsedError.message,
          });

          return {
            success: false,
            error: parsedError.message,
          };
        }
      }

      // 如果所有重试都失败了
      const finalError = lastError?.message || "未知错误";
      const parsedError = parseWalrusError(finalError);

      setSaveState({
        stage: "error",
        progress: 0,
        message: `保存失败: ${parsedError.message}`,
        error: parsedError.message,
      });

      return {
        success: false,
        error: parsedError.message,
      };
    },
    [currentAccount, signAndExecuteTransaction]
  );

  const resetSaveState = useCallback(() => {
    setSaveState({
      stage: "idle",
      progress: 0,
      message: "准备保存...",
    });
  }, []);

  return {
    saveToWalrus,
    saveState,
    resetSaveState,
    isConnected: !!currentAccount,
    currentAccount,
    isInitialized,
    initError,
    walBalance,
    estimatedCost,
    checkWalBalance,
    estimateSaveCost,
  };
};
