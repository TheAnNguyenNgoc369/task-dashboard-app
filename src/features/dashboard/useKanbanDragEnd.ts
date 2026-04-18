import { useCallback } from 'react';
import type { DropResult } from '@hello-pangea/dnd';
import { toast } from 'sonner';
import type { KanbanColumn } from '../../types';

interface UseKanbanDragEndParams {
  columns: KanbanColumn[];
  moveTask: (taskId: string, columnId: string) => void;
  reorderTasks: (columnId: string, fromIndex: number, toIndex: number) => void;
  reorderColumns: (fromIndex: number, toIndex: number) => void;
}

export function useKanbanDragEnd({
  columns,
  moveTask,
  reorderTasks,
  reorderColumns,
}: UseKanbanDragEndParams) {
  return useCallback(
    (result: DropResult) => {
      const { source, destination, draggableId, type } = result;
      if (!destination) return;
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      )
        return;

      if (type === 'COLUMN') {
        reorderColumns(source.index, destination.index);
        return;
      }

      if (source.droppableId !== destination.droppableId) {
        moveTask(draggableId, destination.droppableId);
        toast.success(
          `Moved to ${columns.find((c) => c.id === destination.droppableId)?.label ?? destination.droppableId}`,
        );
      } else {
        reorderTasks(source.droppableId, source.index, destination.index);
      }
    },
    [moveTask, reorderTasks, reorderColumns, columns],
  );
}
