'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  App,
  Avatar,
  Button,
  Drawer,
  Dropdown,
  Grid,
  Layout,
  Menu,
  Space,
  Typography,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  BookOutlined,
  CloudUploadOutlined,
  DashboardOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { usePathname, useRouter } from 'next/navigation';
import styles from './MainLayout.module.css';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface MainLayoutProps {
  children: React.ReactNode;
}

const SIDER_WIDTH = 256;
const SIDER_COLLAPSED_WIDTH = 80;

const menuItems: MenuProps['items'] = [
  {
    key: 'dashboard',
    icon: <DashboardOutlined />,
    label: '仪表盘',
  },
  {
    type: 'divider',
  },
  {
    key: 'file-management',
    icon: <CloudUploadOutlined />,
    label: '文件与解析',
    children: [
      {
        key: 'file-upload',
        label: '文档上传',
      },
      {
        key: 'file-list',
        label: '解析中心',
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
    key: 'question-management',
    icon: <QuestionCircleOutlined />,
    label: '题目管理',
    children: [
      {
        key: 'question-banks',
        label: '题库列表',
        disabled: true,
      },
      {
        key: 'questions',
        label: '题目列表',
        disabled: true,
      },
    ],
  },
  {
    type: 'divider',
  },
  {
    key: 'user-management',
    icon: <TeamOutlined />,
    label: '用户管理',
    disabled: true,
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { modal } = App.useApp();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.lg;

  const initialMenuState = useMemo(() => deriveMenuState(pathname), [pathname]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(
    initialMenuState.selectedKeys
  );
  const [openKeys, setOpenKeys] = useState<string[]>(initialMenuState.openKeys);

  const contentOffset = isMobile
    ? 0
    : collapsed
      ? SIDER_COLLAPSED_WIDTH
      : SIDER_WIDTH;

  useEffect(() => {
    const { selectedKeys: nextSelectedKeys, openKeys: nextOpenKeys } =
      deriveMenuState(pathname);
    setSelectedKeys(nextSelectedKeys);
    setOpenKeys(nextOpenKeys);
    setMobileOpen(false);
  }, [pathname]);

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    const targetPath = menuKeyToPath[key];
    if (targetPath) {
      router.push(targetPath);
    }
  };

  const handleLogout = () => {
    modal.confirm({
      title: '确认退出',
      content: '确定要退出登录吗？',
      okText: '退出',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        await logout();
      },
    });
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
      disabled: true,
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
      onClick: () => router.push('/settings'),
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

  const siderNode = (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={SIDER_WIDTH}
      collapsedWidth={SIDER_COLLAPSED_WIDTH}
      className={styles.sider}
    >
      <div className={styles.brand} role="banner" aria-label="应用导航">
        <div className={styles.brandMark} aria-hidden="true">
          WX
        </div>
        {!collapsed ? (
          <div className={styles.brandText}>
            <div className={styles.brandName}>微信后台</div>
            <div className={styles.brandDesc}>管理控制台</div>
          </div>
        ) : null}
      </div>

      <div className={styles.menu}>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          openKeys={openKeys}
          items={menuItems}
          onClick={handleMenuClick}
          onOpenChange={(keys) => setOpenKeys(keys as string[])}
        />
      </div>
    </Sider>
  );

  return (
    <Layout className={styles.shell}>
      {!isMobile ? siderNode : null}

      {isMobile ? (
        <Drawer
          open={mobileOpen}
          placement="left"
          width={SIDER_WIDTH}
          closable={false}
          onClose={() => setMobileOpen(false)}
          rootClassName={styles.mobileDrawer}
          destroyOnClose
        >
          <div className={styles.mobileBrand}>
            <div className={styles.brandMark} aria-hidden="true">
              WX
            </div>
            <div className={styles.brandText}>
              <div className={styles.brandName}>微信后台</div>
              <div className={styles.brandDesc}>管理控制台</div>
            </div>
          </div>

          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            items={menuItems}
            onClick={(e) => {
              handleMenuClick(e);
              setMobileOpen(false);
            }}
            onOpenChange={(keys) => setOpenKeys(keys as string[])}
          />
        </Drawer>
      ) : null}

      <Layout className={styles.main} style={{ marginLeft: contentOffset }}>
        <Header className={styles.header}>
          <div className={styles.headerLeft}>
            <Button
              type="text"
              aria-label={isMobile ? '打开导航' : collapsed ? '展开侧边栏' : '收起侧边栏'}
              icon={
                isMobile ? (
                  <MenuUnfoldOutlined />
                ) : collapsed ? (
                  <MenuUnfoldOutlined />
                ) : (
                  <MenuFoldOutlined />
                )
              }
              onClick={() => {
                if (isMobile) {
                  setMobileOpen(true);
                } else {
                  setCollapsed((prev) => !prev);
                }
              }}
              className={styles.headerButton}
            />

            <Text type="secondary" className={styles.headerHint}>
              {selectedKeys[0] === 'dashboard' ? '概览' : '数据管理'}
            </Text>
          </div>

          <div className={styles.headerRight}>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <div className={styles.userButton} role="button" tabIndex={0}>
                <Space size={10}>
                  <Avatar
                    size="small"
                    src={user?.avatar_url}
                    icon={!user?.avatar_url ? <UserOutlined /> : undefined}
                  />
                  <div className={styles.userText}>
                    <div className={styles.userName}>
                      {user?.nickname || user?.username || '用户'}
                    </div>
                    <div className={styles.userMeta}>
                      {user?.role_id === 1 ? '管理员' : '普通用户'}
                    </div>
                  </div>
                </Space>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className={styles.content}>
          <div className={`${styles.contentInner} app-page`}>{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;

