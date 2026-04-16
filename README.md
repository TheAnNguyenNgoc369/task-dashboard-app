# Mission Control — Task Dashboard

A production-grade Kanban task manager built as a portfolio piece, showcasing
modern React architecture, advanced state management, and polished UI/UX.

---

## Tech stack

| Concern | Choice | Why |
|---|---|---|
| Framework | React 18 + TypeScript | Concurrent features, strict typing |
| Build | Vite 5 | Sub-second HMR, ESM-native |
| Styling | Tailwind CSS + shadcn/ui | Utility-first, Radix primitives |
| UI State | Zustand | See below |
| Server State | TanStack Query | Ready for API upgrade |
| DnD | @hello-pangea/dnd | Active fork of react-beautiful-dnd |
| Charts | Recharts | Composable, React-native |
| Forms | React Hook Form + Zod | Uncontrolled perf + runtime validation |
| Toasts | Sonner | Accessible, minimal |
| Persistence | localStorage (Zustand persist) | Zero-backend demo |

---

## Why Zustand over Redux?

**Zustand** was chosen for UI and task state for four reasons:

1. **Zero boilerplate.** No action types, reducers, or dispatch calls.
   A `set()` call inside the store is the entire mutation API.

2. **Tiny footprint.** ~1 kB gzipped vs Redux Toolkit's ~13 kB. Matters for
   initial load on portfolio projects that are judged on Lighthouse scores.

3. **No Provider.** Any component imports `useTasksStore()` and subscribes
   directly — no wrapping the tree in `<Provider store={...}>`.

4. **Selector-based subscriptions.** Components only re-render when the exact
   slice they select changes, giving Context API-level ergonomics with
   fine-grained performance.

**When to reach for Redux instead:**
- DevTools time-travel is a hard requirement for complex undo/redo
- The team already uses Redux and consistency matters more than bundle size
- You need middleware like redux-saga for complex async orchestration

---

## Why TanStack Query?

Even in this offline demo, TanStack Query is listed as a `devDependency` to
show the upgrade path. When a backend is added:

```ts
// Replace useTasksStore() reads with:
const { data: tasks } = useQuery({ queryKey: ['tasks'], queryFn: fetchTasks });

// Replace store mutations with:
const mutation = useMutation({
  mutationFn: updateTask,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
});
```

The component tree stays identical — only the data source changes.

---

## Folder structure

```
src/
├── components/
│   ├── TaskCard.tsx       # Reusable draggable card with hover actions
│   ├── KanbanColumn.tsx   # Droppable column wrapping TaskCards
│   ├── TaskModal.tsx      # CRUD modal (RHF + Zod)
│   └── AnalyticsRow.tsx   # Stat cards + Recharts donut chart
├── hooks/
│   └── useTasks.ts        # Filtered views + analytics derived state
├── store/
│   ├── tasks.ts           # Persisted task CRUD (Zustand + localStorage)
│   └── ui.ts              # Ephemeral UI flags (dark mode, modal, search)
├── types/
│   └── index.ts           # Shared TypeScript interfaces
└── lib/
    ├── sampleData.ts      # Seed tasks + column/category constants
    └── utils.ts           # cn() Tailwind class merger
```

---

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Features

- **Kanban board** — drag tasks between Planning / In Progress / Done columns
- **Analytics** — live donut chart + stat cards update on every change
- **CRUD modal** — create and edit tasks with priority, category, and due date
- **Search & filter** — real-time title/description search + category filter
- **Overdue detection** — due dates past today are highlighted red
- **Dark mode** — persisted toggle, system-variable driven
- **Persistence** — `localStorage` via Zustand's persist middleware
- **Responsive** — single-column on mobile, 3-column on desktop
