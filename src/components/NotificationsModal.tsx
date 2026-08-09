import React from 'react';
import { X, Bell, Ticket, Gift, Sparkles, CheckCheck } from 'lucide-react';
import { AppNotification } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationsModalProps {
  isOpen: boolean;
  notifications: AppNotification[];
  onClose: () => void;
  onMarkAllRead: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  notifications,
  onClose,
  onMarkAllRead,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4 shadow-2xl"
        >
          <div className="flex justify-between items-center border-b border-[#edeef0] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[#6C2BD9]">
                <Bell className="w-4 h-4" />
              </div>
              <h3 className="font-heading font-bold text-lg text-[#1a1c1d]">
                Notifications
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#f3f3f5] flex items-center justify-center text-[#4a4455] hover:bg-[#edeef0]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5 max-h-[60vh] overflow-y-auto hide-scrollbar">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  notif.isRead
                    ? 'bg-white border-[#edeef0] text-[#7b7486]'
                    : 'bg-purple-50/60 border-purple-200 text-[#1a1c1d]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      notif.type === 'ticket'
                        ? 'bg-purple-100 text-[#6C2BD9]'
                        : notif.type === 'reward'
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    {notif.type === 'ticket' ? (
                      <Ticket className="w-4 h-4" />
                    ) : notif.type === 'reward' ? (
                      <Gift className="w-4 h-4" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 space-y-0.5 text-xs">
                    <p className="font-heading font-bold text-[#1a1c1d]">
                      {notif.title}
                    </p>
                    <p className="text-[11px] text-[#7b7486] leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-[#ccc3d7] font-medium block pt-1">
                      {notif.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onMarkAllRead}
            className="w-full py-2.5 bg-[#f3f3f5] hover:bg-[#edeef0] text-xs font-bold text-[#4a4455] rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-[#6C2BD9]" />
            <span>Mark all as read</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
