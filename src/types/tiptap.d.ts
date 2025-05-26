declare module '@tiptap/react' {
  export interface Editor {
    getHTML(): string;
    chain(): any;
    isActive(name: string, attributes?: any): boolean;
  }

  export interface EditorOptions {
    extensions: any[];
    content?: string;
    immediatelyRender?: boolean;
    onUpdate?: (props: { editor: Editor }) => void;
    editable?: boolean;
    editorProps?: {
      attributes?: {
        class?: string;
        [key: string]: any;
      };
    };
  }

  export function useEditor(options: EditorOptions): Editor | null;
  export const EditorContent: React.FC<{ editor: Editor | null; className?: string }>;
}

declare module '@tiptap/starter-kit' {
  const StarterKit: any;
  export default StarterKit;
} 