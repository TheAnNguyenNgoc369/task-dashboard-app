import { useState } from 'react';
import { Trash2, Pencil } from 'lucide-react';
import { useBoardStore } from '../../store/board';
import type { PriorityDef } from '../../types';
import { AddRow } from './AddRow';
import { EditRow } from './EditRow';

export function PrioritiesTab() {
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
                type="button"
                onClick={() => setEditingId(pri.id)}
                className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                title="Edit priority"
              >
                <Pencil size={13} />
              </button>
              <button
                type="button"
                onClick={() => deletePriority(pri.id)}
                className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                title="Delete priority"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ),
      )}
      <AddRow
        placeholder="Add priority…"
        onAdd={(label, color) => addPriority(label, color)}
      />
    </div>
  );
}
