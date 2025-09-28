'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * 需要认证的路由列表
 */
const PROTECTED_ROUTES = ['/', '/users', '/questions', '/files'];

/**
 * 不需要认证的路由列表
 */
const PUBLIC_ROUTES = ['/login'];

/**
 * 路由保护组件
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // 等待认证状态检查完成
    if (loading) {
      return;
    }

    const isProtectedRoute = PROTECTED_ROUTES.some(
      route => pathname === route || pathname.startsWith(route + '/')
    );

    const isPublicRoute = PUBLIC_ROUTES.some(
      route => pathname === route || pathname.startsWith(route + '/')
    );

    // 如果是受保护的路由但用户未登录，重定向到登录页
    if (isProtectedRoute && !isAuthenticated) {
      router.replace('/login');
      return;
    }

    // 如果是公共路由但用户已登录，重定向到首页
    if (isPublicRoute && isAuthenticated) {
      router.replace('/');
      return;
    }
  }, [isAuthenticated, loading, pathname, router]);

  // 显示加载状态
  if (loading) {
    return (
      <LoadingSpinner
        size="large"
        tip="正在验证身份..."
        style={{ minHeight: '100vh' }}
      />
    );
  }

  // 检查当前路由是否需要认证
  const isProtectedRoute = PROTECTED_ROUTES.some(
    route => pathname === route || pathname.startsWith(route + '/')
  );

  // 如果是受保护的路由但用户未登录，显示加载状态（等待重定向）
  if (isProtectedRoute && !isAuthenticated) {
    return (
      <LoadingSpinner
        size="large"
        tip="正在跳转到登录页..."
        style={{ minHeight: '100vh' }}
      />
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
