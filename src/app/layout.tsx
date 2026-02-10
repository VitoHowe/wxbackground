import type { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { App, ConfigProvider } from 'antd';
import { Fira_Code, Noto_Sans_SC } from 'next/font/google';
import zhCN from 'antd/locale/zh_CN';
import { AuthGuard } from '@/components';
import { AuthProvider } from '@/context/AuthContext';
import AntdBridge from '@/components/layout/AntdBridge';
import { antdTheme } from '@/theme/antdTheme';
import './globals.css';

const appSans = Noto_Sans_SC({
  variable: '--font-app-sans',
  // Keep weights limited to reduce font payload while allowing UI hierarchy.
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  subsets: ['latin'],
});

const appMono = Fira_Code({
  variable: '--font-app-mono',
  weight: ['400', '500', '600'],
  display: 'swap',
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
        className={`${appSans.variable} ${appMono.variable} antialiased`}
      >
        <AntdRegistry>
          <ConfigProvider
            locale={zhCN}
            theme={antdTheme}
            componentSize="middle"
          >
            <App
              message={{ maxCount: 3, duration: 2 }}
              notification={{ placement: 'topRight', duration: 3, showProgress: true }}
            >
              <AntdBridge>
                <AuthProvider>
                  <AuthGuard>{children}</AuthGuard>
                </AuthProvider>
              </AntdBridge>
            </App>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
