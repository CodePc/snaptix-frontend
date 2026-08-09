import React, { useState } from 'react';
import {
  MapPin,
  Pencil,
  Sparkles,
  Heart,
  CreditCard,
  Settings,
  LogOut,
  ChevronRight,
  QrCode,
  Wallet,
  Check,
  ShieldCheck,
  Plus,
  Trash2,
  X,
  Briefcase,
  ArrowRight,
  TrendingUp,
  Image as ImageIcon,
  Eye,
  Download,
} from 'lucide-react';
import { UserProfile, Ticket, ActiveTab } from '../types';
import { TicketPassModal } from './TicketPassModal';
import { motion, AnimatePresence } from 'motion/react';
import accountScreenDesignImg from '../assets/images/account_screen_design_1786065291159.jpg';

interface ProfileViewProps {
  user: UserProfile;
  tickets: Ticket[];
  onNavigateTab: (tab: ActiveTab) => void;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onSignOut?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  tickets,
  onNavigateTab,
  onUpdateUser,
  onSignOut,
}) => {

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [showInterestsModal, setShowInterestsModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);
  const [showStitchDesignModal, setShowStitchDesignModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [walletConnecting, setWalletConnecting] = useState<boolean>(false);

  const upcomingTickets = tickets.filter((t) => t.status === 'upcoming');

  const allAvailableInterests = [
    'Electronic Music',
    'Tech Conferences',
    'Modern Art',
    'Jazz & Soul',
    'Food & Dining',
    'Live Sports',
    'Indie Cinema',
    'Design Workshops',
    'Nightlife & Raves',
    'Gaming & Esports',
  ];

  const handleToggleInterest = (interest: string) => {
    const current = user.interests || [];
    const updated = current.includes(interest)
      ? current.filter((i) => i !== interest)
      : [...current, interest];
    onUpdateUser({ interests: updated });
  };

  const handleToggleDigitalPay = (methodName: string) => {
    onUpdateUser({
      paymentMethods: [
        ...user.paymentMethods,
        {
          id: `pm-${Date.now()}`,
          type: 'card',
          label: methodName,
          isDefault: false,
        },
      ],
    });
    showToast(`${methodName} linked successfully!`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <main id="profile-view-container" className="space-y-6 pb-28 px-4 pt-2">
      {/* User Header Profile */}
      <section className="flex flex-col items-center text-center pt-2">
        <div className="relative mb-3">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl shadow-purple-900/10 ring-4 ring-purple-100">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={() => {
              const newName = prompt('Enter your name:', user.name);
              if (newName) onUpdateUser({ name: newName });
            }}
            className="absolute bottom-0 right-0 w-8 h-8 bg-[#6C2BD9] text-white rounded-full flex items-center justify-center border-2 border-white shadow-md active:scale-90 transition-transform"
            aria-label="Edit Profile"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>

        <h2 className="font-heading text-2xl font-bold text-[#1a1c1d]">
          {user.name}
        </h2>
        <div className="flex items-center gap-1 text-xs text-[#7b7486] font-medium mt-0.5">
          <MapPin className="w-3.5 h-3.5 text-[#6C2BD9]" />
          <span>{user.location}</span>
        </div>
      </section>

      {/* Bento Stats Grid */}
      <section className="grid grid-cols-2 gap-3">
        <div
          onClick={() => onNavigateTab('tickets')}
          className="bg-white p-4 rounded-3xl border border-[#ccc3d7]/30 shadow-xs cursor-pointer hover:border-[#6C2BD9]/40 transition-all space-y-2"
        >
          <span className="text-xs text-[#7b7486] font-medium block">
            Upcoming Events
          </span>
          <span className="font-heading text-xl font-bold text-[#6C2BD9] block">
            {upcomingTickets.length} Active
          </span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-[#ccc3d7]/30 shadow-xs space-y-2">
          <span className="text-xs text-[#7b7486] font-medium block">
            Reward Points
          </span>
          <span className="font-heading text-xl font-bold text-[#F5A524] block">
            {user.rewardPoints.toLocaleString()} pts
          </span>
        </div>
      </section>

      {/* My Tickets Horizontal Preview */}
      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-heading font-bold text-lg text-[#1a1c1d]">
            My Tickets
          </h3>
          <button
            onClick={() => onNavigateTab('tickets')}
            className="text-xs font-heading font-bold uppercase tracking-wider text-[#6C2BD9] hover:underline"
          >
            View All
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto hide-scrollbar snap-x pb-1">
          {tickets.slice(0, 3).map((tkt) => {
            const isUpcoming = tkt.status === 'upcoming';
            return (
              <div
                key={tkt.id}
                onClick={() => setSelectedTicket(tkt)}
                className={`min-w-[270px] rounded-3xl p-4 snap-center relative overflow-hidden cursor-pointer transition-transform active:scale-95 shadow-sm ${
                  isUpcoming
                    ? 'bg-[#6C2BD9] text-white shadow-purple-600/20'
                    : 'bg-white text-[#1a1c1d] border border-[#ccc3d7]/40'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span
                      className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full inline-block ${
                        isUpcoming ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {tkt.statusLabel}
                    </span>
                    <h4 className="font-heading font-bold text-base mt-1 truncate max-w-[170px]">
                      {tkt.eventTitle}
                    </h4>
                  </div>
                  <div
                    className={`p-1.5 rounded-xl ${
                      isUpcoming ? 'bg-white text-slate-900' : 'bg-purple-50 text-[#6C2BD9]'
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                  </div>
                </div>

                <div
                  className={`flex justify-between items-end border-t pt-3 text-xs ${
                    isUpcoming ? 'border-white/20 text-white/90' : 'border-[#edeef0] text-[#7b7486]'
                  }`}
                >
                  <div>
                    <p className="text-[10px] opacity-70">Date</p>
                    <p className="font-bold">{tkt.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] opacity-70">Seat</p>
                    <p className="font-bold">{tkt.seat}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Menu Options Card */}
      <section className="bg-white rounded-3xl border border-[#ccc3d7]/30 shadow-xs overflow-hidden">
        {/* Interests */}
        <button
          onClick={() => setShowInterestsModal(true)}
          className="w-full flex items-center justify-between p-4 hover:bg-[#f9f9fb] transition-colors group text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-[#6C2BD9]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="font-heading font-bold text-sm text-[#1a1c1d]">
                Interests & Preferences
              </p>
              <p className="text-xs text-[#7b7486]">
                {user.interests.length} topics selected
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#ccc3d7] group-hover:translate-x-0.5 transition-transform" />
        </button>

        <div className="mx-4 border-t border-[#edeef0]" />

        {/* Saved Events Shortcut */}
        <button
          onClick={() => onNavigateTab('saved')}
          className="w-full flex items-center justify-between p-4 hover:bg-[#f9f9fb] transition-colors group text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <p className="font-heading font-bold text-sm text-[#1a1c1d]">
                Saved Events
              </p>
              <p className="text-xs text-[#7b7486]">Bookmarked event list</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#ccc3d7] group-hover:translate-x-0.5 transition-transform" />
        </button>

        <div className="mx-4 border-t border-[#edeef0]" />

        {/* Payment Methods */}
        <button
          onClick={() => setShowPaymentModal(true)}
          className="w-full flex items-center justify-between p-4 hover:bg-[#f9f9fb] transition-colors group text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="font-heading font-bold text-sm text-[#1a1c1d]">
                Payment Methods
              </p>
              <p className="text-xs text-[#7b7486]">
                Cards, Apple Pay & Web3 Wallet
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#ccc3d7] group-hover:translate-x-0.5 transition-transform" />
        </button>

        <div className="mx-4 border-t border-[#edeef0]" />

        {/* Settings */}
        <button
          onClick={() => setShowSettingsModal(true)}
          className="w-full flex items-center justify-between p-4 hover:bg-[#f9f9fb] transition-colors group text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#f3f3f5] flex items-center justify-center text-[#4a4455]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <p className="font-heading font-bold text-sm text-[#1a1c1d]">
                Settings
              </p>
              <p className="text-xs text-[#7b7486]">Notifications & location</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#ccc3d7] group-hover:translate-x-0.5 transition-transform" />
        </button>

        <div className="mx-4 border-t border-[#edeef0]" />

        {/* Stitch Screen Design Mockup Preview */}
        <button
          onClick={() => setShowStitchDesignModal(true)}
          className="w-full flex items-center justify-between p-4 hover:bg-purple-50/50 transition-colors group text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-[#6C2BD9] to-[#9333ea] flex items-center justify-center text-white shadow-xs">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-heading font-bold text-sm text-[#1a1c1d]">
                  Stitched Screen Design
                </p>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-[#6C2BD9] px-2 py-0.5 rounded-full">
                  Design Stitch
                </span>
              </div>
              <p className="text-xs text-[#7b7486]">
                High-fidelity full UI design mockup
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#6C2BD9]">
            <span>View</span>
            <ChevronRight className="w-4 h-4 text-[#6C2BD9] group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      </section>

      {/* Logout Button */}
      <button
        onClick={() => setShowLogoutConfirm(true)}
        className="w-full py-4 text-[#E5484D] font-heading font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-50 rounded-2xl transition-colors active:scale-95"
      >
        <LogOut className="w-4 h-4" />
        <span>Logout Account</span>
      </button>

      {/* Ticket Pass Modal */}
      <TicketPassModal
        ticket={selectedTicket}
        isOpen={Boolean(selectedTicket)}
        onClose={() => setSelectedTicket(null)}
      />

      {/* Payment Methods Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-[#edeef0] pb-3">
                <h3 className="font-heading font-bold text-lg text-[#1a1c1d]">
                  Payment Methods
                </h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="w-8 h-8 rounded-full bg-[#f3f3f5] flex items-center justify-center text-[#4a4455]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {user.paymentMethods.map((pm) => (
                  <div
                    key={pm.id}
                    className="p-3.5 rounded-2xl border border-[#ccc3d7]/40 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-[#6C2BD9]" />
                      <div>
                        <p className="text-xs font-bold text-[#1a1c1d]">{pm.label}</p>
                        {pm.isDefault && (
                          <span className="text-[10px] text-emerald-600 font-bold">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Apple Pay & Google Pay Fast Checkout Section */}
                <div className="p-4 rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-[#6C2BD9]" />
                      <span className="font-heading font-bold text-xs text-[#1a1c1d]">
                        Digital Wallets (Apple Pay & Google Pay)
                      </span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> Ready
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => handleToggleDigitalPay('Apple Pay')}
                      className="py-2.5 px-3 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Link Apple Pay</span>
                    </button>
                    <button
                      onClick={() => handleToggleDigitalPay('Google Pay')}
                      className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-[#4285F4]" />
                      <span>Link Google Pay</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interests Modal */}
      <AnimatePresence>
        {showInterestsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-[#edeef0] pb-3">
                <div>
                  <h3 className="font-heading font-bold text-lg text-[#1a1c1d]">
                    Your Interests
                  </h3>
                  <p className="text-xs text-[#7b7486]">
                    Select categories to personalize your feed
                  </p>
                </div>
                <button
                  onClick={() => setShowInterestsModal(false)}
                  className="w-8 h-8 rounded-full bg-[#f3f3f5] flex items-center justify-center text-[#4a4455]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {allAvailableInterests.map((interest) => {
                  const isSelected = user.interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      onClick={() => handleToggleInterest(interest)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#6C2BD9] text-white shadow-sm'
                          : 'bg-[#f3f3f5] text-[#4a4455] hover:bg-[#edeef0]'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>{interest}</span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  setShowInterestsModal(false);
                  showToast('Interests updated!');
                }}
                className="w-full py-3 bg-[#6C2BD9] text-white rounded-xl font-heading font-bold text-xs shadow-md mt-4"
              >
                Save Preferences
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-[#edeef0] pb-3">
                <h3 className="font-heading font-bold text-lg text-[#1a1c1d]">
                  App Settings
                </h3>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="w-8 h-8 rounded-full bg-[#f3f3f5] flex items-center justify-center text-[#4a4455]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 bg-[#f9f9fb] rounded-2xl">
                  <div>
                    <p className="font-bold text-[#1a1c1d]">Event Push Notifications</p>
                    <p className="text-[11px] text-[#7b7486]">Get reminders 2h before doors open</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 accent-[#6C2BD9] rounded"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-[#f9f9fb] rounded-2xl">
                  <div>
                    <p className="font-bold text-[#1a1c1d]">Location Services</p>
                    <p className="text-[11px] text-[#7b7486]">Show events within your current city</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 accent-[#6C2BD9] rounded"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-[#f9f9fb] rounded-2xl">
                  <div>
                    <p className="font-bold text-[#1a1c1d]">Default Currency</p>
                    <p className="text-[11px] text-[#7b7486]">USD ($)</p>
                  </div>
                  <span className="font-bold text-[#6C2BD9]">USD</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  showToast('Settings saved!');
                }}
                className="w-full py-3 bg-[#6C2BD9] text-white rounded-xl font-heading font-bold text-xs shadow-md mt-4"
              >
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Stitched Screen Design Modal */}
      <AnimatePresence>
        {showStitchDesignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 12 }}
              className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] flex flex-col"
            >
              <div className="flex justify-between items-center border-b border-[#edeef0] pb-3 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#6C2BD9] flex items-center justify-center">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base text-[#1a1c1d]">
                      Stitched Screen Design
                    </h3>
                    <p className="text-[11px] text-[#7b7486]">
                      Account & Profile Screen UI Breakdown
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowStitchDesignModal(false)}
                  className="p-2 rounded-full hover:bg-slate-100 text-[#7b7486]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Design Image Canvas */}
              <div className="relative overflow-y-auto rounded-2xl bg-slate-950 border border-slate-800 p-2 sm:p-3 flex items-center justify-center group">
                <img
                  src={accountScreenDesignImg}
                  alt="Snaptix Account Screen Stitched Design"
                  referrerPolicy="no-referrer"
                  className="w-full max-h-[50vh] object-contain rounded-xl shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 pointer-events-none">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>Stitched Hi-Fi UI Mockup</span>
                </div>
              </div>

              {/* UI Specs & Key Sections Breakdown */}
              <div className="space-y-2 text-xs overflow-y-auto max-h-36 pr-1 shrink-0">
                <p className="font-heading font-bold text-[11px] uppercase tracking-wider text-[#7b7486]">
                  Stitched Architecture Modules
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-[#f9f9fb] rounded-xl border border-[#edeef0]">
                    <span className="font-bold text-[#6C2BD9]">1. Profile & Badge</span>
                    <p className="text-[#7b7486] text-[10px] mt-0.5">Attendee identity, avatar & verified badge</p>
                  </div>
                  <div className="p-2 bg-[#f9f9fb] rounded-xl border border-[#edeef0]">
                    <span className="font-bold text-[#6C2BD9]">2. Loyalty Fan Pass</span>
                    <p className="text-[#7b7486] text-[10px] mt-0.5">2,450 points, VIP progression & perks</p>
                  </div>
                  <div className="p-2 bg-[#f9f9fb] rounded-xl border border-[#edeef0]">
                    <span className="font-bold text-[#6C2BD9]">3. Organiser Portal</span>
                    <p className="text-[#7b7486] text-[10px] mt-0.5">Instant role switcher & real-time revenue</p>
                  </div>
                  <div className="p-2 bg-[#f9f9fb] rounded-xl border border-[#edeef0]">
                    <span className="font-bold text-[#6C2BD9]">4. Dynamic Pass Hub</span>
                    <p className="text-[#7b7486] text-[10px] mt-0.5">Dynamic QR ticket stub carousel</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-1 shrink-0">
                <a
                  href={accountScreenDesignImg}
                  download="snaptix_account_screen_stitch_design.jpg"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 rounded-xl border border-[#ccc3d7]/50 text-xs font-bold text-[#4a4455] flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Stitched Image</span>
                </a>
                <button
                  onClick={() => setShowStitchDesignModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#6C2BD9] text-white text-xs font-bold shadow-md hover:bg-[#5b22b8] transition-colors"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-white rounded-3xl p-6 text-center space-y-4 shadow-2xl"
            >
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
                <LogOut className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-[#1a1c1d]">
                  Log out of Snaptix?
                </h3>
                <p className="text-xs text-[#7b7486] mt-1">
                  You can log back in anytime to access your booked tickets and saved events.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="py-2.5 rounded-xl border border-[#ccc3d7]/50 text-xs font-bold text-[#4a4455]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    showToast('Logged out of Explorer account');
                    if (onSignOut) {
                      setTimeout(onSignOut, 300);
                    }
                  }}
                  className="py-2.5 rounded-xl bg-[#E5484D] text-white text-xs font-bold shadow-md shadow-red-500/20 active:scale-95 transition-transform"
                >
                  Log Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl z-50 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </main>
  );
};
