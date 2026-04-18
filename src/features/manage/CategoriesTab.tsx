import { useState } from 'react';
import { Trash2, Pencil } from 'lucide-react';
import { useBoardStore } from '../../store/board';
import type { CategoryDef } from '../../types';
import { AddRow } from './AddRow';
import { EditRow } from './EditRow';

export function CategoriesTab() {
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
                type="button"
                onClick={() => setEditingId(cat.id)}
                className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                title="Edit category"
              >
                <Pencil size={13} />
              </button>
              <button
                type="button"
                onClick={() => deleteCategory(cat.id)}
                className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                title="Delete category"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ),
      )}
      <AddRow
        placeholder="Add category…"
        onAdd={(label, color) => addCategory(label, color)}
      />
    </div>
  );
}
