import { useState, useCallback, useEffect } from "react";
import { useEditor } from "./hooks/useEditor";
import { useWalrusSave } from "./hooks/useWalrusSave";

import Navbar from "./components/Navbar";
import Toolbar from "./components/Toolbar";
import Editor from "./components/Editor";
import SaveStatus from "./components/SaveStatus";
import BlobList from "./components/BlobList";

import "./App.css";

function App() {
  const [isBlobListOpen, setIsBlobListOpen] = useState(false);
  const {
    saveToWalrus,
    saveState,
    resetSaveState,
    isConnected,
    currentAccount,
    isInitialized,
    initError,
  } = useWalrusSave();

  const { value, setValue, isEditing, setIsEditing, textareaRef, insertText } =
    useEditor();

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



  const handleCloseBlobList = () => {
    setIsBlobListOpen(false);
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



  return (
    <div className="app-container">
      <Navbar />
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

      <SaveStatus saveState={saveState} onClose={resetSaveState} />
      <BlobList
        isOpen={isBlobListOpen}
        onClose={handleCloseBlobList}
        currentAccount={currentAccount?.address}
      />
    </div>
  );
}

export default App;
