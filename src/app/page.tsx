'use client';

import React from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Button, App } from 'antd';
import {
  UserOutlined,
  FileOutlined,
  CloudUploadOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { MainLayout, PageHeader } from '@/components';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const { Text } = Typography;

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { message } = App.useApp();

  // 模拟数据
  const statistics = [
    {
      title: '总用户数',
      value: 1234,
      icon: <UserOutlined style={{ color: '#1890ff' }} />,
      color: '#1890ff',
    },
    {
      title: '文件总数',
      value: 567,
      icon: <FileOutlined style={{ color: '#52c41a' }} />,
      color: '#52c41a',
    },
    {
      title: '今日上传',
      value: 89,
      icon: <CloudUploadOutlined style={{ color: '#fa8c16' }} />,
      color: '#fa8c16',
    },
    {
      title: '存储使用',
      value: 78.5,
      suffix: '%',
      icon: <BarChartOutlined style={{ color: '#eb2f96' }} />,
      color: '#eb2f96',
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title={`欢迎回来，${user?.nickname || user?.username || '用户'}！`}
        subtitle="欢迎使用微信小程序后台管理系统"
        extra={
          <Button
            type="primary"
            icon={<CloudUploadOutlined />}
            onClick={() => router.push('/files/upload')}
          >
            快速上传
          </Button>
        }
      />

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statistics.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                suffix={stat.suffix}
                prefix={stat.icon}
                valueStyle={{ color: stat.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* 快速操作 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="快速操作" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="default"
                block
                icon={<CloudUploadOutlined />}
                size="large"
              >
                上传文件
              </Button>
              <Button type="default" block icon={<UserOutlined />} size="large">
                用户管理
              </Button>
              <Button type="default" block icon={<FileOutlined />} size="large">
                文件管理
              </Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="系统信息" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>系统版本:</Text>
                <Text strong>v1.0.0</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>当前用户:</Text>
                <Text strong>{user?.username || '未知'}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>用户角色:</Text>
                <Text strong>
                  {user?.role_id === 1 ? '管理员' : '普通用户'}
                </Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>服务器状态:</Text>
                <Text strong style={{ color: '#52c41a' }}>
                  正常
                </Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 最近活动 */}
      <Card title="最近活动" style={{ marginTop: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
            <Space>
              <UserOutlined style={{ color: '#1890ff' }} />
              <div>
                <Text strong>用户登录</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {user?.nickname || user?.username} 刚刚登录了系统
                </Text>
              </div>
            </Space>
          </div>
          <div style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
            <Space>
              <FileOutlined style={{ color: '#52c41a' }} />
              <div>
                <Text strong>文件上传</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  管理员上传了 3 个文件
                </Text>
              </div>
            </Space>
          </div>
          <div style={{ padding: '12px 0' }}>
            <Space>
              <BarChartOutlined style={{ color: '#fa8c16' }} />
              <div>
                <Text strong>系统更新</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  系统已更新到最新版本 v1.0.0
                </Text>
              </div>
            </Space>
          </div>
        </Space>
      </Card>
    </MainLayout>
  );
};

export default HomePage;
