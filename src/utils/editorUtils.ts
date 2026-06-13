import type { RefObject } from "react";

// 默认的 Markdown 内容
export const DEFAULT_MARKDOWN_CONTENT = `# Welcome to MD2Walrus

A full-screen Markdown editor built with **react-markdown**!

## Features

- ✨ **Real-time Preview** - Live rendering with react-markdown
- 📝 **Syntax Highlighting** - Code block syntax highlighting
- 🎨 **Modern UI** - Clean and beautiful interface
- 📱 **Responsive Design** - Adapts to different screen sizes
- 🔧 **Plugin Support** - Rich remark/rehype plugin ecosystem
- 📊 **Table Support** - GitHub Flavored Markdown tables
- 🧮 **Math Formulas** - LaTeX mathematical expressions

### Code Example

\`\`\`javascript
function hello() {
  console.log('Hello, react-markdown!');
}
\`\`\`

### Mathematical Formulas

Inline formula: $E = mc^2$

Block formula:

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

### Table

| Feature | Status | Description |
|---------|--------|-------------|
| Editor | ✅ | Using textarea |
| Preview | ✅ | react-markdown |
| Plugins | ✅ | remark/rehype |
| Export | 🚧 | In development |

### Task List

- [x] Install react-markdown
- [x] Configure plugins
- [x] Implement full-screen layout
- [ ] Add export functionality
- [ ] Add theme switching

### Quote

> This is a quote block
> 
> It can contain multiple lines

---

*Built with react-markdown, supporting a rich plugin ecosystem!*`;

// 插入文本到光标位置
export const insertTextAtCursor = (
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  value: string,
  setValue: (value: string) => void,
  before: string,
  after: string = ""
) => {
  if (!textareaRef.current) return;

  const textarea = textareaRef.current;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = value.substring(start, end);

  const newText =
    value.substring(0, start) +
    before +
    selectedText +
    after +
    value.substring(end);
  setValue(newText);

  // 设置光标位置
  setTimeout(() => {
    textarea.focus();
    textarea.setSelectionRange(
      start + before.length,
      start + before.length + selectedText.length
    );
  }, 0);
};

// 插入标题
export const insertHeading = (
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  value: string,
  setValue: (value: string) => void,
  level: number
) => {
  const prefix = "#".repeat(level) + " ";
  insertTextAtCursor(textareaRef, value, setValue, prefix);
};

// 插入列表
export const insertList = (
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  value: string,
  setValue: (value: string) => void,
  type: "ul" | "ol"
) => {
  const prefix = type === "ul" ? "- " : "1. ";
  insertTextAtCursor(textareaRef, value, setValue, prefix);
};

// 插入代码块
export const insertCodeBlock = (
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  value: string,
  setValue: (value: string) => void
) => {
  insertTextAtCursor(textareaRef, value, setValue, "```\n", "\n```");
};

// 插入表格
export const insertTable = (
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  value: string,
  setValue: (value: string) => void
) => {
  const table =
    "\n| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Content 1 | Content 2 | Content 3 |\n";
  insertTextAtCursor(textareaRef, value, setValue, table);
};

// 插入链接
export const insertLink = (
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  value: string,
  setValue: (value: string) => void
) => {
  const url = prompt("Enter link URL:");
  if (url) {
    const text = prompt("Enter link text:", "Link text");
    insertTextAtCursor(
      textareaRef,
      value,
      setValue,
      `[${text || "Link text"}](${url})`
    );
  }
};

// 插入图片
export const insertImage = (
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  value: string,
  setValue: (value: string) => void
) => {
  const url = prompt("Enter image URL:");
  if (url) {
    const alt = prompt("Enter image description:", "Image description");
    insertTextAtCursor(
      textareaRef,
      value,
      setValue,
      `![${alt || "Image description"}](${url})`
    );
  }
};

// 复制内容到剪贴板
export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  alert("Content copied to clipboard!");
};

// 导出文件
export const exportFile = (
  content: string,
  filename: string = "document.md"
) => {
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// 导入本地 Markdown 文件
export const importFile = (
  setValue: (value: string) => void,
  setFilename?: (filename: string) => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".md,.markdown,.txt,text/markdown";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error("No file selected"));
        return;
      }

      try {
        const content = await file.text();
        setValue(content);
        if (setFilename) {
          setFilename(file.name);
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    };

    input.onerror = () => {
      reject(new Error("Failed to select file"));
    };

    input.click();
  });
};
