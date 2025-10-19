// API响应基础类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 分页参数
export interface PaginationParams {
  page?: number;
  page_size?: number;
}

// 分页响应
export interface PaginationResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

// 供应商类型
export interface Provider {
  id: string;
  name: string;
  model_type: 'openai' | 'anthropic';
  api_url: string;
  created_at: string;
  updated_at: string;
}

// AI模型类型
export interface AIModel {
  id: string;
  name: string;
  provider_id: string;
  provider_model_name: string;
  status: 'active' | 'disabled';
  input_price?: number;
  output_price?: number;
  currency?: 'USD' | 'CNY';
  created_at: string;
  updated_at: string;
}

// 供应商Token类型
export interface ProviderToken {
  id: string;
  provider_id: string;
  token: string;
  active: boolean;      // Token是否激活
  created_at: string;
  updated_at: string;
}

// 用户Token类型
export interface UserToken {
  id: string;
  user_id?: number;
  name?: string;
  token: string;
  status?: 'active' | 'disabled';
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

// 用户类型
export interface User {
  id: number;
  username: string;
  email?: string;
  role?: string;
  created_at: string;
  updated_at: string;
}

// 登录请求
export interface LoginRequest {
  username: string;
  password: string;
}

// 登录响应
export interface LoginResponse {
  token: string;
  user: User;
}

// 创建供应商请求
export interface CreateProviderRequest {
  name: string;
  model_type: 'openai' | 'anthropic';
  api_url: string;
}

// 创建AI模型请求
export interface CreateAIModelRequest {
  name: string;
  provider_id: string;
  provider_model_name: string;
  status?: 'active' | 'disabled';
  input_price: number;
  output_price: number;
  currency: 'USD' | 'CNY';
}

// 更新AI模型请求
export interface UpdateAIModelRequest {
  name?: string;
  provider_model_name?: string;
  input_price?: number;
  output_price?: number;
  currency?: 'USD' | 'CNY';
  status?: 'active' | 'disabled';
}

// 设置AI模型状态请求
export interface SetAIModelStatusRequest {
  status: 'active' | 'disabled';
}

// AI模型列表响应
export interface ListAIModelsResponse {
  models: AIModel[];
  page: number;
  page_size: number;
  total: number;
}

// 创建供应商Token请求
export interface CreateProviderTokenRequest {
  provider_id: string;
  token: string;
}

// 更新供应商Token请求
export interface UpdateProviderTokenRequest {
  active: boolean;
}

// 供应商Token列表响应
export interface ListProviderTokensResponse {
  tokens: ProviderToken[];
  page: number;
  page_size: number;
  total: number;
}

// 用户Token列表响应
export interface ListUserTokensResponse {
  tokens: UserToken[];
  page: number;
  page_size: number;
  total: number;
}

// Usage相关类型
export interface Usage {
  id: string;
  request_id: string;
  user_token_id: string;
  model_id: string;
  provider_token_id: string;
  input_tokens: number;
  output_tokens: number;
  input_cost: number;
  output_cost: number;
  total_cost: number;
  created_at: string;
}

export interface UsageStats {
  total_requests: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost: number;
}

export interface UsageTrendItem {
  date: string;
  requests: number;
  tokens: number;
  cost: number;
}

export interface ModelDistributionItem {
  model_name: string;
  requests: number;
  tokens: number;
  cost: number;
  percent: number;
}

export interface ListUsageResponse {
  items: Usage[];
  total: number;
  page: number;
  page_size: number;
}

export interface UsageTrendResponse {
  trend: UsageTrendItem[];
}

export interface ModelDistributionResponse {
  distribution: ModelDistributionItem[];
}

export interface UsageQueryParams {
  page?: number;
  page_size?: number;
  user_token_id?: string;
  model_id?: string;
  provider_token_id?: string;
  start_time?: string;
  end_time?: string;
  days?: number;
}