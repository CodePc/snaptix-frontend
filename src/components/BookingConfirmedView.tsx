import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  Calendar,
  Share2,
  Home,
  Ticket as TicketIcon,
  Download,
  MapPin,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import { Ticket } from '../types';
import { QRCodeDisplay } from './QRCodeDisplay';
import { launchConfetti } from '../utils/confetti';
import { generateIcsCalendar } from '../utils/calendar';
import { motion } from 'motion/react';

interface BookingConfirmedViewProps {
  ticket: Ticket;
  onViewTickets: () => void;
  onReturnHome: () => void;
}

export const BookingConfirmedView: React.FC<BookingConfirmedViewProps> = ({
  ticket,
  onViewTickets,
  onReturnHome,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const cleanup = launchConfetti(canvasRef.current, 4000);
      return cleanup;
    }
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Going to ${ticket.eventTitle}!`,
          text: `I just booked tickets for ${ticket.eventTitle} on Snaptix! Booking ID: ${ticket.bookingId}`,
          url: window.location.href,
        });
        return;
      } catch {
        // fall through
      }
    }
    navigator.clipboard.writeText(
      `I'm going to ${ticket.eventTitle} on ${ticket.date}! Booking ID: ${ticket.bookingId}`
    );
    showToast('Event booking details copied to clipboard!');
  };

  const handleAddToCalendar = () => {
    generateIcsCalendar({
      title: ticket.eventTitle,
      description: `Snaptix Ticket Pass: ${ticket.bookingId}\nSeat: ${ticket.seat}\nTier: ${ticket.tierName}`,
      location: `${ticket.venue}, ${ticket.city}`,
      date: ticket.date,
      time: ticket.time,
    });
    showToast('Calendar invite (.ics) downloaded!');
  };

  const handleAddToWallet = () => {
    showToast('Digital pass synced with Apple / Google Wallet!');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div
      id="booking-confirmed-view"
      className="min-h-screen bg-[#f9f9fb] text-[#1a1c1d] pb-24"
    >
      {/* Confetti celebration canvas overlay */}
      <canvas ref={canvasRef} className="confetti-canvas" />

      {/* Top Header */}
      <header className="sticky top-0 w-full z-40 bg-[#f9f9fb]/80 backdrop-blur-md px-4 h-14 flex items-center justify-between">
        <button
          onClick={onReturnHome}
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#6C2BD9] hover:bg-purple-50 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 font-heading font-bold text-base text-[#6C2BD9]">
          <TicketIcon className="w-5 h-5 -rotate-12" />
          <span>Snaptix</span>
        </div>

        <button
          onClick={handleShare}
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#6C2BD9] hover:bg-purple-50 active:scale-95 transition-all"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 space-y-6">
        {/* Success Header */}
        <section className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 14, stiffness: 200 }}
            className="w-20 h-20 bg-[#1FAE6B] text-white rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/25"
          >
            <Check className="w-10 h-10 stroke-[3]" />
          </motion.div>

          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-[#1a1c1d] leading-tight">
              You're Going to {ticket.eventTitle}!
            </h1>
            <p className="text-sm text-[#7b7486] mt-1 font-medium">
              Booking Confirmed • Check your email for receipt
            </p>
          </motion.div>
        </section>

        {/* Perforated Ticket Pass Card */}
        <motion.article
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative bg-white rounded-3xl shadow-xl shadow-black/5 border border-[#ccc3d7]/30 overflow-hidden"
        >
          {/* Card Hero Banner */}
          <div className="relative h-40 w-full overflow-hidden">
            <img
              src={ticket.eventImage}
              alt={ticket.eventTitle}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 z-10 text-white">
              <span className="px-2.5 py-0.5 bg-[#6C2BD9] text-white font-bold text-[10px] uppercase tracking-wider rounded-full inline-block mb-1">
                {ticket.tierName}
              </span>
              <h3 className="font-heading font-bold text-lg leading-tight truncate text-white">
                {ticket.eventTitle}
              </h3>
            </div>
          </div>

          {/* Event Details Grid */}
          <div className="p-5 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-bold uppercase tracking-wider text-[#7b7486] block text-[10px]">
                  Date
                </span>
                <p className="font-heading font-bold text-sm text-[#1a1c1d] mt-0.5">
                  {ticket.date}
                </p>
              </div>
              <div>
                <span className="font-bold uppercase tracking-wider text-[#7b7486] block text-[10px]">
                  Time
                </span>
                <p className="font-heading font-bold text-sm text-[#1a1c1d] mt-0.5">
                  {ticket.time}
                </p>
              </div>
            </div>

            <div>
              <span className="font-bold uppercase tracking-wider text-[#7b7486] block text-[10px]">
                Location & Seat
              </span>
              <div className="flex items-center gap-1.5 text-[#1a1c1d] font-bold text-sm mt-0.5">
                <MapPin className="w-4 h-4 text-[#6C2BD9] flex-shrink-0" />
                <span className="truncate">{ticket.venue}, {ticket.city}</span>
              </div>
              <span className="text-[11px] text-[#6C2BD9] font-medium block ml-5">
                Assigned: {ticket.seat}
              </span>
            </div>
          </div>

          {/* Perforated Divider with Circular Notches */}
          <div className="relative py-1">
            <div className="ticket-notch-l" />
            <div className="ticket-divider-dashed mx-6" />
            <div className="ticket-notch-r" />
          </div>

          {/* QR Code Section */}
          <div className="p-6 pt-4 bg-[#fcfbfe] flex flex-col items-center text-center space-y-2">
            <QRCodeDisplay data={ticket.qrCodeData} size={150} />
            <div className="space-y-0.5 pt-1">
              <p className="font-mono font-bold text-xs text-[#7b7486]">
                Booking ID: {ticket.bookingId}
              </p>
              <p className="font-heading font-bold text-xs text-[#6C2BD9] uppercase tracking-wider">
                {ticket.quantity} {ticket.quantity === 1 ? 'Ticket' : 'Tickets'} • Admit One Per QR
              </p>
            </div>
          </div>
        </motion.article>

        {/* Action Buttons */}
        <section className="space-y-3 pt-2">
          <button
            id="confirmed-view-tickets-cta"
            onClick={onViewTickets}
            className="w-full h-14 bg-[#6C2BD9] hover:bg-purple-700 text-white rounded-2xl font-heading font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-purple-600/25 active:scale-95 transition-all"
          >
            <TicketIcon className="w-5 h-5 -rotate-12" />
            <span>View in My Tickets</span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleAddToWallet}
              className="h-12 rounded-xl bg-white border border-[#ccc3d7]/50 text-xs font-bold text-[#1a1c1d] flex items-center justify-center gap-2 hover:bg-purple-50 active:scale-95 transition-all shadow-xs"
            >
              <Download className="w-4 h-4 text-[#6C2BD9]" />
              <span>Add to Wallet</span>
            </button>
            <button
              onClick={handleAddToCalendar}
              className="h-12 rounded-xl bg-white border border-[#ccc3d7]/50 text-xs font-bold text-[#1a1c1d] flex items-center justify-center gap-2 hover:bg-purple-50 active:scale-95 transition-all shadow-xs"
            >
              <Calendar className="w-4 h-4 text-[#6C2BD9]" />
              <span>Add to Calendar</span>
            </button>
          </div>

          <button
            onClick={handleShare}
            className="w-full py-3 text-xs font-bold text-[#6C2BD9] hover:bg-purple-50 rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-4 h-4" />
            <span>Share with Friends</span>
          </button>

          <button
            onClick={onReturnHome}
            className="w-full py-2 text-xs font-medium text-[#7b7486] hover:text-[#1a1c1d] transition-colors flex items-center justify-center gap-1"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </button>
        </section>
      </main>

      {/* Floating Toast Message */}
      {toastMessage && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl z-50 flex items-center gap-2"
        >
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </motion.div>
      )}
    </div>
  );
};
