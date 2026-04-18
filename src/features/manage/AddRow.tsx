import { useState } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

export interface AddRowProps {
  placeholder: string;
  onAdd: (label: string, color: string) => void;
}

export function AddRow({ placeholder, onAdd }: AddRowProps) {
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
        type="button"
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
        type="button"
        onClick={commit}
        disabled={!label.trim()}
        className="rounded-md p-1 text-green-600 hover:bg-green-100 disabled:opacity-40 dark:hover:bg-green-950"
        title="Add"
      >
        <Check size={14} />
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="rounded-md p-1 text-muted-foreground hover:bg-accent"
        title="Cancel"
      >
        <X size={14} />
      </button>
    </div>
  );
}
