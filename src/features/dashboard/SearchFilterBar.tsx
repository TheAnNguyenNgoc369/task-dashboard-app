import { Search, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CategoryDef } from '../../types';
import { cn } from '../../lib/utils';

interface SearchFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  categories: CategoryDef[];
}

export function SearchFilterBar({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  categories,
}: SearchFilterBarProps) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <div className="relative min-w-[200px] flex-1">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks…"
          className={cn(
            'h-11 w-full rounded-xl border border-border bg-card pl-10 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20',
            search.trim() ? 'pr-10' : 'pr-3',
          )}
        />
        {search.trim() !== '' && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-border/80 bg-muted/60 text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground"
            aria-label="Clear search"
          >
            <X size={12} strokeWidth={2.5} />
          </button>
        )}
      </div>
      <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
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
  );
}
