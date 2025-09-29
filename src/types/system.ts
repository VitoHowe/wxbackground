export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type JsonObject = { [key: string]: JsonValue };

export interface ModelConfig {
  id: number;
  name: string;
  endpoint: string;
  api_key: string;
  description?: string | null;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface ModelConfigPayload {
  name: string;
  endpoint: string;
  api_key: string;
  description?: string | null;
  status: number;
}

export interface SystemSetting<TPayload = JsonValue> {
  type: 'knowledge_format' | 'question_parse_format';
  payload: TPayload;
  updated_by?: number | null;
  updated_at?: string;
}
