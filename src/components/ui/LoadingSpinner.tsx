'use client';

import React from 'react';
import { Spin, Space } from 'antd';

interface LoadingSpinnerProps {
  size?: 'small' | 'default' | 'large';
  tip?: string;
  spinning?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'default',
  tip = '加载中...',
  spinning = true,
  children,
  style,
}) => {
  if (children) {
    return (
      <Spin spinning={spinning} tip={tip} size={size} style={style}>
        {children}
      </Spin>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 200,
        ...style,
      }}
    >
      <Space direction="vertical" align="center">
        <Spin size={size} />
        {tip && <span style={{ marginTop: 8, color: '#666' }}>{tip}</span>}
      </Space>
    </div>
  );
};

export default LoadingSpinner;
