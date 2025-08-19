import { useState } from "react";
import { useEditor } from "./hooks/useEditor";
import Navbar from "./components/Navbar";
import Toolbar from "./components/Toolbar";
import Editor from "./components/Editor";
import HelpModal from "./components/HelpModal";
import "./App.css";

function App() {
  const { value, setValue, isEditing, setIsEditing, textareaRef, insertText } =
    useEditor();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleHelpClick = () => {
    setIsHelpOpen(true);
  };

  const handleHelpClose = () => {
    setIsHelpOpen(false);
  };

  return (
    <div className="app-container">
      <Navbar onHelpClick={handleHelpClick} />
      <Toolbar
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        textareaRef={textareaRef}
        value={value}
        setValue={setValue}
        insertText={insertText}
      />
      <Editor
        isEditing={isEditing}
        value={value}
        setValue={setValue}
        textareaRef={textareaRef}
      />
      <HelpModal isOpen={isHelpOpen} onClose={handleHelpClose} />
    </div>
  );
}

export default App;
