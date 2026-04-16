/**
 * components/KanbanColumn.tsx
 *
 * Wraps @hello-pangea/dnd <Droppable> and renders a list of TaskCards.
 * The Droppable snapshot is used to visually indicate a valid drop target.
 */

import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { TaskCard } from './TaskCard';
import type { KanbanColumn as KanbanColumnType, Task } from '../types';
import { cn } from '../lib/utils';

interface KanbanColumnProps {
  column: KanbanColumnType;
  tasks: Task[];
  onAddTask: (col: KanbanColumnType['id']) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

export function KanbanColumn({
  column,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card overflow-hidden">
      {/* Column header */}
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: column.color }}
          />
          <span className="text-[13px] font-semibold text-foreground">
            {column.label}
          </span>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
          {tasks.length}
        </span>
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
                  <div className="mb-2 last:mb-0">
                    <TaskCard
                      task={task}
                      isDragging={dragSnapshot.isDragging}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                      innerRef={dragProvided.innerRef}
                      draggableProps={dragProvided.draggableProps}
                      dragHandleProps={dragProvided.dragHandleProps}
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
