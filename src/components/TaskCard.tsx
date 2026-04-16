/**
 * components/TaskCard.tsx
 *
 * Reusable draggable task card.
 * Receives the task data and callbacks — no store access inside.
 * This keeps it pure and easily testable.
 */

import React from 'react';
import { Pencil, Trash2, Calendar, GripVertical } from 'lucide-react';
import type { Task } from '../types';
import { formatDue } from '../hooks/useTasks';
import { cn } from '../lib/utils';

const PRIORITY_STYLES: Record<Task['priority'], string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  med:  'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  low:  'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
};
const PRIORITY_LABELS: Record<Task['priority'], string> = {
  high: 'High', med: 'Medium', low: 'Low',
};

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  /** Drag handlers passed from the DnD library */
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  draggableProps?: React.HTMLAttributes<HTMLDivElement>;
  innerRef?: (el: HTMLDivElement | null) => void;
}

export const TaskCard = React.memo(function TaskCard({
  task,
  isDragging = false,
  onEdit,
  onDelete,
  dragHandleProps,
  draggableProps,
  innerRef,
}: TaskCardProps) {
  const isOverdue =
    task.due && task.col !== 'done' && new Date(task.due) < new Date();

  return (
    <div
      ref={innerRef}
      {...draggableProps}
      className={cn(
        'group relative rounded-xl border border-border bg-card p-3.5 transition-all duration-150',
        'hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/5',
        isDragging && 'opacity-50 scale-[0.97] shadow-lg rotate-1',
      )}
    >
      {/* Drag handle */}
      <div
        {...dragHandleProps}
        className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 cursor-grab active:cursor-grabbing transition-opacity"
      >
        <GripVertical size={14} />
      </div>

      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2.5 pl-2">
        <p className="text-[13px] font-medium leading-snug text-foreground line-clamp-2">
          {task.title}
        </p>
        {/* Action buttons — visible on hover */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Edit task"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            aria-label="Delete task"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Metadata row */}
      <div className="flex items-center gap-1.5 flex-wrap pl-2">
        {/* Priority badge */}
        <span
          className={cn(
            'text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded',
            PRIORITY_STYLES[task.priority],
          )}
        >
          {PRIORITY_LABELS[task.priority]}
        </span>

        {/* Category badge */}
        <span className="text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground">
          {task.category}
        </span>

        {/* Due date */}
        {task.due && (
          <span
            className={cn(
              'flex items-center gap-1 text-[10px]',
              isOverdue
                ? 'text-destructive font-medium'
                : 'text-muted-foreground',
            )}
          >
            <Calendar size={10} />
            {formatDue(task.due)}
            {isOverdue && ' · overdue'}
          </span>
        )}
      </div>

      {/* Optional description preview */}
      {task.desc && (
        <p className="mt-2 pl-2 text-[11px] text-muted-foreground line-clamp-1">
          {task.desc}
        </p>
      )}
    </div>
  );
});
