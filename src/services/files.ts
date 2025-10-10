import request from '@/utils/request';
import { API_PATHS } from '@/constants/api';
import type { ApiResponse } from '@/types';

export type FileStatus = 'pending' | 'parsing' | 'completed' | 'failed';

export interface FileItem {
  id: number;
  name: string;
  description?: string | null;
  file_original_name?: string;
  file_path?: string;
  file_size?: number;
  parse_status?: FileStatus;
  parse_method?: string | null;
  total_questions?: number;
  created_by?: number;
  creator_name?: string;
  created_at?: string;
  updated_at?: string;
  url?: string;
  type?: string;
  size?: number;
  status?: FileStatus;
}

export interface FileListQuery {
  page?: number;
  limit?: number;
  status?: FileStatus;
  startTime?: string;
  endTime?: string;
}

export interface PagedResult<T> {
  files: never[];
  list: T[];
  total: number;
  page: number;
  limit: number;
}

export class FilesService {
  static async uploadFile(
    file: File,
    payload: { name: string; description?: string; type?: string; fileType?: string }
  ): Promise<ApiResponse<FileItem>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', payload.name);
    if (payload.description) formData.append('description', payload.description);
    if (payload.type) formData.append('type', payload.type);
    if (payload.fileType) formData.append('fileType', payload.fileType);
    debugger;
    const res = await request.post<ApiResponse<FileItem>>(API_PATHS.FILE_UPLOAD, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  }

  static async listFiles(query: FileListQuery = {}): Promise<ApiResponse<PagedResult<FileItem>>> {
    const { page = 1, limit = 20, status, startTime, endTime } = query;
    const res = await request.get<ApiResponse<PagedResult<FileItem>>>(API_PATHS.FILES, {
      params: { page, limit, status, startTime, endTime },
    });
    return res.data;
  }

  static async parseFile(
    id: number,
    config?: { providerId: number; modelName: string }
  ): Promise<ApiResponse<{ taskId: string; message: string }>> {
    const res = await request.post<ApiResponse<{ taskId: string; message: string }>>(
      API_PATHS.FILE_PARSE(id),
      config
    );
    return res.data;
  }

  static async deleteFile(id: number): Promise<ApiResponse<void>> {
    const res = await request.delete<ApiResponse<void>>(API_PATHS.FILE_DETAIL(id));
    return res.data;
  }
}
