import React, { useEffect, useState } from 'react';
import {
  X,
  Calendar,
  MapPin,
  Download,
  Share2,
  Check,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';
import { Ticket } from '../types';
import { QRCodeDisplay } from './QRCodeDisplay';
import { generateIcsCalendar } from '../utils/calendar';
import { motion, AnimatePresence } from 'motion/react';
import { buildPassQrPayload, fetchPassToken } from '../services/snaptixApi';

interface TicketPassModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenChat?: () => void;
}

export const TicketPassModal: React.FC<TicketPassModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onOpenChat,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [qrPayload, setQrPayload] = useState<string>('');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(15);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [liveStatus, setLiveStatus] = useState<string>('');

  useEffect(() => {
    if (!isOpen || !ticket) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const refresh = async () => {
      try {
        const data = await fetchPassToken(ticket.id);
        if (cancelled) return;
        setLiveStatus(data.passStatus);
        setQrPayload(buildPassQrPayload(data.passId, data.currentToken));
        const secs = Math.max(1, Number(data.secondsRemaining) || 15);
        setSecondsRemaining(secs);
        setTokenError(null);
        timer = setTimeout(refresh, Math.min(secs, 5) * 1000);
      } catch (err) {
        if (cancelled) return;
        setTokenError(err instanceof Error ? err.message : 'Token refresh failed');
        setQrPayload(ticket.qrCodeData);
        timer = setTimeout(refresh, 5000);
      }
    };

    setQrPayload(ticket.qrCodeData);
    void refresh();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [isOpen, ticket]);

  if (!isOpen || !ticket) return null;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Snaptix Entry Pass: ${ticket.eventTitle}`,
          text: `Here is my pass for ${ticket.eventTitle}. Seat: ${ticket.seat}`,
          url: window.location.href,
        });
        return;
      } catch {
        // ignore
      }
    }
    navigator.clipboard.writeText(
      `Snaptix Pass: ${ticket.eventTitle} (${ticket.bookingId}), Seat: ${ticket.seat}`,
    );
    showToast('Ticket pass details copied to clipboard!');
  };

  const handleCalendar = () => {
    generateIcsCalendar({
      title: ticket.eventTitle,
      description: `Snaptix Pass: ${ticket.bookingId}\nSeat: ${ticket.seat}\nTier: ${ticket.tierName}`,
      location: `${ticket.venue}, ${ticket.city}`,
      date: ticket.date,
      time: ticket.time,
    });
    showToast('Calendar entry (.ics) exported!');
  };

  const handleWallet = () => {
    showToast('Pass added to Apple / Google Wallet!');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const isPast = ticket.status === 'past' || liveStatus === 'CHECKED_IN';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-black/40 text-white backdrop-blur-md flex items-center justify-center hover:bg-black/60 active:scale-90 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative h-36 w-full overflow-hidden">
            <img
              src={ticket.eventImage}
              alt={ticket.eventTitle}
              className={`w-full h-full object-cover ${isPast ? 'grayscale opacity-60' : ''}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 z-10 text-white">
              <span
                className={`px-2.5 py-0.5 font-bold text-[10px] uppercase tracking-wider rounded-full inline-block mb-1 ${
                  isPast ? 'bg-slate-700 text-slate-300' : 'bg-[#6C2BD9] text-white'
                }`}
              >
                {liveStatus || ticket.statusLabel} • {ticket.tierName}
              </span>
              <h3 className="font-heading font-bold text-lg leading-tight text-white truncate">
                {ticket.eventTitle}
              </h3>
            </div>
          </div>

          <div className="p-5 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="font-bold uppercase tracking-wider text-[#7b7486] text-[10px] block">
                  Date & Time
                </span>
                <p className="font-heading font-bold text-sm text-[#1a1c1d] mt-0.5">{ticket.date}</p>
                <p className="text-[11px] text-[#7b7486]">{ticket.time}</p>
              </div>

              <div>
                <span className="font-bold uppercase tracking-wider text-[#7b7486] text-[10px] block">
                  Seat & Tier
                </span>
                <p className="font-heading font-bold text-sm text-[#6C2BD9] mt-0.5">{ticket.seat}</p>
                <p className="text-[11px] text-[#7b7486]">{ticket.tierName}</p>
              </div>
            </div>

            <div>
              <span className="font-bold uppercase tracking-wider text-[#7b7486] text-[10px] block">
                Venue Location
              </span>
              <div className="flex items-center gap-1.5 text-[#1a1c1d] font-bold text-sm mt-0.5">
                <MapPin className="w-4 h-4 text-[#6C2BD9] flex-shrink-0" />
                <span className="truncate">
                  {ticket.venue}, {ticket.city}
                </span>
              </div>
            </div>
          </div>

          <div className="relative py-1">
            <div className="ticket-notch-l" />
            <div className="ticket-divider-dashed mx-6" />
            <div className="ticket-notch-r" />
          </div>

          <div className="p-5 bg-[#faf8ff] flex flex-col items-center text-center space-y-3">
            <QRCodeDisplay
              data={qrPayload || ticket.qrCodeData}
              size={150}
              isPast={isPast}
              caption={!isPast ? `Rotates in ${secondsRemaining}s` : undefined}
            />

            <div className="space-y-0.5">
              <span className="font-mono font-bold text-xs text-[#7b7486] flex items-center justify-center gap-1">
                {!isPast && <RefreshCw className="w-3 h-3 animate-spin text-[#6C2BD9]" />}
                {ticket.bookingId}
              </span>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#6C2BD9]">
                {isPast
                  ? 'Ticket Expired / Used'
                  : tokenError
                    ? 'Showing cached QR — reconnecting…'
                    : 'Live rotating QR — hold near scanner'}
              </p>
            </div>

            {!isPast && (
              <div className="grid grid-cols-4 gap-1.5 w-full pt-1">
                <button
                  onClick={handleWallet}
                  className="py-2.5 px-1.5 bg-white border border-[#ccc3d7]/40 rounded-xl text-[10px] font-bold text-[#1a1c1d] flex flex-col items-center gap-1 shadow-xs hover:bg-purple-50 active:scale-95"
                >
                  <Download className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  <span>Wallet</span>
                </button>
                <button
                  onClick={handleCalendar}
                  className="py-2.5 px-1.5 bg-white border border-[#ccc3d7]/40 rounded-xl text-[10px] font-bold text-[#1a1c1d] flex flex-col items-center gap-1 shadow-xs hover:bg-purple-50 active:scale-95"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  <span>Calendar</span>
                </button>
                <button
                  onClick={handleShare}
                  className="py-2.5 px-1.5 bg-white border border-[#ccc3d7]/40 rounded-xl text-[10px] font-bold text-[#1a1c1d] flex flex-col items-center gap-1 shadow-xs hover:bg-purple-50 active:scale-95"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  <span>Share</span>
                </button>
                {onOpenChat && (
                  <button
                    onClick={onOpenChat}
                    className="py-2.5 px-1.5 bg-purple-50 border border-purple-200 rounded-xl text-[10px] font-bold text-[#6C2BD9] flex flex-col items-center gap-1 shadow-xs hover:bg-purple-100 active:scale-95"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#6C2BD9]" />
                    <span>Chat Host</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl z-50 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </AnimatePresence>
  );
};
