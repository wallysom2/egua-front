declare module 'emoji-mart/data/emojis.json' {
  const data: any;
  export default data;
}

declare module 'emoji-mart/dist/components/Picker' {
  import { FC } from 'react';
  
  interface PickerProps {
    data: any;
    onEmojiSelect: (emoji: any) => void;
    theme?: 'light' | 'dark';
  }
  
  const Picker: FC<PickerProps>;
  export default Picker;
}

declare module '@tiptap/core' {
  export class Editor {
    getHTML(): string;
    chain(): any;
    focus(): any;
    isActive(name: string, attributes?: Record<string, any>): boolean;
  }
}

declare module '@tiptap/react' {
  import { Editor } from '@tiptap/core';
  
  interface EditorUpdateProps {
    editor: Editor;
  }
  
  export function useEditor(options: any): Editor | null;
  export const EditorContent: React.FC<{ editor: Editor | null; className?: string }>;
}

declare module '@tiptap/starter-kit' {
  const StarterKit: any;
  export default StarterKit;
}

declare module '@emoji-mart/data' {
  const data: any;
  export default data;
}

declare module '@emoji-mart/react' {
  import { FC } from 'react';
  
  interface PickerProps {
    data: any;
    onEmojiSelect: (emoji: any) => void;
    theme?: 'light' | 'dark';
  }
  
  const Picker: FC<PickerProps>;
  export default Picker;
} 