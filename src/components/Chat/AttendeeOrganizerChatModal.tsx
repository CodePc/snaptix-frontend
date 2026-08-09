import React, { useState } from 'react';
import {
  X,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCheck,
  Ticket as TicketIcon,
  Clock,
  MapPin,
  HelpCircle,
  Check,
  MessageSquare,
} from 'lucide-react';
import { ChatThread, ChatMessage, Ticket, EventItem } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface AttendeeOrganizerChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket?: Ticket | null;
  event?: EventItem | null;
  activeThread?: ChatThread | null;
  onSendMessage: (threadId: string, text: string, sender: 'attendee' | 'organizer') => void;
}

export const AttendeeOrganizerChatModal: React.FC<AttendeeOrganizerChatModalProps> = ({
  isOpen,
  onClose,
  ticket,
  event,
  activeThread,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [isTypingSimulated, setIsTypingSimulated] = useState<boolean>(false);

  if (!isOpen) return null;

  const eventTitle = ticket?.eventTitle || event?.title || activeThread?.eventTitle || 'Event Support';
  const organizerName = event?.organizer?.name || 'Apex Host Team';
  const organizerAvatar =
    event?.organizer?.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop';

  const threadId = activeThread?.id || (ticket ? `thread-${ticket.id}` : `thread-${event?.id || 'general'}`);
  const messages: ChatMessage[] = activeThread?.messages || [
    {
      id: 'welcome-msg',
      threadId,
      sender: 'organizer',
      senderName: organizerName,
      text: `Hello! Thanks for reaching out regarding ${eventTitle}. How can our venue host team assist you today?`,
      timestamp: 'Just now',
      isRead: true,
    },
  ];

  const quickQuestions = [
    'What time do gates open?',
    'Where is VIP / fast-track entry?',
    'Is parking available on-site?',
    'Can I transfer my pass to a friend?',
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    onSendMessage(threadId, text.trim(), 'attendee');
    setInputText('');

    // Simulate friendly organizer assistant typing response if first inquiry
    if (messages.length <= 2) {
      setIsTypingSimulated(true);
      setTimeout(() => {
        setIsTypingSimulated(false);
        onSendMessage(
          threadId,
          `Thank you for your question! Our on-ground venue operations team at ${event?.venue || 'the venue'} has received your ticket note. Doors open promptly and contactless barcode scanning will be ready at all gates.`,
          'organizer'
        );
      }, 1500);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 16 }}
          className="w-full max-w-lg bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col h-[600px] max-h-[90vh] border border-[#ccc3d7]/50"
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#1a1c1d] to-[#6C2BD9] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={organizerAvatar}
                  alt={organizerName}
                  className="w-10 h-10 rounded-2xl object-cover border border-white/20"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-[#1a1c1d] rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-heading font-bold text-sm text-white leading-tight">
                    {organizerName}
                  </h3>
                  <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[9px] font-bold rounded-full border border-emerald-400/30 flex items-center gap-0.5">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    <span>Verified Host</span>
                  </span>
                </div>
                <p className="text-[11px] text-purple-200 truncate max-w-[220px]">
                  {eventTitle}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 active:scale-90 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Verified Ticket Context Ribbon */}
          {ticket && (
            <div className="px-4 py-2 bg-purple-50/80 border-b border-purple-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#6C2BD9]">
                <TicketIcon className="w-4 h-4" />
                <span className="font-mono font-bold">{ticket.bookingId}</span>
                <span className="text-[#4a4455]">• {ticket.tierName} ({ticket.seat})</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                Pass Verified
              </span>
            </div>
          )}

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f9f9fb] hide-scrollbar">
            {messages.map((msg) => {
              const isAttendee = msg.sender === 'attendee';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAttendee ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-end gap-1.5 max-w-[85%]">
                    {!isAttendee && (
                      <img
                        src={organizerAvatar}
                        alt="Organizer"
                        className="w-6 h-6 rounded-full object-cover mb-1"
                      />
                    )}

                    <div
                      className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                        isAttendee
                          ? 'bg-[#6C2BD9] text-white rounded-br-none shadow-xs'
                          : 'bg-white text-[#1a1c1d] rounded-bl-none border border-[#ccc3d7]/40 shadow-xs'
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      <div
                        className={`flex items-center justify-end gap-1 text-[9px] ${
                          isAttendee ? 'text-purple-200' : 'text-[#7b7486]'
                        }`}
                      >
                        <span>{msg.timestamp}</span>
                        {isAttendee && <CheckCheck className="w-3 h-3 text-emerald-300" />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {isTypingSimulated && (
              <div className="flex items-center gap-2 text-xs text-[#7b7486] italic pl-2">
                <span className="w-2 h-2 rounded-full bg-[#6C2BD9] animate-ping" />
                <span>Host team is typing...</span>
              </div>
            )}
          </div>

          {/* Quick Suggestions */}
          <div className="px-3 py-2 bg-white border-t border-[#ccc3d7]/30 flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
            <span className="text-[10px] font-bold text-[#7b7486] uppercase tracking-wider flex-shrink-0">
              Quick:
            </span>
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="px-2.5 py-1 bg-[#f3f3f5] hover:bg-purple-50 text-[#4a4455] hover:text-[#6C2BD9] rounded-lg text-[11px] font-medium whitespace-nowrap border border-transparent hover:border-purple-200 transition-all flex-shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-[#ccc3d7]/40 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your question to the event organizer..."
              className="flex-1 h-11 px-4 bg-[#f9f9fb] border border-[#ccc3d7]/50 rounded-2xl text-xs text-[#1a1c1d] focus:ring-2 focus:ring-[#6C2BD9] outline-none"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-11 h-11 bg-[#6C2BD9] disabled:bg-slate-300 text-white rounded-2xl flex items-center justify-center shadow-md hover:bg-purple-700 active:scale-95 transition-all flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
