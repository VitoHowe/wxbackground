import { RequestConfig } from './api';

declare module 'axios' {
  export interface AxiosRequestConfig {
    metadata?: RequestConfig;
  }
}
