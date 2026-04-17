import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { AnalyticsData, DashboardCard } from '../types';
import { useBoardStore } from '../store/board';

interface AnalyticsRowProps {
  data: AnalyticsData;
}

const TOP_N = 4;

function topColumnsByCount(data: AnalyticsData, n: number) {
  return [...data.byColumn]
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

function resolveStatCard(
  card: DashboardCard,
  data: AnalyticsData
): { main: string; sub: string } {
  switch (card.kind) {
    case 'total':
      return {
        main: String(data.total),
        sub: `${data.activeCount} active`,
      };
    case 'completed':
      return {
        main: `${data.completionPct}%`,
        sub: `${data.completedCount} of ${data.total} done`,
      };
    case 'active':
      return {
        main: String(data.activeCount),
        sub: 'not in done',
      };
    case 'overdue':
      return {
        main: String(data.overdueCount),
        sub: 'past due',
      };
    case 'priority': {
      const id = card.priorityId ?? '';
      const n = data.priorityCounts[id] ?? 0;
      return {
        main: String(n),
        sub: id ? 'tasks' : 'pick a priority',
      };
    }
    case 'column': {
      const col = data.byColumn.find((c) => c.id === card.columnId);
      return {
        main: String(col?.count ?? 0),
        sub: col ? 'tasks' : 'column missing',
      };
    }
    default:
      return { main: '', sub: '' };
  }
}

function DistributionBlock({
  card,
  data,
}: {
  card: DashboardCard;
  data: AnalyticsData;
}) {
  const top = topColumnsByCount(data, TOP_N);
  const pieData = top.map((c) => ({ name: c.label, value: c.count, color: c.color }));
  const safePieData =
    pieData.length > 0 ? pieData : [{ name: 'Empty', value: 1, color: '#e2e8f0' }];

  return (
    <div
      className="col-span-2 flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:col-span-3 lg:col-span-1"
      style={{
        background: `linear-gradient(135deg, color-mix(in oklch, ${card.color} 8%, var(--card)), var(--card))`,
        boxShadow: `inset 0 1px 0 color-mix(in oklch, ${card.color} 12%, transparent)`,
      }}
    >
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

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {card.title}
        </p>
        {top.map((col) => (
          <div key={col.id} className="flex items-center gap-2 text-sm text-muted-foreground">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: col.color }}
            />
            <span className="min-w-0 truncate">{col.label}</span>
            <span className="ml-auto shrink-0 font-semibold tabular-nums text-foreground">
              {col.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnalyticsRow({ data }: AnalyticsRowProps) {
  const dashboardCards = useBoardStore((s) => s.dashboardCards);

  if (dashboardCards.length === 0) {
    return (
      <div className="mb-4 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
        No dashboard cards yet. Open <strong>Manage</strong> → <strong>Dashboard</strong> to add
        cards.
      </div>
    );
  }

  return (
    <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {dashboardCards.map((card) => {
        if (card.kind === 'distribution') {
          return <DistributionBlock key={card.id} card={card} data={data} />;
        }
        const { main, sub } = resolveStatCard(card, data);
        return (
          <div
            key={card.id}
            className="rounded-xl border border-border bg-card p-4 shadow-sm"
            style={{
              background: `linear-gradient(135deg, color-mix(in oklch, ${card.color} 12%, var(--card)), var(--card))`,
              boxShadow: `inset 0 1px 0 color-mix(in oklch, ${card.color} 16%, transparent)`,
            }}
          >
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {card.title}
            </p>
            <p className="text-3xl font-semibold tabular-nums" style={{ color: card.color }}>
              {main}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
          </div>
        );
      })}
    </div>
  );
}
