import type { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import { Geist, Geist_Mono } from 'next/font/google';
import zhCN from 'antd/locale/zh_CN';
import { AuthGuard } from '@/components';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '微信小程序后台管理系统',
  description: '用于管理微信小程序数据和文件的后台系统',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AntdRegistry>
          <ConfigProvider
            locale={zhCN}
            theme={{
              token: {
                colorPrimary: '#1890ff',
                borderRadius: 6,
                fontFamily: 'var(--font-geist-sans)',
              },
              components: {
                Layout: {
                  headerBg: '#fff',
                  siderBg: '#001529',
                },
                Menu: {
                  darkItemBg: '#001529',
                  darkSubMenuItemBg: '#000c17',
                  darkItemSelectedBg: '#1890ff',
                },
              },
            }}
          >
            <AuthGuard>{children}</AuthGuard>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
