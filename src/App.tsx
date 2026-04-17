import { Suspense, lazy, useCallback, useEffect } from 'react';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { Moon, Sun, Plus, Search, SlidersHorizontal, ChevronDown, ClipboardList, Settings } from 'lucide-react';
import { Toaster, toast } from 'sonner';

import { KanbanColumn } from './components/KanbanColumn';
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
    dark, toggleDark,
    search, setSearch,
    categoryFilter, setCategoryFilter,
    modalOpen, editingTaskId, activeColumn,
    openModal, closeModal,
    manageOpen, openManage, closeManage,
  } = useUIStore();
  const { columns, categories, updateColumn, deleteColumn } = useBoardStore();

  const { tasksByColumn, analytics } = useTasks();
  const editingTask = useTask(editingTaskId);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  // ── Drag & drop ────────────────────────────────────────────────────────────
  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination, draggableId } = result;
      if (!destination) return;
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      ) return;

      if (source.droppableId !== destination.droppableId) {
        moveTask(draggableId, destination.droppableId);
        toast.success(
          `Moved to ${columns.find((c) => c.id === destination.droppableId)?.label ?? destination.droppableId}`
        );
      } else {
        reorderTasks(source.droppableId, source.index, destination.index);
      }
    },
    [moveTask, reorderTasks, columns]
  );

  // ── Modal handlers ─────────────────────────────────────────────────────────
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
    [editingTaskId, addTask, updateTask, closeModal]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteTask(id);
      toast.success('Task deleted');
    },
    [deleteTask]
  );

  const handleEditColumn = useCallback(
    (id: string, label: string, color: string) => {
      updateColumn(id, { label, color });
      toast.success('Column updated');
    },
    [updateColumn]
  );

  const handleDeleteColumn = useCallback(
    (id: string) => {
      deleteColumn(id);
      toast.success('Column deleted');
    },
    [deleteColumn]
  );

  // Dynamic grid: 1 col on mobile, up to 4 on wide screens
  const gridCols =
    columns.length === 1 ? 'grid-cols-1' :
    columns.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
    columns.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
    'grid-cols-1 md:grid-cols-2 xl:grid-cols-4';

  const firstColId = columns[0]?.id ?? 'planning';

  return (
    <div className={cn('min-h-screen bg-background transition-colors', dark && 'dark')}>
      <div className="mx-auto max-w-[1400px] px-4 py-6">

        {/* ── Top bar ──────────────────────────────────────────────────────── */}
        <header className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="group flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-gradient-to-br from-primary to-violet-500 text-primary-foreground shadow-[0_12px_24px_-14px_rgba(99,102,241,0.75)] transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 hover:shadow-[0_16px_28px_-12px_rgba(99,102,241,0.85)]">
              <ClipboardList size={20} className="transition-transform duration-200 group-hover:scale-110" />
            </div>
            <div>
              <h1 className="text-xl font-semibold leading-none text-foreground">
                Task Dashboard
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                A Kanban task dashboard built with React 18, Zustand, and Tailwind CSS.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleDark}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-accent hover:text-foreground"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={openManage}
              className="flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-accent hover:text-foreground"
              title="Board settings"
            >
              <Settings size={16} />
              Manage
            </button>
            <button
              onClick={() => openModal()}
              className="group flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500 px-4 text-sm font-semibold text-white shadow-[0_14px_28px_-14px_rgba(99,102,241,0.85)] transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:from-violet-500 hover:via-primary hover:to-pink-500 hover:shadow-[0_18px_30px_-12px_rgba(168,85,247,0.9)]"
            >
              <Plus size={17} className="transition-transform duration-200 group-hover:rotate-90" />
              New task
            </button>
          </div>
        </header>

        {/* ── Analytics row ─────────────────────────────────────────────────── */}
        <Suspense fallback={<div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" />}>
          <AnalyticsRow data={analytics} />
        </Suspense>

        {/* ── Search & filter bar ───────────────────────────────────────────── */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks…"
              className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-3 text-base text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="relative">
            <SlidersHorizontal
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-11 min-w-[180px] cursor-pointer appearance-none rounded-xl border border-border/80 bg-white py-2.5 pl-10 pr-10 text-sm font-medium text-foreground shadow-[0_8px_20px_-14px_rgba(0,0,0,0.45)] outline-none transition-all hover:border-primary/40 hover:shadow-[0_10px_24px_-14px_rgba(99,102,241,0.45)] focus:border-ring focus:ring-3 focus:ring-ring/40 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              <option value="All">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Kanban board ──────────────────────────────────────────────────── */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className={cn('grid gap-3', gridCols)}>
            {columns.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                tasks={tasksByColumn[col.id] ?? []}
                onAddTask={(colId) => openModal(undefined, colId)}
                onEditTask={(task) => openModal(task.id)}
                onDeleteTask={handleDelete}
                onEditColumn={handleEditColumn}
                onDeleteColumn={handleDeleteColumn}
              />
            ))}
          </div>
        </DragDropContext>

      </div>

      {/* ── Task Modal ────────────────────────────────────────────────────────── */}
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

      {/* ── Manage Modal ──────────────────────────────────────────────────────── */}
      <Suspense fallback={null}>
        <ManageModal open={manageOpen} onClose={closeManage} />
      </Suspense>

      {/* ── Toast notifications ───────────────────────────────────────────────── */}
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
