import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '../../lib/utils';
import type { ManageTab } from './constants';
import { ColumnsTab } from './ColumnsTab';
import { CategoriesTab } from './CategoriesTab';
import { PrioritiesTab } from './PrioritiesTab';
import { DashboardTab } from './DashboardTab';

export interface ManageModalProps {
  open: boolean;
  onClose: () => void;
}

export function ManageModal({ open, onClose }: ManageModalProps) {
  const [tab, setTab] = useState<ManageTab>('columns');

  const tabs: { id: ManageTab; label: string }[] = [
    { id: 'columns', label: 'Columns' },
    { id: 'categories', label: 'Categories' },
    { id: 'priorities', label: 'Priorities' },
    { id: 'dashboard', label: 'Dashboard' },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Board Settings</DialogTitle>
        </DialogHeader>

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
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="max-h-[420px] overflow-y-auto pr-0.5">
          {tab === 'columns' && <ColumnsTab />}
          {tab === 'categories' && <CategoriesTab />}
          {tab === 'priorities' && <PrioritiesTab />}
          {tab === 'dashboard' && <DashboardTab />}
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
