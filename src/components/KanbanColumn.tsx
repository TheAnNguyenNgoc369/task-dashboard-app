import { useState } from 'react';
import { Droppable, Draggable, type DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { Plus, Pencil, Trash2, Check, X, GripVertical } from 'lucide-react';
import { TaskCard } from './TaskCard';
import type { KanbanColumn as KanbanColumnType, Task } from '../types';
import { cn } from '../lib/utils';

interface KanbanColumnProps {
  column: KanbanColumnType;
  tasks: Task[];
  onAddTask: (col: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onEditColumn?: (id: string, label: string, color: string) => void;
  onDeleteColumn?: (id: string) => void;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  isDragging?: boolean;
}

export function KanbanColumn({
  column,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onEditColumn,
  onDeleteColumn,
  dragHandleProps,
  isDragging,
}: KanbanColumnProps) {
  const [editing, setEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(column.label);
  const [editColor, setEditColor] = useState(column.color);

  const saveEdit = () => {
    if (editLabel.trim()) {
      onEditColumn?.(column.id, editLabel.trim(), editColor);
    }
    setEditing(false);
  };

  return (
    <div className={cn(
      'flex flex-col overflow-hidden rounded-xl border border-border bg-card/90 shadow-sm transition-shadow',
      isDragging && 'shadow-2xl ring-2 ring-primary/30 rotate-[1deg]',
    )}>
      {/* Column header */}
      <div
        {...(dragHandleProps ?? {})}
        className={cn(
          'flex items-center justify-between border-b border-border px-3.5 py-3',
          dragHandleProps && 'cursor-grab active:cursor-grabbing select-none',
        )}
        style={{
          background: `linear-gradient(135deg, color-mix(in oklch, ${column.color} 16%, var(--card)), var(--card))`,
        }}
      >
        {editing ? (
          <div className="flex flex-1 items-center gap-1.5">
            <input
              type="color"
              value={editColor}
              onChange={(e) => setEditColor(e.target.value)}
              className="h-6 w-6 shrink-0 cursor-pointer rounded border border-border bg-transparent p-0"
            />
            <input
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveEdit();
                if (e.key === 'Escape') setEditing(false);
              }}
              className="flex-1 rounded border border-primary/40 bg-background px-2 py-0.5 text-[13px] font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/20"
              autoFocus
            />
            <button
              onClick={saveEdit}
              className="rounded p-0.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-950"
            >
              <Check size={13} />
            </button>
            <button
              onClick={() => setEditing(false)}
              className="rounded p-0.5 text-muted-foreground hover:bg-accent"
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2.5">
              {dragHandleProps && (
                <GripVertical size={13} className="shrink-0 text-muted-foreground/40" />
              )}
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: column.color }}
              />
              <span className="text-[13px] font-semibold text-foreground">
                {column.label}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                {tasks.length}
              </span>
              {onEditColumn && (
                <button
                  onClick={() => {
                    setEditLabel(column.label);
                    setEditColor(column.color);
                    setEditing(true);
                  }}
                  className="ml-0.5 rounded p-1 text-muted-foreground opacity-0 transition-all hover:bg-accent hover:text-foreground group-hover:opacity-100 [.flex:hover_&]:opacity-100"
                  title="Rename column"
                >
                  <Pencil size={11} />
                </button>
              )}
              {onDeleteColumn && (
                <button
                  onClick={() => onDeleteColumn(column.id)}
                  className="rounded p-1 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive [.flex:hover_&]:opacity-100"
                  title="Delete column"
                >
                  <Trash2 size={11} />
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Droppable zone */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex-1 p-2.5 min-h-[140px] transition-colors duration-150',
              snapshot.isDraggingOver && 'bg-primary/5',
            )}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <p className="text-center text-[11px] text-muted-foreground py-6">
                No tasks here
              </p>
            )}

            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(dragProvided, dragSnapshot) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    className="mb-2 last:mb-0"
                  >
                    <TaskCard
                      task={task}
                      isDragging={dragSnapshot.isDragging}
                      isDoneColumn={column.isDone}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                      dragHandleProps={dragProvided.dragHandleProps ?? undefined}
                    />
                  </div>
                )}
              </Draggable>
            ))}

            {provided.placeholder}

            {/* Add task button */}
            <button
              onClick={() => onAddTask(column.id)}
              className={cn(
                'mt-2 flex w-full items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2',
                'text-[12px] text-muted-foreground transition-all',
                'hover:border-solid hover:border-primary/40 hover:bg-primary/5 hover:text-primary',
              )}
            >
              <Plus size={13} />
              Add task
            </button>
          </div>
        )}
      </Droppable>
    </div>
  );
}
