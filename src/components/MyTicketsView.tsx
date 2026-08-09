import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  QrCode,
  History,
  Ticket as TicketIcon,
  Search,
  Plus,
  Tag,
  MessageSquare,
} from 'lucide-react';
import { Ticket } from '../types';
import { TicketPassModal } from './TicketPassModal';
import { motion } from 'motion/react';

interface MyTicketsViewProps {
  tickets: Ticket[];
  onBrowseEvents: () => void;
  onListForResale?: (ticket: Ticket) => void;
  onOpenChatWithHost?: (ticket: Ticket) => void;
}

export const MyTicketsView: React.FC<MyTicketsViewProps> = ({
  tickets,
  onBrowseEvents,
  onListForResale,
  onOpenChatWithHost,
}) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isPassModalOpen, setIsPassModalOpen] = useState<boolean>(false);

  const upcomingTickets = tickets.filter((t) => t.status === 'upcoming');
  const pastTickets = tickets.filter((t) => t.status === 'past');

  const displayedTickets =
    activeTab === 'upcoming' ? upcomingTickets : pastTickets;

  const handleOpenTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsPassModalOpen(true);
  };

  return (
    <main id="my-tickets-view" className="space-y-5 pb-28 px-4 pt-2">
      {/* Header Info */}
      <section className="space-y-1">
        <h2 className="font-heading text-2xl font-bold text-[#1a1c1d]">
          My Tickets
        </h2>
        <p className="text-xs text-[#7b7486]">
          Manage your upcoming and past event experiences, or resell tickets safely.
        </p>
      </section>

      {/* Tab Switcher */}
      <section className="relative flex bg-[#edeef0] rounded-2xl p-1 shadow-inner">
        <button
          id="tab-upcoming-tickets"
          onClick={() => setActiveTab('upcoming')}
          className={`relative z-10 flex-1 py-2.5 text-xs font-heading font-bold rounded-xl transition-all duration-200 ${
            activeTab === 'upcoming'
              ? 'bg-white text-[#6C2BD9] shadow-sm'
              : 'text-[#7b7486] hover:text-[#1a1c1d]'
          }`}
        >
          UPCOMING ({upcomingTickets.length})
        </button>

        <button
          id="tab-past-tickets"
          onClick={() => setActiveTab('past')}
          className={`relative z-10 flex-1 py-2.5 text-xs font-heading font-bold rounded-xl transition-all duration-200 ${
            activeTab === 'past'
              ? 'bg-white text-[#6C2BD9] shadow-sm'
              : 'text-[#7b7486] hover:text-[#1a1c1d]'
          }`}
        >
          PAST ({pastTickets.length})
        </button>
      </section>

      {/* Tickets List */}
      <section className="space-y-4">
        {displayedTickets.length === 0 ? (
          <div
            id="tickets-empty-state"
            className="py-14 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-dashed border-[#ccc3d7] p-6 space-y-3"
          >
            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center text-[#6C2BD9]">
              <TicketIcon className="w-8 h-8 -rotate-12" />
            </div>
            <h3 className="font-heading font-bold text-lg text-[#1a1c1d]">
              No {activeTab} tickets found
            </h3>
            <p className="text-xs text-[#7b7486] max-w-xs leading-relaxed">
              {activeTab === 'upcoming'
                ? "Looks like you haven't booked any upcoming events yet. Let's find something exciting!"
                : 'No past ticket records found in your account.'}
            </p>
            {activeTab === 'upcoming' && (
              <button
                onClick={onBrowseEvents}
                className="mt-2 px-6 py-2.5 bg-[#6C2BD9] text-white rounded-xl text-xs font-heading font-bold shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
              >
                BROWSE EVENTS
              </button>
            )}
          </div>
        ) : (
          displayedTickets.map((tkt) => {
            const isUpcoming = tkt.status === 'upcoming';

            return (
              <motion.article
                key={tkt.id}
                id={`ticket-card-${tkt.id}`}
                whileTap={{ scale: 0.99 }}
                className="relative bg-white rounded-3xl shadow-sm border border-[#ccc3d7]/40 overflow-hidden group hover:shadow-md transition-all"
              >
                {/* Event Photo Header with Live Badge */}
                <div className="relative h-36 w-full overflow-hidden">
                  <img
                    src={tkt.eventImage}
                    alt={tkt.eventTitle}
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                      !isUpcoming ? 'grayscale opacity-60' : ''
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                  <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end text-white">
                    <div>
                      <span
                        className={`px-2.5 py-0.5 font-bold text-[10px] uppercase tracking-wider rounded-full inline-block mb-1 ${
                          isUpcoming
                            ? 'bg-amber-400 text-slate-950 shadow-sm'
                            : 'bg-slate-700 text-slate-200'
                        }`}
                      >
                        {tkt.statusLabel}
                      </span>
                      <h3 className="font-heading font-bold text-lg leading-tight text-white truncate max-w-[220px]">
                        {tkt.eventTitle}
                      </h3>
                    </div>

                    {/* Date Badge Box */}
                    <div className="bg-white/20 backdrop-blur-md border border-white/20 rounded-xl px-2.5 py-1 text-center text-white">
                      <span className="block text-base font-bold leading-tight">
                        {tkt.dayNumber}
                      </span>
                      <span className="block text-[10px] uppercase font-bold text-white/80">
                        {tkt.monthShort}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[#6C2BD9]">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[#7b7486] uppercase tracking-wider block">
                          Date & Time
                        </span>
                        <p className="font-heading font-bold text-xs text-[#1a1c1d]">
                          {tkt.time}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[#6C2BD9]">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <span className="text-[10px] font-bold text-[#7b7486] uppercase tracking-wider block">
                          Venue
                        </span>
                        <p className="font-heading font-bold text-xs text-[#1a1c1d] truncate">
                          {tkt.venue}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Perforated Divider */}
                <div className="relative py-0.5">
                  <div className="ticket-notch-l" />
                  <div className="ticket-divider-dashed mx-5" />
                  <div className="ticket-notch-r" />
                </div>

                {/* Footer Section with Ticket ID & View CTA + Resale CTA */}
                <div className="p-4 flex items-center justify-between gap-2 bg-[#faf8ff] flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white border border-[#ccc3d7]/50 flex items-center justify-center text-[#1a1c1d] shadow-xs">
                      {isUpcoming ? (
                        <QrCode className="w-5 h-5 text-[#6C2BD9]" />
                      ) : (
                        <History className="w-5 h-5 text-[#7b7486]" />
                      )}
                    </div>
                    <div>
                      <p className="font-mono text-xs font-bold text-[#4a4455]">
                        {tkt.bookingId}
                      </p>
                      <p className="text-[10px] text-[#7b7486]">
                        {tkt.tierName} • {tkt.seat}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {onOpenChatWithHost && (
                      <button
                        onClick={() => onOpenChatWithHost(tkt)}
                        className="px-3 py-2 bg-white hover:bg-purple-50 text-[#6C2BD9] border border-purple-200 rounded-xl font-heading font-bold text-[11px] shadow-xs flex items-center gap-1 active:scale-95 transition-all"
                        title="Direct chat with event organizer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat Host</span>
                      </button>
                    )}

                    {isUpcoming && onListForResale && (
                      <button
                        onClick={() => onListForResale(tkt)}
                        className="px-3 py-2 bg-white hover:bg-purple-50 text-[#6C2BD9] border border-purple-200 rounded-xl font-heading font-bold text-[11px] shadow-xs flex items-center gap-1 active:scale-95 transition-all"
                      >
                        <Tag className="w-3.5 h-3.5" />
                        <span>Resell</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenTicket(tkt)}
                      className="px-4 py-2 bg-[#6C2BD9] hover:bg-purple-700 text-white rounded-xl font-heading font-bold text-xs shadow-md shadow-purple-600/20 active:scale-95 transition-all"
                    >
                      VIEW PASS
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })
        )}
      </section>

      {/* Ticket Pass Modal */}
      <TicketPassModal
        ticket={selectedTicket}
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        onOpenChat={onOpenChatWithHost ? () => {
          if (selectedTicket) {
            setIsPassModalOpen(false);
            onOpenChatWithHost(selectedTicket);
          }
        } : undefined}
      />
    </main>
  );
};

