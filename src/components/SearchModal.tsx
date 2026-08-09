import React, { useState } from 'react';
import { X, Search, MapPin, Calendar, DollarSign, ArrowRight } from 'lucide-react';
import { EventItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SearchModalProps {
  isOpen: boolean;
  events: EventItem[];
  onClose: () => void;
  onSelectEvent: (event: EventItem) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  events,
  onClose,
  onSelectEvent,
}) => {
  const [query, setQuery] = useState<string>('');
  const [category, setCategory] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(150);

  if (!isOpen) return null;

  const results = events.filter((e) => {
    const matchQuery =
      query.trim() === '' ||
      e.title.toLowerCase().includes(query.toLowerCase()) ||
      e.venue.toLowerCase().includes(query.toLowerCase()) ||
      e.city.toLowerCase().includes(query.toLowerCase());
    const matchCategory =
      category === 'All' || e.category.toLowerCase() === category.toLowerCase();
    const matchPrice = e.price <= maxPrice;

    return matchQuery && matchCategory && matchPrice;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
        >
          {/* Search Header */}
          <div className="p-4 border-b border-[#edeef0] flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#7b7486] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search artists, festivals, jazz, venues..."
                className="w-full h-11 pl-10 pr-4 bg-[#f9f9fb] rounded-xl border border-[#ccc3d7]/50 focus:ring-2 focus:ring-[#6C2BD9] outline-none text-xs font-body"
              />
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#f3f3f5] flex items-center justify-center text-[#4a4455] hover:bg-[#edeef0]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Filters */}
          <div className="px-4 py-2 bg-[#f9f9fb] border-b border-[#edeef0] flex items-center gap-2 overflow-x-auto hide-scrollbar text-xs">
            <span className="text-[#7b7486] font-bold text-[11px]">Filter:</span>
            {['All', 'Music', 'Tech', 'Food', 'Sports', 'Workshops'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                  category === cat
                    ? 'bg-[#6C2BD9] text-white'
                    : 'bg-white border border-[#ccc3d7]/40 text-[#4a4455]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Results List */}
          <div className="p-4 overflow-y-auto space-y-3 flex-1 hide-scrollbar">
            <div className="flex justify-between items-center text-xs text-[#7b7486]">
              <span>Results ({results.length})</span>
              <span>Max: ${maxPrice}</span>
            </div>

            {results.length === 0 ? (
              <div className="py-12 text-center text-[#7b7486] text-xs">
                No events match your search criteria.
              </div>
            ) : (
              results.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => {
                    onSelectEvent(evt);
                    onClose();
                  }}
                  className="p-3 bg-white hover:bg-purple-50/50 rounded-2xl border border-[#ccc3d7]/30 flex items-center justify-between gap-3 cursor-pointer group transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={evt.image}
                      alt={evt.title}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-heading font-bold text-sm text-[#1a1c1d] truncate group-hover:text-[#6C2BD9] transition-colors">
                        {evt.title}
                      </h4>
                      <p className="text-[11px] text-[#7b7486] truncate">
                        {evt.date} • {evt.venue}
                      </p>
                      <span className="text-[10px] font-bold text-[#6C2BD9]">
                        {evt.price === 0 ? 'Free' : `$${evt.price.toFixed(2)}`}
                      </span>
                    </div>
                  </div>

                  <button className="w-8 h-8 rounded-full bg-[#f3f3f5] group-hover:bg-[#6C2BD9] group-hover:text-white flex items-center justify-center text-[#4a4455] transition-all flex-shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
