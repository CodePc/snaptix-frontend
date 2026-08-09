import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Ticket as TicketIcon,
  Users,
  QrCode,
  Plus,
  ArrowUpRight,
  ChevronRight,
  Sparkles,
  Zap,
  Tag,
  ShieldCheck,
  Calendar,
  Layers,
  BarChart3,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';
import {
  OrganiserEventData,
  FinancialTransaction,
  OrganiserTab,
  OrganiserPersona,
} from '../../types';
import { motion } from 'motion/react';

interface OrganiserDashboardViewProps {
  events?: OrganiserEventData[];
  transactions?: FinancialTransaction[];
  currentPersona?: OrganiserPersona;
  onOpenCreateWizard: () => void;
  onOpenQRScanner: () => void;
  onNavigateTab: (tab: OrganiserTab) => void;
  onSelectEventManage: (eventId: string) => void;
  onSignOut?: () => void;
}

export const OrganiserDashboardView: React.FC<OrganiserDashboardViewProps> = ({
  events = [],
  transactions = [],
  currentPersona = 'admin',
  onOpenCreateWizard,
  onOpenQRScanner,
  onNavigateTab,
  onSelectEventManage,
  onSignOut,
}) => {
  const safeEvents = events || [];
  const safeTransactions = transactions || [];

  const totalGrossRevenue = safeEvents.reduce((acc, e) => acc + (e.grossSales || 0), 0);
  const totalTicketsSold = safeEvents.reduce((acc, e) => acc + (e.ticketsSold || 0), 0);
  const totalCapacity = safeEvents.reduce((acc, e) => acc + (e.totalCapacity || 0), 0);
  const totalCheckedIn = safeEvents.reduce((acc, e) => acc + (e.checkedInCount || 0), 0);
  const liveEventsCount = safeEvents.filter(
    (e) => e.status === 'published' || e.status === 'live'
  ).length;
  const pendingApprovalCount = safeEvents.filter((e) => e.status === 'pending_approval').length;

  return (
    <main id="organiser-dashboard-view" className="space-y-5 pb-28 px-4 pt-2">
      {/* Welcome Banner */}
      <section className="bg-gradient-to-br from-[#1a1c1d] via-slate-900 to-[#6C2BD9]/80 text-white rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-heading font-bold uppercase tracking-wider text-purple-200 border border-white/10 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Organiser Command Center</span>
            </span>

            <span className="text-xs text-purple-200/80 font-medium">
              Snaptix Live Events LLC
            </span>
          </div>

          <div>
            <h2 className="font-heading text-2xl font-bold">
              Organiser Overview
            </h2>
            <p className="text-xs text-slate-300 max-w-sm mt-0.5">
              Manage ticket tiers, track real-time venue check-ins, run promotional campaigns, and manage instant bank payouts.
            </p>
          </div>

          {/* Fast Action Buttons Bar */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenCreateWizard}
              className="px-4 py-2.5 bg-[#6C2BD9] hover:bg-purple-600 text-white font-heading font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Event</span>
            </button>

            <button
              onClick={onOpenQRScanner}
              className="px-4 py-2.5 bg-white text-[#1a1c1d] hover:bg-slate-100 font-heading font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <QrCode className="w-4 h-4 text-[#6C2BD9]" />
              <span>Gate QR Scanner</span>
            </button>
          </div>
        </div>

        {/* Subtle background glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#6C2BD9]/30 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Approval Queue Alert Banner */}
      {pendingApprovalCount > 0 && (
        <section className="p-4 bg-amber-50 border border-amber-300 rounded-3xl flex items-center justify-between text-xs text-amber-900 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center shrink-0">
              {pendingApprovalCount}
            </div>
            <div>
              <p className="font-bold text-slate-900">
                {pendingApprovalCount} Event{pendingApprovalCount > 1 ? 's' : ''} Pending Admin Approval
              </p>
              <p className="text-[11px] text-amber-800">
                Created by moderators sitting in approval queue before going live on Explore.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('org_events')}
            className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] rounded-xl shrink-0 shadow-xs active:scale-95 transition-all"
          >
            Review Queue →
          </button>
        </section>
      )}

      {/* 4 Core Financial & Sales Metric Cards */}
      <section className="grid grid-cols-2 gap-3">
        {/* Gross Revenue */}
        <div className="p-4 bg-white rounded-3xl border border-[#ccc3d7]/40 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#7b7486]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Gross Sales</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="font-heading font-bold text-xl text-[#1a1c1d]">
            ${totalGrossRevenue.toLocaleString()}
          </p>
          <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +18.4% this month
          </p>
        </div>

        {/* Tickets Sold */}
        <div className="p-4 bg-white rounded-3xl border border-[#ccc3d7]/40 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#7b7486]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Tickets Sold</span>
            <div className="w-7 h-7 rounded-xl bg-purple-50 text-[#6C2BD9] flex items-center justify-center">
              <TicketIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="font-heading font-bold text-xl text-[#1a1c1d]">
            {totalTicketsSold}{' '}
            <span className="text-xs font-normal text-[#7b7486]">/ {totalCapacity}</span>
          </p>
          <div className="w-full h-1.5 bg-[#f3f3f5] rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-[#6C2BD9] rounded-full"
              style={{
                width: `${totalCapacity ? Math.round((totalTicketsSold / totalCapacity) * 100) : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Live Gate Check-ins */}
        <div className="p-4 bg-white rounded-3xl border border-[#ccc3d7]/40 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#7b7486]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Check-in Rate</span>
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="font-heading font-bold text-xl text-[#1a1c1d]">
            {totalCheckedIn}{' '}
            <span className="text-xs font-normal text-[#7b7486]">
              ({totalTicketsSold ? Math.round((totalCheckedIn / totalTicketsSold) * 100) : 0}%)
            </span>
          </p>
          <p className="text-[10px] text-[#7b7486]">
            Live venue entry count
          </p>
        </div>

        {/* Active Events */}
        <div className="p-4 bg-white rounded-3xl border border-[#ccc3d7]/40 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#7b7486]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Live Events</span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="font-heading font-bold text-xl text-[#1a1c1d]">
            {liveEventsCount}{' '}
            <span className="text-xs font-normal text-[#7b7486]">active</span>
          </p>
          <p className="text-[10px] text-purple-600 font-bold">
            {events.length - liveEventsCount} drafts / scheduled
          </p>
        </div>
      </section>

      {/* Quick Navigation Cards */}
      <section className="grid grid-cols-3 gap-2">
        <button
          onClick={() => onNavigateTab('org_events')}
          className="p-3 bg-white rounded-2xl border border-[#ccc3d7]/40 hover:border-[#6C2BD9] text-left shadow-xs transition-all"
        >
          <Layers className="w-5 h-5 text-[#6C2BD9] mb-1.5" />
          <h4 className="font-heading font-bold text-xs text-[#1a1c1d]">Manage Events</h4>
          <p className="text-[10px] text-[#7b7486]">Roster & Tiers</p>
        </button>

        <button
          onClick={() => onNavigateTab('org_promotions')}
          className="p-3 bg-white rounded-2xl border border-[#ccc3d7]/40 hover:border-[#6C2BD9] text-left shadow-xs transition-all"
        >
          <Tag className="w-5 h-5 text-amber-600 mb-1.5" />
          <h4 className="font-heading font-bold text-xs text-[#1a1c1d]">Promotions</h4>
          <p className="text-[10px] text-[#7b7486]">Codes & Ads</p>
        </button>

        <button
          onClick={() => onNavigateTab('org_analytics')}
          className="p-3 bg-white rounded-2xl border border-[#ccc3d7]/40 hover:border-[#6C2BD9] text-left shadow-xs transition-all"
        >
          <BarChart3 className="w-5 h-5 text-blue-600 mb-1.5" />
          <h4 className="font-heading font-bold text-xs text-[#1a1c1d]">Analytics</h4>
          <p className="text-[10px] text-[#7b7486]">Sales charts</p>
        </button>
      </section>

      {/* Managed Events List */}
      <section className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-heading font-bold text-sm text-[#1a1c1d]">
            Your Events ({events.length})
          </span>
          <button
            onClick={() => onNavigateTab('org_events')}
            className="text-[#6C2BD9] font-bold flex items-center gap-0.5 hover:underline"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {safeEvents.map((evt) => (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-4 border border-[#ccc3d7]/40 shadow-xs hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={evt.image}
                    alt={evt.title}
                    className="w-14 h-14 rounded-2xl object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <span
                      className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full inline-block ${
                        evt.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700'
                          : evt.status === 'live'
                          ? 'bg-purple-50 text-[#6C2BD9]'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {evt.status === 'published' ? 'Live Sales' : evt.status}
                    </span>
                    <h3 className="font-heading font-bold text-sm text-[#1a1c1d] truncate mt-0.5">
                      {evt.title}
                    </h3>
                    <p className="text-[11px] text-[#7b7486] truncate">
                      {evt.date} • {evt.venue}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="font-mono text-sm font-bold text-[#6C2BD9] block">
                    ${evt.grossSales.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-[#7b7486]">Gross Sales</span>
                </div>
              </div>

              {/* Progress: Capacity Sold */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-[#7b7486]">
                  <span>Tickets Sold</span>
                  <span className="font-bold text-[#1a1c1d]">
                    {evt.ticketsSold} / {evt.totalCapacity} ({Math.round((evt.ticketsSold / (evt.totalCapacity || 1)) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-[#f3f3f5] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#6C2BD9] rounded-full"
                    style={{
                      width: `${Math.min(100, Math.round((evt.ticketsSold / (evt.totalCapacity || 1)) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons for this Event */}
              <div className="flex items-center justify-between pt-1 border-t border-[#edeef0]">
                <div className="text-[11px] text-[#7b7486]">
                  Check-ins: <span className="font-bold text-[#1a1c1d]">{evt.checkedInCount} verified</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onSelectEventManage(evt.id);
                      onNavigateTab('org_events');
                    }}
                    className="px-3 py-1.5 bg-[#f3f3f5] hover:bg-[#edeef0] text-[#1a1c1d] font-bold text-[11px] rounded-xl flex items-center gap-1"
                  >
                    <span>Manage Event</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recent Sales Activity Stream */}
      <section className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-heading font-bold text-sm text-[#1a1c1d]">
            Recent Ticket Sales & Royalties
          </span>
          <button
            onClick={() => onNavigateTab('org_sales_account')}
            className="text-[#6C2BD9] font-bold flex items-center gap-0.5 hover:underline"
          >
            <span>Payout Ledger</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-[#ccc3d7]/40 shadow-xs divide-y divide-[#edeef0]">
          {safeTransactions.slice(0, 4).map((tx) => (
            <div key={tx.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    tx.type === 'ticket_sale'
                      ? 'bg-emerald-50 text-emerald-600'
                      : tx.type === 'resale_royalty'
                      ? 'bg-purple-50 text-[#6C2BD9]'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {tx.type === 'ticket_sale' ? (
                    <TicketIcon className="w-4 h-4" />
                  ) : tx.type === 'resale_royalty' ? (
                    <Tag className="w-4 h-4" />
                  ) : (
                    <CreditCard className="w-4 h-4" />
                  )}
                </div>

                <div>
                  <h5 className="font-bold text-[#1a1c1d] leading-tight">
                    {tx.type === 'ticket_sale'
                      ? 'Ticket Sale'
                      : tx.type === 'resale_royalty'
                      ? 'Resale Royalty (5%)'
                      : 'Bank Payout'}
                  </h5>
                  <p className="text-[10px] text-[#7b7486] truncate max-w-[180px]">
                    {tx.description}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`font-mono font-bold text-xs block ${
                    tx.amount > 0 ? 'text-emerald-600' : 'text-slate-800'
                  }`}
                >
                  {tx.amount > 0 ? `+$${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                </span>
                <span className="text-[9px] text-[#7b7486]">{tx.date}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};
