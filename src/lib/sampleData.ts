import type { Task, KanbanColumn } from '../types';

export const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'planning',  label: 'Planning',     color: '#818cf8' },
  { id: 'progress', label: 'In Progress', color: '#f97316' },
  { id: 'done',     label: 'Done',        color: '#22c55e' },
];

export const CATEGORIES = ['Work', 'Personal', 'Urgent', 'Design', 'Research'] as const;

export const SAMPLE_TASKS: Task[] = [
  {
    id: 'sample_1', title: 'Redesign landing page hero section',
    priority: 'high', category: 'Design', col: 'progress',
    due: '2026-04-18', desc: 'Update with new brand guidelines',
    createdAt: '2026-04-01T09:00:00Z', updatedAt: '2026-04-10T09:00:00Z',
  },
  {
    id: 'sample_2', title: 'Set up CI/CD pipeline for staging',
    priority: 'high', category: 'Work', col: 'planning',
    due: '2026-04-22', desc: '',
    createdAt: '2026-04-02T09:00:00Z', updatedAt: '2026-04-02T09:00:00Z',
  },
  {
    id: 'sample_3', title: 'Write unit tests for auth module',
    priority: 'med', category: 'Work', col: 'planning',
    due: '2026-04-25', desc: '',
    createdAt: '2026-04-03T09:00:00Z', updatedAt: '2026-04-03T09:00:00Z',
  },
  {
    id: 'sample_4', title: 'Review Q2 product roadmap doc',
    priority: 'low', category: 'Research', col: 'done',
    due: '2026-04-10', desc: '',
    createdAt: '2026-04-01T09:00:00Z', updatedAt: '2026-04-09T09:00:00Z',
  },
  {
    id: 'sample_5', title: 'Fix responsive nav breakpoints',
    priority: 'med', category: 'Design', col: 'progress',
    due: '2026-04-20', desc: '',
    createdAt: '2026-04-04T09:00:00Z', updatedAt: '2026-04-04T09:00:00Z',
  },
  {
    id: 'sample_6', title: 'Schedule 1:1 with design team',
    priority: 'low', category: 'Personal', col: 'done',
    due: '2026-04-12', desc: '',
    createdAt: '2026-04-02T09:00:00Z', updatedAt: '2026-04-11T09:00:00Z',
  },
  {
    id: 'sample_7', title: 'Migrate legacy API endpoints to v2',
    priority: 'high', category: 'Urgent', col: 'planning',
    due: '2026-04-30', desc: 'Breaking changes in v2 response shape',
    createdAt: '2026-04-05T09:00:00Z', updatedAt: '2026-04-05T09:00:00Z',
  },
  {
    id: 'sample_8', title: 'Update npm dependencies',
    priority: 'low', category: 'Work', col: 'done',
    due: '2026-04-08', desc: '',
    createdAt: '2026-04-01T09:00:00Z', updatedAt: '2026-04-07T09:00:00Z',
  },
];
