import { create } from 'zustand';

interface UIState {
  dark: boolean;
  search: string;
  categoryFilter: string;
  modalOpen: boolean;
  editingTaskId: string | null;
  activeColumn: string | null;
  toggleDark: () => void;
  setSearch: (q: string) => void;
  setCategoryFilter: (cat: string) => void;
  openModal: (taskId?: string, col?: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  dark: localStorage.getItem('mc_dark') === '1',
  search: '',
  categoryFilter: 'All',
  modalOpen: false,
  editingTaskId: null,
  activeColumn: null,

  toggleDark: () =>
    set((s) => {
      const next = !s.dark;
      localStorage.setItem('mc_dark', next ? '1' : '0');
      return { dark: next };
    }),

  setSearch: (search) => set({ search }),
  setCategoryFilter: (categoryFilter) => set({ categoryFilter }),

  openModal: (taskId, col) =>
    set({ modalOpen: true, editingTaskId: taskId ?? null, activeColumn: col ?? null }),

  closeModal: () =>
    set({ modalOpen: false, editingTaskId: null, activeColumn: null }),
}));
