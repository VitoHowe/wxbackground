'use client';

import React, { useState } from 'react';
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Button,
  theme,
  Space,
  Typography,
  Modal,
} from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  CloudUploadOutlined,
  TeamOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAuth } from '@/hooks/useAuth';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;
const { confirm } = Modal;

interface MainLayoutProps {
  children: React.ReactNode;
}

// 菜单项配置
const menuItems: MenuProps['items'] = [
  {
    key: 'dashboard',
    icon: <DashboardOutlined />,
    label: '仪表盘',
  },
  {
    key: 'file-management',
    icon: <CloudUploadOutlined />,
    label: '文件管理',
    children: [
      {
        key: 'file-upload',
        label: '文件上传',
      },
      {
        key: 'file-list',
        label: '文件列表',
      },
    ],
  },
  {
    key: 'question-management',
    icon: <QuestionCircleOutlined />,
    label: '题库管理',
    children: [
      {
        key: 'question-banks',
        label: '题库列表',
      },
      {
        key: 'questions',
        label: '题目管理',
      },
    ],
  },
  {
    key: 'user-management',
    icon: <TeamOutlined />,
    label: '用户管理',
  },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: '系统设置',
  },
];

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState(['dashboard']);
  const { user, logout } = useAuth();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 处理菜单点击
  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    setSelectedKeys([key]);
    // 这里可以添加路由导航逻辑
    console.log('导航到:', key);
  };

  // 处理退出登录
  const handleLogout = () => {
    confirm({
      title: '确认退出',
      content: '您确定要退出登录吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        await logout();
      },
    });
  };

  // 用户下拉菜单
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
      onClick: () => {
        console.log('个人信息');
      },
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
      onClick: () => {
        console.log('设置');
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
        }}
      >
        <div
          style={{
            height: 64,
            margin: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <Text
            style={{
              color: '#fff',
              fontSize: collapsed ? 16 : 20,
              fontWeight: 'bold',
            }}
          >
            {collapsed ? 'WX' : '微信后台'}
          </Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 200 }}>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 1,
            width: '100%',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />

          <Space size="middle">
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar
                  size="small"
                  src={user?.avatar_url}
                  icon={!user?.avatar_url ? <UserOutlined /> : undefined}
                />
                <Text>{user?.nickname || user?.username || '用户'}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
