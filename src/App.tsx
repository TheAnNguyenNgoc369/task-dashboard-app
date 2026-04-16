import { useCallback, useEffect } from 'react';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { Moon, Sun, Plus, Search, SlidersHorizontal } from 'lucide-react';
import { Toaster, toast } from 'sonner';

import { KanbanColumn } from './components/KanbanColumn';
import { TaskModal } from './components/TaskModal';
import { AnalyticsRow } from './components/AnalyticsRow';

import { useTasksStore } from './store/tasks';
import { useUIStore } from './store/ui';
import { useTasks, useTask } from './hooks/useTasks';
import { KANBAN_COLUMNS, CATEGORIES } from './lib/sampleData';
import type { Task, TaskFormData } from './types';
import { cn } from './lib/utils';

export default function App() {
  const { addTask, updateTask, deleteTask, moveTask, reorderTasks } =
    useTasksStore();
  const {
    dark, toggleDark,
    search, setSearch,
    categoryFilter, setCategoryFilter,
    modalOpen, editingTaskId, activeColumn,
    openModal, closeModal,
  } = useUIStore();

  // ── Derived data ───────────────────────────────────────────────────────────
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
        moveTask(draggableId, destination.droppableId as Task['col']);
        toast.success(
          `Moved to ${KANBAN_COLUMNS.find((c) => c.id === destination.droppableId)?.label}`
        );
      } else {
        reorderTasks(source.droppableId as Task['col'], source.index, destination.index);
      }
    },
    [moveTask, reorderTasks]
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

  return (
    <div className={cn('min-h-screen bg-background transition-colors', dark && 'dark')}>
      <div className="mx-auto max-w-7xl px-4 py-6">

        {/* ── Top bar ──────────────────────────────────────────────────────── */}
        <header className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-base font-bold text-primary-foreground">
              MC
            </div>
            <div>
              <h1 className="text-xl font-semibold leading-none text-foreground">
                Task Dashboard
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">Task Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleDark}
              className="rounded-lg border border-border bg-card p-2.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus size={17} />
              New task
            </button>
          </div>
        </header>

        {/* ── Analytics row ─────────────────────────────────────────────────── */}
        <AnalyticsRow data={analytics} />

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
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="cursor-pointer appearance-none rounded-lg border border-border bg-card py-2.5 pl-10 pr-3 text-base text-foreground outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="All">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Kanban board ──────────────────────────────────────────────────── */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {KANBAN_COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                tasks={tasksByColumn[col.id]}
                onAddTask={(colId) => openModal(undefined, colId)}
                onEditTask={(task) => openModal(task.id)}
                onDeleteTask={handleDelete}
              />
            ))}
          </div>
        </DragDropContext>

      </div>

      {/* ── Task Modal ────────────────────────────────────────────────────────── */}
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
            : { col: (activeColumn as Task['col']) ?? 'planning' }
        }
      />

      {/* ── Toast notifications ───────────────────────────────────────────────── */}
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
