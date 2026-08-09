import React, { useState } from 'react';
import {
  DollarSign,
  CreditCard,
  Building2,
  ArrowDownToLine,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Clock,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import {
  UserProfile,
  FinancialTransaction,
  PayoutRecord,
} from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface OrganiserSalesAccountViewProps {
  user: UserProfile;
  transactions?: FinancialTransaction[];
  payouts?: PayoutRecord[];
  onRequestPayout: (amount: number, destination: string) => void;
}

export const OrganiserSalesAccountView: React.FC<OrganiserSalesAccountViewProps> = ({
  user,
  transactions = [],
  payouts = [],
  onRequestPayout,
}) => {
  const safeTransactions = transactions || [];
  const safePayouts = payouts || [];

  const availableBalance = user?.organizerProfile?.availableBalance ?? 18450;
  const pendingBalance = user?.organizerProfile?.pendingBalance ?? 3820;
  const lifetimeRevenue = user?.organizerProfile?.lifetimeGrossRevenue ?? 142680;

  const [showPayoutModal, setShowPayoutModal] = useState<boolean>(false);
  const [payoutAmount, setPayoutAmount] = useState<number>(availableBalance);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleConfirmPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (payoutAmount <= 0 || payoutAmount > availableBalance) return;

    setIsProcessing(true);
    setTimeout(() => {
      onRequestPayout(
        payoutAmount,
        user.organizerProfile?.bankName || 'Chase Bank (•••• 8831)'
      );
      setIsProcessing(false);
      setShowPayoutModal(false);
      setToastMessage(
        `$${payoutAmount.toLocaleString()} transfer initiated to your Chase bank account!`
      );
      setTimeout(() => setToastMessage(null), 3000);
    }, 800);
  };

  const handleDownloadStatement = (month: string) => {
    setToastMessage(`Downloading ${month} Financial Sales Statement (.csv)...`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <main id="organiser-sales-account-view" className="space-y-5 pb-28 px-4 pt-2">
      {/* Header Bar */}
      <section className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-[#1a1c1d]">
            Event Account & Sales
          </h2>
          <p className="text-xs text-[#7b7486]">
            Manage balances, bank transfers, and financial transaction ledgers
          </p>
        </div>
      </section>

      {/* Hero Financial Balance Card */}
      <section className="bg-gradient-to-br from-[#1a1c1d] via-slate-900 to-[#6C2BD9]/90 text-white rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between text-xs text-purple-200">
          <span className="font-bold uppercase tracking-wider text-[10px]">
            Available for Direct Payout
          </span>
          <span className="flex items-center gap-1 text-emerald-400 font-bold text-[10px]">
            <ShieldCheck className="w-3.5 h-3.5" /> Stripe Payout Ready
          </span>
        </div>

        <div>
          <h3 className="font-mono text-3xl font-bold">
            ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            + ${pendingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} in post-event escrow settlement
          </p>
        </div>

        {/* Payout Trigger Button */}
        <div className="pt-2 flex gap-2">
          <button
            onClick={() => setShowPayoutModal(true)}
            disabled={availableBalance <= 0}
            className="flex-1 py-3 bg-[#6C2BD9] hover:bg-purple-600 disabled:opacity-50 text-white font-heading font-bold text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>Transfer Funds to Bank</span>
          </button>
        </div>
      </section>

      {/* Connected Bank & Financial Entities */}
      <section className="bg-white rounded-3xl p-4 border border-[#ccc3d7]/40 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-heading font-bold text-xs text-[#1a1c1d]">
            Connected Bank & Payout Method
          </span>
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full">
            Verified
          </span>
        </div>

        <div className="flex items-center gap-3 p-3 bg-[#f9f9fb] rounded-2xl border border-[#edeef0]">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6C2BD9] flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1 text-xs">
            <h4 className="font-bold text-[#1a1c1d] truncate">
              {user.organizerProfile?.bankName || 'Chase Business Checking'}
            </h4>
            <p className="text-[11px] text-[#7b7486]">
              Account ending in •••• {user.organizerProfile?.bankAccountLast4 || '8831'} (ACH Direct)
            </p>
          </div>
        </div>
      </section>

      {/* Lifetime Gross & Fees Summary */}
      <section className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-white rounded-3xl border border-[#ccc3d7]/40 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7b7486]">
            Lifetime Gross Sales
          </span>
          <p className="font-heading font-bold text-lg text-[#1a1c1d]">
            ${lifetimeRevenue.toLocaleString()}
          </p>
          <p className="text-[10px] text-[#7b7486]">All events combined</p>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-[#ccc3d7]/40 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7b7486]">
            Platform Handling Fee
          </span>
          <p className="font-heading font-bold text-lg text-[#6C2BD9]">
            3.5%
          </p>
          <p className="text-[10px] text-[#7b7486]">Includes merchant processing</p>
        </div>
      </section>

      {/* Transaction Sales Ledger */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm text-[#1a1c1d]">
            Detailed Financial Ledger
          </h3>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-[#ccc3d7]/40 shadow-xs divide-y divide-[#edeef0]">
          {safeTransactions.map((tx) => (
            <div key={tx.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    tx.type === 'ticket_sale'
                      ? 'bg-emerald-50 text-emerald-600'
                      : tx.type === 'resale_royalty'
                      ? 'bg-purple-50 text-[#6C2BD9]'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {tx.type === 'ticket_sale' ? (
                    <DollarSign className="w-4 h-4" />
                  ) : tx.type === 'resale_royalty' ? (
                    <Sparkles className="w-4 h-4" />
                  ) : (
                    <ArrowDownToLine className="w-4 h-4" />
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-[#1a1c1d]">
                    {tx.eventTitle || tx.description}
                  </h4>
                  <p className="text-[10px] text-[#7b7486]">
                    {tx.description} • {tx.date}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`font-mono font-bold text-xs block ${
                    tx.amount > 0 ? 'text-emerald-600' : 'text-slate-900'
                  }`}
                >
                  {tx.amount > 0 ? `+$${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                </span>
                <span className="text-[9px] text-[#7b7486]">{tx.status}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tax Invoices & Reports */}
      <section className="bg-white rounded-3xl p-4 border border-[#ccc3d7]/40 shadow-xs space-y-3">
        <h3 className="font-heading font-bold text-xs text-[#1a1c1d]">
          Tax Documents & Monthly Statements
        </h3>

        <div className="space-y-2 text-xs">
          {['July 2024 Statement', 'June 2024 Statement', '2023 Form 1099-K'].map((doc) => (
            <div
              key={doc}
              className="flex items-center justify-between p-2.5 bg-[#f9f9fb] rounded-xl"
            >
              <div className="flex items-center gap-2 text-[#1a1c1d]">
                <FileText className="w-4 h-4 text-[#6C2BD9]" />
                <span className="font-bold">{doc}</span>
              </div>
              <button
                onClick={() => handleDownloadStatement(doc)}
                className="text-[#6C2BD9] font-bold text-[11px] hover:underline flex items-center gap-1"
              >
                <ArrowDownToLine className="w-3 h-3" />
                <span>Export</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* PAYOUT REQUEST MODAL */}
      <AnimatePresence>
        {showPayoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-sm bg-white rounded-3xl p-5 space-y-4 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-heading font-bold text-base text-[#1a1c1d]">
                  Transfer Funds to Bank
                </h3>
                <button
                  onClick={() => setShowPayoutModal(false)}
                  className="text-[#7b7486] hover:text-[#1a1c1d]"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleConfirmPayout} className="space-y-3 text-xs">
                <div className="p-3 bg-[#f9f9fb] rounded-2xl border border-[#edeef0] space-y-1">
                  <span className="text-[10px] text-[#7b7486] font-bold uppercase">
                    Destination
                  </span>
                  <p className="font-bold text-[#1a1c1d]">
                    Chase Bank (Business Checking •••• 8831)
                  </p>
                  <p className="text-[10px] text-emerald-600">
                    Est. Arrival: Instant / Next business day
                  </p>
                </div>

                <div>
                  <label className="font-bold text-[#1a1c1d] block mb-1">
                    Payout Amount ($)
                  </label>
                  <input
                    type="number"
                    max={availableBalance}
                    min={10}
                    step={1}
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(Number(e.target.value))}
                    className="w-full h-11 px-3.5 bg-[#f9f9fb] border border-[#ccc3d7]/50 rounded-xl font-mono font-bold text-base text-[#6C2BD9] outline-none"
                  />
                  <div className="flex justify-between text-[10px] text-[#7b7486] mt-1">
                    <span>Available: ${availableBalance.toLocaleString()}</span>
                    <button
                      type="button"
                      onClick={() => setPayoutAmount(availableBalance)}
                      className="text-[#6C2BD9] font-bold hover:underline"
                    >
                      Transfer All
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || payoutAmount <= 0}
                  className="w-full py-3.5 bg-[#6C2BD9] hover:bg-purple-700 text-white font-heading font-bold rounded-2xl shadow-md disabled:opacity-50"
                >
                  {isProcessing ? 'Processing Transfer...' : `Confirm $${payoutAmount.toLocaleString()} Payout`}
                </button>
              </form>
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
