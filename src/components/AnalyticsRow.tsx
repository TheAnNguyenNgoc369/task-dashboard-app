/**
 * components/AnalyticsRow.tsx
 *
 * Top summary row: stat cards + Recharts donut chart.
 * Pure presentational — receives data as props.
 */

import React from 'react';
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
  { key: 'backlog',  label: 'Backlog',     color: '#818cf8' },
] as const;

const STAT_CARDS = (d: AnalyticsData) => [
  { label: 'Total tasks',  value: d.total,            sub: `${d.highPriority} high priority`, color: undefined },
  { label: 'Completed',    value: `${d.completionPct}%`, sub: `${d.done} of ${d.total} done`,  color: '#22c55e' },
  { label: 'In progress',  value: d.progress,         sub: 'active tasks',                   color: '#f97316' },
  { label: 'Backlog',      value: d.backlog,           sub: 'not started',                    color: '#818cf8' },
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
          className="rounded-xl border border-border bg-card p-3.5"
        >
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
            {card.label}
          </p>
          <p
            className="text-2xl font-semibold tabular-nums"
            style={card.color ? { color: card.color } : undefined}
          >
            {card.value}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{card.sub}</p>
        </div>
      ))}

      {/* Pie chart card (spans 1 column) */}
      <div className="rounded-xl border border-border bg-card p-3.5 flex items-center gap-4 col-span-2 sm:col-span-3 lg:col-span-1">
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

        <div className="flex flex-col gap-1.5">
          {PIE_DATA_KEYS.map((d) => (
            <div key={d.key} className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: d.color }}
              />
              {d.label}: <span className="font-medium text-foreground">{data[d.key]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
