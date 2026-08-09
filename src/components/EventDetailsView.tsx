import React, { useState } from 'react';
import {
  ArrowLeft,
  Heart,
  Share2,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Star,
  ChevronRight,
  Navigation,
  ArrowRight,
  Sparkles,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { EventItem } from '../types';
import { motion } from 'motion/react';

interface EventDetailsViewProps {
  event: EventItem;
  allEvents: EventItem[];
  onBack: () => void;
  onBookTickets: (event: EventItem) => void;
  onToggleSave: (eventId: string) => void;
  onSelectSimilarEvent: (event: EventItem) => void;
  onOpenChat?: (event: EventItem) => void;
}

export const EventDetailsView: React.FC<EventDetailsViewProps> = ({
  event,
  allEvents,
  onBack,
  onBookTickets,
  onToggleSave,
  onSelectSimilarEvent,
  onOpenChat,
}) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState<boolean>(false);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showDirections, setShowDirections] = useState<boolean>(false);

  const similarEvents = allEvents.filter((e) => e.id !== event.id).slice(0, 3);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Check out ${event.title} on Snaptix!`,
          url: window.location.href,
        });
        return;
      } catch {
        // Fall back to clipboard
      }
    }
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div id="event-details-view" className="min-h-screen bg-[#f9f9fb] pb-36">
      {/* Floating Glassmorphic Header */}
      <header
        id="event-details-header"
        className="fixed top-0 left-0 w-full z-50 px-4 pt-4 pb-3 flex items-center justify-between pointer-events-none"
      >
        <button
          onClick={onBack}
          aria-label="Go back"
          className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center pointer-events-auto hover:bg-black/60 active:scale-90 transition-all shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => onToggleSave(event.id)}
            aria-label="Save event"
            className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/60 active:scale-90 transition-all shadow-lg"
          >
            <Heart
              className={`w-5 h-5 ${
                event.isSaved ? 'fill-red-500 text-red-500' : 'text-white'
              }`}
            />
          </button>
          <button
            onClick={handleShare}
            aria-label="Share event"
            className="relative w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/60 active:scale-90 transition-all shadow-lg"
          >
            <Share2 className="w-5 h-5" />
            {copiedLink && (
              <span className="absolute -bottom-8 right-0 bg-black text-white text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
                Link copied!
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero Visual Section */}
      <section className="relative w-full h-[440px] overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20" />

        <div className="absolute bottom-10 left-4 right-4 text-white space-y-2 z-10">
          {event.badge && (
            <span className="px-3 py-1 bg-amber-400 text-slate-950 font-heading font-bold text-xs uppercase tracking-wider rounded-full inline-block shadow-md">
              {event.badge}
            </span>
          )}

          <h1 className="font-heading text-3xl md:text-4xl font-extrabold leading-tight text-white drop-shadow-md">
            {event.title}
          </h1>

          <div className="flex items-center gap-2 text-white/90 text-sm font-medium">
            <Calendar className="w-4 h-4 text-purple-300" />
            <span>{event.date} • {event.time.split(' - ')[0]}</span>
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <main className="max-w-2xl mx-auto px-4 -mt-6 relative z-20 space-y-6">
        {/* Event Meta Box */}
        <section
          id="event-meta-card"
          className="bg-white rounded-3xl p-5 shadow-xl border border-[#ccc3d7]/30 space-y-4"
        >
          {/* Date & Time Row */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 flex flex-col items-center justify-center text-[#6C2BD9] shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                {event.monthShort || 'DATE'}
              </span>
              <span className="font-heading text-2xl font-bold leading-none">
                {event.dayNumber || '15'}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-heading font-bold text-base text-[#1a1c1d]">
                {event.date}
              </p>
              <p className="text-xs text-[#7b7486] flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-[#6C2BD9]" />
                <span>{event.time} {event.doorsOpen ? `(Doors open at ${event.doorsOpen})` : ''}</span>
              </p>
            </div>
          </div>

          <div className="border-t border-[#edeef0]" />

          {/* Venue & Location Row */}
          <div
            onClick={() => setShowDirections(!showDirections)}
            className="flex items-center justify-between gap-4 cursor-pointer group"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="w-14 h-14 rounded-2xl bg-[#f3f3f5] flex items-center justify-center text-[#4a4455] group-hover:bg-purple-50 group-hover:text-[#6C2BD9] transition-colors">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-bold text-base text-[#1a1c1d] truncate group-hover:text-[#6C2BD9] transition-colors">
                  {event.venue}
                </p>
                <p className="text-xs text-[#7b7486] truncate mt-0.5">
                  {event.city} • {event.distance || '2.4 miles away'}
                </p>
              </div>
            </div>
            <button className="text-xs font-bold text-[#6C2BD9] group-hover:translate-x-1 transition-transform flex items-center gap-1">
              <span>Directions</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* About this Event */}
        <section id="event-about-section" className="space-y-2">
          <h2 className="font-heading text-xl font-bold text-[#1a1c1d]">
            About this event
          </h2>
          <div className="bg-white rounded-3xl p-5 border border-[#ccc3d7]/30 shadow-xs space-y-3">
            <p
              className={`text-sm text-[#4a4455] leading-relaxed transition-all ${
                isDescriptionExpanded ? '' : 'line-clamp-3'
              }`}
            >
              {event.description}
            </p>
            <button
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="text-xs font-bold text-[#6C2BD9] flex items-center gap-1 hover:underline"
            >
              <span>{isDescriptionExpanded ? 'Read less' : 'Read full description'}</span>
              <ChevronRight
                className={`w-3.5 h-3.5 transition-transform ${
                  isDescriptionExpanded ? '-rotate-90' : 'rotate-90'
                }`}
              />
            </button>

            {/* Highlights Chips */}
            <div className="pt-3 border-t border-[#edeef0] flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-50 text-[#6C2BD9] text-xs font-bold rounded-full inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Live Visuals
              </span>
              <span className="px-3 py-1 bg-purple-50 text-[#6C2BD9] text-xs font-bold rounded-full inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified Entry
              </span>
              <span className="px-3 py-1 bg-purple-50 text-[#6C2BD9] text-xs font-bold rounded-full inline-flex items-center gap-1">
                <Users className="w-3 h-3" /> 18+ ID Required
              </span>
            </div>
          </div>
        </section>

        {/* Organizer Card */}
        <section id="event-organizer-section" className="space-y-2">
          <h2 className="font-heading text-xl font-bold text-[#1a1c1d]">
            Organized by
          </h2>
          <div className="bg-white rounded-3xl p-4 border border-[#ccc3d7]/30 shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative">
                <img
                  src={event.organizer.avatar}
                  alt={event.organizer.name}
                  className="w-13 h-13 rounded-full object-cover ring-2 ring-purple-100"
                />
                {event.organizer.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 ring-2 ring-white">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-heading font-bold text-base text-[#1a1c1d] truncate">
                  {event.organizer.name}
                </p>
                <div className="flex items-center gap-1 text-xs text-[#7b7486] mt-0.5">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="font-bold text-[#1a1c1d]">{event.organizer.rating}</span>
                  <span>({event.organizer.reviewsCount.toLocaleString()} Reviews)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onOpenChat && (
                <button
                  onClick={() => onOpenChat(event)}
                  className="px-4 py-2 rounded-full text-xs font-bold bg-purple-50 text-[#6C2BD9] border border-purple-200 hover:bg-purple-100 transition-all active:scale-95 shadow-xs"
                >
                  Ask Host
                </button>
              )}
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all active:scale-95 shadow-xs ${
                  isFollowing
                    ? 'bg-[#edeef0] text-[#4a4455]'
                    : 'bg-[#6C2BD9] text-white hover:bg-purple-700'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          </div>
        </section>

        {/* Location Map Preview */}
        <section id="event-location-preview-section" className="space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="font-heading text-xl font-bold text-[#1a1c1d]">
              Location & Map
            </h2>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                event.locationCoords.address || event.venue
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-[#6C2BD9] hover:underline flex items-center gap-1"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Open in Google Maps</span>
            </a>
          </div>

          <div className="relative h-48 rounded-3xl overflow-hidden border border-[#ccc3d7]/30 shadow-xs bg-slate-100 group">
            {/* Interactive stylised map canvas visual */}
            <div className="absolute inset-0 bg-[radial-gradient(#6c2bd9_1px,transparent_1px)] [background-size:16px_16px] bg-slate-50 opacity-80" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10">
              <div className="w-12 h-12 rounded-full bg-[#6C2BD9] text-white flex items-center justify-center shadow-2xl ring-8 ring-purple-500/20 animate-bounce">
                <MapPin className="w-6 h-6" />
              </div>
              <p className="font-heading font-bold text-sm text-[#1a1c1d] mt-2">
                {event.venue}
              </p>
              <p className="text-xs text-[#7b7486] max-w-xs">
                {event.locationCoords.address}
              </p>
            </div>
          </div>
        </section>

        {/* Available Ticket Tiers Summary */}
        <section id="event-tiers-section" className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-[#1a1c1d]">
            Ticket Packages
          </h2>
          <div className="space-y-2.5">
            {event.tiers.map((tier) => (
              <div
                key={tier.id}
                className="bg-white rounded-2xl p-4 border border-[#ccc3d7]/30 shadow-xs flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-sm text-[#1a1c1d]">
                      {tier.name}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">
                      {tier.available} left
                    </span>
                  </div>
                  <p className="text-xs text-[#7b7486] line-clamp-1">{tier.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-heading font-bold text-lg text-[#6C2BD9]">
                    {tier.price === 0 ? 'Free' : `$${tier.price}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Similar Events */}
        {similarEvents.length > 0 && (
          <section id="similar-events-section" className="space-y-3 pt-2">
            <h2 className="font-heading text-xl font-bold text-[#1a1c1d]">
              Similar Events
            </h2>
            <div className="flex overflow-x-auto hide-scrollbar gap-3 snap-x pb-2">
              {similarEvents.map((sim) => (
                <div
                  key={sim.id}
                  onClick={() => onSelectSimilarEvent(sim)}
                  className="min-w-[260px] bg-white rounded-2xl border border-[#ccc3d7]/30 overflow-hidden shadow-xs cursor-pointer group snap-center"
                >
                  <div className="relative h-32 w-full overflow-hidden">
                    <img
                      src={sim.image}
                      alt={sim.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md text-white font-bold text-[10px] rounded-md">
                      {sim.category}
                    </span>
                  </div>
                  <div className="p-3 space-y-1">
                    <h4 className="font-heading font-bold text-sm text-[#1a1c1d] truncate group-hover:text-[#6C2BD9] transition-colors">
                      {sim.title}
                    </h4>
                    <p className="text-[11px] text-[#7b7486] truncate">
                      {sim.date} • {sim.venue}
                    </p>
                    <p className="font-heading font-bold text-xs text-[#6C2BD9] pt-1">
                      {sim.price === 0 ? 'Free' : `$${sim.price.toFixed(2)}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Sticky Bottom Booking Bar */}
      <footer
        id="event-details-bottom-bar"
        className="fixed bottom-0 left-0 w-full z-40 bg-white/95 backdrop-blur-2xl border-t border-[#ccc3d7]/30 px-4 py-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]"
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase font-bold tracking-wider text-[#7b7486] block">
              Ticket Price
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-heading text-2xl font-extrabold text-[#6C2BD9]">
                {event.price === 0 ? 'Free' : `$${event.price.toFixed(2)}`}
              </span>
              <span className="text-xs text-[#7b7486]">/ person</span>
            </div>
          </div>

          <button
            id="book-tickets-action-button"
            onClick={() => onBookTickets(event)}
            className="flex-1 max-w-xs h-14 bg-[#6C2BD9] hover:bg-purple-700 text-white rounded-2xl font-heading font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-purple-600/30 active:scale-95 transition-all"
          >
            <span>{event.price === 0 ? 'Register Now' : 'Book Tickets'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
};
