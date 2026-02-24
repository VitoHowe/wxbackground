const normalizeBaseUrl = (url = ''): string => {
  if (!url) return '';
  return url.replace(/\/+$/, '');
};

const resolveApiBaseUrl = (): string => {
  const envBaseUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL || '');
  if (envBaseUrl) return envBaseUrl;
  // 本地开发默认走 wxnode 本地服务，避免误打线上环境。
  return 'http://127.0.0.1:3001/api';
};

/**
 * API 基础配置
 */
export const API_CONFIG = {
  BASE_URL: resolveApiBaseUrl(),
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
  QUESTION_BANK_CHAPTERS: (bankId: number) => `/question-banks/${bankId}/chapters`,
  QUESTION_BANK_CHAPTER_DETAIL: (bankId: number, chapterId: number) =>
    `/question-banks/${bankId}/chapters/${chapterId}`,
  QUESTION_BANK_IMAGES: (bankId: number) => `/question-banks/${bankId}/images`,
  QUESTION_BANK_IMAGE_DETAIL: (bankId: number, filename: string) =>
    `/question-banks/${bankId}/images/${filename}`,

  // 科目与题库配置
  SUBJECTS: '/subjects',
  SUBJECTS_ADMIN: '/subjects/admin',
  SUBJECT_DETAIL: (id: number) => `/subjects/${id}`,
  SUBJECT_CHAPTERS: (subjectId: number) => `/subjects/${subjectId}/chapters`,
  SUBJECT_CHAPTERS_SYNC: (subjectId: number) => `/subjects/${subjectId}/chapters/sync`,
  SUBJECT_CHAPTER_ALIASES: (subjectId: number) => `/subjects/${subjectId}/chapter-aliases`,
  SUBJECT_CHAPTER_ALIAS_DETAIL: (subjectId: number, aliasId: number) =>
    `/subjects/${subjectId}/chapter-aliases/${aliasId}`,
  SUBJECT_BANKS: (subjectId: number) => `/subjects/${subjectId}/banks`,
  ADMIN_QUESTION_BANKS: '/admin/question-banks',
  ADMIN_QUESTION_BANK_IMPORT: '/admin/question-banks/import-json',
  ADMIN_QUESTION_BANK_CHAPTER_IMPORT: (bankId: number) =>
    `/admin/question-banks/${bankId}/chapters/import-json`,
  ADMIN_QUESTION_BANK_SUBJECT_CHAPTERS: (bankId: number) =>
    `/admin/question-banks/${bankId}/subject-chapters`,

  // 论文与机构管理
  ADMIN_ESSAY_ORGS: '/admin/essay-orgs',
  ADMIN_ESSAY_ORG_DETAIL: (orgId: number) => `/admin/essay-orgs/${orgId}`,
  ADMIN_ESSAYS: '/admin/essays',
  ADMIN_ESSAY_DETAIL: (essayId: number) => `/admin/essays/${essayId}`,

  // 文件相关
  FILES: '/files',
  FILE_DETAIL: (id: number) => `/files/${id}`,
  FILE_UPLOAD: '/files/upload',
  FILE_PARSE: (id: number) => `/files/${id}/parse`,
  FILE_PARSE_STATUS: (id: number) => `/files/${id}/parse-status`,

  // Markdown 解析中心
  ADMIN_MARKDOWN_FILES: '/admin/markdown-files',
  ADMIN_MARKDOWN_FILE_DETAIL: (id: number) => `/admin/markdown-files/${id}`,
  ADMIN_MARKDOWN_FILE_PARSE: (id: number) => `/admin/markdown-files/${id}/parse`,
  ADMIN_MARKDOWN_FILE_CHAPTERS: (id: number) => `/admin/markdown-files/${id}/chapters`,
  MARKDOWN_FILE_SOURCE: (id: number) => `/markdown-files/${id}/source.md`,

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
