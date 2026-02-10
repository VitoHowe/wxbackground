'use client';

import React, { useCallback, useMemo } from 'react';
import { App, Button } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import styles from './CodeBlock.module.css';

export type CodeBlockProps = {
  title?: React.ReactNode;
  value: string;
  maxHeight?: number;
  copyable?: boolean;
  copyText?: string;
};

const copyToClipboard = async (text: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
};

const CodeBlock: React.FC<CodeBlockProps> = ({
  title,
  value,
  maxHeight = 360,
  copyable = true,
  copyText,
}) => {
  const { message } = App.useApp();

  const style = useMemo(
    () =>
      ({
        ['--max-h' as any]: `${maxHeight}px`,
      }) as React.CSSProperties,
    [maxHeight]
  );

  const handleCopy = useCallback(async () => {
    try {
      await copyToClipboard(copyText ?? value);
      message.success('已复制到剪贴板');
    } catch (error) {
      message.error((error as Error)?.message || '复制失败');
    }
  }, [copyText, message, value]);

  return (
    <div className={styles.wrap}>
      {title || copyable ? (
        <div className={styles.header}>
          <div className={styles.title}>{title}</div>
          {copyable ? (
            <Button
              size="small"
              type="text"
              icon={<CopyOutlined />}
              onClick={() => void handleCopy()}
              style={{ color: 'rgba(226, 232, 240, 0.88)' }}
            >
              复制
            </Button>
          ) : null}
        </div>
      ) : null}
      <pre className={styles.pre} style={style}>
        {value || ''}
      </pre>
    </div>
  );
};

export default CodeBlock;

