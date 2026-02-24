import axios, { AxiosResponse, AxiosError } from 'axios';
import { messageApi } from '@/utils/antdMessage';
import { API_CONFIG, BUSINESS_CODE } from '@/constants/api';
import type { ApiResponse, RequestConfig } from '@/types';

/**
 * 创建 axios 实例
 */
const request = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 获取本地存储的 token
 */
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(API_CONFIG.TOKEN_KEY);
  }
  return null;
};

/**
 * 设置 token 到本地存储
 */
const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(API_CONFIG.TOKEN_KEY, token);
  }
};

/**
 * 移除本地存储的 token
 */
const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(API_CONFIG.TOKEN_KEY);
  }
};

/**
 * 请求拦截器
 */
request.interceptors.request.use(
  config => {
    // 添加 token 到请求头
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 显示加载提示
    const requestConfig = config.metadata as RequestConfig;
    if (requestConfig?.showLoading !== false) {
      // 这里可以显示全局 loading，暂时使用 console.log
      console.log('Loading...');
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 */
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // 隐藏加载提示
    console.log('Loading finished');

    const { data } = response;
    const requestConfig = response.config.metadata as RequestConfig;

    // 创建成功会返回 201，这里统一归一为 200，避免页面层遗漏处理导致不刷新。
    if (data.code === BUSINESS_CODE.CREATED) {
      data.code = BUSINESS_CODE.SUCCESS;
      return response;
    }

    // 检查业务状态码
    if (data.code === BUSINESS_CODE.SUCCESS) {
      return response;
    }

    // 处理 token 过期
    if (data.code === BUSINESS_CODE.UNAUTHORIZED) {
      removeToken();
      messageApi.error?.('登录已过期，请重新登录');
      // 重定向到登录页面
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(new Error('Token expired'));
    }

    // 显示错误信息
    if (requestConfig?.showError !== false) {
      messageApi.error?.(data.message || '请求失败');
    }

    return Promise.reject(new Error(data.message || '请求失败'));
  },
  (error: AxiosError) => {
    // 隐藏加载提示
    console.log('Loading finished');

    const requestConfig = error.config?.metadata as RequestConfig;

    // 处理网络错误
    if (!error.response) {
      if (requestConfig?.showError !== false) {
        messageApi.error?.('网络连接失败，请检查网络设置');
      }
      return Promise.reject(error);
    }

    // 处理 HTTP 状态码错误
    const { status } = error.response;
    let errorMessage = '请求失败';

    switch (status) {
      case 400:
        errorMessage = '请求参数错误';
        break;
      case 401:
        errorMessage = '未授权，请重新登录';
        removeToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        break;
      case 403:
        errorMessage = '没有权限访问此资源';
        break;
      case 404:
        errorMessage = '请求的资源不存在';
        break;
      case 500:
        errorMessage = '服务器内部错误';
        break;
      default:
        errorMessage = `请求失败，状态码：${status}`;
    }

    if (requestConfig?.showError !== false) {
      messageApi.error?.(errorMessage);
    }

    return Promise.reject(error);
  }
);

/**
 * GET 请求
 */
export const get = <T = unknown>(
  url: string,
  params?: Record<string, unknown>,
  config?: RequestConfig
): Promise<ApiResponse<T>> => {
  return request
    .get(url, {
      params,
      metadata: config,
    })
    .then(res => res.data);
};

/**
 * POST 请求
 */
export const post = <T = unknown, TBody = unknown>(
  url: string,
  data?: TBody,
  config?: RequestConfig
): Promise<ApiResponse<T>> => {
  return request
    .post(url, data, {
      metadata: config,
    })
    .then(res => res.data);
};

/**
 * PUT 请求
 */
export const put = <T = unknown, TBody = unknown>(
  url: string,
  data?: TBody,
  config?: RequestConfig
): Promise<ApiResponse<T>> => {
  return request
    .put(url, data, {
      metadata: config,
    })
    .then(res => res.data);
};

/**
 * DELETE 请求
 */
export const del = <T = unknown, TParams = Record<string, unknown>>(
  url: string,
  params?: TParams,
  config?: RequestConfig
): Promise<ApiResponse<T>> => {
  return request
    .delete(url, {
      params,
      metadata: config,
    })
    .then(res => res.data);
};

/**
 * 文件上传
 */
export const upload = <T = unknown>(
  url: string,
  file: File,
  config?: RequestConfig & { onUploadProgress?: (progress: number) => void }
): Promise<ApiResponse<T>> => {
  const formData = new FormData();
  formData.append('file', file);

  return request
    .post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: progressEvent => {
        if (config?.onUploadProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          config.onUploadProgress(progress);
        }
      },
      metadata: config,
    })
    .then(res => res.data);
};

// 导出 token 相关方法
export { getToken, setToken, removeToken };

// 导出 axios 实例（用于特殊情况）
export default request;
