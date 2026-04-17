import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { KanbanColumn, PriorityDef, CategoryDef } from '../types';

export const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: 'planning', label: 'Planning',    color: '#818cf8' },
  { id: 'progress', label: 'In Progress', color: '#f97316' },
  { id: 'done',     label: 'Done',        color: '#22c55e', isDone: true },
];

export const DEFAULT_PRIORITIES: PriorityDef[] = [
  { id: 'high', label: 'High',   color: '#ef4444', emoji: '🔴' },
  { id: 'med',  label: 'Medium', color: '#f97316', emoji: '🟠' },
  { id: 'low',  label: 'Low',    color: '#22c55e', emoji: '🟢' },
];

export const DEFAULT_CATEGORIES: CategoryDef[] = [
  { id: 'Work',     label: 'Work',     color: '#6366f1' },
  { id: 'Personal', label: 'Personal', color: '#8b5cf6' },
  { id: 'Urgent',   label: 'Urgent',   color: '#ef4444' },
  { id: 'Design',   label: 'Design',   color: '#ec4899' },
  { id: 'Research', label: 'Research', color: '#0ea5e9' },
];

interface BoardState {
  columns: KanbanColumn[];
  priorities: PriorityDef[];
  categories: CategoryDef[];

  addColumn: (label: string, color: string) => KanbanColumn;
  updateColumn: (id: string, data: Partial<Omit<KanbanColumn, 'id'>>) => void;
  deleteColumn: (id: string) => void;

  addPriority: (label: string, color: string, emoji: string) => void;
  updatePriority: (id: string, data: Partial<Omit<PriorityDef, 'id'>>) => void;
  deletePriority: (id: string) => void;

  addCategory: (label: string, color: string) => void;
  updateCategory: (id: string, data: Partial<Omit<CategoryDef, 'id'>>) => void;
  deleteCategory: (id: string) => void;
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set) => ({
      columns: DEFAULT_COLUMNS,
      priorities: DEFAULT_PRIORITIES,
      categories: DEFAULT_CATEGORIES,

      addColumn: (label, color) => {
        const col: KanbanColumn = { id: `col_${Date.now()}`, label, color };
        set((s) => ({ columns: [...s.columns, col] }));
        return col;
      },

      updateColumn: (id, data) =>
        set((s) => ({
          columns: s.columns.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),

      deleteColumn: (id) =>
        set((s) => ({ columns: s.columns.filter((c) => c.id !== id) })),

      addPriority: (label, color, emoji) =>
        set((s) => ({
          priorities: [
            ...s.priorities,
            { id: `pri_${Date.now()}`, label, color, emoji },
          ],
        })),

      updatePriority: (id, data) =>
        set((s) => ({
          priorities: s.priorities.map((p) => (p.id === id ? { ...p, ...data } : p)),
        })),

      deletePriority: (id) =>
        set((s) => ({ priorities: s.priorities.filter((p) => p.id !== id) })),

      addCategory: (label, color) =>
        set((s) => ({
          categories: [
            ...s.categories,
            { id: `cat_${Date.now()}`, label, color },
          ],
        })),

      updateCategory: (id, data) =>
        set((s) => ({
          categories: s.categories.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),

      deleteCategory: (id) =>
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),
    }),
    {
      name: 'mc_board',
      version: 1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
