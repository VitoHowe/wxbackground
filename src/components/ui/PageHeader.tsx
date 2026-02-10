'use client';

import React from 'react';
import { Breadcrumb, Button, Space, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { BreadcrumbProps } from 'antd';
import styles from './PageHeader.module.css';

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
    <div className={styles.header}>
      {breadcrumb ? (
        <Breadcrumb items={breadcrumb} className={styles.breadcrumb} />
      ) : null}

      <div className={styles.row}>
        <div className={styles.titleWrap}>
          {showBack ? (
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={onBack}
              aria-label="返回"
              className={styles.backBtn}
            />
          ) : null}

          <div className={styles.titleText}>
            <Title level={3} className={styles.title}>
              {title}
            </Title>
            {subtitle ? (
              <Text type="secondary" className={styles.subtitle}>
                {subtitle}
              </Text>
            ) : null}
          </div>
        </div>

        {extra ? <Space className={styles.extra}>{extra}</Space> : null}
      </div>
    </div>
  );
};

export default PageHeader;

