import { useState, useCallback, useEffect } from "react";
import { useEditor } from "./hooks/useEditor";
import { useWalrusSave } from "./hooks/useWalrusSave";
import { testWalrusClient } from "./utils/walrusClient";
import Navbar from "./components/Navbar";
import Toolbar from "./components/Toolbar";
import Editor from "./components/Editor";
import HelpModal from "./components/HelpModal";
import SaveStatus from "./components/SaveStatus";
import "./App.css";

function App() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [testResult, setTestResult] = useState<string>("");
  const {
    saveToWalrus,
    saveState,
    resetSaveState,
    isConnected,
    isInitialized,
    initError,
    walBalance,
    estimatedCost,
    checkWalBalance,
    estimateSaveCost,
  } = useWalrusSave();

  const { value, setValue, isEditing, setIsEditing, textareaRef, insertText } =
    useEditor();

  const handleTestWalrus = useCallback(async () => {
    setTestResult("Testing Walrus client...");
    const result = await testWalrusClient();
    if (result.success) {
      setTestResult("✅ Walrus client test successful!");
    } else {
      setTestResult(`❌ Walrus client test failed: ${result.error}`);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!isConnected) {
      alert("请先连接钱包才能保存到 Walrus");
      return;
    }

    if (!isInitialized) {
      alert(initError || "Walrus 客户端正在初始化中，请稍后重试");
      return;
    }

    try {
      const result = await saveToWalrus(value, "document.md");
      if (result.success) {
        console.log("保存成功！Blob ID:", result.blobId);
        // 可以在这里添加成功提示
      } else {
        console.error("保存失败:", result.error);
        alert(`保存失败: ${result.error}`);
      }
    } catch (error) {
      console.error("保存过程中发生错误:", error);
      alert("保存过程中发生错误，请重试");
    }
  }, [saveToWalrus, value, isConnected, isInitialized, initError]);

  const handleEstimateCost = useCallback(async () => {
    if (!isConnected) {
      alert("请先连接钱包");
      return;
    }
    await estimateSaveCost(value);
  }, [estimateSaveCost, value, isConnected]);

  const handleHelpClick = () => {
    setIsHelpOpen(true);
  };

  const handleHelpClose = () => {
    setIsHelpOpen(false);
  };

  // 全局快捷键处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  // 自动测试 Walrus 客户端
  useEffect(() => {
    const autoTest = async () => {
      console.log("Auto-testing Walrus client...");
      const result = await testWalrusClient();
      if (result.success) {
        console.log("✅ Auto-test successful: Walrus client is working!");
        setTestResult("✅ Walrus client auto-test successful!");
      } else {
        console.error("❌ Auto-test failed:", result.error);
        setTestResult(`❌ Walrus client auto-test failed: ${result.error}`);
      }
    };

    // 延迟执行，确保所有依赖都已加载
    const timer = setTimeout(autoTest, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="app-container">
      <Navbar onHelpClick={handleHelpClick} />
      <div
        style={{
          padding: "10px",
          backgroundColor: "#f0f0f0",
          borderBottom: "1px solid #ccc",
        }}
      >
        <button onClick={handleTestWalrus} style={{ marginRight: "10px" }}>
          测试 Walrus 客户端
        </button>
        {isConnected && (
          <>
            <button onClick={checkWalBalance} style={{ marginRight: "10px" }}>
              检查 WAL 余额
            </button>
            <button
              onClick={handleEstimateCost}
              style={{ marginRight: "10px" }}
            >
              估算保存费用
            </button>
          </>
        )}
        {testResult && (
          <span style={{ color: testResult.includes("✅") ? "green" : "red" }}>
            {testResult}
          </span>
        )}
        {isConnected && (
          <div style={{ marginTop: "10px", fontSize: "14px" }}>
            {walBalance && (
              <span style={{ marginRight: "20px" }}>
                WAL 余额: {parseInt(walBalance) / 1000000000} WAL
              </span>
            )}
            {estimatedCost && (
              <span>
                估算费用:{" "}
                {estimatedCost === "unknown"
                  ? "未知"
                  : `${parseInt(estimatedCost) / 1000000000} SUI`}
              </span>
            )}
          </div>
        )}
      </div>
      <Toolbar
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        textareaRef={textareaRef}
        value={value}
        setValue={setValue}
        insertText={insertText}
        onSave={handleSave}
        isSaving={
          saveState.stage === "encoding" ||
          saveState.stage === "registering" ||
          saveState.stage === "uploading" ||
          saveState.stage === "certifying"
        }
        isDisabled={!isInitialized}
      />
      <Editor
        isEditing={isEditing}
        value={value}
        setValue={setValue}
        textareaRef={textareaRef}
      />
      <HelpModal isOpen={isHelpOpen} onClose={handleHelpClose} />
      <SaveStatus saveState={saveState} onClose={resetSaveState} />
    </div>
  );
}

export default App;
