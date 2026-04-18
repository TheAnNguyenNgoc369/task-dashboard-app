import type { DashboardCardKind } from '../../types';

export type ManageTab = 'columns' | 'categories' | 'priorities' | 'dashboard';

/** Stable order for the metric picker (not Object.keys order) */
export const DASHBOARD_KINDS: DashboardCardKind[] = [
  'total',
  'completed',
  'active',
  'overdue',
  'priority',
  'column',
  'distribution',
];

export const KIND_LABELS: Record<DashboardCardKind, string> = {
  total: 'Total tasks',
  completed: 'Completion rate',
  active: 'Active (not done)',
  overdue: 'Overdue',
  priority: 'By priority',
  column: 'Single column',
  distribution: 'Distribution Chart',
};
