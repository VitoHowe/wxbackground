import { get, post, setToken, removeToken, getToken } from '@/utils/request';
import { API_PATHS, API_CONFIG } from '@/constants/api';
import type { ApiResponse } from '@/types';

/**
 * 登录请求参数
 */
export interface LoginParams {
  username: string;
  password: string;
}

/**
 * 注册请求参数
 */
export interface RegisterParams {
  username: string;
  password: string;
  nickname?: string;
  phone?: string;
}

/**
 * 用户信息
 */
export interface UserInfo {
  id: number;
  username?: string;
  openid?: string;
  nickname?: string;
  avatar_url?: string;
  phone?: string;
  role_id: number;
  status: number;
  created_at: string;
  updated_at: string;
}

/**
 * 登录响应
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: UserInfo;
}

/**
 * 刷新令牌请求参数
 */
export interface RefreshTokenParams {
  refreshToken: string;
}

/**
 * 刷新令牌响应
 */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

/**
 * 认证服务
 */
export class AuthService {
  /**
   * 用户登录
   */
  static async login(params: LoginParams): Promise<ApiResponse<LoginResponse>> {
    const response = await post<LoginResponse>(
      API_PATHS.LOGIN,
      params as unknown as Record<string, unknown>
    );
    console.log('loginresponse', response);

    // 登录成功后保存 token
    if (response.code === 200 && response.data) {
      setToken(response.data.accessToken);
      this.setRefreshToken(response.data.refreshToken);
    }

    return response;
  }

  /**
   * 用户注册
   */
  static async register(
    params: RegisterParams
  ): Promise<ApiResponse<LoginResponse>> {
    const response = await post<LoginResponse>(
      API_PATHS.REGISTER,
      params as unknown as Record<string, unknown>
    );

    // 注册成功后保存 token
    if (response.code === 201 && response.data) {
      setToken(response.data.accessToken);
      this.setRefreshToken(response.data.refreshToken);
    }

    return response;
  }

  /**
   * 获取用户信息
   */
  static async getProfile(): Promise<ApiResponse<UserInfo>> {
    return get<UserInfo>(API_PATHS.PROFILE);
  }

  /**
   * 更新用户信息
   */
  static async updateProfile(
    params: Partial<Pick<UserInfo, 'nickname' | 'avatar_url' | 'phone'>>
  ): Promise<ApiResponse<UserInfo>> {
    return post<UserInfo>(API_PATHS.PROFILE, params);
  }

  /**
   * 刷新访问令牌
   */
  static async refreshToken(): Promise<ApiResponse<RefreshTokenResponse>> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('没有刷新令牌');
    }

    const response = await post<RefreshTokenResponse>(API_PATHS.REFRESH, {
      refreshToken,
    });

    // 刷新成功后更新 token
    if (response.code === 200 && response.data) {
      setToken(response.data.accessToken);
      this.setRefreshToken(response.data.refreshToken);
    }

    return response;
  }

  /**
   * 用户登出
   */
  static async logout(): Promise<void> {
    try {
      await post(API_PATHS.LOGOUT);
    } catch (error) {
      console.warn('登出请求失败:', error);
    } finally {
      // 无论请求是否成功，都清除本地 token
      this.clearTokens();
    }
  }

  /**
   * 检查是否已登录
   */
  static isLoggedIn(): boolean {
    return !!getToken();
  }

  /**
   * 检查 token 是否有效
   */
  static async checkTokenValid(): Promise<boolean> {
    try {
      const response = await this.getProfile();
      return response.code === 200;
    } catch {
      return false;
    }
  }

  /**
   * 设置刷新令牌
   */
  private static setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(API_CONFIG.REFRESH_TOKEN_KEY, token);
    }
  }

  /**
   * 获取刷新令牌
   */
  private static getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(API_CONFIG.REFRESH_TOKEN_KEY);
    }
    return null;
  }

  /**
   * 清除所有令牌
   */
  private static clearTokens(): void {
    removeToken();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(API_CONFIG.REFRESH_TOKEN_KEY);
    }
  }
}
