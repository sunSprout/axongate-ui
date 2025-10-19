import { create } from 'zustand';
import { usageApi } from '../api';
import type {
  Usage,
  UsageStats,
  UsageTrendItem,
  ModelDistributionItem,
  UsageQueryParams,
} from '../types/api';

interface UsageFilters {
  dateRange: [string, string] | null;
  selectedModel: string;
  selectedUser: string;
  page: number;
  pageSize: number;
}

interface UsageState {
  // 数据状态
  usageList: Usage[];
  usageStats: UsageStats | null;
  usageTrend: UsageTrendItem[];
  modelDistribution: ModelDistributionItem[];

  // UI状态
  loading: boolean;
  error: string | null;

  // 筛选和分页
  filters: UsageFilters;
  totalCount: number;

  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<UsageFilters>) => void;

  // API Actions
  fetchUsageList: () => Promise<void>;
  fetchUsageStats: () => Promise<void>;
  fetchUsageTrend: () => Promise<void>;
  fetchModelDistribution: () => Promise<void>;
  refreshData: () => Promise<void>;
}

export const useUsageStore = create<UsageState>((set, get) => ({
  // 初始状态
  usageList: [],
  usageStats: null,
  usageTrend: [],
  modelDistribution: [],

  loading: false,
  error: null,

  filters: {
    dateRange: null,
    selectedModel: 'all',
    selectedUser: 'all',
    page: 1,
    pageSize: 20,
  },
  totalCount: 0,

  // 基础Actions
  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),

  // API Actions
  fetchUsageList: async () => {
    const { filters, setLoading, setError } = get();

    try {
      setLoading(true);
      setError(null);

      const params: UsageQueryParams = {
        page: filters.page,
        page_size: filters.pageSize,
      };

      // 添加筛选条件
      if (filters.selectedUser !== 'all') {
        params.user_token_id = filters.selectedUser;
      }

      if (filters.selectedModel !== 'all') {
        params.model_id = filters.selectedModel;
      }

      if (filters.dateRange) {
        params.start_time = filters.dateRange[0];
        params.end_time = filters.dateRange[1];
      }

      const response = await usageApi.list(params);

      set({
        usageList: response.items || [],
        totalCount: response.total || 0,
      });

    } catch (error: any) {
      console.error('Failed to fetch usage list:', error);
      setError(error?.message || 'Failed to fetch usage data');
    } finally {
      setLoading(false);
    }
  },

  fetchUsageStats: async () => {
    const { filters, setError } = get();

    try {
      const params: Omit<UsageQueryParams, 'page' | 'page_size'> = {};

      if (filters.selectedUser !== 'all') {
        params.user_token_id = filters.selectedUser;
      }

      if (filters.selectedModel !== 'all') {
        params.model_id = filters.selectedModel;
      }

      if (filters.dateRange) {
        params.start_time = filters.dateRange[0];
        params.end_time = filters.dateRange[1];
      }

      const stats = await usageApi.getStats(params);

      set({ usageStats: stats });

    } catch (error: any) {
      console.error('Failed to fetch usage stats:', error);
      setError(error?.message || 'Failed to fetch usage statistics');
    }
  },

  fetchUsageTrend: async () => {
    const { filters, setError } = get();

    try {
      const params: Omit<UsageQueryParams, 'page' | 'page_size'> = {};

      if (filters.selectedUser !== 'all') {
        params.user_token_id = filters.selectedUser;
      }

      if (filters.selectedModel !== 'all') {
        params.model_id = filters.selectedModel;
      }

      if (filters.dateRange) {
        params.start_time = filters.dateRange[0];
        params.end_time = filters.dateRange[1];
      }

      const response = await usageApi.getTrend(params);

      set({ usageTrend: response.trend || [] });

    } catch (error: any) {
      console.error('Failed to fetch usage trend:', error);
      setError(error?.message || 'Failed to fetch usage trend');
    }
  },

  fetchModelDistribution: async () => {
    const { filters, setError } = get();

    try {
      const params: Pick<UsageQueryParams, 'user_token_id' | 'start_time' | 'end_time'> = {};

      if (filters.selectedUser !== 'all') {
        params.user_token_id = filters.selectedUser;
      }

      if (filters.dateRange) {
        params.start_time = filters.dateRange[0];
        params.end_time = filters.dateRange[1];
      }

      const response = await usageApi.getDistribution(params);

      set({ modelDistribution: response.distribution || [] });

    } catch (error: any) {
      console.error('Failed to fetch model distribution:', error);
      setError(error?.message || 'Failed to fetch model distribution');
    }
  },

  refreshData: async () => {
    const { fetchUsageList, fetchUsageStats, fetchUsageTrend, fetchModelDistribution } = get();

    await Promise.all([
      fetchUsageList(),
      fetchUsageStats(),
      fetchUsageTrend(),
      fetchModelDistribution(),
    ]);
  },
}));