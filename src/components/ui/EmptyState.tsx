'use client';

import React from 'react';
import { Empty, Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface EmptyStateProps {
  title?: string;
  description?: string;
  image?: string;
  children?: React.ReactNode;
  action?: {
    text: string;
    onClick: () => void;
    icon?: React.ReactNode;
    type?: 'primary' | 'default' | 'dashed';
  };
  style?: React.CSSProperties;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = '暂无数据',
  description,
  image,
  children,
  action,
  style,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 300,
        ...style,
      }}
    >
      <Empty
        image={image || Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <Space direction="vertical" align="center">
            <span style={{ fontSize: 16, fontWeight: 500 }}>{title}</span>
            {description && (
              <span style={{ fontSize: 14, color: '#666' }}>{description}</span>
            )}
          </Space>
        }
      >
        {children}
        {action && (
          <Button
            type={action.type || 'primary'}
            icon={action.icon || <PlusOutlined />}
            onClick={action.onClick}
            style={{ marginTop: 16 }}
          >
            {action.text}
          </Button>
        )}
      </Empty>
    </div>
  );
};

export default EmptyState;
