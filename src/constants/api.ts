/**
 * API 基础配置
 */
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
  TIMEOUT: 10000,
  TOKEN_KEY: 'wx_admin_token',
  REFRESH_TOKEN_KEY: 'wx_admin_refresh_token',
} as const;

/**
 * API 路径
 */
export const API_PATHS = {
  // 认证相关
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  PROFILE: '/auth/profile',

  // 用户相关
  USERS: '/users',
  USER_DETAIL: (id: number) => `/users/${id}`,

  // 题库相关
  QUESTIONS: '/questions',
  QUESTION_DETAIL: (id: number) => `/questions/${id}`,
  QUESTION_BANKS: '/questions/banks',
  QUESTION_BANK_DETAIL: (id: number) => `/questions/banks/${id}`,

  // 文件相关
  FILES: '/files',
  FILE_DETAIL: (id: number) => `/files/${id}`,
  FILE_UPLOAD: '/files/upload',
  FILE_PARSE: (id: number) => `/files/${id}/parse`,
  FILE_PARSE_STATUS: (id: number) => `/files/${id}/parse-status`,

  // 系统设置相关
  PROVIDER_CONFIGS: '/system/providers',
  PROVIDER_CONFIG_DETAIL: (id: number) => `/system/providers/${id}`,
  KNOWLEDGE_FORMAT: '/system/knowledge-format',
  QUESTION_FORMAT: '/system/question-parse-format',
} as const;

/**
 * HTTP 状态码
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * 业务状态码
 */
export const BUSINESS_CODE = {
  SUCCESS: 200,
  CREATED: 201,
  ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
} as const;
