import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  CheckCircle,
  AlertCircle,
  Camera,
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react';
import { OrganiserEventData, AttendeeRecord } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { parsePassQrPayload, validatePassApi } from '../../services/snaptixApi';

interface QRCheckInScannerModalProps {
  isOpen: boolean;
  events: OrganiserEventData[];
  defaultEventId?: string;
  onClose: () => void;
  /** Manual desk check-in by real passId — awaited so we can react to backend validation errors. */
  onCheckIn: (
    eventId: string,
    passId: string,
  ) => Promise<{ success: boolean; message: string; attendee?: AttendeeRecord }>;
  /** Pulls the latest roster from GET /events/{id}/attendees for the selected event. */
  onRefreshAttendees?: (eventId: string) => void;
}

export const QRCheckInScannerModal: React.FC<QRCheckInScannerModalProps> = ({
  isOpen,
  events,
  defaultEventId,
  onClose,
  onCheckIn,
  onRefreshAttendees,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(
    defaultEventId || events[0]?.id || '',
  );
  const [manualCode, setManualCode] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [scanStatus, setScanStatus] = useState<{
    type: 'success' | 'already' | 'invalid' | null;
    message: string;
    attendee?: AttendeeRecord;
  }>({ type: null, message: '' });

  const activeEvent = events.find((e) => e.id === selectedEventId) || events[0];

  useEffect(() => {
    if (defaultEventId) {
      setSelectedEventId(defaultEventId);
    } else if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id);
    }
  }, [events, defaultEventId, selectedEventId]);

  // Pull a fresh roster whenever the modal opens or the selected event changes.
  useEffect(() => {
    if (isOpen && selectedEventId) {
      onRefreshAttendees?.(selectedEventId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedEventId]);

  if (!isOpen) return null;

  const playBeep = (isSuccess: boolean) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (isSuccess) {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else {
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.setValueAtTime(220, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch {
      // AudioContext not available
    }
  };

  const handleProcessCode = async (code: string) => {
    if (!code.trim() || !activeEvent || isVerifying) return;
    setIsVerifying(true);

    const parsed = parsePassQrPayload(code);
    if (parsed) {
      try {
        const result = await validatePassApi(parsed.passId, parsed.token);
        const msg = (result.message || '').toUpperCase();
        if (result.valid) {
          playBeep(true);
          setScanStatus({
            type: 'success',
            message: result.message || `Checked in pass ${parsed.passId.slice(0, 8)}…`,
            attendee: {
              id: parsed.passId,
              name: 'Ticket Holder',
              email: '',
              ticketCode: parsed.passId,
              bookingId: `#${parsed.passId.slice(0, 8).toUpperCase()}`,
              tierName: 'Pass',
              seat: `PASS-${parsed.passId.slice(0, 4).toUpperCase()}`,
              checkedIn: true,
              checkInTime: 'Just now',
              purchaseDate: new Date().toISOString(),
              pricePaid: 0,
            },
          });
          onRefreshAttendees?.(activeEvent.id);
        } else if (msg.includes('ALREADY') || msg.includes('CHECKED')) {
          playBeep(false);
          setScanStatus({
            type: 'already',
            message: result.message || 'Pass already checked in',
          });
        } else {
          playBeep(false);
          setScanStatus({
            type: 'invalid',
            message: result.message || 'Invalid or expired token',
          });
        }
        setManualCode('');
        setIsVerifying(false);
        return;
      } catch (err) {
        playBeep(false);
        setScanStatus({
          type: 'invalid',
          message: err instanceof Error ? err.message : 'Validate API failed',
        });
        setIsVerifying(false);
        return;
      }
    }

    // Fall back to matching a real roster entry (from GET /events/{id}/attendees) by
    // passId / booking code / name, then hit the manual desk check-in endpoint.
    const trimmed = code.trim().toUpperCase();
    const found = activeEvent.attendees.find(
      (a) =>
        a.ticketCode.toUpperCase() === trimmed ||
        a.bookingId.toUpperCase() === trimmed ||
        a.id.toUpperCase() === trimmed ||
        a.name.toUpperCase().includes(trimmed),
    );

    if (!found) {
      playBeep(false);
      setScanStatus({
        type: 'invalid',
        message: 'Paste SNAPTIX|passId|token from the live QR, or a roster passId/booking code.',
      });
      setIsVerifying(false);
      return;
    }

    const res = await onCheckIn(activeEvent.id, found.id);
    if (res.success) {
      playBeep(true);
      setScanStatus({ type: 'success', message: res.message, attendee: res.attendee || found });
    } else {
      playBeep(false);
      setScanStatus({
        type: res.message.includes('ALREADY') ? 'already' : 'invalid',
        message: res.message,
        attendee: res.attendee || found,
      });
    }
    setManualCode('');
    setIsVerifying(false);
  };

  const handleCheckInNextPending = () => {
    if (!activeEvent) return;
    const pending = activeEvent.attendees.find((a) => !a.checkedIn);
    if (pending) {
      void handleProcessCode(pending.id);
    } else {
      setScanStatus({
        type: 'invalid',
        message:
          activeEvent.attendees.length > 0
            ? 'Everyone on the roster is already checked in.'
            : 'No roster attendees yet — paste a live SNAPTIX|passId|token instead.',
      });
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        >
          <div className="p-4 border-b border-[#edeef0] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[#6C2BD9]">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-[#1a1c1d]">Live Gate Scanner</h3>
                <p className="text-[10px] text-[#7b7486]">Validates rotating SNAPTIX QR tokens</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="w-8 h-8 rounded-full bg-[#f3f3f5] flex items-center justify-center text-[#4a4455] hover:text-[#6C2BD9]"
                title="Toggle Beep Sound"
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4 text-red-500" />
                )}
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#f3f3f5] flex items-center justify-center text-[#4a4455] hover:bg-[#edeef0]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-3 bg-[#f9f9fb] border-b border-[#edeef0] flex items-center gap-2 text-xs">
            <span className="font-bold text-[#7b7486] text-[11px] whitespace-nowrap">Event:</span>
            <select
              value={selectedEventId}
              onChange={(e) => {
                setSelectedEventId(e.target.value);
                setScanStatus({ type: null, message: '' });
              }}
              className="w-full bg-white border border-[#ccc3d7]/50 rounded-xl px-2.5 py-1.5 font-heading font-bold text-xs text-[#1a1c1d] outline-none truncate"
            >
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.title}
                </option>
              ))}
            </select>
          </div>

          <div className="p-5 flex flex-col items-center justify-center space-y-4">
            <div className="relative w-64 h-64 bg-slate-950 rounded-3xl overflow-hidden border-4 border-purple-900/40 shadow-inner flex items-center justify-center">
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#6C2BD9] rounded-tl-lg" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#6C2BD9] rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#6C2BD9] rounded-bl-lg" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#6C2BD9] rounded-br-lg" />

              <motion.div
                animate={{ y: [-90, 90, -90] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
                className="absolute left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-[#6C2BD9] to-transparent shadow-[0_0_12px_#6C2BD9]"
              />

              <div className="text-center text-white/50 space-y-1 pointer-events-none">
                <Camera className="w-8 h-8 mx-auto opacity-40 animate-pulse" />
                <p className="text-[10px] font-mono tracking-widest uppercase">
                  {isVerifying ? 'Verifying…' : 'Scanner Active'}
                </p>
              </div>

              <AnimatePresence>
                {scanStatus.type && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className={`absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white ${
                      scanStatus.type === 'success'
                        ? 'bg-emerald-600/95'
                        : scanStatus.type === 'already'
                          ? 'bg-amber-600/95'
                          : 'bg-red-600/95'
                    }`}
                  >
                    {scanStatus.type === 'success' ? (
                      <CheckCircle className="w-12 h-12 mb-2 animate-bounce" />
                    ) : (
                      <AlertCircle className="w-12 h-12 mb-2 animate-pulse" />
                    )}
                    <p className="font-heading font-bold text-sm leading-tight">
                      {scanStatus.type === 'success'
                        ? 'ACCESS GRANTED'
                        : scanStatus.type === 'already'
                          ? 'ALREADY SCANNED'
                          : 'INVALID TICKET'}
                    </p>
                    <p className="text-[11px] opacity-90 mt-1 max-w-[200px]">{scanStatus.message}</p>

                    {scanStatus.attendee && (
                      <div className="mt-2 pt-2 border-t border-white/20 text-[10px] text-white/90">
                        <span className="font-bold">{scanStatus.attendee.tierName}</span> •{' '}
                        <span>{scanStatus.attendee.seat}</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={handleCheckInNextPending}
              disabled={isVerifying}
              className="w-full py-2.5 bg-purple-50 hover:bg-purple-100 text-[#6C2BD9] font-heading font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-purple-200 transition-colors disabled:opacity-60"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Check In Next Pending Attendee</span>
            </button>

            <div className="w-full space-y-1.5 pt-1">
              <label className="text-[11px] font-bold text-[#7b7486] block">
                Paste live QR payload (SNAPTIX|passId|token):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && void handleProcessCode(manualCode)}
                  placeholder="SNAPTIX|uuid|123456"
                  className="flex-1 h-10 px-3 bg-[#f9f9fb] border border-[#ccc3d7]/50 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-[#6C2BD9]"
                />
                <button
                  onClick={() => void handleProcessCode(manualCode)}
                  disabled={isVerifying}
                  className="px-4 bg-[#6C2BD9] text-white font-heading font-bold text-xs rounded-xl hover:bg-purple-700 active:scale-95 transition-all disabled:opacity-60"
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
