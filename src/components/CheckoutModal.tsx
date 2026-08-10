import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Wallet,
  Check,
  Plus,
  Minus,
  ShieldCheck,
  Loader2,
  Lock,
} from 'lucide-react';
import { EventItem, EventTier, Ticket } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { createOrderApi } from '../services/snaptixApi';

interface CheckoutModalProps {
  event: EventItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newTicket: Ticket) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  event,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedTier, setSelectedTier] = useState<EventTier>(
    event.tiers[0] || {
      id: 'default',
      name: 'General Admission',
      price: event.price,
      description: 'Standard event access',
      available: 50,
      perks: ['Standard Entry'],
    }
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedPayment, setSelectedPayment] = useState<string>('card');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [walletStatus, setWalletStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Must match backend exactly: /orders charges tier.price × quantity, with no
  // service fee or discount support server-side yet (promo codes are backlog).
  const total = selectedTier.price * quantity;

  // Safe Apple Pay / Google Pay selector
  const handleSelectDigitalPay = (method: 'apple_pay' | 'google_pay') => {
    setSelectedPayment(method);
    setWalletStatus(
      method === 'apple_pay'
        ? 'Apple Pay (Touch ID / Face ID ready)'
        : 'Google Pay (Instant 1-Tap checkout)'
    );
  };

  const handleConfirmPurchase = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const newTicket = await createOrderApi(
        event,
        selectedTier.id,
        selectedTier.name,
        quantity,
      );
      onSuccess(newTicket);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Checkout failed';
      setErrorMessage(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-lg max-h-[90vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#edeef0] flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-lg text-[#1a1c1d]">
                Checkout & Tickets
              </h2>
              <p className="text-xs text-[#7b7486] truncate max-w-xs">{event.title}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#f3f3f5] flex items-center justify-center text-[#4a4455] hover:bg-[#edeef0] active:scale-90 transition-transform"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 overflow-y-auto space-y-5 hide-scrollbar">
            {/* 1. Select Ticket Tier */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#7b7486] block">
                Select Package
              </label>
              <div className="space-y-2">
                {event.tiers.map((tier) => {
                  const isSelected = selectedTier.id === tier.id;
                  return (
                    <div
                      key={tier.id}
                      onClick={() => setSelectedTier(tier)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#6C2BD9] bg-purple-50/60 ring-2 ring-purple-500/20'
                          : 'border-[#ccc3d7]/40 bg-white hover:border-[#6C2BD9]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? 'border-[#6C2BD9] bg-[#6C2BD9] text-white'
                                : 'border-[#ccc3d7]'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div>
                            <p className="font-heading font-bold text-sm text-[#1a1c1d]">
                              {tier.name}
                            </p>
                            <p className="text-[11px] text-[#7b7486]">{tier.description}</p>
                          </div>
                        </div>
                        <span className="font-heading font-bold text-base text-[#6C2BD9]">
                          {tier.price === 0 ? 'Free' : `$${tier.price}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Quantity Stepper */}
            <div className="flex items-center justify-between p-4 bg-[#f3f3f5] rounded-2xl">
              <div>
                <span className="font-heading font-bold text-sm text-[#1a1c1d] block">
                  Number of Tickets
                </span>
                <span className="text-xs text-[#7b7486]">Limit 8 per booking</span>
              </div>
              <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-[#ccc3d7]/30 shadow-xs">
                <button
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#4a4455] hover:bg-[#edeef0] disabled:opacity-30 active:scale-90"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-heading font-bold text-base min-w-[20px] text-center text-[#1a1c1d]">
                  {quantity}
                </span>
                <button
                  disabled={quantity >= 8}
                  onClick={() => setQuantity(Math.min(8, quantity + 1))}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#4a4455] hover:bg-[#edeef0] disabled:opacity-30 active:scale-90"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 3. Payment Method Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#7b7486] block">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                {/* Credit Card */}
                <button
                  type="button"
                  onClick={() => setSelectedPayment('card')}
                  className={`p-3 rounded-2xl border flex items-center gap-2.5 text-left transition-all ${
                    selectedPayment === 'card'
                      ? 'border-[#6C2BD9] bg-purple-50 text-[#6C2BD9] ring-2 ring-purple-500/20'
                      : 'border-[#ccc3d7]/40 bg-white text-[#4a4455]'
                  }`}
                >
                  <CreditCard className="w-4 h-4 flex-shrink-0" />
                  <div className="truncate">
                    <p className="text-xs font-bold">Visa •••• 4242</p>
                    <p className="text-[10px] text-[#7b7486]">Credit / Debit</p>
                  </div>
                </button>

                {/* Apple Pay / Google Pay */}
                <button
                  type="button"
                  onClick={() => handleSelectDigitalPay('apple_pay')}
                  className={`p-3 rounded-2xl border flex items-center gap-2.5 text-left transition-all ${
                    selectedPayment === 'apple_pay'
                      ? 'border-[#6C2BD9] bg-purple-50 text-[#6C2BD9] ring-2 ring-purple-500/20'
                      : 'border-[#ccc3d7]/40 bg-white text-[#4a4455]'
                  }`}
                >
                  <Wallet className="w-4 h-4 flex-shrink-0 text-[#6C2BD9]" />
                  <div className="truncate">
                    <p className="text-xs font-bold">Apple / Google Pay</p>
                    <p className="text-[10px] text-[#7b7486]">1-Tap Fast Checkout</p>
                  </div>
                </button>
              </div>

              {walletStatus && selectedPayment === 'apple_pay' && (
                <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-xl text-[11px] text-purple-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#6C2BD9] flex-shrink-0" />
                  <span className="truncate">{walletStatus}</span>
                </div>
              )}
            </div>

            {/* 4. Summary Breakdown */}
            <div className="p-4 bg-[#f9f9fb] rounded-2xl border border-[#edeef0] space-y-2 text-xs">
              <div className="flex justify-between text-[#7b7486]">
                <span>
                  {selectedTier.name} × {quantity}
                </span>
                <span className="font-mono">${total.toFixed(2)}</span>
              </div>
              <div className="border-t border-[#ccc3d7]/40 pt-2 flex justify-between items-center text-sm font-bold text-[#1a1c1d]">
                <span>Total Due</span>
                <span className="font-heading text-lg text-[#6C2BD9]">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="p-4 border-t border-[#edeef0] bg-white">
            {errorMessage && (
              <p className="text-xs text-red-600 mb-2 text-center break-words">{errorMessage}</p>
            )}
            <button
              id="confirm-payment-button"
              disabled={isProcessing}
              onClick={handleConfirmPurchase}
              className="w-full h-14 bg-[#6C2BD9] hover:bg-purple-700 disabled:opacity-60 text-white rounded-2xl font-heading font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-purple-600/25 active:scale-95 transition-all"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing Instant Entry...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>
                    Pay ${total.toFixed(2)} & Generate Pass
                  </span>
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-[#7b7486] mt-2 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>256-bit encrypted checkout • Guaranteed genuine tickets</span>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
