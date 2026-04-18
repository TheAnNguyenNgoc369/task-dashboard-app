import { Moon, Sun, Plus, ClipboardList, Settings } from 'lucide-react';

interface DashboardHeaderProps {
  dark: boolean;
  onToggleDark: () => void;
  onOpenManage: () => void;
  onNewTask: () => void;
}

export function DashboardHeader({
  dark,
  onToggleDark,
  onOpenManage,
  onNewTask,
}: DashboardHeaderProps) {
  return (
    <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="group flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-gradient-to-br from-primary to-violet-500 text-primary-foreground shadow-[0_12px_24px_-14px_rgba(99,102,241,0.75)] transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 hover:shadow-[0_16px_28px_-12px_rgba(99,102,241,0.85)]">
          <ClipboardList
            size={20}
            className="transition-transform duration-200 group-hover:scale-110"
          />
        </div>
        <div>
          <h1 className="text-xl font-semibold leading-none text-foreground">
            Task Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A Kanban task dashboard built with React 18, Zustand, and Tailwind CSS.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleDark}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-accent hover:text-foreground"
          aria-label="Toggle dark mode"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          type="button"
          onClick={onOpenManage}
          className="flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-accent hover:text-foreground"
          title="Board settings"
        >
          <Settings size={16} />
          Manage
        </button>
        <button
          type="button"
          onClick={onNewTask}
          className="group flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500 px-4 text-sm font-semibold text-white shadow-[0_14px_28px_-14px_rgba(99,102,241,0.85)] transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:from-violet-500 hover:via-primary hover:to-pink-500 hover:shadow-[0_18px_30px_-12px_rgba(168,85,247,0.9)]"
        >
          <Plus size={17} className="transition-transform duration-200 group-hover:rotate-90" />
          New task
        </button>
      </div>
    </header>
  );
}
