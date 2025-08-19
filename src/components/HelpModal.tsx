import {
  X,
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
import "./HelpModal.css";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal = ({ isOpen, onClose }: HelpModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="help-modal-overlay" onClick={onClose}>
      <div className="help-modal" onClick={(e) => e.stopPropagation()}>
        <div className="help-modal-header">
          <h2>MD2Walrus Help</h2>
          <button className="help-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="help-modal-content">
          <section className="help-section">
            <h3>🎯 Basic Features</h3>
            <p>
              MD2Walrus is a full-screen Markdown editor with real-time preview
              and rich editing features.
            </p>

            <div className="feature-grid">
              <div className="feature-item">
                <Edit size={16} />
                <span>Real-time Editing</span>
              </div>
              <div className="feature-item">
                <Eye size={16} />
                <span>Real-time Preview</span>
              </div>
              <div className="feature-item">
                <FileCode size={16} />
                <span>Syntax Highlighting</span>
              </div>
              <div className="feature-item">
                <Table size={16} />
                <span>Table Support</span>
              </div>
              <div className="feature-item">
                <Code size={16} />
                <span>Math Formulas</span>
              </div>
              <div className="feature-item">
                <Download size={16} />
                <span>File Export</span>
              </div>
              <div className="feature-item">
                <Save size={16} />
                <span>Walrus Storage</span>
              </div>
            </div>
          </section>

          <section className="help-section">
            <h3>🌊 Walrus Storage</h3>
            <p>
              Save your Markdown documents permanently to the Walrus
              decentralized storage network.
            </p>

            <div className="walrus-info">
              <div className="walrus-step">
                <strong>1. Connect Wallet</strong>
                <p>Connect your Sui wallet to enable saving to Walrus</p>
              </div>
              <div className="walrus-step">
                <strong>2. Save Document</strong>
                <p>
                  Click the save button or press <kbd>Ctrl</kbd> + <kbd>S</kbd>
                </p>
              </div>
              <div className="walrus-step">
                <strong>3. Sign Transactions</strong>
                <p>Approve the registration and certification transactions</p>
              </div>
              <div className="walrus-step">
                <strong>4. Get Blob ID</strong>
                <p>Receive a unique Blob ID to access your document forever</p>
              </div>
            </div>

            <div className="walrus-note">
              <strong>Note:</strong> Documents are stored for 5 epochs (~30
              days) on Sui Testnet. Storage costs are paid in SUI tokens.
            </div>
          </section>

          <section className="help-section">
            <h3>⌨️ Keyboard Shortcuts</h3>
            <div className="shortcuts-grid">
              <div className="shortcut-item">
                <kbd>Ctrl</kbd> + <kbd>B</kbd>
                <span>Bold text</span>
              </div>
              <div className="shortcut-item">
                <kbd>Ctrl</kbd> + <kbd>I</kbd>
                <span>Italic text</span>
              </div>
              <div className="shortcut-item">
                <kbd>Ctrl</kbd> + <kbd>K</kbd>
                <span>Insert link</span>
              </div>
              <div className="shortcut-item">
                <kbd>Tab</kbd>
                <span>Indent (4 spaces)</span>
              </div>
              <div className="shortcut-item">
                <kbd>Ctrl</kbd> + <kbd>S</kbd>
                <span>Save to Walrus</span>
              </div>
            </div>
          </section>

          <section className="help-section">
            <h3>🛠️ Toolbar Features</h3>
            <div className="toolbar-help">
              <div className="toolbar-group-help">
                <h4>View Toggle</h4>
                <div className="toolbar-buttons">
                  <div className="toolbar-button-help">
                    <Edit size={16} />
                    <span>Edit Mode</span>
                  </div>
                  <div className="toolbar-button-help">
                    <Eye size={16} />
                    <span>Preview Mode</span>
                  </div>
                </div>
              </div>

              <div className="toolbar-group-help">
                <h4>Text Formatting</h4>
                <div className="toolbar-buttons">
                  <div className="toolbar-button-help">
                    <Bold size={16} />
                    <span>Bold</span>
                  </div>
                  <div className="toolbar-button-help">
                    <Italic size={16} />
                    <span>Italic</span>
                  </div>
                  <div className="toolbar-button-help">
                    <Strikethrough size={16} />
                    <span>Strikethrough</span>
                  </div>
                  <div className="toolbar-button-help">
                    <Code size={16} />
                    <span>Inline Code</span>
                  </div>
                </div>
              </div>

              <div className="toolbar-group-help">
                <h4>Headings</h4>
                <div className="toolbar-buttons">
                  <div className="toolbar-button-help">
                    <Heading1 size={16} />
                    <span>Heading 1</span>
                  </div>
                  <div className="toolbar-button-help">
                    <Heading2 size={16} />
                    <span>Heading 2</span>
                  </div>
                  <div className="toolbar-button-help">
                    <Heading3 size={16} />
                    <span>Heading 3</span>
                  </div>
                </div>
              </div>

              <div className="toolbar-group-help">
                <h4>Lists & Quotes</h4>
                <div className="toolbar-buttons">
                  <div className="toolbar-button-help">
                    <List size={16} />
                    <span>Unordered List</span>
                  </div>
                  <div className="toolbar-button-help">
                    <ListOrdered size={16} />
                    <span>Ordered List</span>
                  </div>
                  <div className="toolbar-button-help">
                    <Quote size={16} />
                    <span>Quote</span>
                  </div>
                </div>
              </div>

              <div className="toolbar-group-help">
                <h4>Media & Links</h4>
                <div className="toolbar-buttons">
                  <div className="toolbar-button-help">
                    <Link size={16} />
                    <span>Insert Link</span>
                  </div>
                  <div className="toolbar-button-help">
                    <Image size={16} />
                    <span>Insert Image</span>
                  </div>
                </div>
              </div>

              <div className="toolbar-group-help">
                <h4>Code & Tables</h4>
                <div className="toolbar-buttons">
                  <div className="toolbar-button-help">
                    <FileCode size={16} />
                    <span>Code Block</span>
                  </div>
                  <div className="toolbar-button-help">
                    <Table size={16} />
                    <span>Insert Table</span>
                  </div>
                  <div className="toolbar-button-help">
                    <Minus size={16} />
                    <span>Horizontal Rule</span>
                  </div>
                </div>
              </div>

              <div className="toolbar-group-help">
                <h4>Actions</h4>
                <div className="toolbar-buttons">
                  <div className="toolbar-button-help">
                    <Copy size={16} />
                    <span>Copy Content</span>
                  </div>
                  <div className="toolbar-button-help">
                    <Download size={16} />
                    <span>Export File</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="help-section">
            <h3>📝 Markdown Syntax Support</h3>
            <div className="markdown-examples">
              <div className="example-item">
                <strong>Headings:</strong> <code># Heading 1</code>,{" "}
                <code>## Heading 2</code>
              </div>
              <div className="example-item">
                <strong>Bold:</strong> <code>**bold text**</code>
              </div>
              <div className="example-item">
                <strong>Italic:</strong> <code>*italic text*</code>
              </div>
              <div className="example-item">
                <strong>Code:</strong> <code>`inline code`</code>
              </div>
              <div className="example-item">
                <strong>Code Block:</strong>{" "}
                <code>```javascript\ncode content\n```</code>
              </div>
              <div className="example-item">
                <strong>Link:</strong> <code>[link text](URL)</code>
              </div>
              <div className="example-item">
                <strong>Image:</strong> <code>![description](imageURL)</code>
              </div>
              <div className="example-item">
                <strong>Math Formula:</strong> <code>$E = mc^2$</code> (inline),{" "}
                <code>$$formula$$</code> (block)
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
