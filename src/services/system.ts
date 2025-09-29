import { get, post, put, del } from '@/utils/request';
import { API_PATHS } from '@/constants/api';
import type {
  ApiResponse,
  JsonObject,
  ModelConfig,
  ModelConfigPayload,
  SystemSetting,
} from '@/types';

export class SystemService {
  static async fetchModelConfigs(): Promise<ApiResponse<ModelConfig[]>> {
    return get<ModelConfig[]>(API_PATHS.MODEL_CONFIGS);
  }

  static async createModelConfig(data: ModelConfigPayload): Promise<ApiResponse<ModelConfig>> {
    return post<ModelConfig, ModelConfigPayload>(API_PATHS.MODEL_CONFIGS, data);
  }

  static async updateModelConfig(
    id: number,
    data: Partial<ModelConfigPayload>
  ): Promise<ApiResponse<ModelConfig>> {
    return put<ModelConfig, Partial<ModelConfigPayload>>(API_PATHS.MODEL_CONFIG_DETAIL(id), data);
  }

  static async deleteModelConfig(id: number): Promise<ApiResponse<null>> {
    return del<null>(API_PATHS.MODEL_CONFIG_DETAIL(id));
  }

  static async fetchKnowledgeFormat<TPayload = JsonObject>(): Promise<ApiResponse<SystemSetting<TPayload>>> {
    return get<SystemSetting<TPayload>>(API_PATHS.KNOWLEDGE_FORMAT);
  }

  static async saveKnowledgeFormat<TPayload = JsonObject>(
    payload: TPayload
  ): Promise<ApiResponse<SystemSetting<TPayload>>> {
    return post<SystemSetting<TPayload>, TPayload>(API_PATHS.KNOWLEDGE_FORMAT, payload);
  }

  static async fetchQuestionFormat<TPayload = JsonObject>(): Promise<ApiResponse<SystemSetting<TPayload>>> {
    return get<SystemSetting<TPayload>>(API_PATHS.QUESTION_FORMAT);
  }

  static async saveQuestionFormat<TPayload = JsonObject>(
    payload: TPayload
  ): Promise<ApiResponse<SystemSetting<TPayload>>> {
    return post<SystemSetting<TPayload>, TPayload>(API_PATHS.QUESTION_FORMAT, payload);
  }
}
