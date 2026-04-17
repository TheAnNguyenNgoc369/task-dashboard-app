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
  Plus,
  Check,
  X,
  GripVertical,
  CheckSquare,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBoardStore } from '../store/board';
import type {
  KanbanColumn,
  PriorityDef,
  CategoryDef,
  DashboardCard,
  DashboardCardKind,
} from '../types';
import { cn } from '../lib/utils';

type Tab = 'columns' | 'categories' | 'priorities' | 'dashboard';

const KIND_LABELS: Record<DashboardCardKind, string> = {
  total: 'Total tasks',
  completed: 'Completion %',
  high_priority: 'High priority',
  column: 'Tasks in column',
  distribution: 'Distribution chart',
};

interface ManageModalProps {
  open: boolean;
  onClose: () => void;
}

// ── Inline edit row ─────────────────────────────────────────────────────────
interface EditRowProps {
  label: string;
  color: string;
  onSave: (label: string, color: string) => void;
  onCancel: () => void;
}
function EditRow({ label, color, onSave, onCancel }: EditRowProps) {
  const [l, setL] = useState(label);
  const [c, setC] = useState(color);
  return (
    <div className="flex items-center gap-2 rounded-lg bg-accent/40 px-2 py-1.5">
      <input
        type="color"
        value={c}
        onChange={(ev) => setC(ev.target.value)}
        className="h-7 w-7 shrink-0 cursor-pointer rounded border border-border bg-transparent p-0.5"
        title="Pick colour"
      />
      <Input
        value={l}
        onChange={(ev) => setL(ev.target.value)}
        className="h-7 flex-1 text-sm"
        onKeyDown={(ev) => {
          if (ev.key === 'Enter') onSave(l.trim(), c);
          if (ev.key === 'Escape') onCancel();
        }}
        autoFocus
      />
      <button
        onClick={() => l.trim() && onSave(l.trim(), c)}
        className="rounded-md p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-950"
        title="Save"
      >
        <Check size={14} />
      </button>
      <button
        onClick={onCancel}
        className="rounded-md p-1 text-muted-foreground hover:bg-accent"
        title="Cancel"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ── Add new row ─────────────────────────────────────────────────────────────
interface AddRowProps {
  placeholder: string;
  onAdd: (label: string, color: string) => void;
}
function AddRow({ placeholder, onAdd }: AddRowProps) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [color, setColor] = useState('#6366f1');

  const commit = () => {
    if (!label.trim()) return;
    onAdd(label.trim(), color);
    setLabel('');
    setColor('#6366f1');
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-1 flex w-full items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-[12px] text-muted-foreground transition-all hover:border-solid hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
      >
        <Plus size={13} />
        {placeholder}
      </button>
    );
  }

  return (
    <div className="mt-1 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-2 py-1.5">
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="h-7 w-7 shrink-0 cursor-pointer rounded border border-border bg-transparent p-0.5"
        title="Pick colour"
      />
      <Input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder={placeholder}
        className="h-7 flex-1 text-sm"
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') setOpen(false);
        }}
        autoFocus
      />
      <button
        onClick={commit}
        disabled={!label.trim()}
        className="rounded-md p-1 text-green-600 hover:bg-green-100 disabled:opacity-40 dark:hover:bg-green-950"
        title="Add"
      >
        <Check size={14} />
      </button>
      <button
        onClick={() => setOpen(false)}
        className="rounded-md p-1 text-muted-foreground hover:bg-accent"
        title="Cancel"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ── Columns tab ──────────────────────────────────────────────────────────────
function ColumnsTab() {
  const { columns, addColumn, updateColumn, deleteColumn } = useBoardStore();
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-1">
      {columns.map((col: KanbanColumn) =>
        editingId === col.id ? (
          <EditRow
            key={col.id}
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
            key={col.id}
            className={cn(
              'group flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5 hover:border-border/80 transition-opacity',
              col.visible === false && 'opacity-50'
            )}
          >
            <GripVertical size={14} className="shrink-0 text-muted-foreground/40" />
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
            {/* visibility always visible, not hidden behind hover */}
            <button
              onClick={() => updateColumn(col.id, { visible: col.visible === false ? true : false })}
              className={cn(
                'rounded-md p-1 transition-colors',
                col.visible === false
                  ? 'text-muted-foreground/40 hover:text-foreground hover:bg-accent'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
              title={col.visible === false ? 'Show column on board' : 'Hide column from board'}
            >
              {col.visible === false ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
            <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => updateColumn(col.id, { isDone: !col.isDone })}
                className={cn(
                  'rounded-md p-1 text-xs transition-colors',
                  col.isDone
                    ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-950'
                    : 'text-muted-foreground hover:text-green-600 hover:bg-green-100 dark:hover:bg-green-950'
                )}
                title={col.isDone ? 'Unmark as done column' : 'Mark as done column'}
              >
                <CheckSquare size={13} />
              </button>
              <button
                onClick={() => setEditingId(col.id)}
                className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                title="Edit column"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={() => deleteColumn(col.id)}
                className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                title="Delete column"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        )
      )}
      <AddRow
        placeholder="Add column…"
        onAdd={(label, color) => addColumn(label, color)}
      />
    </div>
  );
}

// ── Categories tab ───────────────────────────────────────────────────────────
function CategoriesTab() {
  const { categories, addCategory, updateCategory, deleteCategory } = useBoardStore();
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-1">
      {categories.map((cat: CategoryDef) =>
        editingId === cat.id ? (
          <EditRow
            key={cat.id}
            label={cat.label}
            color={cat.color}
            onSave={(label, color) => {
              updateCategory(cat.id, { label, color });
              setEditingId(null);
            }}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <div
            key={cat.id}
            className="group flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5"
          >
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ background: cat.color }}
            />
            <span className="flex-1 text-sm text-foreground">{cat.label}</span>
            <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => setEditingId(cat.id)}
                className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                title="Edit category"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={() => deleteCategory(cat.id)}
                className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                title="Delete category"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        )
      )}
      <AddRow
        placeholder="Add category…"
        onAdd={(label, color) => addCategory(label, color)}
      />
    </div>
  );
}

// ── Priorities tab ───────────────────────────────────────────────────────────
function PrioritiesTab() {
  const { priorities, addPriority, updatePriority, deletePriority } = useBoardStore();
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-1">
      {priorities.map((pri: PriorityDef) =>
        editingId === pri.id ? (
          <EditRow
            key={pri.id}
            label={pri.label}
            color={pri.color}
            onSave={(label, color) => {
              updatePriority(pri.id, { label, color });
              setEditingId(null);
            }}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <div
            key={pri.id}
            className="group flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5"
          >
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ background: pri.color }}
            />
            <span className="flex-1 text-sm text-foreground">{pri.label}</span>
            <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => setEditingId(pri.id)}
                className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                title="Edit priority"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={() => deletePriority(pri.id)}
                className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                title="Delete priority"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        )
      )}
      <AddRow
        placeholder="Add priority…"
        onAdd={(label, color) => addPriority(label, color)}
      />
    </div>
  );
}

// ── Dashboard cards tab ────────────────────────────────────────────────────
function DashboardTab() {
  const {
    columns,
    dashboardCards,
    addDashboardCard,
    updateDashboardCard,
    deleteDashboardCard,
    reorderDashboardCards,
  } = useBoardStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{
    title: string;
    color: string;
    kind: DashboardCardKind;
    columnId: string;
  }>({ title: '', color: '#6366f1', kind: 'total', columnId: '' });

  const [adding, setAdding] = useState(false);

  const firstCol = columns[0]?.id ?? '';

  const startEdit = (c: DashboardCard) => {
    setEditingId(c.id);
    setDraft({
      title: c.title,
      color: c.color,
      kind: c.kind,
      columnId: c.columnId ?? firstCol,
    });
  };

  const saveEdit = (id: string) => {
    if (!draft.title.trim()) return;
    const columnId =
      draft.kind === 'column' ? (draft.columnId || firstCol) : undefined;
    updateDashboardCard(id, {
      title: draft.title.trim(),
      color: draft.color,
      kind: draft.kind,
      columnId,
    });
    setEditingId(null);
  };

  const commitAdd = () => {
    if (!draft.title.trim()) return;
    const columnId =
      draft.kind === 'column' ? (draft.columnId || firstCol) : undefined;
    if (draft.kind === 'column' && !columnId) return;
    addDashboardCard({
      title: draft.title.trim(),
      color: draft.color,
      kind: draft.kind,
      columnId,
    });
    setDraft({ title: '', color: '#6366f1', kind: 'total', columnId: firstCol });
    setAdding(false);
  };

  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;
      if (result.source.index === result.destination.index) return;
      reorderDashboardCards(result.source.index, result.destination.index);
    },
    [reorderDashboardCards]
  );

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-muted-foreground">
        Configure the stat cards above the board. Drag the handle to reorder.
      </p>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="manage-dashboard-cards">
          {(dropProvided) => (
            <div
              ref={dropProvided.innerRef}
              {...dropProvided.droppableProps}
              className="space-y-1"
            >
              {dashboardCards.map((card, index) => (
                <Draggable
                  key={card.id}
                  draggableId={card.id}
                  index={index}
                  isDragDisabled={editingId === card.id}
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
                      {editingId === card.id ? (
                        <div className="space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-2.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <input
                              type="color"
                              value={draft.color}
                              onChange={(e) =>
                                setDraft((d) => ({ ...d, color: e.target.value }))
                              }
                              className="h-7 w-7 shrink-0 cursor-pointer rounded border border-border bg-transparent p-0.5"
                            />
                            <Input
                              value={draft.title}
                              onChange={(e) =>
                                setDraft((d) => ({ ...d, title: e.target.value }))
                              }
                              placeholder="Card title"
                              className="h-8 min-w-[120px] flex-1 text-sm"
                            />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Select
                              value={draft.kind}
                              onValueChange={(v) =>
                                setDraft((d) => ({ ...d, kind: v as DashboardCardKind }))
                              }
                            >
                              <SelectTrigger className="h-8 w-full text-sm sm:w-[200px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {(Object.keys(KIND_LABELS) as DashboardCardKind[]).map((k) => (
                                  <SelectItem key={k} value={k}>
                                    {KIND_LABELS[k]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {draft.kind === 'column' && (
                              <Select
                                value={draft.columnId || firstCol}
                                onValueChange={(v) =>
                                  setDraft((d) => ({ ...d, columnId: v }))
                                }
                              >
                                <SelectTrigger className="h-8 w-full text-sm sm:w-[180px]">
                                  <SelectValue placeholder="Column" />
                                </SelectTrigger>
                                <SelectContent>
                                  {columns.map((col) => (
                                    <SelectItem key={col.id} value={col.id}>
                                      {col.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingId(null)}
                            >
                              Cancel
                            </Button>
                            <Button size="sm" onClick={() => saveEdit(card.id)}>
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="group flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5">
                          <button
                            type="button"
                            {...dragProvided.dragHandleProps}
                            className="shrink-0 cursor-grab rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground active:cursor-grabbing"
                            title="Drag to reorder"
                            aria-label="Drag to reorder"
                          >
                            <GripVertical size={16} />
                          </button>
                          <span
                            className="h-3 w-3 shrink-0 rounded-full"
                            style={{ background: card.color }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">
                              {card.title}
                            </p>
                            <p className="truncate text-[10px] text-muted-foreground">
                              {KIND_LABELS[card.kind]}
                              {card.kind === 'column' && card.columnId
                                ? ` · ${columns.find((c) => c.id === card.columnId)?.label ?? card.columnId}`
                                : ''}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => startEdit(card)}
                              className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                              title="Edit"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteDashboardCard(card.id)}
                              className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              title="Delete"
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

      {adding ? (
        <div className="space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="color"
              value={draft.color}
              onChange={(e) => setDraft((d) => ({ ...d, color: e.target.value }))}
              className="h-7 w-7 shrink-0 cursor-pointer rounded border border-border bg-transparent p-0.5"
            />
            <Input
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              placeholder="Card title"
              className="h-8 min-w-[120px] flex-1 text-sm"
              autoFocus
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select
              value={draft.kind}
              onValueChange={(v) =>
                setDraft((d) => ({ ...d, kind: v as DashboardCardKind, columnId: d.columnId || firstCol }))
              }
            >
              <SelectTrigger className="h-8 w-full text-sm sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(KIND_LABELS) as DashboardCardKind[]).map((k) => (
                  <SelectItem key={k} value={k}>
                    {KIND_LABELS[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {draft.kind === 'column' && (
              <Select
                value={draft.columnId || firstCol}
                onValueChange={(v) => setDraft((d) => ({ ...d, columnId: v }))}
              >
                <SelectTrigger className="h-8 w-full text-sm sm:w-[180px]">
                  <SelectValue placeholder="Column" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((col) => (
                    <SelectItem key={col.id} value={col.id}>
                      {col.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="flex justify-end gap-1">
            <Button size="sm" variant="outline" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={commitAdd}>
              Add card
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setDraft({
              title: '',
              color: '#6366f1',
              kind: 'total',
              columnId: firstCol,
            });
            setAdding(true);
          }}
          className="mt-1 flex w-full items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-[12px] text-muted-foreground transition-all hover:border-solid hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
        >
          <Plus size={13} />
          Add dashboard card
        </button>
      )}
    </div>
  );
}

// ── Main modal ───────────────────────────────────────────────────────────────
export function ManageModal({ open, onClose }: ManageModalProps) {
  const [tab, setTab] = useState<Tab>('columns');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'columns',    label: 'Columns'    },
    { id: 'categories', label: 'Categories' },
    { id: 'priorities', label: 'Priorities' },
    { id: 'dashboard',  label: 'Dashboard'  },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[520px] bg-slate-50 text-popover-foreground dark:bg-card dark:text-white">
        <DialogHeader>
          <DialogTitle className="text-foreground dark:text-white">
            Board Settings
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-muted p-1 sm:grid-cols-4">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'rounded-md px-2 py-1.5 text-xs font-medium transition-all sm:text-sm',
                tab === t.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="max-h-[420px] overflow-y-auto pr-0.5">
          {tab === 'columns'    && <ColumnsTab />}
          {tab === 'categories' && <CategoriesTab />}
          {tab === 'priorities' && <PrioritiesTab />}
          {tab === 'dashboard'  && <DashboardTab />}
        </div>

        <div className="flex justify-end pt-1">
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
