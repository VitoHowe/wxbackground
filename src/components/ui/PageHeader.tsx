'use client';

import React from 'react';
import { Typography, Breadcrumb, Space, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { BreadcrumbProps } from 'antd';

const { Title, Text } = Typography;

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: BreadcrumbProps['items'];
  extra?: React.ReactNode;
  onBack?: () => void;
  showBack?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumb,
  extra,
  onBack,
  showBack = false,
}) => {
  return (
    <div style={{ marginBottom: 24 }}>
      {breadcrumb && (
        <Breadcrumb items={breadcrumb} style={{ marginBottom: 12 }} />
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <Space align="center">
          {showBack && (
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={onBack}
              style={{ marginRight: 8 }}
            />
          )}
          <Title level={2} style={{ margin: 0 }}>
            {title}
          </Title>
        </Space>

        {extra && <Space>{extra}</Space>}
      </div>

      {subtitle && (
        <Text type="secondary" style={{ fontSize: 14 }}>
          {subtitle}
        </Text>
      )}
    </div>
  );
};

export default PageHeader;
