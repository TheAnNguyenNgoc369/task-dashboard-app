import React from 'react';
import { Pencil, Trash2, Calendar, GripVertical } from 'lucide-react';
import type { Task } from '../types';
import { useBoardStore } from '../store/board';
import { formatDue } from '../hooks/useTasks';
import { cn } from '../lib/utils';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  isDoneColumn?: boolean;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  draggableProps?: React.HTMLAttributes<HTMLDivElement>;
  innerRef?: (el: HTMLDivElement | null) => void;
}

export const TaskCard = React.memo(function TaskCard({
  task,
  isDragging = false,
  isDoneColumn = false,
  onEdit,
  onDelete,
  dragHandleProps,
  draggableProps,
  innerRef,
}: TaskCardProps) {
  const priorities = useBoardStore((s) => s.priorities);
  const categories = useBoardStore((s) => s.categories);

  const priorityDef = priorities.find((p) => p.id === task.priority);
  const categoryDef = categories.find((c) => c.id === task.category);

  const isOverdue = task.due && !isDoneColumn && new Date(task.due) < new Date();

  return (
    <div
      ref={innerRef}
      {...draggableProps}
      className={cn(
        'group relative rounded-xl border border-border bg-gradient-to-br from-card to-secondary p-3.5 text-foreground shadow-sm transition-all duration-150 dark:from-card dark:to-secondary dark:text-white',
        'hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md hover:shadow-black/5',
        isDragging && 'opacity-50 scale-[0.97] shadow-lg rotate-1',
      )}
    >
      {/* Drag handle */}
      <div
        {...dragHandleProps}
        className="absolute inset-y-1 left-1 flex w-9 items-center justify-center rounded-lg cursor-grab active:cursor-grabbing bg-muted/40 text-muted-foreground opacity-70 transition-all hover:bg-muted hover:text-foreground hover:opacity-100"
        aria-label="Drag task"
      >
        <GripVertical size={16} />
      </div>

      {/* Header row */}
      <div className="mb-2.5 flex items-start justify-between gap-2 pl-8">
        <p className="text-[13px] font-medium leading-snug text-foreground line-clamp-2 dark:text-white">
          {task.title}
        </p>
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
      <div className="flex flex-wrap items-center gap-1.5 pl-8">
        {/* Priority badge */}
        {priorityDef ? (
          <span
            className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded"
            style={{
              background: `color-mix(in oklch, ${priorityDef.color} 18%, var(--secondary))`,
              color: priorityDef.color,
            }}
          >
            {priorityDef.emoji} {priorityDef.label}
          </span>
        ) : (
          <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded bg-muted text-muted-foreground">
            {task.priority}
          </span>
        )}

        {/* Category badge */}
        {categoryDef ? (
          <span
            className="text-[10px] px-2 py-0.5 rounded"
            style={{
              background: `color-mix(in oklch, ${categoryDef.color} 14%, var(--secondary))`,
              color: categoryDef.color,
            }}
          >
            {categoryDef.label}
          </span>
        ) : (
          <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground dark:bg-muted dark:text-slate-200">
            {task.category}
          </span>
        )}

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
        <p className="mt-2 pl-8 text-[11px] text-muted-foreground line-clamp-1 dark:text-slate-300">
          {task.desc}
        </p>
      )}
    </div>
  );
});
