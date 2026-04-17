import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { KanbanColumn, PriorityDef, CategoryDef, DashboardCard } from '../types';

export const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: 'planning', label: 'Planning',    color: '#818cf8', visible: true },
  { id: 'progress', label: 'In Progress', color: '#f97316', visible: true },
  { id: 'done',     label: 'Done',        color: '#22c55e', isDone: true, visible: true },
];

export const DEFAULT_PRIORITIES: PriorityDef[] = [
  { id: 'high', label: 'High',   color: '#ef4444' },
  { id: 'med',  label: 'Medium', color: '#f97316' },
  { id: 'low',  label: 'Low',    color: '#22c55e' },
];

export const DEFAULT_CATEGORIES: CategoryDef[] = [
  { id: 'Work',     label: 'Work',     color: '#6366f1' },
  { id: 'Personal', label: 'Personal', color: '#8b5cf6' },
  { id: 'Urgent',   label: 'Urgent',   color: '#ef4444' },
  { id: 'Design',   label: 'Design',   color: '#ec4899' },
  { id: 'Research', label: 'Research', color: '#0ea5e9' },
];

export const DEFAULT_DASHBOARD_CARDS: DashboardCard[] = [
  { id: 'dc_total', title: 'Total tasks', color: '#2563eb', kind: 'total' },
  { id: 'dc_completed', title: 'Completed', color: '#22c55e', kind: 'completed' },
  { id: 'dc_col_planning', title: 'Planning', color: '#818cf8', kind: 'column', columnId: 'planning' },
  { id: 'dc_col_progress', title: 'In Progress', color: '#f97316', kind: 'column', columnId: 'progress' },
  { id: 'dc_dist', title: 'By column', color: '#64748b', kind: 'distribution' },
];

interface BoardState {
  columns: KanbanColumn[];
  priorities: PriorityDef[];
  categories: CategoryDef[];
  dashboardCards: DashboardCard[];

  addColumn: (label: string, color: string) => KanbanColumn;
  updateColumn: (id: string, data: Partial<Omit<KanbanColumn, 'id'>>) => void;
  deleteColumn: (id: string) => void;

  addPriority: (label: string, color: string) => void;
  updatePriority: (id: string, data: Partial<Omit<PriorityDef, 'id'>>) => void;
  deletePriority: (id: string) => void;

  addCategory: (label: string, color: string) => void;
  updateCategory: (id: string, data: Partial<Omit<CategoryDef, 'id'>>) => void;
  deleteCategory: (id: string) => void;

  addDashboardCard: (card: Omit<DashboardCard, 'id'>) => DashboardCard;
  updateDashboardCard: (id: string, data: Partial<Omit<DashboardCard, 'id'>>) => void;
  deleteDashboardCard: (id: string) => void;
  reorderDashboardCards: (fromIndex: number, toIndex: number) => void;
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set) => ({
      columns: DEFAULT_COLUMNS,
      priorities: DEFAULT_PRIORITIES,
      categories: DEFAULT_CATEGORIES,
      dashboardCards: DEFAULT_DASHBOARD_CARDS,

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

      addPriority: (label, color) =>
        set((s) => ({
          priorities: [
            ...s.priorities,
            { id: `pri_${Date.now()}`, label, color },
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

      addDashboardCard: (card) => {
        const next: DashboardCard = {
          ...card,
          id: `dc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        };
        set((s) => ({ dashboardCards: [...s.dashboardCards, next] }));
        return next;
      },

      updateDashboardCard: (id, data) =>
        set((s) => ({
          dashboardCards: s.dashboardCards.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        })),

      deleteDashboardCard: (id) =>
        set((s) => ({
          dashboardCards: s.dashboardCards.filter((c) => c.id !== id),
        })),

      reorderDashboardCards: (fromIndex, toIndex) =>
        set((s) => {
          const list = [...s.dashboardCards];
          const [moved] = list.splice(fromIndex, 1);
          if (!moved) return s;
          list.splice(toIndex, 0, moved);
          return { dashboardCards: list };
        }),
    }),
    {
      name: 'mc_board',
      version: 3,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState, version) => {
        let s = persistedState as {
          priorities?: PriorityDef[];
          dashboardCards?: DashboardCard[];
        };

        if (version < 2 && s?.priorities) {
          s = {
            ...s,
            priorities: s.priorities.map((p) => ({
              id: p.id,
              label: p.label,
              color: p.color,
            })),
          };
        }

        if (version < 3 && !s.dashboardCards?.length) {
          s = { ...s, dashboardCards: DEFAULT_DASHBOARD_CARDS };
        }

        return s;
      },
    }
  )
);
