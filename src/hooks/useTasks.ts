import { useMemo } from 'react';
import { useTasksStore } from '../store/tasks';
import { useUIStore } from '../store/ui';
import type { Column, AnalyticsData, Task } from '../types';

export function useTasks() {
  const tasks = useTasksStore((s) => s.tasks);
  const search = useUIStore((s) => s.search);
  const categoryFilter = useUIStore((s) => s.categoryFilter);

  const filteredTasks = useMemo(() => {
    const q = search.toLowerCase().trim();
    return tasks.filter((t) => {
      const matchSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.desc ?? '').toLowerCase().includes(q);
      const matchCategory =
        categoryFilter === 'All' || t.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [tasks, search, categoryFilter]);

  const tasksByColumn = useMemo(
    () =>
      ({
        planning: filteredTasks.filter((t) => t.col === 'planning'),
        progress: filteredTasks.filter((t) => t.col === 'progress'),
        done: filteredTasks.filter((t) => t.col === 'done'),
      }) satisfies Record<Column, Task[]>,
    [filteredTasks]
  );

  const analytics = useMemo((): AnalyticsData => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.col === 'done').length;
    const progress = tasks.filter((t) => t.col === 'progress').length;
    const planning = tasks.filter((t) => t.col === 'planning').length;
    const highPriority = tasks.filter((t) => t.priority === 'high').length;
    return {
      total,
      done,
      progress,
      planning,
      highPriority,
      completionPct: total ? Math.round((done / total) * 100) : 0,
    };
  }, [tasks]);

  return { tasks, filteredTasks, tasksByColumn, analytics };
}

/** Returns a single task by id, or undefined */
export function useTask(id: string | null) {
  return useTasksStore((s) => s.tasks.find((t) => t.id === id));
}

/** Checks if a due date is overdue (past today, and task not done) */
export function useIsOverdue(due?: string, col?: Column): boolean {
  if (!due || col === 'done') return false;
  return new Date(due) < new Date();
}

export function formatDue(due?: string): string {
  if (!due) return '';
  return new Date(due).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
