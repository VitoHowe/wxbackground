'use client';

import { useAuthContext } from '@/context/AuthContext';

/**
 * 认证 Hook（代理到全局 AuthContext，避免重复初始化与多次拉取 profile）
 */
export const useAuth = () => {
  return useAuthContext();
};
