import { create } from 'zustand';

interface AppState {
  loading: boolean;
  sidebarCollapsed: boolean;
  setLoading: (loading: boolean) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  loading: false,
  sidebarCollapsed: false,
  
  setLoading: (loading) => set({ loading }),
  
  toggleSidebar: () => set((state) => ({ 
    sidebarCollapsed: !state.sidebarCollapsed 
  })),
}));