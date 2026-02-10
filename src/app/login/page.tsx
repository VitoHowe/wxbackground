'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Form,
  Input,
  Button,
  Card,
  Tabs,
  Space,
  Typography,
  Divider,
  Alert,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  PhoneOutlined,
  LoginOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import type { LoginParams, RegisterParams } from '@/services/auth';
import styles from './page.module.css';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

/**
 * 表单验证规则
 */
const validationRules = {
  username: [
    { required: true, message: '请输入用户名' },
    { min: 3, max: 50, message: '用户名长度应在3-50个字符之间' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' },
  ],
  password: [
    { required: true, message: '请输入密码' },
    { min: 6, max: 20, message: '密码长度应在6-20个字符之间' },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
      message: '密码必须包含大小写字母和数字',
    },
  ],
  nickname: [{ max: 50, message: '昵称最多50个字符' }],
  phone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号格式',
    },
  ],
};

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { login, register, isAuthenticated, loading, error, clearError } =
    useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loginForm] = Form.useForm<LoginParams>();
  const [registerForm] = Form.useForm<RegisterParams>();

  // 如果已经登录，重定向到首页
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  // 清除错误信息当切换标签时
  useEffect(() => {
    clearError();
  }, [activeTab, clearError]);

  /**
   * 处理登录
   */
  const handleLogin = async (values: LoginParams) => {
    const result = await login(values);
    if (result.success) {
      router.replace('/');
    }
  };

  /**
   * 处理注册
   */
  const handleRegister = async (values: RegisterParams) => {
    const result = await register(values);
    if (result.success) {
      router.replace('/');
    }
  };

  return (
    <div className={styles.wrapper}>
      <Card
        bordered={false}
        className={styles.card}
        bodyStyle={{ padding: 28 }}
      >
        {/* 标题区域 */}
        <div className={styles.header}>
          <div className={styles.brand} aria-label="微信后台管理系统">
            <div className={styles.brandMark} aria-hidden="true">
              WX
            </div>
            <div className={styles.brandText}>
              <Title level={2} className={styles.title}>
                微信后台
              </Title>
              <Text type="secondary" className={styles.subtitle}>
                成熟的题库与内容管理控制台
              </Text>
            </div>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={clearError}
            style={{ marginBottom: 24 }}
          />
        )}

        {/* 登录/注册表单 */}
        <Tabs
          activeKey={activeTab}
          onChange={key => setActiveTab(key as 'login' | 'register')}
          centered
        >
          {/* 登录表单 */}
          <TabPane
            tab={
              <Space>
                <LoginOutlined />
                登录
              </Space>
            }
            key="login"
          >
            <Form
              form={loginForm}
              layout="vertical"
              onFinish={handleLogin}
              autoComplete="off"
            >
              <Form.Item
                name="username"
                label="用户名"
                rules={validationRules.username}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="请输入用户名"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="密码"
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 6, message: '密码至少6个字符' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请输入密码"
                  size="large"
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  block
                >
                  登录
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          {/* 注册表单 */}
          <TabPane
            tab={
              <Space>
                <UserAddOutlined />
                注册
              </Space>
            }
            key="register"
          >
            <Form
              form={registerForm}
              layout="vertical"
              onFinish={handleRegister}
              autoComplete="off"
            >
              <Form.Item
                name="username"
                label="用户名"
                rules={validationRules.username}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="3-50个字符，只能包含字母、数字、下划线"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="密码"
                rules={validationRules.password}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="6-20个字符，需包含大小写字母和数字"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="nickname"
                label="昵称"
                rules={validationRules.nickname}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="请输入昵称（可选）"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="phone"
                label="手机号"
                rules={validationRules.phone}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="请输入手机号（可选）"
                  size="large"
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  block
                >
                  注册
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>

        <Divider />

        {/* 底部信息 */}
        <div className={styles.footer}>
          <Text type="secondary">© 2026 微信小程序后台管理系统</Text>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
