import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "./Editor.css";

interface EditorProps {
  isEditing: boolean;
  value: string;
  setValue: (value: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

const Editor = ({ isEditing, value, setValue, textareaRef }: EditorProps) => {
  return (
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
  );
};

export default Editor;
