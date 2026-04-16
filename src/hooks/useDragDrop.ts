import { useCallback } from 'react';
import type { DropResult } from '@hello-pangea/dnd';
import { useTasksStore } from '../store/tasks';
import { useToast } from './useToast';
import { KANBAN_COLUMNS } from '../lib/sampleData';
import type { Column } from '../types';

export function useDragDrop() {
  const { moveTask, reorderTasks } = useTasksStore();
  const { success } = useToast();

  const onDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination, draggableId } = result;
      if (!destination) return;

      const sameCol  = source.droppableId === destination.droppableId;
      const samePos  = source.index === destination.index;
      if (sameCol && samePos) return;

      if (!sameCol) {
        // Cross-column move
        moveTask(draggableId, destination.droppableId as Column);
        const colLabel = KANBAN_COLUMNS.find(
          (c) => c.id === destination.droppableId
        )?.label ?? destination.droppableId;
        success(`Moved to ${colLabel}`);
      } else {
        // Same-column reorder
        reorderTasks(
          source.droppableId as Column,
          source.index,
          destination.index
        );
      }
    },
    [moveTask, reorderTasks, success]
  );

  return { onDragEnd };
}
