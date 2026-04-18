import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { KanbanColumn } from '../../components/KanbanColumn';
import type { KanbanColumn as KanbanColumnType, Task } from '../../types';
import { NewColumnPanel } from './NewColumnPanel';

interface KanbanBoardProps {
  visibleColumns: KanbanColumnType[];
  tasksByColumn: Record<string, Task[]>;
  onDragEnd: (result: DropResult) => void;
  onAddColumn: (label: string, color: string) => void;
  onOpenModal: (taskId?: string, colId?: string) => void;
  onDeleteTask: (id: string) => void;
  onEditColumn: (id: string, label: string, color: string) => void;
  onDeleteColumn: (id: string) => void;
}

export function KanbanBoard({
  visibleColumns,
  tasksByColumn,
  onDragEnd,
  onAddColumn,
  onOpenModal,
  onDeleteTask,
  onEditColumn,
  onDeleteColumn,
}: KanbanBoardProps) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="kanban-scroll-area overflow-x-auto pb-3">
        <Droppable droppableId="board-columns" type="COLUMN" direction="horizontal">
          {(colsProvided) => (
            <div
              ref={colsProvided.innerRef}
              {...colsProvided.droppableProps}
              className="flex items-start gap-3"
              style={{ minWidth: `${(visibleColumns.length + 1) * 308}px` }}
            >
              {visibleColumns.map((col, index) => (
                <Draggable key={col.id} draggableId={`col__${col.id}`} index={index}>
                  {(colDrag, colSnapshot) => (
                    <div
                      ref={colDrag.innerRef}
                      {...colDrag.draggableProps}
                      className="w-[296px] shrink-0"
                      style={colDrag.draggableProps.style}
                    >
                      <KanbanColumn
                        column={col}
                        tasks={tasksByColumn[col.id] ?? []}
                        onAddTask={(colId) => onOpenModal(undefined, colId)}
                        onEditTask={(task) => onOpenModal(task.id)}
                        onDeleteTask={onDeleteTask}
                        onEditColumn={onEditColumn}
                        onDeleteColumn={onDeleteColumn}
                        dragHandleProps={colDrag.dragHandleProps}
                        isDragging={colSnapshot.isDragging}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {colsProvided.placeholder}
              <NewColumnPanel onAddColumn={onAddColumn} />
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
}
