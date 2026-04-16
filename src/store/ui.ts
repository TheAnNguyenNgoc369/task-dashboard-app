/**
 * store/ui.ts
 *
 * WHY ZUSTAND OVER REDUX?
 * - Zero boilerplate: no actions, reducers, or action-type constants needed
 * - Tiny bundle (~1 kB) vs Redux Toolkit (~13 kB gzipped)
 * - No Provider wrapper — any component subscribes anywhere
 * - Direct mutations via Immer-compatible set() — reads like plain JS
 * - React 18 concurrent-mode safe out of the box
 *
 * WHY NOT CONTEXT API?
 * - Context re-renders every consumer on any state change, even unrelated fields
 * - Zustand uses selector-based subscriptions: a component only re-renders
 *   when the exact slice it subscribes to changes
 */

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
