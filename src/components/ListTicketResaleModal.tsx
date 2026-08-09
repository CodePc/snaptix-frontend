import React, { useState } from 'react';
import {
  X,
  Tag,
  ShieldCheck,
  Zap,
  Info,
  DollarSign,
  AlertCircle,
  Check,
} from 'lucide-react';
import { Ticket, ResaleListing } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ListTicketResaleModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmList: (listing: ResaleListing) => void;
}

export const ListTicketResaleModal: React.FC<ListTicketResaleModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onConfirmList,
}) => {
  if (!isOpen || !ticket) return null;

  // Anti-scalping cap: maximum 110% of face value
  const maxPriceCap = Math.round(ticket.totalPrice * 1.1);
  const minPrice = Math.max(5, Math.round(ticket.totalPrice * 0.5));

  const [resalePrice, setResalePrice] = useState<number>(ticket.totalPrice);
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const platformFee = Math.round(resalePrice * 0.05 * 100) / 100;
  const organizerRoyalty = Math.round(resalePrice * 0.05 * 100) / 100;
  const estimatedPayout = Math.max(0, Math.round((resalePrice - platformFee) * 100) / 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms || resalePrice <= 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const listing: ResaleListing = {
        id: `resale-${Date.now()}`,
        ticketId: ticket.id,
        eventId: ticket.eventId,
        eventTitle: ticket.eventTitle,
        eventImage: ticket.eventImage,
        date: ticket.date,
        time: ticket.time,
        venue: ticket.venue,
        city: ticket.city,
        tierName: ticket.tierName,
        seat: ticket.seat,
        originalPrice: ticket.totalPrice,
        resalePrice: resalePrice,
        sellerName: 'Alex Thompson (You)',
        sellerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop',
        sellerVerified: true,
        status: 'available',
        listedAt: new Date().toISOString(),
        antiScalpVerified: true,
        instantTransfer: true,
      };

      onConfirmList(listing);
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-[#edeef0] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-[#1a1c1d]">
                  List Ticket for Resale
                </h3>
                <p className="text-[11px] text-[#7b7486]">
                  Verified P2P Marketplace with instant barcode reissue
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#f3f3f5] flex items-center justify-center text-[#4a4455] hover:bg-[#edeef0]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto hide-scrollbar text-xs">
            {/* Ticket Preview Card */}
            <div className="p-3.5 bg-[#f9f9fb] rounded-2xl border border-[#ccc3d7]/40 flex items-center gap-3">
              <img
                src={ticket.eventImage}
                alt={ticket.eventTitle}
                className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase text-[#6C2BD9] tracking-wider">
                  {ticket.tierName} • {ticket.seat}
                </span>
                <h4 className="font-heading font-bold text-sm text-[#1a1c1d] truncate">
                  {ticket.eventTitle}
                </h4>
                <p className="text-[11px] text-[#7b7486]">
                  Original Price: <span className="font-bold text-[#1a1c1d]">${ticket.totalPrice.toFixed(2)}</span>
                </p>
              </div>
            </div>

            {/* Anti-Scalping Protection Notice */}
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/60 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="text-[11px] text-emerald-900 leading-relaxed">
                <span className="font-bold">Anti-Scalping Fair Cap Active:</span> Resale price is capped at max +10% (${maxPriceCap}) to keep live events fair and accessible.
              </div>
            </div>

            {/* Price Setter */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-heading font-bold text-xs text-[#1a1c1d]">
                  Set Resale Price
                </label>
                <span className="font-mono text-sm font-bold text-[#6C2BD9]">
                  ${resalePrice.toFixed(2)}
                </span>
              </div>

              <input
                type="range"
                min={minPrice}
                max={maxPriceCap}
                step={1}
                value={resalePrice}
                onChange={(e) => setResalePrice(Number(e.target.value))}
                className="w-full h-2 bg-purple-100 accent-[#6C2BD9] rounded-lg cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-[#7b7486] font-medium">
                <span>Min: ${minPrice}</span>
                <span>Face Value: ${ticket.totalPrice}</span>
                <span>Max Cap: ${maxPriceCap}</span>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="p-3.5 bg-white rounded-2xl border border-[#edeef0] space-y-2 text-xs">
              <div className="flex justify-between text-[#7b7486]">
                <span>Listing Price</span>
                <span className="font-bold text-[#1a1c1d]">${resalePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#7b7486]">
                <span>Snaptix Guarantee Fee (5%)</span>
                <span>-${platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#7b7486]">
                <span>Organiser Royalty (5% incl.)</span>
                <span className="text-purple-600 font-medium">${organizerRoyalty.toFixed(2)}</span>
              </div>
              <div className="border-t border-[#edeef0] pt-2 flex justify-between font-heading font-bold text-sm text-[#1a1c1d]">
                <span>Your Payout (Instant Deposit)</span>
                <span className="text-emerald-600 font-mono">${estimatedPayout.toFixed(2)}</span>
              </div>
            </div>

            {/* Instant Barcode Reissue Notice */}
            <div className="flex items-start gap-2 text-[11px] text-[#7b7486] bg-purple-50/60 p-3 rounded-2xl border border-purple-100">
              <Zap className="w-4 h-4 text-[#6C2BD9] flex-shrink-0 mt-0.5" />
              <p>
                When purchased, your existing QR barcode is permanently invalidated and a fresh cryptographically secure pass is issued to the buyer.
              </p>
            </div>

            {/* Agreement Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 accent-[#6C2BD9] rounded"
              />
              <span className="text-[11px] text-[#4a4455]">
                I agree to list this verified ticket on the Snaptix Resale Exchange.
              </span>
            </label>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isSubmitting || !agreedToTerms}
              className="w-full py-3.5 bg-[#6C2BD9] hover:bg-purple-700 disabled:opacity-50 text-white rounded-2xl font-heading font-bold text-xs shadow-lg shadow-purple-600/20 active:scale-95 transition-all"
            >
              {isSubmitting ? 'Publishing Listing...' : `Confirm & List for $${resalePrice.toFixed(2)}`}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
