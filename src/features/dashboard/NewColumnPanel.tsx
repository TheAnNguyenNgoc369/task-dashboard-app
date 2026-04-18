import { useCallback, useState } from 'react';
import { Plus, X, Check } from 'lucide-react';
import { toast } from 'sonner';

interface NewColumnPanelProps {
  onAddColumn: (label: string, color: string) => void;
}

export function NewColumnPanel({ onAddColumn }: NewColumnPanelProps) {
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColColor, setNewColColor] = useState('#818cf8');

  const handleAddColumn = useCallback(() => {
    const name = newColName.trim() || 'New Column';
    onAddColumn(name, newColColor);
    setNewColName('');
    setNewColColor('#818cf8');
    setAddingColumn(false);
    toast.success(`Column "${name}" added`);
  }, [newColName, newColColor, onAddColumn]);

  const handleCancelAddColumn = useCallback(() => {
    setAddingColumn(false);
    setNewColName('');
    setNewColColor('#818cf8');
  }, []);

  return (
    <div className="w-[296px] shrink-0">
      {addingColumn ? (
        <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card/90 shadow-sm">
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
              type="button"
              onClick={handleAddColumn}
              className="rounded p-0.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-950"
              title="Confirm"
            >
              <Check size={13} />
            </button>
            <button
              type="button"
              onClick={handleCancelAddColumn}
              className="rounded p-0.5 text-muted-foreground hover:bg-accent"
              title="Cancel"
            >
              <X size={13} />
            </button>
          </div>
          <div className="p-2.5">
            <button
              type="button"
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
          type="button"
          onClick={() => setAddingColumn(true)}
          className="flex w-full items-center gap-2.5 rounded-xl border border-dashed border-border bg-card/90 px-3.5 py-3 text-[13px] font-semibold text-muted-foreground shadow-sm transition-all hover:border-border hover:text-foreground"
        >
          <Plus size={14} />
          New column
        </button>
      )}
    </div>
  );
}
