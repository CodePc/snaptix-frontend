import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Ticket as TicketIcon,
  Users,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Zap,
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
import { OrganiserEventData } from '../../types';

interface OrganiserAnalyticsViewProps {
  events?: OrganiserEventData[];
}

const SALES_TIMELINE_DATA = [
  { date: 'Mon', revenue: 4200, tickets: 38 },
  { date: 'Tue', revenue: 6800, tickets: 62 },
  { date: 'Wed', revenue: 9400, tickets: 85 },
  { date: 'Thu', revenue: 8100, tickets: 74 },
  { date: 'Fri', revenue: 14200, tickets: 128 },
  { date: 'Sat', revenue: 18900, tickets: 164 },
  { date: 'Sun', revenue: 16500, tickets: 145 },
];

const TIER_DISTRIBUTION_DATA = [
  { name: 'General Admission', value: 58, color: '#6C2BD9' },
  { name: 'VIP Front Row', value: 24, color: '#8B5CF6' },
  { name: 'Early Bird', value: 12, color: '#A78BFA' },
  { name: 'Rooftop VIP', value: 6, color: '#DDD6FE' },
];

const CHANNEL_ATTRIBUTION_DATA = [
  { channel: 'Snaptix App', sales: 42000, color: '#6C2BD9' },
  { channel: 'Direct / Social', sales: 24500, color: '#8B5CF6' },
  { channel: 'Email Blast', sales: 18450, color: '#3B82F6' },
  { channel: 'Resale Royalty', sales: 4200, color: '#10B981' },
];

export const OrganiserAnalyticsView: React.FC<OrganiserAnalyticsViewProps> = ({
  events = [],
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d');
  const safeEvents = events || [];

  const totalGross = safeEvents.reduce((acc, e) => acc + (e.grossSales || 0), 0);
  const totalTickets = safeEvents.reduce((acc, e) => acc + (e.ticketsSold || 0), 0);
  const avgOrderValue = totalTickets > 0 ? (totalGross / totalTickets).toFixed(2) : '0.00';

  return (
    <main id="organiser-analytics-view" className="space-y-5 pb-28 px-4 pt-2">
      {/* Header Bar */}
      <section className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-[#1a1c1d]">
            Performance Analytics
          </h2>
          <p className="text-xs text-[#7b7486]">
            Real-time sales velocity, audience insights, and tier distribution
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

      {/* 4 Metric KPI Cards */}
      <section className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-white rounded-3xl border border-[#ccc3d7]/40 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7b7486]">
            Average Order Value
          </span>
          <p className="font-heading font-bold text-xl text-[#1a1c1d]">
            ${avgOrderValue}
          </p>
          <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +12.3% vs last event
          </p>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-[#ccc3d7]/40 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7b7486]">
            Cart Conversion Rate
          </span>
          <p className="font-heading font-bold text-xl text-[#1a1c1d]">
            68.4%
          </p>
          <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> Top 5% in category
          </p>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-[#ccc3d7]/40 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7b7486]">
            Repeat Attendees
          </span>
          <p className="font-heading font-bold text-xl text-[#1a1c1d]">
            34.2%
          </p>
          <p className="text-[10px] text-purple-600 font-bold">
            High loyalty retention
          </p>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-[#ccc3d7]/40 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7b7486]">
            Resale Royalties
          </span>
          <p className="font-heading font-bold text-xl text-[#1a1c1d]">
            $4,200.00
          </p>
          <p className="text-[10px] text-emerald-600 font-bold">
            Secondary market 5%
          </p>
        </div>
      </section>

      {/* CHART 1: Daily Revenue & Ticket Velocity Area Chart */}
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
          <span className="text-xs font-mono font-bold text-[#6C2BD9]">
            +28.6%
          </span>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={SALES_TIMELINE_DATA}>
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
                tickFormatter={(v) => `$${v / 1000}k`}
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
      </section>

      {/* CHART 2: Sales Breakdown by Tier & Channels */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Tier Distribution Donut */}
        <div className="bg-white rounded-3xl p-4 border border-[#ccc3d7]/40 shadow-xs space-y-2">
          <h3 className="font-heading font-bold text-xs text-[#1a1c1d]">
            Sales by Ticket Tier
          </h3>
          <div className="h-40 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={TIER_DISTRIBUTION_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={55}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {TIER_DISTRIBUTION_DATA.map((entry, index) => (
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
            {TIER_DISTRIBUTION_DATA.map((tier) => (
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
        </div>

        {/* Marketing Channels Bar Chart */}
        <div className="bg-white rounded-3xl p-4 border border-[#ccc3d7]/40 shadow-xs space-y-2">
          <h3 className="font-heading font-bold text-xs text-[#1a1c1d]">
            Channel Sales Attribution ($)
          </h3>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CHANNEL_ATTRIBUTION_DATA} layout="vertical">
                <XAxis type="number" hide />
                <YAxis
                  dataKey="channel"
                  type="category"
                  stroke="#7b7486"
                  fontSize={10}
                  tickLine={false}
                  width={80}
                />
                <Tooltip
                  formatter={(val: number) => [`$${val.toLocaleString()}`, 'Sales']}
                  contentStyle={{
                    backgroundColor: '#1a1c1d',
                    color: '#fff',
                    borderRadius: '12px',
                    fontSize: '11px',
                    border: 'none',
                  }}
                />
                <Bar dataKey="sales" fill="#6C2BD9" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </main>
  );
};
