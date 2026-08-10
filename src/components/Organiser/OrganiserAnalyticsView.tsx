import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { OrganiserAnalytics, OrganiserEventData } from '../../types';

interface OrganiserAnalyticsViewProps {
  events?: OrganiserEventData[];
  onFetchAnalytics: (range: '7d' | '30d' | 'all') => Promise<OrganiserAnalytics>;
}

const TIER_COLORS = ['#6C2BD9', '#8B5CF6', '#A78BFA', '#DDD6FE', '#C4B5FD', '#EDE9FE'];

const EMPTY_ANALYTICS: OrganiserAnalytics = {
  totalGrossRevenue: 0,
  totalTicketsSold: 0,
  totalCapacity: 0,
  checkedInCount: 0,
  avgOrderValue: 0,
  resaleRoyalties: 0,
  dailyRevenue: [],
  tierBreakdown: [],
};

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const OrganiserAnalyticsView: React.FC<OrganiserAnalyticsViewProps> = ({
  events = [],
  onFetchAnalytics,
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');
  const [analytics, setAnalytics] = useState<OrganiserAnalytics>(EMPTY_ANALYTICS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const safeEvents = events || [];

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    onFetchAnalytics(timeRange)
      .then((data) => {
        if (!cancelled) setAnalytics(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load analytics');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [timeRange, onFetchAnalytics]);

  const capacitySoldPct =
    analytics.totalCapacity > 0
      ? ((analytics.totalTicketsSold / analytics.totalCapacity) * 100).toFixed(1)
      : '0.0';
  const checkInRatePct =
    analytics.totalTicketsSold > 0
      ? ((analytics.checkedInCount / analytics.totalTicketsSold) * 100).toFixed(1)
      : '0.0';

  const revenueChartData = analytics.dailyRevenue.map((d) => ({
    date: formatShortDate(d.date),
    revenue: d.revenue,
  }));

  const tierTotal = analytics.tierBreakdown.reduce((acc, t) => acc + t.ticketsSold, 0);
  const tierPieData = analytics.tierBreakdown.map((t, idx) => ({
    name: t.tierName,
    value: tierTotal > 0 ? Math.round((t.ticketsSold / tierTotal) * 100) : 0,
    color: TIER_COLORS[idx % TIER_COLORS.length],
  }));

  return (
    <main id="organiser-analytics-view" className="space-y-5 pb-28 px-4 pt-2">
      {/* Header Bar */}
      <section className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-[#1a1c1d]">
            Performance Analytics
          </h2>
          <p className="text-xs text-[#7b7486]">
            Real revenue, ticket, and resale figures from your own events
          </p>
        </div>

        <div className="flex bg-white rounded-xl border border-[#ccc3d7]/40 p-1 text-[11px] font-bold">
          {(['7d', '30d', 'all'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-2.5 py-1 rounded-lg uppercase transition-all ${
                timeRange === r
                  ? 'bg-[#6C2BD9] text-white shadow-xs'
                  : 'text-[#7b7486] hover:text-[#1a1c1d]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </section>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-red-700 text-[11px]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center gap-2 text-[#7b7486] text-xs py-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading analytics…</span>
        </div>
      )}

      {/* 4 Metric KPI Cards — all derived from real orders/passes */}
      <section className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-white rounded-3xl border border-[#ccc3d7]/40 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7b7486]">
            Total Gross Revenue
          </span>
          <p className="font-heading font-bold text-xl text-[#1a1c1d]">
            ${analytics.totalGrossRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-[#7b7486] font-bold">
            {analytics.totalTicketsSold} tickets sold
          </p>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-[#ccc3d7]/40 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7b7486]">
            Average Order Value
          </span>
          <p className="font-heading font-bold text-xl text-[#1a1c1d]">
            ${analytics.avgOrderValue.toFixed(2)}
          </p>
          <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> Per completed order
          </p>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-[#ccc3d7]/40 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7b7486]">
            Capacity Sold
          </span>
          <p className="font-heading font-bold text-xl text-[#1a1c1d]">
            {capacitySoldPct}%
          </p>
          <p className="text-[10px] text-purple-600 font-bold">
            {analytics.totalTicketsSold} / {analytics.totalCapacity} seats
          </p>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-[#ccc3d7]/40 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7b7486]">
            Resale Royalties
          </span>
          <p className="font-heading font-bold text-xl text-[#1a1c1d]">
            ${analytics.resaleRoyalties.toFixed(2)}
          </p>
          <p className="text-[10px] text-emerald-600 font-bold">
            5% of completed secondary sales
          </p>
        </div>
      </section>

      {/* Gate Check-In Rate strip */}
      <section className="bg-white rounded-3xl p-4 border border-[#ccc3d7]/40 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="font-heading font-bold text-xs text-[#1a1c1d]">Gate Check-In Rate</h3>
          <p className="text-[10px] text-[#7b7486]">
            {analytics.checkedInCount} of {analytics.totalTicketsSold} sold tickets scanned
          </p>
        </div>
        <span className="font-heading font-bold text-lg text-[#6C2BD9]">{checkInRatePct}%</span>
      </section>

      {/* CHART 1: Daily Revenue Area Chart (real completed-order totals grouped by day) */}
      <section className="bg-white rounded-3xl p-5 border border-[#ccc3d7]/40 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-sm text-[#1a1c1d]">
              Revenue Velocity ($)
            </h3>
            <p className="text-[10px] text-[#7b7486]">
              Daily gross sales volume over selected period
            </p>
          </div>
        </div>

        {revenueChartData.length === 0 ? (
          <div className="h-48 w-full flex items-center justify-center text-[11px] text-[#7b7486]">
            No completed orders in this period yet.
          </div>
        ) : (
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6C2BD9" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6C2BD9" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f3f5" />
                <XAxis
                  dataKey="date"
                  stroke="#7b7486"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="#7b7486"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#1a1c1d',
                    color: '#fff',
                    borderRadius: '12px',
                    fontSize: '11px',
                    border: 'none',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6C2BD9"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* CHART 2: Real Tier Breakdown — ticket share (donut) + revenue by tier (bar) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white rounded-3xl p-4 border border-[#ccc3d7]/40 shadow-xs space-y-2">
          <h3 className="font-heading font-bold text-xs text-[#1a1c1d]">
            Tickets Sold by Tier
          </h3>
          {tierPieData.length === 0 ? (
            <div className="h-40 w-full flex items-center justify-center text-[11px] text-[#7b7486]">
              No ticket sales yet.
            </div>
          ) : (
            <>
              <div className="h-40 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tierPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={36}
                      outerRadius={55}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {tierPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [`${val}%`, 'Share']}
                      contentStyle={{
                        backgroundColor: '#1a1c1d',
                        color: '#fff',
                        borderRadius: '12px',
                        fontSize: '11px',
                        border: 'none',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-1 text-[10px] text-[#4a4455]">
                {tierPieData.map((tier) => (
                  <div key={tier.name} className="flex items-center gap-1.5 truncate">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tier.color }}
                    />
                    <span className="truncate">
                      {tier.name} ({tier.value}%)
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="bg-white rounded-3xl p-4 border border-[#ccc3d7]/40 shadow-xs space-y-2">
          <h3 className="font-heading font-bold text-xs text-[#1a1c1d]">
            Revenue by Ticket Tier ($)
          </h3>
          {analytics.tierBreakdown.length === 0 ? (
            <div className="h-40 w-full flex items-center justify-center text-[11px] text-[#7b7486]">
              No ticket sales yet.
            </div>
          ) : (
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.tierBreakdown} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="tierName"
                    type="category"
                    stroke="#7b7486"
                    fontSize={10}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip
                    formatter={(val: number) => [`$${val.toLocaleString()}`, 'Revenue']}
                    contentStyle={{
                      backgroundColor: '#1a1c1d',
                      color: '#fff',
                      borderRadius: '12px',
                      fontSize: '11px',
                      border: 'none',
                    }}
                  />
                  <Bar dataKey="revenue" fill="#6C2BD9" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>

      {safeEvents.length === 0 && !isLoading && (
        <p className="text-center text-[11px] text-[#7b7486] pt-2">
          Create and publish an event to start seeing live analytics.
        </p>
      )}
    </main>
  );
};
