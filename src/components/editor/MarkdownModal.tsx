'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Modal, Spin } from 'antd';

type MarkdownEditorComponent = typeof import('@uiw/react-md-editor').default;

const MDEditor = dynamic(async () => import('@uiw/react-md-editor'), {
  ssr: false,
}) as unknown as MarkdownEditorComponent;

interface MarkdownModalProps {
  open: boolean;
  title: string;
  value?: string;
  loading?: boolean;
  saving?: boolean;
  width?: number;
  onCancel: () => void;
  onSave: (content: string) => void;
}

const MarkdownModal: React.FC<MarkdownModalProps> = ({
  open,
  title,
  value,
  loading,
  saving,
  width = 720,
  onCancel,
  onSave,
}) => {
  const [content, setContent] = useState(value ?? '');

  useEffect(() => {
    if (open) {
      setContent(value ?? '');
    }
  }, [open, value]);

  const handleOk = () => {
    onSave(content ?? '');
  };

  return (
    <Modal
      open={open}
      title={title}
      width={width}
      onCancel={onCancel}
      onOk={handleOk}
      okText="保存"
      cancelText="取消"
      confirmLoading={saving}
      destroyOnClose
      maskClosable={false}
    >
      <div data-color-mode="light">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
            <Spin size="large" />
          </div>
        ) : (
          <MDEditor
            value={content}
            onChange={(val?: string) => setContent(val ?? '')}
            height={400}
            textareaProps={{ placeholder: '在此编写或粘贴 Markdown 内容' }}
          />
        )}
      </div>
    </Modal>
  );
};

export default MarkdownModal;
