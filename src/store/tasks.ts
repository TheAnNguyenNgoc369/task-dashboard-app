import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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
    (set) => ({
      tasks: SAMPLE_TASKS,

      addTask: (data) => {
        const now = new Date().toISOString();
        const task: Task = {
          ...data,
          id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ tasks: [...s.tasks, task] }));
        return task;
      },

      updateTask: (id, data) =>
        set((s) => ({
          tasks: s.tasks.map((task) =>
            task.id === id ? { ...task, ...data, updatedAt: new Date().toISOString() } : task
          ),
        })),

      deleteTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      moveTask: (id, col) =>
        set((s) => ({
          tasks: s.tasks.map((task) =>
            task.id === id ? { ...task, col, updatedAt: new Date().toISOString() } : task
          ),
        })),

      reorderTasks: (col, fromIndex, toIndex) =>
        set((s) => {
          const colTasks = s.tasks.filter((t) => t.col === col);
          const [moved] = colTasks.splice(fromIndex, 1);
          if (!moved) {
            return { tasks: s.tasks };
          }
          colTasks.splice(toIndex, 0, moved);
          const others = s.tasks.filter((t) => t.col !== col);
          return { tasks: [...others, ...colTasks] };
        }),
    }),
    {
      name: 'mc_tasks',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
