import { useState } from 'react';
import { Trash2, Pencil, Plus, Check, X, GripVertical, CheckSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBoardStore } from '../store/board';
import type { KanbanColumn, PriorityDef, CategoryDef } from '../types';
import { cn } from '../lib/utils';

type Tab = 'columns' | 'categories' | 'priorities';

interface ManageModalProps {
  open: boolean;
  onClose: () => void;
}

// ── Inline edit row ─────────────────────────────────────────────────────────
interface EditRowProps {
  label: string;
  color: string;
  extra?: string; // e.g. emoji for priorities
  onSave: (label: string, color: string, extra?: string) => void;
  onCancel: () => void;
  showExtra?: boolean;
}
function EditRow({ label, color, extra, onSave, onCancel, showExtra }: EditRowProps) {
  const [l, setL] = useState(label);
  const [c, setC] = useState(color);
  const [e, setE] = useState(extra ?? '');
  return (
    <div className="flex items-center gap-2 rounded-lg bg-accent/40 px-2 py-1.5">
      <input
        type="color"
        value={c}
        onChange={(ev) => setC(ev.target.value)}
        className="h-7 w-7 shrink-0 cursor-pointer rounded border border-border bg-transparent p-0.5"
        title="Pick colour"
      />
      {showExtra && (
        <input
          type="text"
          value={e}
          onChange={(ev) => setE(ev.target.value)}
          placeholder="emoji"
          className="w-10 rounded border border-border bg-background px-1 py-0.5 text-sm text-center"
          maxLength={2}
        />
      )}
      <Input
        value={l}
        onChange={(ev) => setL(ev.target.value)}
        className="h-7 flex-1 text-sm"
        onKeyDown={(ev) => {
          if (ev.key === 'Enter') onSave(l.trim(), c, e.trim() || undefined);
          if (ev.key === 'Escape') onCancel();
        }}
        autoFocus
      />
      <button
        onClick={() => l.trim() && onSave(l.trim(), c, e.trim() || undefined)}
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
  onAdd: (label: string, color: string, extra?: string) => void;
  showExtra?: boolean;
}
function AddRow({ placeholder, onAdd, showExtra }: AddRowProps) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [emoji, setEmoji] = useState('');

  const commit = () => {
    if (!label.trim()) return;
    onAdd(label.trim(), color, emoji.trim() || undefined);
    setLabel('');
    setColor('#6366f1');
    setEmoji('');
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
      {showExtra && (
        <input
          type="text"
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          placeholder="emoji"
          className="w-10 rounded border border-border bg-background px-1 py-0.5 text-sm text-center"
          maxLength={2}
        />
      )}
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
            className="group flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5 hover:border-border/80"
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
            extra={pri.emoji}
            showExtra
            onSave={(label, color, emoji) => {
              updatePriority(pri.id, { label, color, emoji: emoji ?? pri.emoji });
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
            <span className="text-sm">{pri.emoji}</span>
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
        onAdd={(label, color, emoji) => addPriority(label, color, emoji ?? '⚪')}
        showExtra
      />
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
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[480px] bg-slate-50 text-popover-foreground dark:bg-card dark:text-white">
        <DialogHeader>
          <DialogTitle className="text-foreground dark:text-white">
            Board Settings
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 rounded-lg border border-border bg-muted p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
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
        <div className="max-h-[380px] overflow-y-auto pr-0.5">
          {tab === 'columns'    && <ColumnsTab />}
          {tab === 'categories' && <CategoriesTab />}
          {tab === 'priorities' && <PrioritiesTab />}
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
