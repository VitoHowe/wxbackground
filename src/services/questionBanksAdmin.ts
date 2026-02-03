import request from '@/utils/request';
import { API_PATHS } from '@/constants/api';
import type { ApiResponse } from '@/types';

export interface AdminQuestionBankItem {
  id: number;
  name: string;
  description?: string | null;
  subject_id?: number | null;
  subject_name?: string | null;
  total_questions: number;
  parse_status: string;
  created_at: string;
  updated_at: string;
  chapter_count: number;
}

export interface SubjectChapterCountItem {
  id: number;
  subject_id: number;
  chapter_name: string;
  display_name?: string | null;
  chapter_order: number;
  status: number;
  question_count: number;
}

export interface BankChapterItem {
  id: number;
  bank_id: number;
  subject_chapter_id?: number | null;
  chapter_name: string;
  chapter_order: number;
  question_count: number;
  subject_chapter_name?: string | null;
  subject_display_name?: string | null;
  subject_chapter_order?: number | null;
}

export interface BankImageItem {
  filename: string;
  url: string;
  size: number;
  last_modified: string;
  used_in_questions: number[];
}

export class QuestionBanksAdminService {
  static async listQuestionBanks(params: {
    page?: number;
    limit?: number;
    subjectId?: number;
  }): Promise<ApiResponse<{ list: AdminQuestionBankItem[]; total: number; pagination: any }>> {
    const { page = 1, limit = 20, subjectId } = params;
    const res = await request.get<ApiResponse<{ list: AdminQuestionBankItem[]; total: number; pagination: any }>>(
      API_PATHS.ADMIN_QUESTION_BANKS,
      { params: { page, limit, subjectId } }
    );
    return res.data;
  }

  static async importBankJson(
    file: File,
    payload: { subjectId: number; name?: string; description?: string }
  ): Promise<ApiResponse<AdminQuestionBankItem>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subjectId', String(payload.subjectId));
    if (payload.name) formData.append('name', payload.name);
    if (payload.description) formData.append('description', payload.description);

    const res = await request.post<ApiResponse<AdminQuestionBankItem>>(
      API_PATHS.ADMIN_QUESTION_BANK_IMPORT,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return res.data;
  }

  static async importChapterJson(
    file: File,
    payload: { bankId: number; subjectChapterId: number }
  ): Promise<ApiResponse<{ bankId: number; chapterId: number; questionCount: number }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subjectChapterId', String(payload.subjectChapterId));

    const res = await request.post<ApiResponse<{ bankId: number; chapterId: number; questionCount: number }>>(
      API_PATHS.ADMIN_QUESTION_BANK_CHAPTER_IMPORT(payload.bankId),
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return res.data;
  }

  static async getBankSubjectChapters(
    bankId: number
  ): Promise<ApiResponse<{ chapters: SubjectChapterCountItem[] }>> {
    const res = await request.get<ApiResponse<{ chapters: SubjectChapterCountItem[] }>>(
      API_PATHS.ADMIN_QUESTION_BANK_SUBJECT_CHAPTERS(bankId)
    );
    return res.data;
  }

  static async getBankChapters(
    bankId: number
  ): Promise<ApiResponse<{ chapters: BankChapterItem[]; totalChapters: number }>> {
    const res = await request.get<ApiResponse<{ chapters: BankChapterItem[]; totalChapters: number }>>(
      API_PATHS.QUESTION_BANK_CHAPTERS(bankId)
    );
    return res.data;
  }

  static async deleteBankChapter(
    bankId: number,
    chapterId: number
  ): Promise<ApiResponse<null>> {
    const res = await request.delete<ApiResponse<null>>(
      API_PATHS.QUESTION_BANK_CHAPTER_DETAIL(bankId, chapterId)
    );
    return res.data;
  }

  static async listBankImages(
    bankId: number
  ): Promise<ApiResponse<{ images: BankImageItem[]; total: number }>> {
    const res = await request.get<ApiResponse<{ images: BankImageItem[]; total: number }>>(
      API_PATHS.QUESTION_BANK_IMAGES(bankId)
    );
    return res.data;
  }

  static async uploadBankImages(
    bankId: number,
    files: File[],
    options?: { overwrite?: boolean }
  ): Promise<
    ApiResponse<{
      uploaded: Array<{ filename: string; url: string; size: number }>;
      skipped: Array<{ filename: string; reason: string }>;
      total_uploaded: number;
    }>
  > {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    const res = await request.post<
      ApiResponse<{
        uploaded: Array<{ filename: string; url: string; size: number }>;
        skipped: Array<{ filename: string; reason: string }>;
        total_uploaded: number;
      }>
    >(API_PATHS.QUESTION_BANK_IMAGES(bankId), formData, {
      params: options?.overwrite ? { overwrite: 1 } : {},
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  }

  static async renameBankImage(
    bankId: number,
    filename: string,
    newFilename: string,
    options?: { overwrite?: boolean }
  ): Promise<ApiResponse<{ oldFilename: string; newFilename: string; updatedQuestions: number }>> {
    const encoded = encodeURIComponent(filename);
    const res = await request.patch<
      ApiResponse<{ oldFilename: string; newFilename: string; updatedQuestions: number }>
    >(API_PATHS.QUESTION_BANK_IMAGE_DETAIL(bankId, encoded), {
      newFilename,
      overwrite: options?.overwrite ?? false,
    });
    return res.data;
  }

  static async deleteBankImage(
    bankId: number,
    filename: string,
    options?: { force?: boolean }
  ): Promise<ApiResponse<{ deleted: boolean; usedInQuestions: number[] }>> {
    const encoded = encodeURIComponent(filename);
    const res = await request.delete<ApiResponse<{ deleted: boolean; usedInQuestions: number[] }>>(
      API_PATHS.QUESTION_BANK_IMAGE_DETAIL(bankId, encoded),
      {
        params: options?.force ? { force: 1 } : {},
      }
    );
    return res.data;
  }
}
