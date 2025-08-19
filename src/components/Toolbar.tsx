import {
  Edit,
  Eye,
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link,
  Image,
  FileCode,
  Table,
  Minus,
  Copy,
  Download,
  Save,
} from "lucide-react";
import type { ToolbarButton } from "../types";
import {
  insertHeading,
  insertList,
  insertCodeBlock,
  insertTable,
  insertLink,
  insertImage,
  copyToClipboard,
  exportFile,
} from "../utils/editorUtils";
import "./Toolbar.css";

interface ToolbarProps {
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  setValue: (value: string) => void;
  insertText: (before: string, after?: string) => void;
  onSave?: () => void;
  isSaving?: boolean;
  isDisabled?: boolean;
}

const Toolbar = ({
  isEditing,
  setIsEditing,
  textareaRef,
  value,
  setValue,
  insertText,
  onSave,
  isSaving = false,
  isDisabled = false,
}: ToolbarProps) => {
  // 视图切换按钮
  const viewButtons: ToolbarButton[] = [
    {
      icon: Edit,
      onClick: () => setIsEditing(true),
      title: "Edit Mode",
      isActive: isEditing,
    },
    {
      icon: Eye,
      onClick: () => setIsEditing(false),
      title: "Preview Mode",
      isActive: !isEditing,
    },
  ];

  // 文本格式化按钮
  const formattingButtons: ToolbarButton[] = [
    {
      icon: Bold,
      onClick: () => insertText("**", "**"),
      title: "Bold (Ctrl+B)",
    },
    {
      icon: Italic,
      onClick: () => insertText("*", "*"),
      title: "Italic (Ctrl+I)",
    },
    {
      icon: Strikethrough,
      onClick: () => insertText("~~", "~~"),
      title: "Strikethrough",
    },
    {
      icon: Code,
      onClick: () => insertText("`", "`"),
      title: "Inline Code",
    },
  ];

  // 标题按钮
  const headingButtons: ToolbarButton[] = [
    {
      icon: Heading1,
      onClick: () => insertHeading(textareaRef, value, setValue, 1),
      title: "Heading 1",
    },
    {
      icon: Heading2,
      onClick: () => insertHeading(textareaRef, value, setValue, 2),
      title: "Heading 2",
    },
    {
      icon: Heading3,
      onClick: () => insertHeading(textareaRef, value, setValue, 3),
      title: "Heading 3",
    },
  ];

  // 列表和引用按钮
  const listButtons: ToolbarButton[] = [
    {
      icon: List,
      onClick: () => insertList(textareaRef, value, setValue, "ul"),
      title: "Unordered List",
    },
    {
      icon: ListOrdered,
      onClick: () => insertList(textareaRef, value, setValue, "ol"),
      title: "Ordered List",
    },
    {
      icon: Quote,
      onClick: () => insertText("> "),
      title: "Quote",
    },
  ];

  // 链接和媒体按钮
  const mediaButtons: ToolbarButton[] = [
    {
      icon: Link,
      onClick: () => insertLink(textareaRef, value, setValue),
      title: "Insert Link (Ctrl+K)",
    },
    {
      icon: Image,
      onClick: () => insertImage(textareaRef, value, setValue),
      title: "Insert Image",
    },
  ];

  // 代码和表格按钮
  const codeButtons: ToolbarButton[] = [
    {
      icon: FileCode,
      onClick: () => insertCodeBlock(textareaRef, value, setValue),
      title: "Code Block",
    },
    {
      icon: Table,
      onClick: () => insertTable(textareaRef, value, setValue),
      title: "Insert Table",
    },
    {
      icon: Minus,
      onClick: () => insertText("---\n"),
      title: "Horizontal Rule",
    },
  ];

  // 操作按钮
  const actionButtons: ToolbarButton[] = [
    {
      icon: Copy,
      onClick: () => copyToClipboard(value),
      title: "Copy Content",
    },
    {
      icon: Download,
      onClick: () => exportFile(value),
      title: "Export File",
    },
  ];

  const renderButtonGroup = (buttons: ToolbarButton[]) => (
    <div className="toolbar-group">
      {buttons.map((button, index) => (
        <button
          key={index}
          className={`toolbar-btn ${button.isActive ? "active" : ""}`}
          onClick={button.onClick}
          title={button.title}
        >
          <button.icon size={16} />
        </button>
      ))}
    </div>
  );

  const renderSaveButtonGroup = () => (
    <div className="toolbar-group">
      <button
        className={`toolbar-btn save-btn ${isSaving ? "saving" : ""}`}
        onClick={() => onSave?.()}
        title="Save to Walrus (Ctrl+S)"
        disabled={isSaving || !onSave || isDisabled}
      >
        <Save size={16} className={isSaving ? "saving-icon" : ""} />
        {isSaving && <span className="save-text">Saving...</span>}
      </button>
    </div>
  );

  return (
    <div className="toolbar">
      {renderButtonGroup(viewButtons)}
      <div className="toolbar-divider"></div>
      {renderSaveButtonGroup()}
      <div className="toolbar-divider"></div>
      {renderButtonGroup(formattingButtons)}
      <div className="toolbar-divider"></div>
      {renderButtonGroup(headingButtons)}
      <div className="toolbar-divider"></div>
      {renderButtonGroup(listButtons)}
      <div className="toolbar-divider"></div>
      {renderButtonGroup(mediaButtons)}
      <div className="toolbar-divider"></div>
      {renderButtonGroup(codeButtons)}
      <div className="toolbar-divider"></div>
      {renderButtonGroup(actionButtons)}
    </div>
  );
};

export default Toolbar;
