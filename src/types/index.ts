export type Priority = 'high' | 'med' | 'low';
export type Category = 'Work' | 'Personal' | 'Urgent' | 'Design' | 'Research';
export type Column = 'planning' | 'progress' | 'done';

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
  id: Column;
  label: string;
  color: string;
}

export interface AnalyticsData {
  total: number;
  done: number;
  progress: number;
  planning: number;
  highPriority: number;
  completionPct: number;
}
