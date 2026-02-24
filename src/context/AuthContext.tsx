"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { App } from "antd";
import {
  AuthService,
  type LoginParams,
  type RegisterParams,
  type UserInfo,
} from "@/services/auth";
import type { AuthState } from "@/types";

interface AuthContextValue extends AuthState {
  login: (params: LoginParams) => Promise<{ success: boolean; data?: any; error?: string }>;
  register: (params: RegisterParams) => Promise<{ success: boolean; data?: any; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (user: UserInfo) => void;
  clearError: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
  });
  const { message } = App.useApp();

  const initAuth = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));

    try {
      if (AuthService.isLoggedIn()) {
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

      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("初始化认证状态失败:", error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: "认证状态检查失败",
      });
    }
  }, []);

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
        message?.success("登录成功");
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.message || "登录失败";
        setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
        message?.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "登录失败";
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      message?.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const register = useCallback(async (params: RegisterParams) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await AuthService.register(params);
      if ((response.code === 200 || response.code === 201) && response.data) {
        setAuthState({
          isAuthenticated: true,
          user: response.data.user,
          loading: false,
          error: null,
        });
        message?.success("注册成功");
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.message || "注册失败";
        setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
        message?.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "注册失败";
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      message?.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true }));
    try {
      await AuthService.logout();
      setAuthState({ isAuthenticated: false, user: null, loading: false, error: null });
      message?.success("已退出登录");
    } catch (error) {
      console.error("登出失败:", error);
      setAuthState({ isAuthenticated: false, user: null, loading: false, error: null });
    }
  }, []);

  const updateUser = useCallback((user: UserInfo) => {
    setAuthState(prev => ({ ...prev, user }));
  }, []);

  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const value = useMemo<AuthContextValue>(() => ({
    ...authState,
    login,
    register,
    logout,
    updateUser,
    clearError,
    refreshAuth: initAuth,
  }), [authState, login, register, logout, updateUser, clearError, initAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
};
