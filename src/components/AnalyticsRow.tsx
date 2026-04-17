import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { AnalyticsData } from '../types';

interface AnalyticsRowProps {
  data: AnalyticsData;
}

export function AnalyticsRow({ data }: AnalyticsRowProps) {
  const pieData = data.byColumn
    .filter((c) => c.count > 0 || data.total === 0)
    .map((c) => ({ name: c.label, value: c.count, color: c.color }));

  // Show at least an empty slice when there's no data
  const safePieData = pieData.length > 0 ? pieData : [{ name: 'Empty', value: 1, color: '#e2e8f0' }];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
      {/* Total tasks */}
      <div
        className="rounded-xl border border-border bg-card p-4 shadow-sm"
        style={{
          background: 'linear-gradient(135deg, color-mix(in oklch, #2563eb 12%, var(--card)), var(--card))',
          boxShadow: 'inset 0 1px 0 color-mix(in oklch, #2563eb 16%, transparent)',
        }}
      >
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Total tasks
        </p>
        <p className="text-3xl font-semibold tabular-nums" style={{ color: '#2563eb' }}>
          {data.total}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {data.highPriority} high priority
        </p>
      </div>

      {/* Completed */}
      <div
        className="rounded-xl border border-border bg-card p-4 shadow-sm"
        style={{
          background: 'linear-gradient(135deg, color-mix(in oklch, #22c55e 12%, var(--card)), var(--card))',
          boxShadow: 'inset 0 1px 0 color-mix(in oklch, #22c55e 16%, transparent)',
        }}
      >
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Completed
        </p>
        <p className="text-3xl font-semibold tabular-nums" style={{ color: '#22c55e' }}>
          {data.completionPct}%
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {data.completedCount} of {data.total} done
        </p>
      </div>

      {/* Per-column stat cards (up to 2 columns shown) */}
      {data.byColumn.slice(0, 2).map((col) => (
        <div
          key={col.id}
          className="rounded-xl border border-border bg-card p-4 shadow-sm"
          style={{
            background: `linear-gradient(135deg, color-mix(in oklch, ${col.color} 12%, var(--card)), var(--card))`,
            boxShadow: `inset 0 1px 0 color-mix(in oklch, ${col.color} 16%, transparent)`,
          }}
        >
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {col.label}
          </p>
          <p className="text-3xl font-semibold tabular-nums" style={{ color: col.color }}>
            {col.count}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">tasks</p>
        </div>
      ))}

      {/* Pie chart card */}
      <div className="col-span-2 flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:col-span-3 lg:col-span-1">
        <ResponsiveContainer width={80} height={80}>
          <PieChart>
            <Pie
              data={safePieData}
              cx="50%"
              cy="50%"
              innerRadius={24}
              outerRadius={36}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {safePieData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [value, name]}
              contentStyle={{
                fontSize: 12,
                border: '0.5px solid var(--border)',
                borderRadius: 8,
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="flex flex-col gap-2 overflow-hidden">
          {data.byColumn.map((col) => (
            <div key={col.id} className="flex items-center gap-2 text-sm text-muted-foreground">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: col.color }}
              />
              <span className="truncate">{col.label}:</span>
              <span className="font-semibold text-foreground">{col.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
