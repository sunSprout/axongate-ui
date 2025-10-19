import apiClient from './client';
import { postEncrypted } from './encrypted';
import type {
  LoginRequest,
  Provider,
  AIModel,
  ProviderToken,
  UserToken,
  PaginationParams,
  PaginationResponse,
  CreateProviderRequest,
  CreateAIModelRequest,
  UpdateAIModelRequest,
  SetAIModelStatusRequest,
  ListAIModelsResponse,
  CreateProviderTokenRequest,
  UpdateProviderTokenRequest,
  ListProviderTokensResponse,
  ListUserTokensResponse,
  Usage,
  UsageStats,
  UsageQueryParams,
  ListUsageResponse,
  UsageTrendResponse,
  ModelDistributionResponse,
} from '../types/api';

// 认证相关API
export const authApi = {
  login: (data: LoginRequest) =>
    postEncrypted<any>('/auth/login', data as any, ['password']),
  
  logout: () => 
    apiClient.post('/auth/logout'),
  
  getCurrentUser: () => 
    apiClient.get('/auth/me'),
};

// 供应商相关API
export const providerApi = {
  list: (params?: PaginationParams) => 
    apiClient.get<any, PaginationResponse<Provider>>('/providers', { params }),
  
  getAll: async () => {
    const response = await apiClient.get<any, { providers: Provider[] }>('/providers/all');
    return response?.providers || [];
  },
  
  getById: (id: string) => 
    apiClient.get<any, Provider>(`/providers/${id}`),
  
  create: (data: CreateProviderRequest) => 
    apiClient.post<any, Provider>('/providers', data),
  
  update: (id: string, data: Partial<CreateProviderRequest>) => 
    apiClient.put<any, Provider>(`/providers/${id}`, data),
  
  delete: (id: string) => 
    apiClient.delete(`/providers/${id}`),
};

// AI模型相关API
export const modelApi = {
  list: (params?: PaginationParams & { provider_id?: string; status?: string }) => 
    apiClient.get<any, PaginationResponse<AIModel>>('/ai-models', { params }),
  
  getAll: async (params?: { provider_id?: string; status?: string }) => {
    // 后端返回的是分页对象，需要返回完整对象
    const response = await apiClient.get<any, ListAIModelsResponse>('/ai-models', { params });
    return response || { models: [], page: 1, page_size: 10, total: 0 };
  },
  
  getById: (id: string) => 
    apiClient.get<any, AIModel>(`/ai-models/${id}`),
  
  create: (data: CreateAIModelRequest) => 
    apiClient.post<any, AIModel>('/ai-models', data),
  
  update: (id: string, data: UpdateAIModelRequest) => 
    apiClient.put<any, AIModel>(`/ai-models/${id}`, data),
  
  updateStatus: (id: string, data: SetAIModelStatusRequest) => 
    apiClient.patch(`/ai-models/${id}/status`, data),
  
  delete: (id: string) => 
    apiClient.delete(`/ai-models/${id}`),
  
  setStatus: (id: string, status: 'active' | 'disabled') => 
    apiClient.post(`/ai-models/${id}/status`, { status }),
};

// 供应商Token相关API
export const providerTokenApi = {
  list: (params?: PaginationParams) => 
    apiClient.get<any, PaginationResponse<ProviderToken>>('/provider-tokens', { params }),
  
  getAll: async (params?: { provider_id?: string }) => {
    // 后端返回的是分页对象，需要提取tokens数组
    const response = await apiClient.get<any, ListProviderTokensResponse>('/provider-tokens', { params });
    return response || { tokens: [], page: 1, page_size: 10, total: 0 };
  },
  
  getByProviderId: (providerId: string) => 
    apiClient.get<any, ProviderToken[]>(`/provider-tokens/by-provider/${providerId}`),
  
  create: (data: CreateProviderTokenRequest) => 
    apiClient.post<any, ProviderToken>('/provider-tokens', data),
  
  update: (id: string, data: UpdateProviderTokenRequest) =>
    apiClient.put<any, ProviderToken>(`/provider-tokens/${id}`, data),
  
  delete: (id: string) => 
    apiClient.delete(`/provider-tokens/${id}`),
};

// 用户Token相关API
export const userTokenApi = {
  list: (params?: PaginationParams) => 
    apiClient.get<any, PaginationResponse<UserToken>>('/user-tokens', { params }),
  
  getAll: () => 
    apiClient.get<any, ListUserTokensResponse>('/user-tokens'),
  
  getById: (id: string) => 
    apiClient.get<any, UserToken>(`/user-tokens/${id}`),
  
  create: () => 
    apiClient.post<any, UserToken>('/user-tokens'),
  
  delete: (id: string) => 
    apiClient.delete(`/user-tokens/${id}`),
  
  regenerate: (id: string) => 
    apiClient.post<any, UserToken>(`/user-tokens/${id}/regenerate`),
  
  validate: (token: string) =>
    apiClient.post<any, { valid: boolean }>('/user-tokens/validate', { token }),
};

// Usage相关API
export const usageApi = {
  list: (params?: UsageQueryParams) =>
    apiClient.get<any, ListUsageResponse>('/usage', { params }),

  getById: (id: string) =>
    apiClient.get<any, Usage>(`/usage/${id}`),

  getStats: (params?: Omit<UsageQueryParams, 'page' | 'page_size'>) =>
    apiClient.get<any, UsageStats>('/usage/stats', { params }),

  getTrend: (params?: Omit<UsageQueryParams, 'page' | 'page_size'>) =>
    apiClient.get<any, UsageTrendResponse>('/usage/trend', { params }),

  getDistribution: (params?: Pick<UsageQueryParams, 'user_token_id' | 'start_time' | 'end_time'>) =>
    apiClient.get<any, ModelDistributionResponse>('/usage/distribution', { params }),
};
