declare module 'emoji-mart/data/emojis.json' {
  interface EmojiData {
    id: string;
    name: string;
    keywords: string[];
    native: string;
    unified: string;
    skins: Array<{
      unified: string;
      native: string;
    }>;
  }
  const data: Record<string, EmojiData>;
  export default data;
}

declare module 'emoji-mart/dist/components/Picker' {
  import { FC } from 'react';
  
  interface EmojiObject {
    id: string;
    name: string;
    native: string;
    unified: string;
    keywords: string[];
  }
  
  interface PickerProps {
    data: Record<string, EmojiObject>;
    onEmojiSelect: (emoji: EmojiObject) => void;
    theme?: 'light' | 'dark';
  }
  
  const Picker: FC<PickerProps>;
  export default Picker;
}

declare module '@tiptap/core' {
  interface Extension {
    name: string;
    type: string;
    configure?: (options?: Record<string, unknown>) => Extension;
  }

  interface EditorOptions {
    content?: string;
    extensions?: (Extension | Extension[])[];
    editable?: boolean;
  }

  interface CommandChain {
    focus(): CommandChain;
    run(): boolean;
    [key: string]: (...args: unknown[]) => CommandChain;
  }

  export class Editor {
    getHTML(): string;
    chain(): CommandChain;
    focus(): Editor;
    isActive(name: string, attributes?: Record<string, unknown>): boolean;
  }
}

declare module '@tiptap/react' {
  import { Editor } from '@tiptap/core';
  
  interface Extension {
    name: string;
    type: string;
    configure?: (options?: Record<string, unknown>) => Extension;
  }
  
  interface EditorUpdateProps {
    editor: Editor;
  }
  
  interface EditorOptions {
    content?: string;
    extensions?: (Extension | Extension[])[];
    editable?: boolean;
    onUpdate?: (props: EditorUpdateProps) => void;
    editorProps?: {
      attributes?: {
        class?: string;
        [key: string]: string | undefined;
      };
    };
  }
  
  export function useEditor(options: EditorOptions): Editor | null;
  export const EditorContent: React.FC<{ editor: Editor | null; className?: string }>;
}

declare module '@tiptap/starter-kit' {
  interface Extension {
    name: string;
    type: string;
    configure?: (options?: Record<string, unknown>) => Extension;
  }
  
  interface StarterKitOptions {
    heading?: boolean;
    bold?: boolean;
    italic?: boolean;
    strike?: boolean;
    code?: boolean;
    bulletList?: boolean;
    orderedList?: boolean;
    blockquote?: boolean;
    horizontalRule?: boolean;
  }
  
  function StarterKit(options?: StarterKitOptions): Extension[];
  export default StarterKit;
}

declare module '@emoji-mart/data' {
  interface EmojiData {
    id: string;
    name: string;
    keywords: string[];
    skins: Array<{
      unified: string;
      native: string;
    }>;
  }
  const data: Record<string, EmojiData>;
  export default data;
}

declare module '@emoji-mart/react' {
  import { FC } from 'react';
  
  interface EmojiObject {
    id: string;
    name: string;
    native: string;
    unified: string;
    keywords: string[];
    skins: Array<{
      unified: string;
      native: string;
    }>;
  }
  
  interface PickerProps {
    data: Record<string, EmojiObject>;
    onEmojiSelect: (emoji: EmojiObject) => void;
    theme?: 'light' | 'dark';
  }
  
  const Picker: FC<PickerProps>;
  export default Picker;
} 