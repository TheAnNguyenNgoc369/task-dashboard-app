import { useMemo } from 'react';
import { useTasksStore } from '../store/tasks';
import { useUIStore } from '../store/ui';
import { useBoardStore } from '../store/board';
import type { AnalyticsData, Task } from '../types';

export function useTasks() {
  const tasks = useTasksStore((s) => s.tasks);
  const columns = useBoardStore((s) => s.columns);
  const priorities = useBoardStore((s) => s.priorities);
  const search = useUIStore((s) => s.search);
  const categoryFilter = useUIStore((s) => s.categoryFilter);

  const filteredTasks = useMemo(() => {
    const q = search.toLowerCase().trim();
    return tasks.filter((t) => {
      const cat = String(t.category ?? '');
      const matchSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        cat.toLowerCase().includes(q) ||
        (t.desc ?? '').toLowerCase().includes(q);
      const matchCategory =
        categoryFilter === 'All' || t.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [tasks, search, categoryFilter]);

  /** Tasks that appear on the Kanban (same column visibility as the board) */
  const boardTasks = useMemo(() => {
    const visibleColIds = new Set(
      columns.filter((c) => c.visible !== false).map((c) => c.id),
    );
    return filteredTasks.filter((t) => visibleColIds.has(t.col));
  }, [filteredTasks, columns]);

  const tasksByColumn = useMemo(() => {
    const result: Record<string, Task[]> = {};
    const knownColIds = new Set(columns.map((c) => c.id));

    for (const col of columns) {
      result[col.id] = boardTasks.filter((t) => t.col === col.id);
    }

    for (const task of filteredTasks) {
      if (!knownColIds.has(task.col)) {
        const list = result[task.col] ?? [];
        if (!list.includes(task)) {
          result[task.col] = [...list, task];
        }
      }
    }

    return result;
  }, [boardTasks, filteredTasks, columns]);

  /** Same task set as visible Kanban columns (search + category + column visibility) */
  const analytics = useMemo((): AnalyticsData => {
    const visibleCols = columns.filter((c) => c.visible !== false);
    const total = boardTasks.length;
    const doneColIds = new Set(visibleCols.filter((c) => c.isDone).map((c) => c.id));
    const completedCount = boardTasks.filter((t) => doneColIds.has(t.col)).length;
    const activeCount = boardTasks.filter((t) => !doneColIds.has(t.col)).length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdueCount = boardTasks.filter((t) => {
      if (!t.due || doneColIds.has(t.col)) return false;
      return new Date(t.due) < today;
    }).length;
    const highPriorityDef = priorities.find(
      (p) => p.id === 'high' || p.label.toLowerCase() === 'high'
    );
    const highPriority = highPriorityDef
      ? boardTasks.filter((t) => t.priority === highPriorityDef.id).length
      : 0;
    const priorityCounts: Record<string, number> = {};
    for (const p of priorities) {
      priorityCounts[p.id] = boardTasks.filter((t) => t.priority === p.id).length;
    }
    const byColumn = visibleCols.map((col) => ({
      id: col.id,
      label: col.label,
      color: col.color,
      count: boardTasks.filter((t) => t.col === col.id).length,
    }));
    return {
      total,
      completedCount,
      highPriority,
      activeCount,
      overdueCount,
      priorityCounts,
      completionPct: total ? Math.round((completedCount / total) * 100) : 0,
      byColumn,
    };
  }, [boardTasks, columns, priorities]);

  return { tasks, filteredTasks, tasksByColumn, analytics };
}

/** Returns a single task by id, or undefined */
export function useTask(id: string | null) {
  return useTasksStore((s) => s.tasks.find((t) => t.id === id));
}

/** Checks if a due date is overdue (past today, and task not in a "done" column) */
export function useIsOverdue(due?: string, col?: string): boolean {
  const columns = useBoardStore((s) => s.columns);
  if (!due) return false;
  const isDoneCol = columns.find((c) => c.id === col)?.isDone ?? false;
  if (isDoneCol) return false;
  return new Date(due) < new Date();
}

export function formatDue(due?: string): string {
  if (!due) return '';
  return new Date(due).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
