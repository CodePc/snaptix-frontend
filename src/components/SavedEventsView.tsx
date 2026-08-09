import React, { useState } from 'react';
import {
  Heart,
  Calendar,
  MapPin,
  Clock,
  Flame,
  ArrowRight,
  Search,
  Sparkles,
} from 'lucide-react';
import { EventItem } from '../types';
import { motion } from 'motion/react';

interface SavedEventsViewProps {
  savedEvents: EventItem[];
  onSelectEvent: (event: EventItem) => void;
  onBookDirect: (event: EventItem) => void;
  onToggleSave: (eventId: string) => void;
  onBrowseEvents: () => void;
}

export const SavedEventsView: React.FC<SavedEventsViewProps> = ({
  savedEvents,
  onSelectEvent,
  onBookDirect,
  onToggleSave,
  onBrowseEvents,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  const filterTabs = ['All Events', 'Music', 'Workshops', 'Tech', 'Food', 'Sports'];

  const displayedEvents = savedEvents.filter((e) => {
    if (selectedFilter === 'All Events') return true;
    return e.category.toLowerCase() === selectedFilter.toLowerCase();
  });

  return (
    <main id="saved-events-view" className="space-y-5 pb-28 px-4 pt-2">
      {/* Header Info */}
      <section className="space-y-1">
        <h2 className="font-heading text-2xl font-bold text-[#1a1c1d]">
          Saved Events
        </h2>
        <p className="text-xs text-[#7b7486]">
          Your personal curated list of upcoming experiences.
        </p>
      </section>

      {/* Category Filter Pills */}
      <section className="overflow-hidden">
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1">
          {filterTabs.map((tab) => {
            const isSelected = selectedFilter === tab;
            return (
              <button
                key={tab}
                onClick={() => setSelectedFilter(tab)}
                className={`px-4 py-2 rounded-full text-xs font-heading font-bold whitespace-nowrap active:scale-95 transition-all shadow-xs ${
                  isSelected
                    ? 'bg-[#6C2BD9] text-white shadow-purple-500/20'
                    : 'bg-white text-[#4a4455] border border-[#ccc3d7]/40 hover:bg-[#edeef0]'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </section>

      {/* Saved Events Grid */}
      <section className="space-y-4">
        {displayedEvents.length === 0 ? (
          <div
            id="saved-empty-state"
            className="py-14 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-dashed border-[#ccc3d7] p-6 space-y-3"
          >
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="font-heading font-bold text-lg text-[#1a1c1d]">
              No saved events
            </h3>
            <p className="text-xs text-[#7b7486] max-w-xs leading-relaxed">
              You haven't bookmarked any events in this category yet. Browse events and tap the heart icon to save favorites.
            </p>
            <button
              onClick={onBrowseEvents}
              className="mt-2 px-6 py-2.5 bg-[#6C2BD9] text-white rounded-xl text-xs font-heading font-bold shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
            >
              EXPLORE EVENTS
            </button>
          </div>
        ) : (
          displayedEvents.map((evt, idx) => {
            const isHeroCard = idx === 0 && selectedFilter === 'All Events';

            if (isHeroCard) {
              return (
                <motion.article
                  key={evt.id}
                  id={`saved-hero-card-${evt.id}`}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onSelectEvent(evt)}
                  className="relative overflow-hidden rounded-3xl bg-white shadow-md border border-[#ccc3d7]/30 cursor-pointer group"
                >
                  <div className="relative h-60 w-full overflow-hidden">
                    <img
                      src={evt.image}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

                    {/* Floating Trending Badge */}
                    <div className="absolute top-4 left-4 bg-[#6C2BD9] text-white px-3 py-1 rounded-xl text-[10px] font-heading font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <Flame className="w-3.5 h-3.5 text-amber-300" />
                      <span>TRENDING</span>
                    </div>

                    {/* Heart Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSave(evt.id);
                      }}
                      className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-red-500 shadow-md active:scale-90 transition-transform"
                    >
                      <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                    </button>

                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end text-white">
                      <div>
                        <h3 className="font-heading font-bold text-xl leading-tight">
                          {evt.title}
                        </h3>
                        <div className="flex items-center gap-2 text-white/80 text-xs mt-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{evt.date}</span>
                          <span>•</span>
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[120px]">{evt.venue}</span>
                        </div>
                      </div>

                      <div className="px-3.5 py-1.5 bg-amber-400 text-slate-950 font-heading font-bold text-sm rounded-xl shadow-lg">
                        {evt.price === 0 ? 'Free' : `$${evt.price.toFixed(2)}`}
                      </div>
                    </div>
                  </div>

                  {/* Attendees & CTA */}
                  <div className="p-4 flex items-center justify-between border-t border-[#edeef0]">
                    <div className="flex items-center">
                      <div className="flex -space-x-2">
                        {(evt.attendeeAvatars || [
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100',
                          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100',
                        ]).map((av, aIdx) => (
                          <img
                            key={aIdx}
                            src={av}
                            alt="Attendee"
                            className="w-7 h-7 rounded-full object-cover ring-2 ring-white"
                          />
                        ))}
                      </div>
                      <span className="text-[11px] font-bold text-[#7b7486] ml-2">
                        +{evt.attendeesCount || 42} going
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookDirect(evt);
                      }}
                      className="px-6 py-2.5 bg-[#6C2BD9] hover:bg-purple-700 text-white rounded-xl font-heading font-bold text-xs shadow-md shadow-purple-600/20 active:scale-95 transition-all"
                    >
                      Book Tickets
                    </button>
                  </div>
                </motion.article>
              );
            }

            return (
              <motion.article
                key={evt.id}
                id={`saved-card-${evt.id}`}
                whileTap={{ scale: 0.99 }}
                onClick={() => onSelectEvent(evt)}
                className="bg-white rounded-3xl border border-[#ccc3d7]/30 shadow-xs overflow-hidden cursor-pointer group"
              >
                <div className="relative h-44 w-full overflow-hidden">
                  <img
                    src={evt.image}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSave(evt.id);
                    }}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-red-500 active:scale-90 transition-transform shadow-md"
                  >
                    <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                  </button>

                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                    <span className="px-2.5 py-0.5 bg-black/60 backdrop-blur-md rounded-md text-[10px] font-bold uppercase tracking-wider">
                      {evt.category}
                    </span>
                    <span className="font-heading font-bold text-sm text-amber-300">
                      {evt.price === 0 ? 'Free' : `$${evt.price.toFixed(2)}`}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h4 className="font-heading font-bold text-base text-[#1a1c1d] leading-snug group-hover:text-[#6C2BD9] transition-colors">
                      {evt.title}
                    </h4>
                    <div className="flex flex-col gap-1 text-xs text-[#7b7486] mt-1.5">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#6C2BD9]" />
                        <span>{evt.date} • {evt.time.split(' - ')[0]}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#6C2BD9]" />
                        <span className="truncate">{evt.venue}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookDirect(evt);
                    }}
                    className="w-full py-2.5 rounded-xl border border-[#6C2BD9] text-[#6C2BD9] hover:bg-purple-50 font-heading font-bold text-xs transition-all active:scale-95"
                  >
                    Quick Book
                  </button>
                </div>
              </motion.article>
            );
          })
        )}

        {displayedEvents.length > 0 && (
          <div className="text-center py-6 text-[#7b7486] text-xs font-medium">
            Viewing {displayedEvents.length} of {savedEvents.length} saved events
          </div>
        )}
      </section>
    </main>
  );
};
