import { Suspense, lazy, useCallback, useEffect } from 'react';
import { Toaster, toast } from 'sonner';

import {
  DashboardHeader,
  SearchFilterBar,
  KanbanBoard,
  useKanbanDragEnd,
} from './features/dashboard';
import { useTasksStore } from './store/tasks';
import { useUIStore } from './store/ui';
import { useBoardStore } from './store/board';
import { useTasks, useTask } from './hooks/useTasks';
import type { TaskFormData } from './types';
import { cn } from './lib/utils';

const TaskModal = lazy(async () => {
  const mod = await import('./components/TaskModal');
  return { default: mod.TaskModal };
});

const AnalyticsRow = lazy(async () => {
  const mod = await import('./components/AnalyticsRow');
  return { default: mod.AnalyticsRow };
});

const ManageModal = lazy(async () => {
  const mod = await import('./components/ManageModal');
  return { default: mod.ManageModal };
});

export default function App() {
  const { addTask, updateTask, deleteTask, moveTask, reorderTasks } = useTasksStore();
  const {
    dark,
    toggleDark,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    modalOpen,
    editingTaskId,
    activeColumn,
    openModal,
    closeModal,
    manageOpen,
    openManage,
    closeManage,
  } = useUIStore();
  const { columns, categories, updateColumn, deleteColumn, addColumn, reorderColumns } =
    useBoardStore();

  const { tasksByColumn, analytics } = useTasks();
  const editingTask = useTask(editingTaskId);

  const handleDragEnd = useKanbanDragEnd({
    columns,
    moveTask,
    reorderTasks,
    reorderColumns,
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const handleModalSubmit = useCallback(
    (data: TaskFormData) => {
      if (editingTaskId) {
        updateTask(editingTaskId, data);
        toast.success('Task updated');
      } else {
        addTask(data);
        toast.success('Task created');
      }
      closeModal();
    },
    [editingTaskId, addTask, updateTask, closeModal],
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteTask(id);
      toast.success('Task deleted');
    },
    [deleteTask],
  );

  const handleEditColumn = useCallback(
    (id: string, label: string, color: string) => {
      updateColumn(id, { label, color });
      toast.success('Column updated');
    },
    [updateColumn],
  );

  const handleDeleteColumn = useCallback(
    (id: string) => {
      deleteColumn(id);
      toast.success('Column deleted');
    },
    [deleteColumn],
  );

  const visibleColumns = columns.filter((c) => c.visible !== false);
  const firstColId = columns[0]?.id ?? 'planning';

  return (
    <div className={cn('min-h-screen bg-background transition-colors', dark && 'dark')}>
      <div className="mx-auto max-w-[1400px] px-4 py-6">
        <DashboardHeader
          dark={dark}
          onToggleDark={toggleDark}
          onOpenManage={openManage}
          onNewTask={() => openModal()}
        />

        <Suspense
          fallback={<div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" />}
        >
          <AnalyticsRow data={analytics} />
        </Suspense>

        <SearchFilterBar
          search={search}
          onSearchChange={setSearch}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          categories={categories}
        />

        <KanbanBoard
          visibleColumns={visibleColumns}
          tasksByColumn={tasksByColumn}
          onDragEnd={handleDragEnd}
          onAddColumn={addColumn}
          onOpenModal={openModal}
          onDeleteTask={handleDelete}
          onEditColumn={handleEditColumn}
          onDeleteColumn={handleDeleteColumn}
        />
      </div>

      <Suspense fallback={null}>
        <TaskModal
          open={modalOpen}
          onClose={closeModal}
          onSubmit={handleModalSubmit}
          mode={editingTaskId ? 'edit' : 'create'}
          defaultValues={
            editingTask
              ? {
                  title: editingTask.title,
                  desc: editingTask.desc,
                  priority: editingTask.priority,
                  category: editingTask.category,
                  col: editingTask.col,
                  due: editingTask.due,
                }
              : { col: activeColumn ?? firstColId }
          }
        />
      </Suspense>

      <Suspense fallback={null}>
        <ManageModal open={manageOpen} onClose={closeManage} />
      </Suspense>

      <Toaster position="bottom-right" richColors />
    </div>
  );
}
