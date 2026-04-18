import { useCallback, useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd';
import { Trash2, Pencil, Plus, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBoardStore } from '../../store/board';
import type { DashboardCard, DashboardCardKind } from '../../types';
import { DASHBOARD_KINDS, KIND_LABELS } from './constants';

export function DashboardTab() {
  const {
    columns,
    priorities,
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
    priorityId: string;
  }>({ title: '', color: '#6366f1', kind: 'total', columnId: '', priorityId: '' });

  const [adding, setAdding] = useState(false);

  const firstCol = columns[0]?.id ?? '';
  const firstPri = priorities[0]?.id ?? 'med';

  const startEdit = (c: DashboardCard) => {
    setEditingId(c.id);
    setDraft({
      title: c.title,
      color: c.color,
      kind: c.kind,
      columnId: c.columnId ?? firstCol,
      priorityId: c.priorityId ?? firstPri,
    });
  };

  const saveEdit = (id: string) => {
    if (!draft.title.trim()) return;
    const columnId =
      draft.kind === 'column' ? (draft.columnId || firstCol) : undefined;
    const priorityId =
      draft.kind === 'priority' ? (draft.priorityId || firstPri) : undefined;
    if (draft.kind === 'column' && !columnId) return;
    if (draft.kind === 'priority' && !priorityId) return;
    updateDashboardCard(id, {
      title: draft.title.trim(),
      color: draft.color,
      kind: draft.kind,
      columnId,
      priorityId,
    });
    setEditingId(null);
  };

  const commitAdd = () => {
    if (!draft.title.trim()) return;
    const columnId =
      draft.kind === 'column' ? (draft.columnId || firstCol) : undefined;
    const priorityId =
      draft.kind === 'priority' ? (draft.priorityId || firstPri) : undefined;
    if (draft.kind === 'column' && !columnId) return;
    if (draft.kind === 'priority' && !priorityId) return;
    addDashboardCard({
      title: draft.title.trim(),
      color: draft.color,
      kind: draft.kind,
      columnId,
      priorityId,
    });
    setDraft({
      title: '',
      color: '#6366f1',
      kind: 'total',
      columnId: firstCol,
      priorityId: firstPri,
    });
    setAdding(false);
  };

  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;
      if (result.source.index === result.destination.index) return;
      reorderDashboardCards(result.source.index, result.destination.index);
    },
    [reorderDashboardCards],
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
                                setDraft((d) => ({
                                  ...d,
                                  kind: v as DashboardCardKind,
                                  columnId: d.columnId || firstCol,
                                  priorityId: d.priorityId || firstPri,
                                }))
                              }
                            >
                              <SelectTrigger className="h-8 w-full text-sm sm:w-[200px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DASHBOARD_KINDS.map((k) => (
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
                            {draft.kind === 'priority' && (
                              <Select
                                value={draft.priorityId || firstPri}
                                onValueChange={(v) =>
                                  setDraft((d) => ({ ...d, priorityId: v }))
                                }
                              >
                                <SelectTrigger className="h-8 w-full text-sm sm:w-[180px]">
                                  <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                  {priorities.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                      {p.label}
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
                              {card.kind === 'priority' && card.priorityId
                                ? ` · ${priorities.find((p) => p.id === card.priorityId)?.label ?? card.priorityId}`
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
                setDraft((d) => ({
                  ...d,
                  kind: v as DashboardCardKind,
                  columnId: d.columnId || firstCol,
                  priorityId: d.priorityId || firstPri,
                }))
              }
            >
              <SelectTrigger className="h-8 w-full text-sm sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DASHBOARD_KINDS.map((k) => (
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
            {draft.kind === 'priority' && (
              <Select
                value={draft.priorityId || firstPri}
                onValueChange={(v) => setDraft((d) => ({ ...d, priorityId: v }))}
              >
                <SelectTrigger className="h-8 w-full text-sm sm:w-[180px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.label}
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
              priorityId: firstPri,
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
