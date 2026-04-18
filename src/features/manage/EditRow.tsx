import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

export interface EditRowProps {
  label: string;
  color: string;
  onSave: (label: string, color: string) => void;
  onCancel: () => void;
}

export function EditRow({ label, color, onSave, onCancel }: EditRowProps) {
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
        type="button"
        onClick={() => l.trim() && onSave(l.trim(), c)}
        className="rounded-md p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-950"
        title="Save"
      >
        <Check size={14} />
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="rounded-md p-1 text-muted-foreground hover:bg-accent"
        title="Cancel"
      >
        <X size={14} />
      </button>
    </div>
  );
}
