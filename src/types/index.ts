export type Priority = string;
export type Category = string;
export type Column = string;

export interface PriorityDef {
  id: string;
  label: string;
  color: string;
}

export interface CategoryDef {
  id: string;
  label: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  desc?: string;
  priority: Priority;
  category: Category;
  col: Column;
  due?: string; // ISO date string
  createdAt: string;
  updatedAt: string;
}

export interface TaskFormData {
  title: string;
  desc?: string;
  priority: Priority;
  category: Category;
  col: Column;
  due?: string;
}

export interface KanbanColumn {
  id: string;
  label: string;
  color: string;
  isDone?: boolean;
}

export interface AnalyticsData {
  total: number;
  completedCount: number;
  highPriority: number;
  completionPct: number;
  byColumn: Array<{ id: string; label: string; color: string; count: number }>;
}
