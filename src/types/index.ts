export interface ToolbarButton {
  icon: React.ComponentType<{ size?: number }>;
  onClick: () => void;
  title: string;
  isActive?: boolean;
}

export interface EditorState {
  value: string;
  isEditing: boolean;
}

export interface EditorActions {
  insertText: (before: string, after?: string) => void;
  insertHeading: (level: number) => void;
  insertList: (type: "ul" | "ol") => void;
  insertCodeBlock: () => void;
  insertTable: () => void;
  insertLink: () => void;
  insertImage: () => void;
}

export type TextareaRef = React.RefObject<HTMLTextAreaElement | null>;
