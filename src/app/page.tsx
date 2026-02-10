'use client';

import React from 'react';
import { Space, Tag, Typography, Button } from 'antd';
import {
  UserOutlined,
  FileOutlined,
  CloudUploadOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { ActionCard, AppCard, KpiTiles, MainLayout, PageHeader } from '@/components';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import styles from './page.module.css';

const { Text } = Typography;

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();

  // 这里先保留演示数据，后续可接入后端统计接口。
  const kpiItems = [
    {
      key: 'users',
      title: '总用户数',
      value: 1234,
      prefix: <UserOutlined />,
      tone: 'primary' as const,
    },
    {
      key: 'files',
      title: '文件总数',
      value: 567,
      prefix: <FileOutlined />,
      tone: 'success' as const,
    },
    {
      key: 'uploads',
      title: '今日上传',
      value: 89,
      prefix: <CloudUploadOutlined />,
      tone: 'accent' as const,
    },
    {
      key: 'storage',
      title: '存储使用',
      value: 78.5,
      suffix: '%',
      prefix: <BarChartOutlined />,
      tone: 'warning' as const,
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title={`欢迎回来，${user?.nickname || user?.username || '用户'}！`}
        subtitle="欢迎使用微信小程序后台管理系统"
        extra={
          <Space>
            <Button onClick={() => router.push('/files')}>解析中心</Button>
            <Button
              type="primary"
              icon={<CloudUploadOutlined />}
              onClick={() => router.push('/files/upload')}
            >
              上传文档
            </Button>
          </Space>
        }
      />

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <KpiTiles items={kpiItems} />

        <div className={styles.grid2}>
          <AppCard title="快捷入口">
            <div className={styles.actionsGrid}>
              <ActionCard
                icon={<CloudUploadOutlined />}
                title="上传 Markdown"
                description="导入文档并生成章节"
                onClick={() => router.push('/files/upload')}
              />
              <ActionCard
                icon={<FileOutlined />}
                title="解析中心"
                description="查看进度、章节与预览"
                tone="success"
                onClick={() => router.push('/files')}
              />
              <ActionCard
                icon={<BarChartOutlined />}
                title="题库管理"
                description="整库/章节 JSON 导入"
                tone="accent"
                onClick={() => router.push('/question-config/banks')}
              />
              <ActionCard
                icon={<UserOutlined />}
                title="系统设置"
                description="供应商配置与解析模板"
                tone="warning"
                onClick={() => router.push('/settings')}
              />
            </div>
          </AppCard>

          <AppCard title="系统概览">
            <div className={styles.kvList}>
              <div className={styles.kvRow}>
                <span className={styles.kvKey}>系统版本</span>
                <span className={styles.kvValue}>v1.0.0</span>
              </div>
              <div className={styles.kvRow}>
                <span className={styles.kvKey}>当前用户</span>
                <span className={styles.kvValue}>{user?.username || '未知'}</span>
              </div>
              <div className={styles.kvRow}>
                <span className={styles.kvKey}>用户角色</span>
                <span className={styles.kvValue}>
                  {user?.role_id === 1 ? '管理员' : '普通用户'}
                </span>
              </div>
              <div className={styles.kvRow}>
                <span className={styles.kvKey}>服务器状态</span>
                <Tag color="success" bordered={false} style={{ marginInlineEnd: 0 }}>
                  正常
                </Tag>
              </div>
            </div>
          </AppCard>
        </div>

        <AppCard title="最近动态">
          <div className={styles.activity}>
            <div className={styles.activityItem}>
              <div className={styles.activityIcon} aria-hidden="true">
                <UserOutlined />
              </div>
              <div>
                <div className={styles.activityTitle}>用户登录</div>
                <div className={styles.activityDesc}>
                  <Text>{user?.nickname || user?.username}</Text> 刚刚登录了系统
                </div>
              </div>
            </div>

            <div className={styles.activityItem}>
              <div
                className={styles.activityIcon}
                aria-hidden="true"
                style={{ background: 'rgba(22, 163, 74, 0.12)', color: '#16A34A' }}
              >
                <FileOutlined />
              </div>
              <div>
                <div className={styles.activityTitle}>文件上传</div>
                <div className={styles.activityDesc}>管理员上传了 3 个文件</div>
              </div>
            </div>

            <div className={styles.activityItem}>
              <div
                className={styles.activityIcon}
                aria-hidden="true"
                style={{ background: 'rgba(249, 115, 22, 0.12)', color: 'var(--app-accent)' }}
              >
                <BarChartOutlined />
              </div>
              <div>
                <div className={styles.activityTitle}>系统更新</div>
                <div className={styles.activityDesc}>系统已更新到最新版本 v1.0.0</div>
              </div>
            </div>
          </div>
        </AppCard>
      </Space>
    </MainLayout>
  );
};

export default HomePage;
