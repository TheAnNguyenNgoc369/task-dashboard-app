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

const PIE_DATA_KEYS = [
  { key: 'done',     label: 'Done',        color: '#22c55e' },
  { key: 'progress', label: 'In Progress', color: '#f97316' },
  { key: 'planning',  label: 'Planning',     color: '#818cf8' },
] as const;

const STAT_CARDS = (d: AnalyticsData) => [
  { label: 'Total tasks', value: d.total, sub: `${d.highPriority} high priority`, color: '#2563eb' },
  { label: 'Completed', value: `${d.completionPct}%`, sub: `${d.done} of ${d.total} done`, color: '#22c55e' },
  { label: 'In progress', value: d.progress, sub: 'active tasks', color: '#f97316' },
  { label: 'Planning', value: d.planning, sub: 'not started', color: '#6366f1' },
];

export function AnalyticsRow({ data }: AnalyticsRowProps) {
  const pieData = PIE_DATA_KEYS.map((d) => ({
    name: d.label,
    value: data[d.key],
    color: d.color,
  }));

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
      {/* Stat cards */}
      {STAT_CARDS(data).map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-border bg-card p-4 shadow-sm"
          style={{
            background: `linear-gradient(135deg, color-mix(in oklch, ${card.color} 12%, var(--card)), var(--card))`,
            boxShadow: `inset 0 1px 0 color-mix(in oklch, ${card.color} 16%, transparent)`,
          }}
        >
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {card.label}
          </p>
          <p
            className="text-3xl font-semibold tabular-nums"
            style={{ color: card.color }}
          >
            {card.value}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{card.sub}</p>
        </div>
      ))}

      {/* Pie chart card (spans 1 column) */}
      <div className="col-span-2 flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:col-span-3 lg:col-span-1">
        <ResponsiveContainer width={80} height={80}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={24}
              outerRadius={36}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {pieData.map((entry, i) => (
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

        <div className="flex flex-col gap-2">
          {PIE_DATA_KEYS.map((d) => (
            <div key={d.key} className="flex items-center gap-2 text-sm text-muted-foreground">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: d.color }}
              />
              {d.label}: <span className="font-semibold text-foreground">{data[d.key]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
