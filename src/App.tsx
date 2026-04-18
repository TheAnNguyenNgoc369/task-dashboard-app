import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { Moon, Sun, Plus, Search, ClipboardList, Settings, X, Check } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  const { columns, categories, updateColumn, deleteColumn, addColumn, reorderColumns } = useBoardStore();

  const { tasksByColumn, analytics } = useTasks();
  const editingTask = useTask(editingTaskId);

  const [addingColumn, setAddingColumn] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColColor, setNewColColor] = useState('#818cf8');

  const handleAddColumn = useCallback(() => {
    const name = newColName.trim() || 'New Column';
    addColumn(name, newColColor);
    setNewColName('');
    setNewColColor('#818cf8');
    setAddingColumn(false);
    toast.success(`Column "${name}" added`);
  }, [newColName, newColColor, addColumn]);

  const handleCancelAddColumn = useCallback(() => {
    setAddingColumn(false);
    setNewColName('');
    setNewColColor('#818cf8');
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  // ── Drag & drop ────────────────────────────────────────────────────────────
  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination, draggableId, type } = result;
      if (!destination) return;
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      ) return;

      if (type === 'COLUMN') {
        reorderColumns(source.index, destination.index);
        return;
      }

      if (source.droppableId !== destination.droppableId) {
        moveTask(draggableId, destination.droppableId);
        toast.success(
          `Moved to ${columns.find((c) => c.id === destination.droppableId)?.label ?? destination.droppableId}`
        );
      } else {
        reorderTasks(source.droppableId, source.index, destination.index);
      }
    },
    [moveTask, reorderTasks, reorderColumns, columns]
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

  const visibleColumns = columns.filter((c) => c.visible !== false);
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
              className={cn(
                'h-11 w-full rounded-xl border border-border bg-card pl-10 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20',
                search.trim() ? 'pr-10' : 'pr-3'
              )}
            />
            {search.trim() !== '' && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-border/80 bg-muted/60 text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground"
                aria-label="Clear search"
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            )}
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-11 min-w-[180px] w-full sm:w-[min(100%,220px)]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  <span
                    className="mr-1.5 inline-block h-2 w-2 rounded-full"
                    style={{ background: c.color }}
                  />
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ── Kanban board ──────────────────────────────────────────────────── */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="kanban-scroll-area overflow-x-auto pb-3">
            <Droppable droppableId="board-columns" type="COLUMN" direction="horizontal">
              {(colsProvided) => (
                <div
                  ref={colsProvided.innerRef}
                  {...colsProvided.droppableProps}
                  className="flex gap-3 items-start"
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
                            onAddTask={(colId) => openModal(undefined, colId)}
                            onEditTask={(task) => openModal(task.id)}
                            onDeleteTask={handleDelete}
                            onEditColumn={handleEditColumn}
                            onDeleteColumn={handleDeleteColumn}
                            dragHandleProps={colDrag.dragHandleProps}
                            isDragging={colSnapshot.isDragging}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {colsProvided.placeholder}

                  {/* ── New column ────────────────────────────────────────────── */}
                  <div className="shrink-0 w-[296px]">
                    {addingColumn ? (
                      <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card/90 shadow-sm">
                        {/* Mirrors the column header edit mode */}
                        <div
                          className="flex items-center gap-1.5 border-b border-border px-3.5 py-3"
                          style={{
                            background: `linear-gradient(135deg, color-mix(in oklch, ${newColColor} 16%, var(--card)), var(--card))`,
                          }}
                        >
                          <input
                            type="color"
                            value={newColColor}
                            onChange={(e) => setNewColColor(e.target.value)}
                            className="h-6 w-6 shrink-0 cursor-pointer rounded border border-border bg-transparent p-0"
                            title="Pick column color"
                          />
                          <input
                            autoFocus
                            type="text"
                            placeholder="Column name"
                            value={newColName}
                            onChange={(e) => setNewColName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddColumn();
                              if (e.key === 'Escape') handleCancelAddColumn();
                            }}
                            className="flex-1 rounded border border-primary/40 bg-background px-2 py-0.5 text-[13px] font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                          />
                          <button
                            onClick={handleAddColumn}
                            className="rounded p-0.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-950"
                            title="Confirm"
                          >
                            <Check size={13} />
                          </button>
                          <button
                            onClick={handleCancelAddColumn}
                            className="rounded p-0.5 text-muted-foreground hover:bg-accent"
                            title="Cancel"
                          >
                            <X size={13} />
                          </button>
                        </div>
                        {/* Body — mirrors droppable zone */}
                        <div className="p-2.5">
                          <button
                            onClick={handleAddColumn}
                            className="mt-0 flex w-full items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-[12px] text-muted-foreground transition-all hover:border-solid hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                          >
                            <Plus size={13} />
                            Add column
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingColumn(true)}
                        className="flex w-full items-center gap-2.5 rounded-xl border border-dashed border-border bg-card/90 px-3.5 py-3 text-[13px] font-semibold text-muted-foreground shadow-sm transition-all hover:border-border hover:text-foreground"
                      >
                        <Plus size={14} />
                        New column
                      </button>
                    )}
                  </div>
                </div>
              )}
            </Droppable>
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
