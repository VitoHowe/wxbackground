/**
 * 用户角色枚举
 */
export enum UserRole {
  ADMIN = 1, // 管理员
  USER = 2, // 普通用户
}

/**
 * 用户状态枚举
 */
export enum UserStatus {
  DISABLED = 0, // 禁用
  ENABLED = 1, // 启用
}

/**
 * 表单验证规则
 */
export interface FormValidationRules {
  username: {
    required: boolean;
    min: number;
    max: number;
    pattern: RegExp;
    message: string;
  };
  password: {
    required: boolean;
    min: number;
    max: number;
    pattern: RegExp;
    message: string;
  };
  nickname: {
    max: number;
    message: string;
  };
  phone: {
    pattern: RegExp;
    message: string;
  };
}

/**
 * 认证状态
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  loading: boolean;
  error: string | null;
}

/**
 * 用户信息接口（重新导出以保持一致性）
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
