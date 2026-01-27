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
  App,
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
  BookOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAuth } from '@/hooks/useAuth';
import { usePathname, useRouter } from 'next/navigation';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;
// 使用 App.useApp() 提供的 modal 修复静态方法的上下文警告

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
    key: 'question-config',
    icon: <BookOutlined />,
    label: '题库配置',
    children: [
      {
        key: 'qc-subjects',
        label: '科目管理',
      },
      {
        key: 'qc-chapters',
        label: '章节管理',
      },
      {
        key: 'qc-banks',
        label: '题库管理',
      },
      {
        key: 'qc-template',
        label: '题库模板',
      },
      {
        key: 'qc-images',
        label: '图片管理',
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

const menuKeyToPath: Record<string, string> = {
  dashboard: '/',
  'file-upload': '/files/upload',
  'file-list': '/files',
  settings: '/settings',
  'qc-subjects': '/question-config/subjects',
  'qc-chapters': '/question-config/chapters',
  'qc-banks': '/question-config/banks',
  'qc-template': '/question-config/template',
  'qc-images': '/question-config/images',
};

const resolveSelectedMenuKey = (pathname: string): string => {
  const orderedEntries = Object.entries(menuKeyToPath).sort(
    (a, b) => b[1].length - a[1].length
  );

  for (const [key, path] of orderedEntries) {
    if (!path) continue;
    if (pathname === path) {
      return key;
    }
    if (path !== '/' && pathname.startsWith(path)) {
      return key;
    }
  }

  return 'dashboard';
};

const deriveMenuState = (pathname: string) => {
  const selectedKey = resolveSelectedMenuKey(pathname);

  const nextOpenKeys = selectedKey.startsWith('file-')
    ? ['file-management']
    : selectedKey.startsWith('qc-')
      ? ['question-config']
    : [];

  return {
    selectedKeys: [selectedKey],
    openKeys: nextOpenKeys,
  };
};

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { modal } = App.useApp();
  const getInitialMenuState = React.useCallback(
    () => deriveMenuState(pathname),
    [pathname]
  );
  const initialMenuState = getInitialMenuState();
  const [selectedKeys, setSelectedKeys] = useState<string[]>(
    initialMenuState.selectedKeys
  );
  const [openKeys, setOpenKeys] = useState<string[]>(
    initialMenuState.openKeys
  );

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 处理菜单点击
  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    setSelectedKeys([key]);
    const targetPath = menuKeyToPath[key];

    if (targetPath) {
      router.push(targetPath);
    } else {
      console.log('导航到:', key);
    }
  };

  // 根据当前路径同步选中菜单与展开的子菜单
  React.useLayoutEffect(() => {
    const { selectedKeys: nextSelectedKeys, openKeys: nextOpenKeys } =
      deriveMenuState(pathname);
    setSelectedKeys(nextSelectedKeys);
    setOpenKeys(nextOpenKeys);
  }, [pathname]);

  // 处理退出登录
  const handleLogout = () => {
    modal.confirm({
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
          openKeys={openKeys}
          items={menuItems}
          onClick={handleMenuClick}
          onOpenChange={keys => setOpenKeys(keys as string[])}
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
