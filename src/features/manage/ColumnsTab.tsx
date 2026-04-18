import { useCallback, useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd';
import {
  Trash2,
  Pencil,
  CheckSquare,
  Eye,
  EyeOff,
  GripVertical,
} from 'lucide-react';
import { useBoardStore } from '../../store/board';
import type { KanbanColumn } from '../../types';
import { cn } from '../../lib/utils';
import { AddRow } from './AddRow';
import { EditRow } from './EditRow';

export function ColumnsTab() {
  const { columns, addColumn, updateColumn, deleteColumn, reorderColumns } = useBoardStore();
  const [editingId, setEditingId] = useState<string | null>(null);

  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;
      if (result.source.index === result.destination.index) return;
      reorderColumns(result.source.index, result.destination.index);
    },
    [reorderColumns],
  );

  return (
    <div className="space-y-1">
      <p className="text-[11px] text-muted-foreground">
        Drag the handle to reorder columns on the board.
      </p>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="manage-columns">
          {(dropProvided) => (
            <div
              ref={dropProvided.innerRef}
              {...dropProvided.droppableProps}
              className="space-y-1"
            >
              {columns.map((col: KanbanColumn, index: number) => (
                <Draggable
                  key={col.id}
                  draggableId={col.id}
                  index={index}
                  isDragDisabled={editingId === col.id}
                >
                  {(dragProvided, snapshot) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      style={{
                        ...dragProvided.draggableProps.style,
                        ...(snapshot.isDragging ? { zIndex: 10 } : {}),
                      }}
                    >
                      {editingId === col.id ? (
                        <EditRow
                          label={col.label}
                          color={col.color}
                          onSave={(label, color) => {
                            updateColumn(col.id, { label, color });
                            setEditingId(null);
                          }}
                          onCancel={() => setEditingId(null)}
                        />
                      ) : (
                        <div
                          className={cn(
                            'group flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5 transition-all',
                            col.visible === false && 'opacity-50',
                            snapshot.isDragging && 'shadow-lg ring-1 ring-primary/20',
                          )}
                        >
                          <button
                            type="button"
                            {...dragProvided.dragHandleProps}
                            className="shrink-0 cursor-grab rounded p-0.5 text-muted-foreground/40 hover:bg-accent hover:text-foreground active:cursor-grabbing"
                            title="Drag to reorder"
                            aria-label="Drag to reorder"
                          >
                            <GripVertical size={14} />
                          </button>
                          <span
                            className="h-3 w-3 shrink-0 rounded-full"
                            style={{ background: col.color }}
                          />
                          <span className="flex-1 text-sm text-foreground">{col.label}</span>
                          {col.isDone && (
                            <span className="flex items-center gap-1 rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                              <CheckSquare size={10} />
                              done
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              updateColumn(col.id, {
                                visible: col.visible === false ? true : false,
                              })
                            }
                            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            title={
                              col.visible === false
                                ? 'Show column on board'
                                : 'Hide column from board'
                            }
                          >
                            {col.visible === false ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                          <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => updateColumn(col.id, { isDone: !col.isDone })}
                              className={cn(
                                'rounded-md p-1 text-xs transition-colors',
                                col.isDone
                                  ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-950'
                                  : 'text-muted-foreground hover:text-green-600 hover:bg-green-100 dark:hover:bg-green-950',
                              )}
                              title={
                                col.isDone ? 'Unmark as done column' : 'Mark as done column'
                              }
                            >
                              <CheckSquare size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(col.id)}
                              className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                              title="Edit column"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteColumn(col.id)}
                              className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              title="Delete column"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {dropProvided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <AddRow
        placeholder="Add column…"
        onAdd={(label, color) => addColumn(label, color)}
      />
    </div>
  );
}
