/**
 * API 响应基础结构
 */
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
  success: boolean;
}

/**
 * 分页响应结构
 */
export interface PaginationResponse<T = unknown> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 文件上传响应
 */
export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

/**
 * 用户信息
 */
export interface UserInfo {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: string;
  createTime: string;
  updateTime: string;
}

/**
 * 登录响应
 */
export interface LoginResponse {
  token: string;
  userInfo: UserInfo;
}

/**
 * 请求配置
 */
export interface RequestConfig {
  showLoading?: boolean;
  showError?: boolean;
  timeout?: number;
}
