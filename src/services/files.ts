import request from '@/utils/request';
import { API_CONFIG, API_PATHS } from '@/constants/api';
import type { ApiResponse } from '@/types';

export type FileStatus = 'pending' | 'parsing' | 'completed' | 'failed';

export interface FileItem {
  id: number;
  name: string;
  description?: string | null;
  original_filename?: string | null;
  file_path?: string;
  file_size?: number;
  parse_status?: FileStatus;
  chapter_count?: number;
  created_by?: number;
  creator_name?: string;
  created_at?: string;
  updated_at?: string;
  file_url?: string;
}

export interface ChapterItem {
  id: number;
  file_id: number;
  chapter_title: string;
  chapter_order: number;
  file_path: string;
  file_size?: number;
  download_url: string;
}

export interface FileListQuery {
  page?: number;
  limit?: number;
  status?: FileStatus;
}

export interface PagedResult<T> {
  files: T[];
  total: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class FilesService {
  static buildPublicUrl(relativePath: string) {
    const base = API_CONFIG.BASE_URL.replace(/\/api$/, '');
    return `${base}${relativePath}`;
  }

  static async uploadFile(
    file: File,
    payload: { name: string; description?: string }
  ): Promise<ApiResponse<FileItem>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', payload.name);
    if (payload.description) formData.append('description', payload.description);
    const res = await request.post<ApiResponse<FileItem>>(API_PATHS.ADMIN_MARKDOWN_FILES, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  }

  static async listFiles(query: FileListQuery = {}): Promise<ApiResponse<PagedResult<FileItem>>> {
    const { page = 1, limit = 20, status } = query;
    const res = await request.get<ApiResponse<PagedResult<FileItem>>>(API_PATHS.ADMIN_MARKDOWN_FILES, {
      params: { page, limit, status },
    });
    return res.data;
  }

  static async parseFile(id: number): Promise<ApiResponse<{ chapter_count: number }>> {
    const res = await request.post<ApiResponse<{ chapter_count: number }>>(
      API_PATHS.ADMIN_MARKDOWN_FILE_PARSE(id)
    );
    return res.data;
  }

  static async listChapters(id: number): Promise<ApiResponse<ChapterItem[]>> {
    const res = await request.get<ApiResponse<ChapterItem[]>>(API_PATHS.ADMIN_MARKDOWN_FILE_CHAPTERS(id));
    return res.data;
  }

  static async deleteFile(id: number): Promise<ApiResponse<void>> {
    const res = await request.delete<ApiResponse<void>>(API_PATHS.ADMIN_MARKDOWN_FILE_DETAIL(id));
    return res.data;
  }
}
