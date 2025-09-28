'use client';

import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import {
  AuthService,
  type LoginParams,
  type RegisterParams,
  type UserInfo,
} from '@/services/auth';
import type { AuthState } from '@/types';

/**
 * 认证 Hook
 */
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
  });

  /**
   * 初始化认证状态
   */
  const initAuth = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));

    try {
      if (AuthService.isLoggedIn()) {
        const isValid = await AuthService.checkTokenValid();

        if (isValid) {
          const response = await AuthService.getProfile();
          if (response.code === 200 && response.data) {
            setAuthState({
              isAuthenticated: true,
              user: response.data,
              loading: false,
              error: null,
            });
            return;
          }
        }
      }

      // Token 无效或不存在
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('初始化认证状态失败:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: '认证状态检查失败',
      });
    }
  }, []);

  /**
   * 用户登录
   */
  const login = useCallback(async (params: LoginParams) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await AuthService.login(params);

      if (response.code === 200 && response.data) {
        setAuthState({
          isAuthenticated: true,
          user: response.data.user,
          loading: false,
          error: null,
        });

        message.success('登录成功');
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.message || '登录失败';
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));

        message.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '登录失败';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      message.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * 用户注册
   */
  const register = useCallback(async (params: RegisterParams) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await AuthService.register(params);

      if (response.code === 201 && response.data) {
        setAuthState({
          isAuthenticated: true,
          user: response.data.user,
          loading: false,
          error: null,
        });

        message.success('注册成功');
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.message || '注册失败';
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));

        message.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '注册失败';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      message.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * 用户登出
   */
  const logout = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true }));

    try {
      await AuthService.logout();
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });

      message.success('已退出登录');
    } catch (error) {
      console.error('登出失败:', error);
      // 即使登出请求失败，也清除本地状态
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });
    }
  }, []);

  /**
   * 更新用户信息
   */
  const updateUser = useCallback((user: UserInfo) => {
    setAuthState(prev => ({
      ...prev,
      user,
    }));
  }, []);

  /**
   * 清除错误信息
   */
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  // 组件挂载时初始化认证状态
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return {
    // 状态
    ...authState,

    // 方法
    login,
    register,
    logout,
    updateUser,
    clearError,
    refreshAuth: initAuth,
  };
};
