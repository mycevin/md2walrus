import { useState, useRef, useEffect } from "react";
import { DEFAULT_MARKDOWN_CONTENT } from "../utils/editorUtils";
import { insertTextAtCursor, insertLink } from "../utils/editorUtils";

export const useEditor = () => {
  const [value, setValue] = useState<string>(DEFAULT_MARKDOWN_CONTENT);
  const [isEditing, setIsEditing] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 插入文本的通用方法
  const insertText = (before: string, after: string = "") => {
    insertTextAtCursor(textareaRef, value, setValue, before, after);
  };

  // 键盘快捷键处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 只在编辑模式下处理快捷键
      if (!isEditing) return;

      // 检查是否在 textarea 中
      const target = e.target as HTMLElement;
      if (target.tagName !== "TEXTAREA") return;

      // Ctrl/Cmd + 快捷键
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "b":
            e.preventDefault();
            insertText("**", "**");
            break;
          case "i":
            e.preventDefault();
            insertText("*", "*");
            break;
          case "k":
            e.preventDefault();
            insertLink(textareaRef, value, setValue);
            break;
          case "s":
            e.preventDefault();
            // 保存功能将通过外部处理
            break;
        }
      }

      // 其他快捷键
      if (e.key === "Tab") {
        e.preventDefault();
        insertText("    "); // 4 个空格
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isEditing, value]);

  return {
    value,
    setValue,
    isEditing,
    setIsEditing,
    textareaRef,
    insertText,
  };
};
