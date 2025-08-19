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

// WAL 代币类型
const WAL_COIN_TYPE =
  "0x8270feb7375eee355e64fdb69c50abb6b5f9393a722883c1cf45f8e26048810a::wal::WAL";

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
        await getWalrusClient();
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

        const walrusClient = await getWalrusClient();
        const flow = walrusClient.writeFilesFlow({
          files: [file],
        });

        // 编码文件以获取大小信息
        await flow.encode();

        // 尝试获取估算成本（这里可能需要根据实际的 Walrus API 调整）
        // 由于 Walrus API 可能不直接提供成本估算，我们使用一个基于文件大小的估算
        const contentSize = new TextEncoder().encode(content).length;
        const estimatedWAL = Math.ceil(contentSize / 1024) * 1000000; // 每KB约1 WAL

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

    return { message: errorMessage };
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

      try {
        setSaveState({
          stage: "encoding",
          progress: 10,
          message: "正在编码文件...",
        });

        // 创建 WalrusFile
        const file = createWalrusFileFromMarkdown(content, filename);

        // 创建保存流程
        let walrusClient;
        try {
          console.log("Getting Walrus client...");
          walrusClient = await getWalrusClient();
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
          message: "正在注册到链上...",
        });

        // 步骤 2: 注册 blob
        const registerTx = flow.register({
          epochs: 5, // 保存 5 个 epoch
          owner: currentAccount.address,
          deletable: true,
        });

        const registerResult = await signAndExecuteTransaction({
          transaction: registerTx,
        });

        setSaveState({
          stage: "uploading",
          progress: 50,
          message: "正在上传到存储节点...",
        });

        // 步骤 3: 上传数据
        await flow.upload({
          digest: registerResult.digest,
        });

        setSaveState({
          stage: "certifying",
          progress: 75,
          message: "正在认证...",
        });

        // 步骤 4: 认证 blob
        const certifyTx = flow.certify();
        const certifyResult = await signAndExecuteTransaction({
          transaction: certifyTx,
        });

        // 步骤 5: 获取文件列表
        const files = await flow.listFiles();
        const blobId = files[0]?.blobId;

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
        console.error("保存到 Walrus 失败:", error);

        const errorMessage =
          error instanceof Error ? error.message : "未知错误";

        // 解析错误信息，提取需要的WAL数量
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
    isInitialized,
    initError,
    walBalance,
    estimatedCost,
    checkWalBalance,
    estimateSaveCost,
  };
};
