import request from '@/utils/request';
import { API_PATHS } from '@/constants/api';
import type { ApiResponse } from '@/types';

export interface SubjectItem {
  id: number;
  name: string;
  code?: string | null;
  status: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SubjectChapterItem {
  id: number;
  subject_id: number;
  chapter_name: string;
  display_name?: string | null;
  chapter_order: number;
  status: number;
  question_count?: number;
  created_at: string;
  updated_at: string;
}

export interface SubjectChapterAliasItem {
  id: number;
  subject_id: number;
  subject_chapter_id: number;
  alias_name: string;
  chapter_name: string;
  display_name?: string | null;
  chapter_order: number;
  created_at: string;
  updated_at: string;
}

export class SubjectsService {
  static async listSubjects(includeDisabled = false): Promise<ApiResponse<{ subjects: SubjectItem[] }>> {
    const url = includeDisabled ? API_PATHS.SUBJECTS_ADMIN : API_PATHS.SUBJECTS;
    const res = await request.get<ApiResponse<{ subjects: SubjectItem[] }>>(url);
    return res.data;
  }

  static async createSubject(payload: {
    name: string;
    code?: string | null;
    sort_order?: number;
    status?: number;
  }): Promise<ApiResponse<SubjectItem>> {
    const res = await request.post<ApiResponse<SubjectItem>>(API_PATHS.SUBJECTS, payload);
    return res.data;
  }

  static async updateSubject(
    id: number,
    payload: Partial<{ name: string; code?: string | null; sort_order?: number; status?: number }>
  ): Promise<ApiResponse<SubjectItem>> {
    const res = await request.put<ApiResponse<SubjectItem>>(API_PATHS.SUBJECT_DETAIL(id), payload);
    return res.data;
  }

  static async listSubjectChapters(
    subjectId: number,
    includeDisabled = false
  ): Promise<ApiResponse<{ chapters: SubjectChapterItem[] }>> {
    const res = await request.get<ApiResponse<{ chapters: SubjectChapterItem[] }>>(
      API_PATHS.SUBJECT_CHAPTERS(subjectId),
      {
        params: includeDisabled ? { includeDisabled: 1 } : {},
      }
    );
    return res.data;
  }

  static async createSubjectChapter(
    subjectId: number,
    payload: {
      chapter_name: string;
      display_name?: string | null;
      chapter_order?: number;
      status?: number;
    }
  ): Promise<ApiResponse<SubjectChapterItem>> {
    const res = await request.post<ApiResponse<SubjectChapterItem>>(
      API_PATHS.SUBJECT_CHAPTERS(subjectId),
      payload
    );
    return res.data;
  }

  static async updateSubjectChapter(
    subjectId: number,
    chapterId: number,
    payload: Partial<{
      chapter_name: string;
      display_name?: string | null;
      chapter_order?: number;
      status?: number;
    }>
  ): Promise<ApiResponse<SubjectChapterItem>> {
    const res = await request.put<ApiResponse<SubjectChapterItem>>(
      `${API_PATHS.SUBJECT_CHAPTERS(subjectId)}/${chapterId}`,
      payload
    );
    return res.data;
  }

  static async syncSubjectChapters(subjectId: number): Promise<
    ApiResponse<{
      totalBanks: number;
      totalChapters: number;
      createdChapters: number;
      boundChapters: number;
      skippedChapters: number;
    }>
  > {
    const res = await request.post<
      ApiResponse<{
        totalBanks: number;
        totalChapters: number;
        createdChapters: number;
        boundChapters: number;
        skippedChapters: number;
      }>
    >(API_PATHS.SUBJECT_CHAPTERS_SYNC(subjectId));
    return res.data;
  }

  static async listSubjectChapterAliases(
    subjectId: number
  ): Promise<ApiResponse<{ aliases: SubjectChapterAliasItem[] }>> {
    const res = await request.get<ApiResponse<{ aliases: SubjectChapterAliasItem[] }>>(
      API_PATHS.SUBJECT_CHAPTER_ALIASES(subjectId)
    );
    return res.data;
  }

  static async createSubjectChapterAlias(
    subjectId: number,
    payload: { alias_name: string; subject_chapter_id: number }
  ): Promise<ApiResponse<SubjectChapterAliasItem>> {
    const res = await request.post<ApiResponse<SubjectChapterAliasItem>>(
      API_PATHS.SUBJECT_CHAPTER_ALIASES(subjectId),
      payload
    );
    return res.data;
  }

  static async deleteSubjectChapterAlias(
    subjectId: number,
    aliasId: number
  ): Promise<ApiResponse<Record<string, never>>> {
    const res = await request.delete<ApiResponse<Record<string, never>>>(
      API_PATHS.SUBJECT_CHAPTER_ALIAS_DETAIL(subjectId, aliasId)
    );
    return res.data;
  }
}
