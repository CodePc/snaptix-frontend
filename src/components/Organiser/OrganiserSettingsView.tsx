import React, { useState } from 'react';
import {
  ShieldCheck,
  User,
  Users,
  Key,
  Building,
  CreditCard,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Lock,
  DollarSign,
  Send,
  Sliders,
  ChevronRight,
  Bell,
  RefreshCw,
  Mail,
  Zap,
} from 'lucide-react';
import { OrganiserPersona } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface OrganiserSettingsViewProps {
  currentPersona: OrganiserPersona;
  onSwitchPersona: (persona: OrganiserPersona) => void;
  pendingApprovalCount: number;
}

export const OrganiserSettingsView: React.FC<OrganiserSettingsViewProps> = ({
  currentPersona,
  onSwitchPersona,
  pendingApprovalCount,
}) => {
  const [orgName, setOrgName] = useState<string>('Snaptix Live Events LLC');
  const [supportEmail, setSupportEmail] = useState<string>('organizer-support@snaptix.app');
  const [requireAdminApproval, setRequireAdminApproval] = useState<boolean>(true);
  const [aiTone, setAiTone] = useState<string>('Exciting & High-Energy');
  const [autoApproveFree, setAutoApproveFree] = useState<boolean>(true);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [inviteRole, setInviteRole] = useState<OrganiserPersona>('moderator');
  const [saveToast, setSaveToast] = useState<boolean>(false);

  const [teamMembers, setTeamMembers] = useState([
    { id: 'usr-1', name: 'Alex Johnson (You)', email: 'alex@snaptix.app', role: 'admin' as OrganiserPersona, status: 'Active' },
    { id: 'usr-2', name: 'Sarah Lin', email: 'sarah.lin@events.org', role: 'moderator' as OrganiserPersona, status: 'Active' },
    { id: 'usr-3', name: 'David Kim', email: 'david.kim@live.io', role: 'moderator' as OrganiserPersona, status: 'Active' },
  ]);

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setTeamMembers([
      ...teamMembers,
      {
        id: `usr-${Date.now()}`,
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: inviteRole,
        status: 'Invited',
      },
    ]);
    setInviteEmail('');
    setShowInviteModal(false);
    triggerSaveToast();
  };

  const triggerSaveToast = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  return (
    <main id="organiser-settings-view" className="space-y-6 pb-28 px-4 pt-2">
      {/* Toast Notification */}
      <AnimatePresence>
        {saveToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 px-4 py-2.5 bg-emerald-600 text-white font-heading font-bold text-xs rounded-2xl shadow-xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved Successfully</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <section className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-[#1a1c1d]">
            Organiser Settings & RBAC
          </h2>
          <p className="text-xs text-[#7b7486]">
            Manage personas, team roles, event approval rules, AI preferences, and payouts
          </p>
        </div>

        <button
          onClick={triggerSaveToast}
          className="px-4 py-2 bg-[#6C2BD9] hover:bg-purple-700 text-white font-heading font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all"
        >
          Save Changes
        </button>
      </section>

      {/* 1. Persona Switcher Section */}
      <section className="p-5 bg-gradient-to-br from-[#1a1c1d] to-purple-950 text-white rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base">Active Organiser Persona</h3>
              <p className="text-xs text-purple-200/80">
                Current Role:{' '}
                <span className="font-bold text-amber-300 uppercase tracking-wider">
                  {currentPersona}
                </span>
              </p>
            </div>
          </div>

          {pendingApprovalCount > 0 && currentPersona === 'admin' && (
            <span className="px-3 py-1 bg-amber-400 text-slate-950 font-heading font-extrabold text-[10px] uppercase rounded-full animate-bounce">
              {pendingApprovalCount} Pending Approval
            </span>
          )}
        </div>

        {/* Persona Selector Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => onSwitchPersona('admin')}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
              currentPersona === 'admin'
                ? 'bg-purple-600/30 border-purple-400 shadow-lg text-white ring-2 ring-purple-400'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-heading font-bold text-sm text-white flex items-center gap-1.5">
                <CrownIcon className="w-4 h-4 text-amber-400" />
                <span>Admin Persona</span>
              </span>
              {currentPersona === 'admin' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Full authority. Review & publish moderator events, manage payouts, invite team members.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onSwitchPersona('moderator')}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
              currentPersona === 'moderator'
                ? 'bg-purple-600/30 border-purple-400 shadow-lg text-white ring-2 ring-purple-400'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-heading font-bold text-sm text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-300" />
                <span>Moderator Persona</span>
              </span>
              {currentPersona === 'moderator' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Create drafts, submit events to Approval Queue, manage live gate check-ins.
            </p>
          </button>
        </div>
      </section>

      {/* 2. Organization Profile & Branding */}
      <section className="bg-white rounded-3xl p-5 border border-[#ccc3d7]/40 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#edeef0] pb-3">
          <Building className="w-5 h-5 text-[#6C2BD9]" />
          <h3 className="font-heading font-bold text-sm text-[#1a1c1d]">
            Organization Profile & Public Branding
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-[#1a1c1d] block mb-1">
              Organization Name
            </label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full h-11 px-3.5 bg-[#f9f9fb] rounded-xl border border-[#ccc3d7]/50 focus:ring-2 focus:ring-[#6C2BD9] outline-none font-bold"
            />
          </div>

          <div>
            <label className="font-bold text-[#1a1c1d] block mb-1">
              Public Support Email
            </label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full h-11 px-3.5 bg-[#f9f9fb] rounded-xl border border-[#ccc3d7]/50 focus:ring-2 focus:ring-[#6C2BD9] outline-none"
            />
          </div>
        </div>
      </section>

      {/* 3. Event Approval Queue Policy (RBAC) */}
      <section className="bg-white rounded-3xl p-5 border border-[#ccc3d7]/40 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#edeef0] pb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="font-heading font-bold text-sm text-[#1a1c1d]">
                Event Approval Queue Rules
              </h3>
              <p className="text-[11px] text-[#7b7486]">
                Configure how moderator submissions are handled before going live
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold border border-amber-200">
            RBAC Enforced
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3.5 bg-[#f9f9fb] rounded-2xl border border-[#edeef0] cursor-pointer">
            <div>
              <p className="font-bold text-[#1a1c1d]">Mandatory Admin Approval for Moderator Submissions</p>
              <p className="text-[11px] text-[#7b7486]">
                Events created by moderators sit in the Approval Queue until approved by an Admin
              </p>
            </div>
            <input
              type="checkbox"
              checked={requireAdminApproval}
              onChange={(e) => setRequireAdminApproval(e.target.checked)}
              className="w-4 h-4 accent-[#6C2BD9] rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 bg-[#f9f9fb] rounded-2xl border border-[#edeef0] cursor-pointer">
            <div>
              <p className="font-bold text-[#1a1c1d]">Auto-Approve $0 Free Events</p>
              <p className="text-[11px] text-[#7b7486]">
                Automatically publish free community events without requiring manual admin approval
              </p>
            </div>
            <input
              type="checkbox"
              checked={autoApproveFree}
              onChange={(e) => setAutoApproveFree(e.target.checked)}
              className="w-4 h-4 accent-[#6C2BD9] rounded"
            />
          </label>
        </div>
      </section>

      {/* 4. AI Co-Pilot Preferences */}
      <section className="bg-white rounded-3xl p-5 border border-[#ccc3d7]/40 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#edeef0] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#6C2BD9]" />
            <div>
              <h3 className="font-heading font-bold text-sm text-[#1a1c1d]">
                AI Co-Pilot Assistant
              </h3>
              <p className="text-[11px] text-[#7b7486]">
                Server-side Gemini 2.5 Flash API integration for event generation & post copy
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 bg-purple-50 text-[#6C2BD9] rounded-full text-[10px] font-bold border border-purple-200 flex items-center gap-1">
            <Zap className="w-3 h-3 text-[#6C2BD9]" />
            Gemini Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-[#1a1c1d] block mb-1">
              Default Copywriting Tone
            </label>
            <select
              value={aiTone}
              onChange={(e) => setAiTone(e.target.value)}
              className="w-full h-11 px-3 bg-[#f9f9fb] rounded-xl border border-[#ccc3d7]/50 focus:ring-2 focus:ring-[#6C2BD9] outline-none"
            >
              <option value="Exciting & High-Energy">Exciting & High-Energy (Nightlife / Concerts)</option>
              <option value="Professional & Prestigious">Professional & Prestigious (Tech & Summits)</option>
              <option value="Underground & Exclusive">Underground & Exclusive (Speakeasies & Raves)</option>
              <option value="Friendly & Welcoming">Friendly & Welcoming (Workshops & Food)</option>
            </select>
          </div>

          <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-200 text-[#4a4455] space-y-1">
            <p className="font-bold text-[#6C2BD9]">AI Co-Pilot Status</p>
            <p className="text-[11px]">
              Generates titles, descriptions, pricing tier recommendations, social captions, and broadcast emails automatically inside wizard modals.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Team Members Roster & Management */}
      <section className="bg-white rounded-3xl p-5 border border-[#ccc3d7]/40 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#edeef0] pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#6C2BD9]" />
            <div>
              <h3 className="font-heading font-bold text-sm text-[#1a1c1d]">
                Team Members & Roles
              </h3>
              <p className="text-[11px] text-[#7b7486]">
                {teamMembers.length} team members attached to this organisation
              </p>
            </div>
          </div>

          {currentPersona === 'admin' && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#6C2BD9] font-bold rounded-xl text-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Invite Member</span>
            </button>
          )}
        </div>

        <div className="space-y-2">
          {teamMembers.map((m) => (
            <div
              key={m.id}
              className="p-3 bg-[#f9f9fb] rounded-2xl border border-[#edeef0] flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-[#6C2BD9] font-bold flex items-center justify-center text-xs">
                  {m.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-[#1a1c1d]">{m.name}</h4>
                  <p className="text-[10px] text-[#7b7486]">{m.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    m.role === 'admin'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {m.role}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  {m.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Payout & Stripe Integration */}
      <section className="bg-white rounded-3xl p-5 border border-[#ccc3d7]/40 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#edeef0] pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-heading font-bold text-sm text-[#1a1c1d]">
                Bank Payout & Stripe Integration
              </h3>
              <p className="text-[11px] text-[#7b7486]">
                Direct ACH transfer and gate escrow payouts
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-full text-[10px] border border-emerald-200">
            ✓ Stripe Connected
          </span>
        </div>

        <div className="p-3.5 bg-[#f9f9fb] rounded-2xl flex items-center justify-between text-xs">
          <div>
            <p className="font-bold text-[#1a1c1d]">Primary Wire Bank Account</p>
            <p className="text-[11px] text-[#7b7486]">Chase Bank N.A. •••• 8842</p>
          </div>
          <span className="font-mono font-bold text-emerald-600">$12,450.00 Ready for Payout</span>
        </div>
      </section>

      {/* Invite Member Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#edeef0] pb-3">
                <h3 className="font-heading font-bold text-base text-[#1a1c1d]">
                  Invite Team Member
                </h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-[#7b7486] font-bold hover:text-[#1a1c1d]"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleInviteSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-[#1a1c1d] block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="teammate@company.com"
                    className="w-full h-11 px-3 bg-[#f9f9fb] rounded-xl border border-[#ccc3d7]/50 focus:ring-2 focus:ring-[#6C2BD9] outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#1a1c1d] block mb-1">
                    Assign Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as OrganiserPersona)}
                    className="w-full h-11 px-3 bg-[#f9f9fb] rounded-xl border border-[#ccc3d7]/50 focus:ring-2 focus:ring-[#6C2BD9] outline-none font-bold"
                  >
                    <option value="moderator">Moderator (Drafts & Approval Queue)</option>
                    <option value="admin">Admin (Full Control & Publishing)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#6C2BD9] hover:bg-purple-700 text-white font-heading font-bold rounded-xl shadow-md transition-all mt-2"
                >
                  Send Invitation
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
};

// Simple Crown icon for Admin
function CrownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m2 4 3 12h14l3-12-6 7-4-5-4 5-6-7z" />
      <path d="M5 20h14" />
    </svg>
  );
}
