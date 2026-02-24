import request from '@/utils/request';
import { API_PATHS } from '@/constants/api';
import type { ApiResponse } from '@/types';

export interface EssayOrgItem {
  id: number;
  name: string;
  description?: string | null;
  status: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  essay_count?: number;
}

export interface AdminEssayItem {
  id: number;
  title: string;
  org_id: number;
  org_name?: string;
  subject_id: number;
  subject_name?: string;
  subject_chapter_id: number;
  subject_chapter_name?: string;
  file_path: string;
  file_size?: number | null;
  status: number;
  created_by?: number | null;
  creator_name?: string | null;
  created_at: string;
  updated_at: string;
  content_url: string;
}

export interface EssayListPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface EssayOrgPayload {
  name: string;
  description?: string | null;
  status?: number;
  sort_order?: number;
}

interface EssayPayload {
  title: string;
  orgId: number;
  subjectId: number;
  subjectChapterId: number;
  status?: number;
}

interface EssayListParams {
  page?: number;
  limit?: number;
  orgId?: number;
  subjectId?: number;
  subjectChapterId?: number;
  status?: number;
  keyword?: string;
}

const appendIfPresent = (formData: FormData, key: string, value: unknown) => {
  if (value === undefined || value === null || value === '') return;
  formData.append(key, String(value));
};

export class EssayAdminService {
  static async listEssayOrgs(includeDisabled = false): Promise<ApiResponse<{ orgs: EssayOrgItem[] }>> {
    const res = await request.get<ApiResponse<{ orgs: EssayOrgItem[] }>>(API_PATHS.ADMIN_ESSAY_ORGS, {
      params: includeDisabled ? { includeDisabled: '1' } : {},
    });
    return res.data;
  }

  static async createEssayOrg(payload: EssayOrgPayload): Promise<ApiResponse<EssayOrgItem>> {
    const res = await request.post<ApiResponse<EssayOrgItem>>(API_PATHS.ADMIN_ESSAY_ORGS, payload);
    return res.data;
  }

  static async updateEssayOrg(
    orgId: number,
    payload: Partial<EssayOrgPayload>
  ): Promise<ApiResponse<EssayOrgItem>> {
    const res = await request.put<ApiResponse<EssayOrgItem>>(
      API_PATHS.ADMIN_ESSAY_ORG_DETAIL(orgId),
      payload
    );
    return res.data;
  }

  static async deleteEssayOrg(orgId: number): Promise<ApiResponse<null>> {
    const res = await request.delete<ApiResponse<null>>(API_PATHS.ADMIN_ESSAY_ORG_DETAIL(orgId));
    return res.data;
  }

  static async listEssays(
    params: EssayListParams
  ): Promise<ApiResponse<{ list: AdminEssayItem[]; total: number; pagination: EssayListPagination }>> {
    const res = await request.get<
      ApiResponse<{ list: AdminEssayItem[]; total: number; pagination: EssayListPagination }>
    >(API_PATHS.ADMIN_ESSAYS, {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        orgId: params.orgId,
        subjectId: params.subjectId,
        subjectChapterId: params.subjectChapterId,
        status: params.status,
        keyword: params.keyword,
      },
    });
    return res.data;
  }

  static async createEssay(file: File, payload: EssayPayload): Promise<ApiResponse<AdminEssayItem>> {
    const formData = new FormData();
    formData.append('file', file);
    appendIfPresent(formData, 'title', payload.title);
    appendIfPresent(formData, 'orgId', payload.orgId);
    appendIfPresent(formData, 'subjectId', payload.subjectId);
    appendIfPresent(formData, 'subjectChapterId', payload.subjectChapterId);
    appendIfPresent(formData, 'status', payload.status ?? 1);

    const res = await request.post<ApiResponse<AdminEssayItem>>(API_PATHS.ADMIN_ESSAYS, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  }

  static async updateEssay(
    essayId: number,
    payload: Partial<EssayPayload> & { file?: File }
  ): Promise<ApiResponse<AdminEssayItem>> {
    const formData = new FormData();
    appendIfPresent(formData, 'title', payload.title);
    appendIfPresent(formData, 'orgId', payload.orgId);
    appendIfPresent(formData, 'subjectId', payload.subjectId);
    appendIfPresent(formData, 'subjectChapterId', payload.subjectChapterId);
    appendIfPresent(formData, 'status', payload.status);
    if (payload.file) {
      formData.append('file', payload.file);
    }

    const res = await request.put<ApiResponse<AdminEssayItem>>(
      API_PATHS.ADMIN_ESSAY_DETAIL(essayId),
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return res.data;
  }

  static async deleteEssay(essayId: number): Promise<ApiResponse<null>> {
    const res = await request.delete<ApiResponse<null>>(API_PATHS.ADMIN_ESSAY_DETAIL(essayId));
    return res.data;
  }
}
