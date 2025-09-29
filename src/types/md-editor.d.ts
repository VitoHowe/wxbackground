declare module '@uiw/react-md-editor' {
  import type { FC } from 'react';

  export interface MDEditorProps {
    value?: string;
    onChange?: (value?: string) => void;
    height?: number;
    textareaProps?: Record<string, unknown>;
    preview?: 'edit' | 'live' | 'preview';
    visiableDragbar?: boolean;
  }

  const MDEditor: FC<MDEditorProps>;
  export default MDEditor;
}

declare module '@uiw/react-markdown-preview' {
  const MarkdownPreview: React.ComponentType<{ source?: string }>;
  export default MarkdownPreview;
}
