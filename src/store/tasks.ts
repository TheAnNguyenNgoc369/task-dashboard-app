/**
 * store/tasks.ts
 *
 * TanStack Query handles *server* data fetching (cache, refetch, loading states).
 * Zustand handles *client* UI state (selected item, modal open, filter values).
 *
 * For a localStorage-backed offline app like this one, Zustand's persist
 * middleware replaces TanStack Query's role — but in a real app with an API,
 * you would:
 *   - useQuery(queryKey, fetchTasks)  → read from server
 *   - useMutation(updateTask)         → write to server + invalidate cache
 *   - useUIStore                      → purely ephemeral UI state
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Task, TaskFormData, Column } from '../types';
import { SAMPLE_TASKS } from '../lib/sampleData';

interface TasksState {
  tasks: Task[];
  addTask: (data: TaskFormData) => Task;
  updateTask: (id: string, data: Partial<TaskFormData>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, col: Column) => void;
  reorderTasks: (col: Column, fromIndex: number, toIndex: number) => void;
}

export const useTasksStore = create<TasksState>()(
  persist(
    immer((set, get) => ({
      tasks: SAMPLE_TASKS,

      addTask: (data) => {
        const now = new Date().toISOString();
        const task: Task = {
          ...data,
          id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => { s.tasks.push(task); });
        return task;
      },

      updateTask: (id, data) =>
        set((s) => {
          const task = s.tasks.find((t) => t.id === id);
          if (task) Object.assign(task, data, { updatedAt: new Date().toISOString() });
        }),

      deleteTask: (id) =>
        set((s) => { s.tasks = s.tasks.filter((t) => t.id !== id); }),

      moveTask: (id, col) =>
        set((s) => {
          const task = s.tasks.find((t) => t.id === id);
          if (task) { task.col = col; task.updatedAt = new Date().toISOString(); }
        }),

      reorderTasks: (col, fromIndex, toIndex) =>
        set((s) => {
          const colTasks = s.tasks.filter((t) => t.col === col);
          const [moved] = colTasks.splice(fromIndex, 1);
          colTasks.splice(toIndex, 0, moved);
          const others = s.tasks.filter((t) => t.col !== col);
          s.tasks = [...others, ...colTasks];
        }),
    })),
    {
      name: 'mc_tasks',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
