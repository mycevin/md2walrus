import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Activity,
  RefreshCw,
  Info,
  TestTube,
  Wallet,
  Database,
  Wifi,
  Monitor,
} from "lucide-react";
import { useCurrentAccount, useCurrentWallet } from "@mysten/dapp-kit";
import { testWalrusClient } from "../utils/walrusClient";
import { SuiClient } from "@mysten/sui/client";
import { useWalrusSave } from "../hooks/useWalrusSave";
import "./EnvironmentCheck.css";

interface CheckResult {
  name: string;
  status: "success" | "error" | "warning" | "loading";
  message: string;
  details?: string;
  icon?: React.ReactNode;
}

interface EnvironmentCheckProps {
  isOpen: boolean;
  onClose: () => void;
}

const EnvironmentCheck = ({ isOpen, onClose }: EnvironmentCheckProps) => {
  const currentAccount = useCurrentAccount();
  const { currentWallet } = useCurrentWallet();
  const [checkResults, setCheckResults] = useState<CheckResult[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);
  const [testResult, setTestResult] = useState<string>("");

  const {
    isConnected,
    checkWalBalance,
    estimateSaveCost,
    walBalance,
    estimatedCost,
  } = useWalrusSave();

  // 检查基础网络连接
  const checkBasicNetwork = async (): Promise<CheckResult> => {
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
          signal: AbortSignal.timeout(5000),
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

    const successfulTests = results.filter((r) => r.success);
    const failedTests = results.filter((r) => !r.success);

    if (successfulTests.length === 0) {
      const errorDetails = failedTests
        .map((test) => `${test.name}: ${test.error}`)
        .join("; ");

      return {
        name: "基础网络连接",
        status: "error",
        message: "所有网络连接测试失败",
        details: errorDetails,
        icon: <Wifi className="check-icon error" />,
      };
    }

    const avgResponseTime =
      successfulTests.reduce((sum, test) => sum + (test.responseTime || 0), 0) /
      successfulTests.length;

    if (avgResponseTime > 3000) {
      return {
        name: "基础网络连接",
        status: "warning",
        message: "网络连接正常但响应较慢",
        details: `平均响应时间: ${avgResponseTime.toFixed(0)}ms`,
        icon: <Wifi className="check-icon warning" />,
      };
    }

    return {
      name: "基础网络连接",
      status: "success",
      message: "网络连接正常",
      details: `平均响应时间: ${avgResponseTime.toFixed(0)}ms`,
      icon: <Wifi className="check-icon success" />,
    };
  };

  // 检查 Sui 网络连接
  const checkSuiNetwork = async (): Promise<CheckResult> => {
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
        await suiClient.getCheckpoint({ id: "latest" });
        const responseTime = Date.now() - startTime;

        results.push({
          name: endpoint.name,
          success: true,
          responseTime,
          url: endpoint.url,
        });

        break; // 如果第一个端点成功，就不需要测试其他端点了
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
        name: "Sui 网络连接",
        status: "error",
        message: "所有 Sui 网络端点不可达",
        details: errorDetails,
        icon: <Database className="check-icon error" />,
      };
    }

    const bestEndpoint = successfulTests[0];
    return {
      name: "Sui 网络连接",
      status: "success",
      message: "Sui 网络连接正常",
      details: `${bestEndpoint.name}, 响应时间: ${bestEndpoint.responseTime}ms`,
      icon: <Database className="check-icon success" />,
    };
  };

  // 检查钱包连接
  const checkWalletConnection = (): CheckResult => {
    if (!currentAccount) {
      return {
        name: "钱包连接",
        status: "error",
        message: "钱包未连接",
        details: "请先连接钱包",
        icon: <Wallet className="check-icon error" />,
      };
    }

    if (!currentWallet) {
      return {
        name: "钱包连接",
        status: "error",
        message: "钱包未初始化",
        details: "钱包客户端未正确加载",
        icon: <Wallet className="check-icon error" />,
      };
    }

    return {
      name: "钱包连接",
      status: "success",
      message: "钱包已连接",
      details: `地址: ${currentAccount.address.slice(
        0,
        8
      )}...${currentAccount.address.slice(-6)}`,
      icon: <Wallet className="check-icon success" />,
    };
  };

  // 检查 Walrus 客户端
  const checkWalrusClient = async (): Promise<CheckResult> => {
    try {
      const testResult = await testWalrusClient();

      if (testResult.success) {
        return {
          name: "Walrus 客户端",
          status: "success",
          message: "Walrus 客户端正常",
          details: "客户端已正确初始化",
          icon: <TestTube className="check-icon success" />,
        };
      } else {
        return {
          name: "Walrus 客户端",
          status: "error",
          message: "Walrus 客户端初始化失败",
          details: testResult.error,
          icon: <TestTube className="check-icon error" />,
        };
      }
    } catch (error) {
      return {
        name: "Walrus 客户端",
        status: "error",
        message: "Walrus 客户端检查失败",
        details: error instanceof Error ? error.message : "未知错误",
        icon: <TestTube className="check-icon error" />,
      };
    }
  };

  // 检查浏览器环境
  const checkBrowserEnvironment = (): CheckResult => {
    const checks = {
      webAssembly: typeof WebAssembly !== "undefined",
      sharedArrayBuffer: typeof SharedArrayBuffer !== "undefined",
      fetch: typeof fetch !== "undefined",
      crypto: typeof crypto !== "undefined" && crypto.subtle,
    };

    const failedChecks = Object.entries(checks)
      .filter(([_, supported]) => !supported)
      .map(([name, _]) => name);

    if (failedChecks.length > 0) {
      return {
        name: "浏览器环境",
        status: "error",
        message: "浏览器环境不完整",
        details: `缺少: ${failedChecks.join(", ")}`,
        icon: <Monitor className="check-icon error" />,
      };
    }

    if (!checks.sharedArrayBuffer) {
      return {
        name: "浏览器环境",
        status: "warning",
        message: "浏览器环境基本支持",
        details: "SharedArrayBuffer 不可用，可能影响性能",
        icon: <Monitor className="check-icon warning" />,
      };
    }

    return {
      name: "浏览器环境",
      status: "success",
      message: "浏览器环境完整",
      details: "所有必需功能都可用",
      icon: <Monitor className="check-icon success" />,
    };
  };

  // 执行所有检查
  const runAllChecks = async () => {
    setIsChecking(true);
    setCheckResults([]);

    const checks = [
      { name: "浏览器环境", check: checkBrowserEnvironment },
      { name: "基础网络连接", check: checkBasicNetwork },
      { name: "Sui 网络连接", check: checkSuiNetwork },
      { name: "钱包连接", check: checkWalletConnection },
      { name: "Walrus 客户端", check: checkWalrusClient },
    ];

    const results: CheckResult[] = [];

    for (const { name, check } of checks) {
      // 添加加载状态
      results.push({
        name,
        status: "loading",
        message: "检查中...",
        icon: <Loader2 className="check-icon loading" />,
      });
      setCheckResults([...results]);

      try {
        const result = await check();
        results[results.length - 1] = result;
        setCheckResults([...results]);
      } catch (error) {
        results[results.length - 1] = {
          name,
          status: "error",
          message: "检查失败",
          details: error instanceof Error ? error.message : "未知错误",
          icon: <XCircle className="check-icon error" />,
        };
        setCheckResults([...results]);
      }
    }

    setIsChecking(false);
    setLastCheckTime(new Date());
  };

  // 测试功能
  const handleTestWalrus = async () => {
    setTestResult("测试中...");
    const result = await testWalrusClient();
    if (result.success) {
      setTestResult("✅ Walrus 客户端测试成功！");
    } else {
      setTestResult(`❌ Walrus 客户端测试失败: ${result.error}`);
    }
  };

  const handleCheckWalBalance = async () => {
    if (!isConnected) {
      setTestResult("请先连接钱包");
      return;
    }
    await checkWalBalance();
  };

  const handleEstimateCost = async () => {
    if (!isConnected) {
      setTestResult("请先连接钱包");
      return;
    }
    await estimateSaveCost("测试文档内容");
  };

  // 获取状态统计
  const getStatusStats = () => {
    const stats = {
      success: 0,
      error: 0,
      warning: 0,
      loading: 0,
    };

    checkResults.forEach((result) => {
      stats[result.status]++;
    });

    return stats;
  };

  const stats = getStatusStats();

  // 初始检查
  useEffect(() => {
    if (isOpen) {
      runAllChecks();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="environment-check-overlay">
      <div className="environment-check-modal">
        <div className="environment-check-header">
          <div className="environment-check-title">
            <Activity className="title-icon" />
            <h2>环境检测</h2>
          </div>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="environment-check-content">
          <div className="check-summary">
            <div className="summary-header">
              <h3 className="summary-title">检测概览</h3>
              {lastCheckTime && (
                <div className="last-check-time">
                  {lastCheckTime.toLocaleTimeString()}
                </div>
              )}
            </div>
            <div className="summary-stats">
              <div className="stat-item success">
                <CheckCircle className="stat-icon" />
                <span>{stats.success}</span>
                <small>正常</small>
              </div>
              <div className="stat-item warning">
                <AlertTriangle className="stat-icon" />
                <span>{stats.warning}</span>
                <small>警告</small>
              </div>
              <div className="stat-item error">
                <XCircle className="stat-icon" />
                <span>{stats.error}</span>
                <small>错误</small>
              </div>
            </div>
          </div>

          {/* 测试功能区域 */}
          <div className="test-section">
            <h3>功能测试</h3>
            <div className="test-buttons">
              <button onClick={handleTestWalrus} className="test-button">
                测试 Walrus 客户端
              </button>
              {isConnected && (
                <>
                  <button
                    onClick={handleCheckWalBalance}
                    className="test-button"
                  >
                    检查 WAL 余额
                  </button>
                  <button onClick={handleEstimateCost} className="test-button">
                    估算保存费用
                  </button>
                </>
              )}
            </div>
            {testResult && (
              <div className="test-result">
                <span
                  style={{ color: testResult.includes("✅") ? "green" : "red" }}
                >
                  {testResult}
                </span>
              </div>
            )}
            {isConnected && (
              <div className="wallet-info">
                {walBalance && (
                  <span className="info-item">
                    WAL 余额: {parseInt(walBalance) / 1000000000} WAL
                  </span>
                )}
                {estimatedCost && (
                  <span className="info-item">
                    估算费用:{" "}
                    {estimatedCost === "unknown"
                      ? "未知"
                      : `${parseInt(estimatedCost) / 1000000000} SUI`}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="check-results">
            {checkResults.map((result, index) => (
              <div key={index} className={`check-item ${result.status}`}>
                <div className="check-header">
                  {result.icon}
                  <span className="check-name">{result.name}</span>
                  <span className={`check-status ${result.status}`}>
                    {result.status === "success" && "正常"}
                    {result.status === "error" && "错误"}
                    {result.status === "warning" && "警告"}
                    {result.status === "loading" && "检查中"}
                  </span>
                </div>
                <div className="check-message">{result.message}</div>
                {result.details && (
                  <div className="check-details">
                    <Info className="details-icon" />
                    {result.details}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="environment-check-actions">
            <button
              className="refresh-button"
              onClick={runAllChecks}
              disabled={isChecking}
            >
              <RefreshCw
                className={`refresh-icon ${isChecking ? "spinning" : ""}`}
              />
              {isChecking ? "检查中..." : "重新检查"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentCheck;
