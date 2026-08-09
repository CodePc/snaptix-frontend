import React, { useState } from 'react';
import {
  Search,
  Tag,
  ShieldCheck,
  Zap,
  ArrowUpDown,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Ticket as TicketIcon,
  Filter,
} from 'lucide-react';
import { ResaleListing, Ticket } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ResaleMarketplaceViewProps {
  listings: ResaleListing[];
  onBuyResaleTicket: (listing: ResaleListing) => void;
  onOpenMyTickets: () => void;
}

export const ResaleMarketplaceView: React.FC<ResaleMarketplaceViewProps> = ({
  listings,
  onBuyResaleTicket,
  onOpenMyTickets,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCity, setFilterCity] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'date'>('price_asc');

  const availableListings = listings.filter((l) => l.status === 'available');

  const filteredListings = availableListings
    .filter((l) => {
      const matchQuery =
        searchQuery.trim() === '' ||
        l.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.sellerName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCity = filterCity === 'All' || l.city.includes(filterCity);
      return matchQuery && matchCity;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.resalePrice - b.resalePrice;
      if (sortBy === 'price_desc') return b.resalePrice - a.resalePrice;
      return new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime();
    });

  return (
    <main id="resale-marketplace-view" className="space-y-5 pb-28 px-4 pt-2">
      {/* Hero Banner with Anti-Scalp Guarantee */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#6C2BD9] via-purple-800 to-indigo-900 rounded-3xl p-5 text-white shadow-xl shadow-purple-900/15">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-heading font-bold uppercase tracking-wider text-white">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>100% Guaranteed Fan-to-Fan Resale</span>
          </div>

          <h2 className="font-heading text-2xl font-bold leading-tight">
            Secondary Ticket Exchange
          </h2>

          <p className="text-xs text-purple-100/90 leading-relaxed max-w-sm">
            Sold-out event? Grab verified passes listed directly by other fans with automated anti-scalping price caps and instant barcode re-issuance.
          </p>

          <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
            <button
              onClick={onOpenMyTickets}
              className="px-4 py-2 bg-white text-[#6C2BD9] font-heading font-bold rounded-xl shadow-md hover:bg-purple-50 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Sell Your Ticket</span>
            </button>
          </div>
        </div>

        {/* Decorative background watermark */}
        <TicketIcon className="absolute -bottom-6 -right-6 w-36 h-36 text-white/10 rotate-12 pointer-events-none" />
      </section>

      {/* Search & Filters Bar */}
      <section className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#7b7486] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resale tickets by event or venue..."
            className="w-full h-11 pl-10 pr-4 bg-white rounded-2xl border border-[#ccc3d7]/50 focus:ring-2 focus:ring-[#6C2BD9] outline-none text-xs text-[#1a1c1d] shadow-xs"
          />
        </div>

        {/* Quick Filters Row */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto hide-scrollbar text-xs">
          <div className="flex items-center gap-1.5">
            {['All', 'New York', 'Los Angeles', 'New Jersey'].map((city) => (
              <button
                key={city}
                onClick={() => setFilterCity(city)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  filterCity === city
                    ? 'bg-[#6C2BD9] text-white shadow-xs'
                    : 'bg-white border border-[#ccc3d7]/40 text-[#4a4455] hover:bg-[#f3f3f5]'
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'price_asc' | 'price_desc' | 'date')}
              className="bg-white border border-[#ccc3d7]/40 rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-[#4a4455] outline-none"
            >
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="date">Recently Listed</option>
            </select>
          </div>
        </div>
      </section>

      {/* Verified Listings Stream */}
      <section className="space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-heading font-bold text-[#1a1c1d]">
            Available Passes ({filteredListings.length})
          </span>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <Zap className="w-3 h-3" /> Instant Transfer Ready
          </span>
        </div>

        {filteredListings.length === 0 ? (
          <div className="py-14 text-center bg-white rounded-3xl border border-dashed border-[#ccc3d7] p-6 space-y-3">
            <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center text-[#6C2BD9] mx-auto">
              <Tag className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-base text-[#1a1c1d]">
              No active resale tickets found
            </h3>
            <p className="text-xs text-[#7b7486] max-w-xs mx-auto">
              Check back soon as fans list their tickets or list your own tickets if you can no longer attend.
            </p>
          </div>
        ) : (
          filteredListings.map((item) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-4 border border-[#ccc3d7]/40 shadow-xs hover:shadow-md transition-all space-y-3.5"
            >
              {/* Event & Seller Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.eventImage}
                    alt={item.eventTitle}
                    className="w-16 h-16 rounded-2xl object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 bg-purple-50 text-[#6C2BD9] text-[9px] font-bold uppercase rounded-full">
                        {item.tierName}
                      </span>
                      <span className="text-[10px] text-[#7b7486] font-mono">
                        {item.seat}
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-sm text-[#1a1c1d] truncate mt-0.5">
                      {item.eventTitle}
                    </h3>
                    <p className="text-[11px] text-[#7b7486] truncate flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#6C2BD9]" />
                      {item.venue}, {item.city}
                    </p>
                  </div>
                </div>

                {/* Price Display */}
                <div className="text-right flex-shrink-0">
                  <span className="font-mono text-lg font-bold text-[#6C2BD9] block leading-tight">
                    ${item.resalePrice.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-[#7b7486] line-through block">
                    Face: ${item.originalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Event Time & Seller Verification Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-[#edeef0] text-xs">
                <div className="flex items-center gap-2 text-[#7b7486]">
                  <img
                    src={item.sellerAvatar}
                    alt={item.sellerName}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="text-[11px] truncate max-w-[110px]">
                    {item.sellerName}
                  </span>
                  {item.sellerVerified && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </div>

                <div className="flex items-center gap-1 text-[11px] font-medium text-[#4a4455]">
                  <Calendar className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  <span>{item.date}</span>
                </div>
              </div>

              {/* Buy Resale Ticket Button */}
              <div className="pt-1 flex items-center gap-2">
                <div className="flex-1 bg-emerald-50 rounded-xl px-2.5 py-2 text-[10px] font-medium text-emerald-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Verified pass with instant fresh barcode transfer</span>
                </div>

                <button
                  onClick={() => onBuyResaleTicket(item)}
                  className="px-5 py-2.5 bg-[#6C2BD9] hover:bg-purple-700 text-white font-heading font-bold text-xs rounded-xl shadow-md shadow-purple-600/20 active:scale-95 transition-all flex-shrink-0"
                >
                  BUY PASS
                </button>
              </div>
            </motion.article>
          ))
        )}
      </section>
    </main>
  );
};
