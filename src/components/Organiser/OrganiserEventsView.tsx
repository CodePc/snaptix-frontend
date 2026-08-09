import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Search,
  Users,
  CheckCircle2,
  XCircle,
  QrCode,
  Edit,
  DollarSign,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Tag,
  AlertCircle,
  UserCheck,
  Zap,
} from 'lucide-react';
import { OrganiserEventData, AttendeeRecord, EventTier, OrganiserPersona } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface OrganiserEventsViewProps {
  events: OrganiserEventData[];
  selectedEventId: string | null;
  currentPersona?: OrganiserPersona;
  onSelectEvent: (id: string | null) => void;
  onOpenCreateWizard: () => void;
  onOpenQRScanner: () => void;
  onCheckInAttendee: (eventId: string, attendeeId: string) => void;
  onUpdateEventStatus: (eventId: string, status: OrganiserEventData['status']) => void;
  onUpdateTierCapacity: (eventId: string, tierId: string, newAvailable: number) => void;
}

export const OrganiserEventsView: React.FC<OrganiserEventsViewProps> = ({
  events,
  selectedEventId,
  currentPersona = 'admin',
  onSelectEvent,
  onOpenCreateWizard,
  onOpenQRScanner,
  onCheckInAttendee,
  onUpdateEventStatus,
  onUpdateTierCapacity,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [attendeeSearch, setAttendeeSearch] = useState<string>('');
  const [activeTabSub, setActiveTabSub] = useState<'attendees' | 'tiers' | 'details'>('attendees');

  const pendingCount = events.filter((e) => e.status === 'pending_approval').length;

  const filteredEvents = events.filter((e) => {
    const matchStatus =
      filterStatus === 'All' ||
      (filterStatus === 'Live' && (e.status === 'published' || e.status === 'live')) ||
      (filterStatus === 'Pending Approval' && e.status === 'pending_approval') ||
      (filterStatus === 'Draft' && e.status === 'draft') ||
      (filterStatus === 'Completed' && e.status === 'completed');
    const matchQuery =
      searchQuery.trim() === '' ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchQuery;
  });

  const selectedEvent = events.find((e) => e.id === selectedEventId) || null;

  return (
    <main id="organiser-events-view" className="space-y-5 pb-28 px-4 pt-2">
      {/* Header Bar */}
      <section className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-[#1a1c1d]">
            Event Management
          </h2>
          <p className="text-xs text-[#7b7486]">
            Manage {events.length} events, attendee rosters, and ticket capacities
          </p>
        </div>

        <button
          onClick={onOpenCreateWizard}
          className="px-4 py-2 bg-[#6C2BD9] hover:bg-purple-700 text-white font-heading font-bold text-xs rounded-xl shadow-md shadow-purple-600/20 flex items-center gap-1.5 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Event</span>
        </button>
      </section>

      {/* Search & Filter Pills */}
      <section className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#7b7486] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events by title or venue..."
            className="w-full h-11 pl-10 pr-4 bg-white rounded-2xl border border-[#ccc3d7]/50 focus:ring-2 focus:ring-[#6C2BD9] outline-none text-xs text-[#1a1c1d] shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar text-xs">
          {['All', 'Live', 'Pending Approval', 'Draft', 'Completed'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                filterStatus === st
                  ? 'bg-[#6C2BD9] text-white shadow-xs'
                  : 'bg-white border border-[#ccc3d7]/40 text-[#4a4455] hover:bg-[#f3f3f5]'
              }`}
            >
              <span>{st}</span>
              {st === 'Pending Approval' && pendingCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Events List */}
      <section className="space-y-4">
        {filteredEvents.map((evt) => {
          const isExpanded = selectedEventId === evt.id;
          const filteredAttendees = evt.attendees.filter(
            (a) =>
              attendeeSearch.trim() === '' ||
              a.name.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
              a.email.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
              a.bookingId.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
              a.ticketCode.toLowerCase().includes(attendeeSearch.toLowerCase())
          );

          return (
            <motion.article
              key={evt.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-3xl border transition-all overflow-hidden ${
                isExpanded
                  ? 'border-[#6C2BD9] shadow-lg ring-1 ring-[#6C2BD9]/20'
                  : 'border-[#ccc3d7]/40 shadow-xs hover:shadow-md'
              }`}
            >
              {/* Event Card Header */}
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={evt.image}
                      alt={evt.title}
                      className="w-16 h-16 rounded-2xl object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full ${
                            evt.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : evt.status === 'live'
                              ? 'bg-purple-50 text-[#6C2BD9] border border-purple-200'
                              : evt.status === 'pending_approval'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {evt.status === 'pending_approval' ? '⏳ Pending Approval' : evt.status}
                        </span>

                        {evt.isFree && (
                          <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-full bg-emerald-100 text-emerald-800">
                            FREE RSVP
                          </span>
                        )}

                        {evt.createdByPersona && (
                          <span className="text-[9px] text-[#7b7486] font-mono uppercase bg-[#f3f3f5] px-1.5 py-0.5 rounded">
                            By {evt.createdByPersona}
                          </span>
                        )}
                      </div>

                      <h3 className="font-heading font-bold text-sm text-[#1a1c1d] truncate mt-0.5">
                        {evt.title}
                      </h3>
                      <p className="text-[11px] text-[#7b7486] truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#6C2BD9]" />
                        {evt.venue}, {evt.city}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="font-mono text-sm font-bold text-[#6C2BD9] block">
                      ${evt.grossSales.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[#7b7486]">
                      {evt.ticketsSold} / {evt.totalCapacity} Sold
                    </span>
                  </div>
                </div>

                {/* Progress Bar & Quick Stats */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-[#7b7486]">
                    <span>
                      Sales:{' '}
                      <span className="font-bold text-[#1a1c1d]">
                        {Math.round((evt.ticketsSold / (evt.totalCapacity || 1)) * 100)}%
                      </span>
                    </span>
                    <span>
                      Check-in:{' '}
                      <span className="font-bold text-emerald-600">
                        {evt.checkedInCount} verified
                      </span>
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

                {/* Card Action Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-[#edeef0] text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenQRScanner()}
                      className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#6C2BD9] font-bold text-[11px] rounded-xl flex items-center gap-1"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Scanner</span>
                    </button>

                    {evt.status === 'pending_approval' ? (
                      currentPersona === 'admin' ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onUpdateEventStatus(evt.id, 'published')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-xl shadow-xs"
                          >
                            ✓ Approve & Publish
                          </button>
                          <button
                            onClick={() => onUpdateEventStatus(evt.id, 'rejected')}
                            className="px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[11px] rounded-xl"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-xl">
                          ⏳ Awaiting Admin Review
                        </span>
                      )
                    ) : evt.status === 'draft' ? (
                      currentPersona === 'admin' ? (
                        <button
                          onClick={() => onUpdateEventStatus(evt.id, 'published')}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold text-[11px] rounded-xl hover:bg-emerald-100"
                        >
                          Publish Live
                        </button>
                      ) : (
                        <button
                          onClick={() => onUpdateEventStatus(evt.id, 'pending_approval')}
                          className="px-3 py-1.5 bg-amber-50 text-amber-800 font-bold text-[11px] rounded-xl hover:bg-amber-100"
                        >
                          Submit for Review
                        </button>
                      )
                    ) : evt.status === 'rejected' ? (
                      currentPersona === 'admin' ? (
                        <button
                          onClick={() => onUpdateEventStatus(evt.id, 'published')}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold text-[11px] rounded-xl hover:bg-emerald-100"
                        >
                          Reactivate & Publish
                        </button>
                      ) : (
                        <button
                          onClick={() => onUpdateEventStatus(evt.id, 'pending_approval')}
                          className="px-3 py-1.5 bg-amber-50 text-amber-800 font-bold text-[11px] rounded-xl hover:bg-amber-100"
                        >
                          Resubmit for Review
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => {
                          if (currentPersona === 'moderator' && evt.status !== 'published' && evt.status !== 'live') {
                            onUpdateEventStatus(evt.id, 'pending_approval');
                          } else {
                            onUpdateEventStatus(
                              evt.id,
                              evt.status === 'published' || evt.status === 'live' ? 'completed' : 'published'
                            );
                          }
                        }}
                        className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold text-[11px] rounded-xl hover:bg-slate-200"
                      >
                        {evt.status === 'published' || evt.status === 'live'
                          ? 'End Event'
                          : currentPersona === 'admin'
                          ? 'Reactivate'
                          : 'Resubmit for Review'}
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => onSelectEvent(isExpanded ? null : evt.id)}
                    className="px-3.5 py-1.5 bg-[#f3f3f5] text-[#1a1c1d] font-bold text-[11px] rounded-xl flex items-center gap-1 hover:bg-[#edeef0]"
                  >
                    <span>{isExpanded ? 'Collapse' : 'Manage'}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Event Management Drawer */}
              {isExpanded && (
                <div className="bg-[#faf8ff] border-t border-[#edeef0] p-4 space-y-4">
                  {/* Drawer Sub-navigation */}
                  <div className="flex items-center gap-2 border-b border-[#edeef0] pb-2 text-xs font-bold">
                    <button
                      onClick={() => setActiveTabSub('attendees')}
                      className={`px-3 py-1 rounded-xl transition-all ${
                        activeTabSub === 'attendees'
                          ? 'bg-[#6C2BD9] text-white shadow-xs'
                          : 'text-[#7b7486] hover:text-[#1a1c1d]'
                      }`}
                    >
                      Attendee Roster ({evt.attendees.length})
                    </button>
                    <button
                      onClick={() => setActiveTabSub('tiers')}
                      className={`px-3 py-1 rounded-xl transition-all ${
                        activeTabSub === 'tiers'
                          ? 'bg-[#6C2BD9] text-white shadow-xs'
                          : 'text-[#7b7486] hover:text-[#1a1c1d]'
                      }`}
                    >
                      Ticket Tiers ({evt.tiers.length})
                    </button>
                    <button
                      onClick={() => setActiveTabSub('details')}
                      className={`px-3 py-1 rounded-xl transition-all ${
                        activeTabSub === 'details'
                          ? 'bg-[#6C2BD9] text-white shadow-xs'
                          : 'text-[#7b7486] hover:text-[#1a1c1d]'
                      }`}
                    >
                      Schedule & Info
                    </button>
                  </div>

                  {/* Sub-tab 1: Attendee Roster & Manual Check-in */}
                  {activeTabSub === 'attendees' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="relative flex-1">
                          <Search className="w-3.5 h-3.5 text-[#7b7486] absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={attendeeSearch}
                            onChange={(e) => setAttendeeSearch(e.target.value)}
                            placeholder="Filter attendee by name, email, or code..."
                            className="w-full h-9 pl-9 pr-3 bg-white rounded-xl border border-[#ccc3d7]/50 text-xs outline-none"
                          />
                        </div>
                      </div>

                      {filteredAttendees.length === 0 ? (
                        <div className="p-6 text-center bg-white rounded-2xl border border-dashed border-[#ccc3d7] text-xs text-[#7b7486]">
                          {evt.attendees.length === 0
                            ? 'No ticket purchases recorded for this event yet.'
                            : 'No matching attendees found for your search.'}
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto hide-scrollbar">
                          {filteredAttendees.map((att) => (
                            <div
                              key={att.id}
                              className="p-3 bg-white rounded-2xl border border-[#edeef0] flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                  src={
                                    att.avatar ||
                                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop'
                                  }
                                  alt={att.name}
                                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-heading font-bold text-[#1a1c1d] truncate">
                                      {att.name}
                                    </span>
                                    <span className="text-[9px] px-1.5 py-0.5 bg-purple-50 text-[#6C2BD9] font-bold rounded">
                                      {att.tierName}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-[#7b7486] truncate">
                                    {att.email} • Code: <span className="font-mono">{att.bookingId}</span>
                                  </p>
                                </div>
                              </div>

                              <button
                                onClick={() => onCheckInAttendee(evt.id, att.id)}
                                className={`px-3 py-1.5 rounded-xl font-bold text-[10px] flex items-center gap-1 transition-all ${
                                  att.checkedIn
                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                    : 'bg-[#6C2BD9] text-white hover:bg-purple-700 shadow-xs'
                                }`}
                              >
                                {att.checkedIn ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Checked In ({att.checkInTime || 'Gate'})</span>
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-3.5 h-3.5" />
                                    <span>Check In</span>
                                  </>
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sub-tab 2: Tier & Capacity Editor */}
                  {activeTabSub === 'tiers' && (
                    <div className="space-y-3">
                      {evt.tiers.map((tier) => (
                        <div
                          key={tier.id}
                          className="p-3.5 bg-white rounded-2xl border border-[#edeef0] flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-heading font-bold text-[#1a1c1d]">
                                {tier.name}
                              </h5>
                              <span className="font-mono font-bold text-[#6C2BD9]">
                                ${tier.price}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#7b7486]">
                              {tier.perks.join(' • ')}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-[#7b7486]">Capacity:</span>
                            <input
                              type="number"
                              min="1"
                              value={tier.available}
                              onChange={(e) =>
                                onUpdateTierCapacity(evt.id, tier.id, Number(e.target.value))
                              }
                              className="w-20 h-8 px-2 bg-[#f9f9fb] border border-[#ccc3d7]/50 rounded-lg text-center font-mono font-bold text-xs"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Sub-tab 3: Schedule & Info */}
                  {activeTabSub === 'details' && (
                    <div className="bg-white rounded-2xl p-4 border border-[#edeef0] space-y-2 text-xs">
                      <p>
                        <span className="font-bold text-[#7b7486]">Date & Time:</span>{' '}
                        {evt.date} • {evt.time}
                      </p>
                      <p>
                        <span className="font-bold text-[#7b7486]">Doors Open:</span>{' '}
                        {evt.doorsOpen || '1 hour before show'}
                      </p>
                      <p>
                        <span className="font-bold text-[#7b7486]">Venue Address:</span>{' '}
                        {evt.locationCoords.address}
                      </p>
                      <p className="text-[11px] text-[#4a4455] pt-1 leading-relaxed">
                        {evt.description}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.article>
          );
        })}
      </section>
    </main>
  );
};
