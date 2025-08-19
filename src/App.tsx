import { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import { ConnectButton } from "@mysten/dapp-kit";
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
} from "lucide-react";
import "./App.css";

function App() {
  const [value, setValue] = useState<string>(
    `# Welcome to MD2Walrus

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

*Built with react-markdown, supporting a rich plugin ecosystem!*`
  );

  const [isEditing, setIsEditing] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Insert text at cursor position
  const insertText = (before: string, after: string = "") => {
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

    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  // Insert heading
  const insertHeading = (level: number) => {
    const prefix = "#".repeat(level) + " ";
    insertText(prefix);
  };

  // Insert list
  const insertList = (type: "ul" | "ol") => {
    const prefix = type === "ul" ? "- " : "1. ";
    insertText(prefix);
  };

  // Insert code block
  const insertCodeBlock = () => {
    insertText("```\n", "\n```");
  };

  // Insert table
  const insertTable = () => {
    const table =
      "\n| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Content 1 | Content 2 | Content 3 |\n";
    insertText(table);
  };

  // Insert link
  const insertLink = () => {
    const url = prompt("Enter link URL:");
    if (url) {
      const text = prompt("Enter link text:", "Link text");
      insertText(`[${text || "Link text"}](${url})`);
    }
  };

  // Insert image
  const insertImage = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      const alt = prompt("Enter image description:", "Image description");
      insertText(`![${alt || "Image description"}](${url})`);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts in edit mode
      if (!isEditing) return;

      // Check if in textarea
      const target = e.target as HTMLElement;
      if (target.tagName !== "TEXTAREA") return;

      // Ctrl/Cmd + shortcuts
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
            insertLink();
            break;
          case "s":
            e.preventDefault();
            // Save functionality can be added here
            break;
        }
      }

      // Other shortcuts
      if (e.key === "Tab") {
        e.preventDefault();
        insertText("    "); // 4 spaces
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isEditing, value]);

  return (
    <div className="app-container">
      {/* Navigation Bar */}
      <div className="navbar">
        <div className="navbar-left">
          <div className="logo">md2walrus</div>
        </div>
        <div className="navbar-right">
          <ConnectButton connectText="Connect Sui Wallet" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        {/* View Toggle */}
        <div className="toolbar-group">
          <button
            className={`toolbar-btn ${isEditing ? "active" : ""}`}
            onClick={() => setIsEditing(true)}
            title="Edit Mode"
          >
            <Edit size={16} />
          </button>
          <button
            className={`toolbar-btn ${!isEditing ? "active" : ""}`}
            onClick={() => setIsEditing(false)}
            title="Preview Mode"
          >
            <Eye size={16} />
          </button>
        </div>

        {/* Divider */}
        <div className="toolbar-divider"></div>

        {/* Text Formatting */}
        <div className="toolbar-group">
          <button
            className="toolbar-btn"
            onClick={() => insertText("**", "**")}
            title="Bold (Ctrl+B)"
          >
            <Bold size={16} />
          </button>
          <button
            className="toolbar-btn"
            onClick={() => insertText("*", "*")}
            title="Italic (Ctrl+I)"
          >
            <Italic size={16} />
          </button>
          <button
            className="toolbar-btn"
            onClick={() => insertText("~~", "~~")}
            title="Strikethrough"
          >
            <Strikethrough size={16} />
          </button>
          <button
            className="toolbar-btn"
            onClick={() => insertText("`", "`")}
            title="Inline Code"
          >
            <Code size={16} />
          </button>
        </div>

        {/* Divider */}
        <div className="toolbar-divider"></div>

        {/* Headings */}
        <div className="toolbar-group">
          <button
            className="toolbar-btn"
            onClick={() => insertHeading(1)}
            title="Heading 1"
          >
            <Heading1 size={16} />
          </button>
          <button
            className="toolbar-btn"
            onClick={() => insertHeading(2)}
            title="Heading 2"
          >
            <Heading2 size={16} />
          </button>
          <button
            className="toolbar-btn"
            onClick={() => insertHeading(3)}
            title="Heading 3"
          >
            <Heading3 size={16} />
          </button>
        </div>

        {/* Divider */}
        <div className="toolbar-divider"></div>

        {/* Lists and Quote */}
        <div className="toolbar-group">
          <button
            className="toolbar-btn"
            onClick={() => insertList("ul")}
            title="Unordered List"
          >
            <List size={16} />
          </button>
          <button
            className="toolbar-btn"
            onClick={() => insertList("ol")}
            title="Ordered List"
          >
            <ListOrdered size={16} />
          </button>
          <button
            className="toolbar-btn"
            onClick={() => insertText("> ")}
            title="Quote"
          >
            <Quote size={16} />
          </button>
        </div>

        {/* Divider */}
        <div className="toolbar-divider"></div>

        {/* Links and Media */}
        <div className="toolbar-group">
          <button
            className="toolbar-btn"
            onClick={insertLink}
            title="Insert Link (Ctrl+K)"
          >
            <Link size={16} />
          </button>
          <button
            className="toolbar-btn"
            onClick={insertImage}
            title="Insert Image"
          >
            <Image size={16} />
          </button>
        </div>

        {/* Divider */}
        <div className="toolbar-divider"></div>

        {/* Code and Table */}
        <div className="toolbar-group">
          <button
            className="toolbar-btn"
            onClick={insertCodeBlock}
            title="Code Block"
          >
            <FileCode size={16} />
          </button>
          <button
            className="toolbar-btn"
            onClick={insertTable}
            title="Insert Table"
          >
            <Table size={16} />
          </button>
          <button
            className="toolbar-btn"
            onClick={() => insertText("---\n")}
            title="Horizontal Rule"
          >
            <Minus size={16} />
          </button>
        </div>

        {/* Divider */}
        <div className="toolbar-divider"></div>

        {/* Action Buttons */}
        <div className="toolbar-group">
          <button
            className="toolbar-btn"
            onClick={() => {
              navigator.clipboard.writeText(value);
              alert("Content copied to clipboard!");
            }}
            title="Copy Content"
          >
            <Copy size={16} />
          </button>
          <button
            className="toolbar-btn"
            onClick={() => {
              const blob = new Blob([value], { type: "text/markdown" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "document.md";
              a.click();
              URL.revokeObjectURL(url);
            }}
            title="Export File"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      <div className="editor-container">
        {isEditing ? (
          <div className="split-view">
            <div className="editor-panel">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Start typing your Markdown content here...&#10;&#10;Keyboard shortcuts:&#10;• Ctrl+B: Bold&#10;• Ctrl+I: Italic&#10;• Ctrl+K: Insert link&#10;• Tab: Indent"
                className="markdown-editor"
              />
            </div>
            <div className="preview-panel">
              <div className="markdown-preview">
                <Markdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex, rehypeHighlight]}
                >
                  {value}
                </Markdown>
              </div>
            </div>
          </div>
        ) : (
          <div className="full-preview">
            <div className="markdown-preview">
              <Markdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex, rehypeHighlight]}
              >
                {value}
              </Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
