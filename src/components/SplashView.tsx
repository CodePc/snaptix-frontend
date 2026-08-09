import React, { useState } from 'react';
import {
  Ticket,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  User,
  Briefcase,
  QrCode,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  Zap,
  CheckCircle2,
  Lock,
  ChevronRight,
  Sliders,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole } from '../types';

interface SplashViewProps {
  onComplete: () => void;
  onDirectRoleSelect?: (role: UserRole) => void;
}

interface SlideItem {
  id: string;
  pillar: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  icon: React.ElementType;
  renderPreview: () => React.ReactNode;
}

export const SplashView: React.FC<SplashViewProps> = ({ onComplete, onDirectRoleSelect }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const slides: SlideItem[] = [
    {
      id: 'slide-qr-passes',
      pillar: 'Dynamic Passes',
      title: 'Rotating Anti-Screenshot Passes',
      subtitle:
        'Anti-counterfeit barcodes cycle automatically every 15 seconds to eliminate gate fraud, duplicate barcodes, and secondary screenshot scalping.',
      badge: 'Anti-Counterfeit Key',
      badgeColor: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30',
      icon: QrCode,
      renderPreview: () => (
        <div className="relative w-full max-w-sm bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl text-white space-y-5 mx-auto">
          {/* Ticket Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-600/30 flex items-center justify-center border border-purple-400/30">
                <Ticket className="w-5 h-5 text-purple-300 -rotate-12" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-extrabold text-white tracking-wide">Neon Horizons 2024</h4>
                <p className="text-xs text-purple-200/80">VIP Front Row • Gate A Entrance</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 rounded-full text-[10px] font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ACTIVE PASS
            </span>
          </div>

          {/* Dynamic Rotating Barcode Stage */}
          <div className="p-6 bg-white rounded-2xl flex flex-col items-center justify-center shadow-inner space-y-3">
            <div className="relative w-36 h-36 bg-slate-950 rounded-xl p-3 flex items-center justify-center overflow-hidden border border-slate-800">
              <div className="w-full h-full border border-dashed border-purple-500/40 rounded-lg flex items-center justify-center relative">
                <QrCode className="w-28 h-28 text-purple-300" />
                <motion.div
                  animate={{ y: [-48, 48, -48] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                  className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#34d399]"
                />
              </div>
            </div>

            {/* Rotation Countdown */}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 bg-purple-100 px-3.5 py-1.5 rounded-full">
              <RefreshCw className="w-3.5 h-3.5 text-[#6C2BD9] animate-spin" style={{ animationDuration: '4s' }} />
              <span>Rotates code in 0:14s</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300/80 pt-1 border-t border-white/10">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" /> Hardware Encrypted
            </span>
            <span className="font-mono font-bold text-white tracking-wider bg-white/10 px-2 py-0.5 rounded">
              SEC-9921-X
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'slide-resale-market',
      pillar: 'Fair Resale',
      title: 'Verified Fair-Trade Resale',
      subtitle:
        'Plans changed? List spare tickets securely at capped face value. Automatic escrow payments with instant 1-click transfer to verified fans.',
      badge: '100% Capped Protection',
      badgeColor: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
      icon: ShieldCheck,
      renderPreview: () => (
        <div className="relative w-full max-w-sm bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl text-white space-y-5 mx-auto">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-400/30">
                <ShieldCheck className="w-5 h-5 text-amber-300" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-extrabold text-white">Escrow Fan Resale</h4>
                <p className="text-xs text-amber-200/80">Zero-Scalping Verified Hub</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-[10px] font-bold">
              VERIFIED
            </span>
          </div>

          {/* Resale Price Guarantee Box */}
          <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-4 space-y-3 text-left">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Original Face Value</span>
              <span className="font-bold text-slate-400 line-through">$89.00</span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-emerald-400">Fair Resale Cap</span>
              <span className="text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-lg border border-emerald-400/30">
                $89.00 (Standard)
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-200 pt-2 border-t border-white/10">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Direct payout wire upon door scan</span>
            </div>
          </div>

          <div className="p-3 bg-purple-500/10 border border-purple-400/20 rounded-xl text-xs text-purple-200 text-center font-semibold">
            ⚡ 5% Royalty automatically split with the Host
          </div>
        </div>
      ),
    },
    {
      id: 'slide-organizer-hub',
      pillar: 'Organiser Studio',
      title: 'Pro Organiser Command Studio',
      subtitle:
        'Manage tiered capacity, scan attendee barcodes at gate doors in 0.2 seconds, track real-time revenue analytics, and process direct bank payouts.',
      badge: 'Host Command Center',
      badgeColor: 'bg-purple-400/20 text-purple-300 border-purple-400/30',
      icon: TrendingUp,
      renderPreview: () => (
        <div className="relative w-full max-w-sm bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl text-white space-y-5 mx-auto">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 flex items-center justify-center border border-purple-400/30">
                <Briefcase className="w-5 h-5 text-purple-300" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-extrabold text-white">Apex Live Studio</h4>
                <p className="text-xs text-purple-200/80">Real-Time Gate Dashboard</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-purple-400/20 text-purple-300 border border-purple-400/30 rounded-full text-[10px] font-bold">
              PRO HOST
            </span>
          </div>

          {/* Realtime Performance Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-white/10 text-center">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Doors Scanned</p>
              <p className="text-xl font-extrabold text-white mt-1">
                842 <span className="text-xs font-semibold text-emerald-400">/ 1,000</span>
              </p>
            </div>
            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-white/10 text-center">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Gross Sales</p>
              <p className="text-xl font-extrabold text-emerald-400 mt-1">$74,850</p>
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-white/10 flex items-center gap-3 text-left">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-400/30">
              <Zap className="w-4 h-4" />
            </div>
            <div className="text-xs leading-tight">
              <p className="font-bold text-white">Ultra-Fast Gate Scanner</p>
              <p className="text-slate-400 text-[11px]">0.2s offline-ready camera validation</p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    } else {
      if (onDirectRoleSelect) {
        onDirectRoleSelect('attendee');
      } else {
        onComplete();
      }
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const currentSlide = slides[currentSlideIndex];

  return (
    <main
      id="splash-screen-container"
      className="relative min-h-screen w-full flex flex-col justify-between p-4 sm:p-8 md:p-12 overflow-hidden select-none bg-[#0B0F17] text-white"
    >
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-[36rem] h-[36rem] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[36rem] h-[36rem] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between pt-2 pb-6 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-lg">
            <Ticket className="w-5 h-5 -rotate-12" />
          </div>
          <div>
            <span className="font-heading font-extrabold text-xl tracking-tight text-white">Snaptix</span>
            <span className="text-[10px] block text-purple-300 font-bold uppercase tracking-wider -mt-0.5">
              Live Event Ecosystem
            </span>
          </div>
        </div>

        {/* Direct Skip Button */}
        <button
          type="button"
          onClick={() => {
            if (onDirectRoleSelect) {
              onDirectRoleSelect('attendee');
            } else {
              onComplete();
            }
          }}
          className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-heading font-bold text-white transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
        >
          <span>Skip to App</span>
          <ArrowRight className="w-3.5 h-3.5 text-purple-300" />
        </button>
      </header>

      {/* Main Feature Showcase Workspace */}
      <section className="w-full max-w-5xl mx-auto my-auto py-4 z-10 space-y-6">
        {/* Pillar Switcher Navigation Bar */}
        <div className="flex items-center justify-center gap-2 max-w-md mx-auto p-1.5 bg-slate-900/90 border border-white/10 rounded-2xl backdrop-blur-md">
          {slides.map((slide, idx) => {
            const isActive = currentSlideIndex === idx;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentSlideIndex(idx)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {slide.pillar}
              </button>
            );
          })}
        </div>

        {/* Feature Stage Grid */}
        <div className="grid md:grid-cols-12 gap-8 items-center bg-slate-900/40 border border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-xl">
          {/* Interactive Feature Visual Preview (Left) */}
          <div className="md:col-span-6 flex justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.id}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="w-full"
              >
                {currentSlide.renderPreview()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Feature Narrative & Details (Right) */}
          <div className="md:col-span-6 flex flex-col items-start text-left space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.id + '-text'}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="space-y-3"
              >
                <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-heading font-extrabold uppercase tracking-wider border ${currentSlide.badgeColor}`}>
                  {currentSlide.badge}
                </span>

                <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-snug">
                  {currentSlide.title}
                </h1>

                <p className="text-sm text-slate-300 leading-relaxed font-normal max-w-md">
                  {currentSlide.subtitle}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Stepper Controls */}
            <div className="flex items-center gap-3 pt-2 w-full">
              {currentSlideIndex > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-all shrink-0 active:scale-95"
                  aria-label="Previous Feature"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                id="splash-btn-next-slide"
                onClick={handleNext}
                className="flex-1 py-3 px-5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-heading font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-950/50 transition-all active:scale-98"
              >
                <span>
                  {currentSlideIndex === slides.length - 1 ? 'Enter Ticketing Portal' : 'Next Platform Feature'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection Shortcut Footer */}
      <footer className="w-full max-w-5xl mx-auto space-y-3 z-20 pb-2 pt-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            id="splash-btn-direct-explorer"
            onClick={() => {
              if (onDirectRoleSelect) {
                onDirectRoleSelect('attendee');
              } else {
                onComplete();
              }
            }}
            className="py-3.5 px-4 bg-slate-900/80 hover:bg-slate-800 border border-white/10 rounded-2xl font-heading font-bold text-xs sm:text-sm flex items-center justify-between text-white transition-all shadow-sm active:scale-98"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-300">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="block font-bold">Event Explorer</span>
                <span className="text-[10px] text-slate-400 font-normal">Browse & Book Passes</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            type="button"
            id="splash-btn-direct-organizer"
            onClick={() => {
              if (onDirectRoleSelect) {
                onDirectRoleSelect('organizer');
              } else {
                onComplete();
              }
            }}
            className="py-3.5 px-4 bg-slate-900/80 hover:bg-slate-800 border border-purple-500/30 rounded-2xl font-heading font-bold text-xs sm:text-sm flex items-center justify-between text-purple-200 transition-all shadow-sm active:scale-98"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-300">
                <Briefcase className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="block font-bold">Organiser Studio</span>
                <span className="text-[10px] text-purple-300/70 font-normal">Host & Gate Analytics</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-purple-300" />
          </button>
        </div>
      </footer>
    </main>
  );
};
