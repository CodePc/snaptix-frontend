import React, { useState } from 'react';
import {
  Search,
  Zap,
  Music,
  Cpu,
  Trophy,
  Palette,
  UtensilsCrossed,
  Sparkles,
  Calendar,
  MapPin,
  ArrowRight,
  Plus,
  SlidersHorizontal,
  Clock,
  Navigation,
  Heart,
  ShieldCheck,
  QrCode,
  Flame,
  Volume2,
  VolumeX,
  Users,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { EventItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ExploreViewProps {
  events: EventItem[];
  onSelectEvent: (event: EventItem) => void;
  onBookDirect: (event: EventItem) => void;
  onToggleSave: (eventId: string) => void;
  onOpenCreateEvent: () => void;
  onOpenSearch: () => void;
}

type QuickFilter = 'all' | 'trending' | 'this_weekend' | 'under_50' | 'vip' | 'selling_fast';

export const ExploreView: React.FC<ExploreViewProps> = ({
  events,
  onSelectEvent,
  onBookDirect,
  onToggleSave,
  onOpenCreateEvent,
  onOpenSearch,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeFilter, setActiveFilter] = useState<QuickFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [distanceRadius, setDistanceRadius] = useState<number>(15);
  const [showLocationPicker, setShowLocationPicker] = useState<boolean>(false);
  const [currentCity, setCurrentCity] = useState<string>('New York, NY');
  const [isAudioPreviewPlaying, setIsAudioPreviewPlaying] = useState<boolean>(false);

  const categories = [
    { id: 'All', label: 'All', icon: Zap },
    { id: 'Music', label: 'Concerts & Raves', icon: Music },
    { id: 'Tech', label: 'Tech & Summits', icon: Cpu },
    { id: 'Sports', label: 'Sports & Esports', icon: Trophy },
    { id: 'Food', label: 'Food & Wine', icon: UtensilsCrossed },
    { id: 'Arts', label: 'Arts & Comedy', icon: Palette },
    { id: 'Workshops', label: 'Masterclasses', icon: Sparkles },
  ];

  const quickFilterPills: { id: QuickFilter; label: string; icon?: React.ElementType }[] = [
    { id: 'all', label: '⚡ All Events' },
    { id: 'trending', label: '🔥 Trending Now' },
    { id: 'selling_fast', label: '⏳ Selling Fast (<15 left)' },
    { id: 'this_weekend', label: '📅 This Weekend' },
    { id: 'under_50', label: '🎟️ Under $50 / Free' },
    { id: 'vip', label: '✨ VIP & Backstage' },
  ];

  // Filter events by category, search query, city, and quick filter tab
  const filteredEvents = events.filter((e) => {
    const matchCategory =
      selectedCategory === 'All' || e.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchQuery =
      searchQuery.trim() === '' ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.tagline && e.tagline.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchQuickFilter = true;
    if (activeFilter === 'trending') {
      matchQuickFilter = !!e.isTrending;
    } else if (activeFilter === 'under_50') {
      matchQuickFilter = e.price <= 50 || !!e.isFree;
    } else if (activeFilter === 'selling_fast') {
      matchQuickFilter = e.badge?.toLowerCase().includes('sold') || e.badge?.toLowerCase().includes('last') || e.price > 80;
    } else if (activeFilter === 'vip') {
      matchQuickFilter = e.tiers.some((t) => t.name.toLowerCase().includes('vip') || t.price > 100);
    } else if (activeFilter === 'this_weekend') {
      matchQuickFilter = e.date.toLowerCase().includes('sat') || e.date.toLowerCase().includes('sun') || e.date.toLowerCase().includes('today') || e.date.toLowerCase().includes('tomorrow');
    }

    return matchCategory && matchQuery && matchQuickFilter;
  });

  const trendingEvents = events.filter((e) => e.isTrending);
  const secretEvents = events.filter((e) => e.price <= 45 || e.category === 'Food' || e.title.includes('Jazz'));
  const techEvents = events.filter((e) => e.category === 'Tech' || e.category === 'Workshops');

  // Spotlight featured event (top of page)
  const spotlightEvent = events.find((e) => e.id === 'event-neon-horizons') || events[0];

  return (
    <main id="explore-view-container" className="space-y-6 pb-28">
      {/* 1. Top Search Bar with City Selector & Live Filter */}
      <section className="px-4 pt-2 space-y-3">
        <div className="flex items-center justify-between gap-2">
          {/* City Location Button */}
          <button
            onClick={() => setShowLocationPicker(!showLocationPicker)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#ccc3d7]/50 rounded-full hover:bg-purple-50 transition-all text-xs font-bold text-[#1a1c1d] shadow-xs active:scale-95"
          >
            <MapPin className="w-3.5 h-3.5 text-[#6C2BD9]" />
            <span className="truncate max-w-[130px] sm:max-w-none">{currentCity}</span>
            <span className="text-[10px] text-[#7b7486]">({distanceRadius}mi)</span>
            <SlidersHorizontal className="w-3 h-3 text-[#7b7486] ml-0.5" />
          </button>

          {/* Guarantee pill */}
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Anti-Scalp Escrow</span>
            <span className="sm:hidden">Protected</span>
          </div>
        </div>

        {/* Location Filter Drawer Modal */}
        <AnimatePresence>
          {showLocationPicker && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 bg-white rounded-3xl border border-[#ccc3d7]/50 shadow-lg space-y-3 overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-[#edeef0] pb-2">
                <span className="text-xs font-heading font-bold text-[#1a1c1d]">Select Active City:</span>
                <button
                  onClick={() => setShowLocationPicker(false)}
                  className="text-xs text-[#6C2BD9] font-bold hover:underline"
                >
                  Done
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  'New York, NY',
                  'Los Angeles, CA',
                  'San Francisco, CA',
                  'Chicago, IL',
                  'London, UK',
                  'Tokyo, JP',
                ].map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      setCurrentCity(loc);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      currentCity === loc
                        ? 'bg-[#6C2BD9] text-white shadow-xs'
                        : 'bg-[#f3f3f5] text-[#4a4455] hover:bg-[#edeef0]'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#edeef0]">
                <span className="text-xs font-bold text-[#1a1c1d]">Search Distance Radius:</span>
                <div className="flex gap-1.5">
                  {[5, 15, 30, 50].map((rad) => (
                    <button
                      key={rad}
                      onClick={() => setDistanceRadius(rad)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        distanceRadius === rad
                          ? 'bg-[#6C2BD9] text-white'
                          : 'bg-[#f3f3f5] text-[#4a4455]'
                      }`}
                    >
                      {rad} mi
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Input */}
        <div className="relative group space-y-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#7b7486]">
              <Search className="w-5 h-5 text-[#6C2BD9]" />
            </div>
            <input
              id="explore-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concerts, secret raves, tech summits, or venues..."
              className="w-full h-13 pl-12 pr-28 bg-white rounded-2xl border border-[#ccc3d7]/60 shadow-sm focus:ring-2 focus:ring-[#6C2BD9] focus:border-transparent text-sm font-medium outline-none transition-all placeholder:text-[#7b7486]/70"
            />
            <div className="absolute inset-y-0 right-3 flex items-center gap-2">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-2.5 py-1 bg-purple-50 text-[#6C2BD9] rounded-lg text-xs font-bold hover:bg-purple-100 transition-all"
                >
                  Clear
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenSearch}
                  className="px-2.5 py-1 bg-[#f3f3f5] text-[#7b7486] rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-purple-100 hover:text-[#6C2BD9] transition-all"
                >
                  Advanced
                </button>
              )}
            </div>
          </div>

          {/* Quick Search Tag Suggestions */}
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar text-[11px] pt-0.5">
            <span className="text-[10px] uppercase font-extrabold text-[#7b7486] shrink-0 tracking-wider">
              Popular:
            </span>
            {[
              { label: '🔥 Neon Horizons', tag: 'Neon' },
              { label: '🎷 Speakeasy Jazz', tag: 'Jazz' },
              { label: '🎟️ Free Passes', tag: 'Free' },
              { label: '⚡ Techno Raves', tag: 'Techno' },
              { label: '💻 AI Summits', tag: 'AI' },
              { label: '✨ VIP Backstage', tag: 'VIP' },
            ].map((s) => (
              <button
                key={s.tag}
                type="button"
                onClick={() => setSearchQuery(s.tag)}
                className={`px-2.5 py-1 rounded-full font-bold whitespace-nowrap transition-all border ${
                  searchQuery.toLowerCase() === s.tag.toLowerCase()
                    ? 'bg-[#6C2BD9] text-white border-[#6C2BD9]'
                    : 'bg-white text-[#4a4455] border-[#ccc3d7]/50 hover:border-[#6C2BD9] hover:text-[#6C2BD9]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Category Carousel */}
      <section id="category-selector-section" className="overflow-hidden">
        <div className="flex overflow-x-auto hide-scrollbar gap-2 px-4 pb-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                id={`category-pill-${cat.id.toLowerCase()}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap active:scale-95 transition-all shadow-xs ${
                  isSelected
                    ? 'bg-[#6C2BD9] text-white shadow-purple-600/30'
                    : 'bg-white text-[#4a4455] hover:bg-[#edeef0] border border-[#ccc3d7]/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Quick Filter Tabs (Trending, Selling Fast, Under $50, VIP) */}
      <section className="px-4 overflow-hidden">
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1">
          {quickFilterPills.map((pill) => (
            <button
              key={pill.id}
              onClick={() => setActiveFilter(pill.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeFilter === pill.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-[#f3f3f5] text-[#7b7486] hover:text-[#1a1c1d] hover:bg-[#edeef0]'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </section>

      {/* 4. Featured Spotlight Hero Drop (When on All / No Search) */}
      {selectedCategory === 'All' && searchQuery === '' && activeFilter === 'all' && spotlightEvent && (
        <section id="hero-spotlight-section" className="px-4">
          <div
            onClick={() => onSelectEvent(spotlightEvent)}
            className="relative w-full rounded-[32px] overflow-hidden shadow-2xl border border-black/10 cursor-pointer group bg-slate-950 text-white min-h-[380px] sm:min-h-[420px] flex flex-col justify-between p-6 sm:p-7"
          >
            {/* Background Image with Cinematic Gradient */}
            <img
              src={spotlightEvent.image}
              alt={spotlightEvent.title}
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent pointer-events-none" />

            {/* Top Bar: Live Badge & Audio Preview Toggle */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-amber-400 text-slate-950 font-heading font-extrabold text-[10px] uppercase tracking-wider rounded-full shadow-md flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-slate-950" />
                  FEATURED SPOTLIGHT
                </span>
                <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold text-white flex items-center gap-1 border border-white/20">
                  <QrCode className="w-3 h-3 text-purple-300" />
                  Rotating Pass
                </span>
              </div>

              {/* Quick Audio Vibe Snippet Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAudioPreviewPlaying(!isAudioPreviewPlaying);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md flex items-center gap-1.5 transition-all ${
                  isAudioPreviewPlaying
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40 animate-pulse'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {isAudioPreviewPlaying ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span className="text-[10px] font-heading">{isAudioPreviewPlaying ? 'Vibe Playing' : 'Preview Audio'}</span>
              </button>
            </div>

            {/* Bottom Content Area */}
            <div className="relative z-10 space-y-3 mt-auto pt-8">
              <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" />
                <span>{spotlightEvent.date} • {spotlightEvent.time.split(' - ')[0]}</span>
              </div>

              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                {spotlightEvent.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 max-w-lg leading-relaxed">
                {spotlightEvent.tagline || spotlightEvent.description}
              </p>

              <div className="flex items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  <span className="truncate">{spotlightEvent.venue}, {spotlightEvent.city}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSave(spotlightEvent.id);
                    }}
                    className="w-11 h-11 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white active:scale-90 transition-all shrink-0"
                    aria-label="Save Event"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        spotlightEvent.isSaved ? 'fill-red-500 text-red-500' : 'text-white'
                      }`}
                    />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookDirect(spotlightEvent);
                    }}
                    className="px-5 h-11 bg-white hover:bg-purple-50 text-[#6C2BD9] rounded-2xl font-heading font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-xl active:scale-95 transition-all"
                  >
                    <span>Book from ${spotlightEvent.price}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. Trending Live Experiences Carousel */}
      {selectedCategory === 'All' && searchQuery === '' && activeFilter === 'all' && (
        <section id="trending-now-section" className="space-y-3">
          <div className="flex justify-between items-center px-4">
            <div>
              <h2 className="font-heading text-xl font-bold text-[#1a1c1d] flex items-center gap-1.5">
                <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span>Trending Experiences</span>
              </h2>
              <p className="text-xs text-[#7b7486]">High-demand drops & selling fast</p>
            </div>
            <button
              onClick={onOpenSearch}
              className="text-xs font-heading font-bold uppercase tracking-wider text-[#6C2BD9] hover:underline"
            >
              View All
            </button>
          </div>

          <div className="flex overflow-x-auto hide-scrollbar gap-4 px-4 snap-x">
            {trendingEvents.map((evt) => (
              <motion.article
                key={evt.id}
                id={`trending-card-${evt.id}`}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectEvent(evt)}
                className="relative flex-shrink-0 w-[84vw] max-w-[340px] h-[400px] rounded-[28px] overflow-hidden snap-center shadow-lg border border-black/5 cursor-pointer group bg-slate-900 text-white flex flex-col justify-between p-5"
              >
                {/* Background Image */}
                <img
                  src={evt.image}
                  alt={evt.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-75 pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />

                {/* Top Badges */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-3 py-1 bg-amber-400 text-slate-950 font-heading font-bold text-[10px] uppercase tracking-wider rounded-full shadow-md">
                    {evt.badge || 'POPULAR'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSave(evt.id);
                      }}
                      className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 active:scale-90 transition-all shadow-md"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          evt.isSaved ? 'fill-red-500 text-red-500' : 'text-white'
                        }`}
                      />
                    </button>
                    <span className="px-3 py-1 bg-[#6C2BD9] text-white font-heading font-bold text-xs rounded-full shadow-md">
                      {evt.price === 0 ? 'Free' : `$${evt.price}`}
                    </span>
                  </div>
                </div>

                {/* Bottom Info */}
                <div className="relative z-10 space-y-2">
                  <div className="flex items-center gap-1.5 text-purple-300 text-[11px] font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{evt.date} • {evt.time.split(' - ')[0]}</span>
                  </div>

                  <h3 className="font-heading text-xl font-bold leading-snug line-clamp-2">
                    {evt.title}
                  </h3>

                  <div className="flex items-center gap-1 text-slate-300 text-xs truncate">
                    <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="truncate">{evt.venue}</span>
                  </div>

                  {/* Booking Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookDirect(evt);
                    }}
                    className="mt-2 w-full h-11 bg-white hover:bg-purple-50 text-[#6C2BD9] rounded-xl font-heading font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all"
                  >
                    <span>Instant Reserve</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      )}

      {/* 6. Host Your Own Event Promotion Card */}
      <section className="px-4">
        <div
          id="host-event-promo-card"
          className="relative overflow-hidden bg-gradient-to-r from-[#6C2BD9] to-[#7C3AED] rounded-3xl p-6 text-white shadow-xl shadow-purple-900/15"
        >
          <div className="relative z-10 space-y-3 max-w-sm">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold leading-snug">
                Host Your Own Live Event
              </h2>
              <p className="text-white/80 text-xs leading-relaxed mt-1">
                Reach thousands of fans, manage tiered capacity, scan attendee QR codes at venue doors, and receive instant payouts.
              </p>
            </div>
            <button
              id="create-event-cta-button"
              onClick={onOpenCreateEvent}
              className="px-5 py-2.5 bg-white text-[#6C2BD9] rounded-xl font-heading font-bold text-xs hover:bg-purple-50 shadow-lg active:scale-95 transition-all inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Launch Organiser Studio</span>
            </button>
          </div>

          {/* Decorative ambient elements */}
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <Sparkles className="absolute top-6 right-8 w-20 h-20 text-white/10 pointer-events-none" />
        </div>
      </section>

      {/* 7. Secret Underground & Speakeasy Experiences (Unique Curator Selection) */}
      {selectedCategory === 'All' && searchQuery === '' && activeFilter === 'all' && secretEvents.length > 0 && (
        <section id="secret-sessions-section" className="px-4 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-heading text-xl font-bold text-[#1a1c1d] flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span>Secret & Intimate Sessions</span>
              </h2>
              <p className="text-xs text-[#7b7486]">Exclusive speakeasies, jazz rooms, and tasting nights</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {secretEvents.slice(0, 2).map((evt) => (
              <div
                key={`secret-${evt.id}`}
                onClick={() => onSelectEvent(evt)}
                className="p-4 bg-white rounded-2xl border border-[#ccc3d7]/40 shadow-xs hover:shadow-md transition-all cursor-pointer flex gap-3.5 group"
              >
                <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0">
                  <img
                    src={evt.image}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 backdrop-blur-md rounded text-[9px] font-bold text-white">
                    ${evt.price}
                  </span>
                </div>

                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <div>
                    <span className="text-[10px] font-bold text-[#6C2BD9] uppercase tracking-wider">
                      {evt.category} • {evt.city.split(',')[0]}
                    </span>
                    <h4 className="font-heading font-bold text-sm text-[#1a1c1d] truncate group-hover:text-[#6C2BD9] transition-colors">
                      {evt.title}
                    </h4>
                    <p className="text-[11px] text-[#7b7486] line-clamp-1 mt-0.5">
                      {evt.venue}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#edeef0]">
                    <span className="text-[10px] font-medium text-[#7b7486]">
                      {evt.date.split(',')[0]}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookDirect(evt);
                      }}
                      className="text-xs font-bold text-[#6C2BD9] hover:underline"
                    >
                      Book →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8. Main Events Grid (Filtered or Near You) */}
      <section id="events-near-you-section" className="px-4 space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-heading text-xl font-bold text-[#1a1c1d]">
              {searchQuery ? 'Search Results' : selectedCategory !== 'All' ? `${selectedCategory} Events` : 'All Events in Your City'}
            </h2>
            <p className="text-xs text-[#7b7486]">
              Showing {filteredEvents.length} live {filteredEvents.length === 1 ? 'experience' : 'experiences'}
            </p>
          </div>
        </div>

        {/* Events Grid / List */}
        <div className="space-y-4 pt-1">
          {filteredEvents.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-3xl border border-dashed border-[#ccc3d7] p-8">
              <div className="w-14 h-14 bg-purple-50 text-[#6C2BD9] rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="font-heading font-bold text-lg text-[#1a1c1d]">
                No events found matching your filter
              </h3>
              <p className="text-xs text-[#7b7486] max-w-xs mx-auto mt-1">
                Try resetting your search filters or choosing a different category.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setActiveFilter('all');
                  setSearchQuery('');
                }}
                className="mt-4 px-5 py-2 bg-[#6C2BD9] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-purple-700 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredEvents.map((evt) => (
              <article
                key={evt.id}
                id={`nearby-card-${evt.id}`}
                onClick={() => onSelectEvent(evt)}
                className="bg-white rounded-3xl border border-[#ccc3d7]/35 shadow-xs hover:shadow-md transition-all overflow-hidden cursor-pointer group"
              >
                {/* Card Media Header */}
                <div className="relative h-48 sm:h-56 w-full overflow-hidden">
                  <img
                    src={evt.image}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Top Right Actions */}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSave(evt.id);
                      }}
                      className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-700 shadow-sm active:scale-90 transition-transform"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          evt.isSaved ? 'fill-red-500 text-red-500' : 'text-slate-700'
                        }`}
                      />
                    </button>
                    <span className="px-3.5 py-1 bg-white/95 backdrop-blur-md rounded-full font-heading font-extrabold text-xs text-[#6C2BD9] shadow-sm">
                      {evt.price === 0 ? 'Free' : `$${evt.price.toFixed(2)}`}
                    </span>
                  </div>

                  {/* Top Left Badge */}
                  {evt.badge && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-slate-950/80 backdrop-blur-md text-amber-300 font-heading font-extrabold text-[10px] uppercase tracking-wider rounded-lg shadow-sm">
                      {evt.badge}
                    </span>
                  )}

                  {/* Bottom Image Overlay Bar */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <span className="font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-purple-300" />
                      {evt.date} • {evt.time.split(' - ')[0]}
                    </span>
                    <span className="text-[11px] text-slate-200 font-medium">
                      {evt.distance || 'In City'}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-heading font-bold text-lg text-[#1a1c1d] leading-snug group-hover:text-[#6C2BD9] transition-colors">
                      {evt.title}
                    </h4>
                  </div>

                  <p className="text-xs text-[#7b7486] line-clamp-2 leading-relaxed">
                    {evt.tagline || evt.description}
                  </p>

                  <div className="flex items-center gap-1.5 text-xs text-[#4a4455]">
                    <Navigation className="w-3.5 h-3.5 text-[#6C2BD9] shrink-0" />
                    <span className="truncate">{evt.venue}, {evt.city}</span>
                  </div>

                  {/* Card Footer with Organizer & Book CTA */}
                  <div className="pt-2.5 flex items-center justify-between border-t border-[#edeef0]">
                    <div className="flex items-center gap-2">
                      <img
                        src={evt.organizer.avatar}
                        alt={evt.organizer.name}
                        className="w-6 h-6 rounded-full object-cover border border-purple-100"
                      />
                      <div className="text-[11px] leading-tight">
                        <span className="font-bold text-[#1a1c1d] block truncate max-w-[130px]">
                          {evt.organizer.name}
                        </span>
                        <span className="text-[10px] text-amber-500 font-semibold">
                          ★ {evt.organizer.rating || 4.9}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookDirect(evt);
                      }}
                      className="px-4 py-2 bg-purple-50 text-[#6C2BD9] hover:bg-[#6C2BD9] hover:text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-xs"
                    >
                      {evt.price === 0 ? 'Register Free' : 'Book Tickets'}
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {/* Floating Action Button (FAB) for Create / Host */}
      <button
        id="explore-fab-create-event"
        onClick={onOpenCreateEvent}
        className="fixed bottom-24 right-4 w-14 h-14 bg-[#6C2BD9] hover:bg-purple-700 text-white rounded-full flex items-center justify-center shadow-xl shadow-purple-600/40 active:scale-90 transition-transform z-30"
        aria-label="Host new event"
      >
        <Plus className="w-6 h-6" />
      </button>
    </main>
  );
};
