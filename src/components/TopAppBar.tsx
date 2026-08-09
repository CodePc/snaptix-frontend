import React from 'react';
import { Search, Bell, Ticket, Briefcase, Plus, QrCode, LogOut, User } from 'lucide-react';
import { ActiveTab, UserRole } from '../types';

interface TopAppBarProps {
  activeTab: ActiveTab;
  userRole: UserRole;
  unreadCount?: number;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenCreateWizard?: () => void;
  onOpenQRScanner?: () => void;
  onSignOut?: () => void;
  titleOverride?: string;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  activeTab,
  userRole,
  unreadCount = 0,
  onOpenSearch,
  onOpenNotifications,
  onOpenCreateWizard,
  onOpenQRScanner,
  onSignOut,
  titleOverride,
}) => {
  const isOrganiser = userRole === 'organizer';

  const getHeaderTitle = () => {
    if (titleOverride) return titleOverride;
    switch (activeTab) {
      case 'explore':
        return 'Snaptix Explorer';
      case 'marketplace':
        return 'Resale Marketplace';
      case 'tickets':
        return 'My Tickets';
      case 'saved':
        return 'Saved Events';
      case 'profile':
        return 'Attendee Profile';
      case 'org_dashboard':
        return 'Organizer Hub';
      case 'org_events':
        return 'Event Manager';
      case 'org_promotions':
        return 'Promo & Campaigns';
      case 'org_analytics':
        return 'Sales Analytics';
      case 'org_sales_account':
        return 'Sales & Payouts';
      default:
        return isOrganiser ? 'Organizer Studio' : 'Snaptix Explorer';
    }
  };

  return (
    <header
      id="main-top-app-bar"
      className={`sticky top-0 w-full z-40 backdrop-blur-xl border-b transition-all ${
        isOrganiser
          ? 'bg-slate-900/95 border-purple-500/20 text-white'
          : 'bg-[#f9f9fb]/95 border-[#ccc3d7]/30 text-[#1a1c1d]'
      }`}
    >
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand and Role-Specific Identity */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0 transition-all ${
              isOrganiser
                ? 'bg-gradient-to-tr from-purple-700 to-indigo-600 shadow-purple-900/30 border border-purple-400/30'
                : 'bg-gradient-to-tr from-[#6C2BD9] to-[#C026D3] shadow-purple-500/20'
            }`}
          >
            {isOrganiser ? (
              <Briefcase className="w-4.5 h-4.5 text-purple-200" />
            ) : (
              <Ticket className="w-4.5 h-4.5 -rotate-12" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1
                className={`font-heading text-base sm:text-lg font-bold tracking-tight truncate ${
                  isOrganiser ? 'text-white' : 'text-[#1a1c1d]'
                }`}
              >
                {getHeaderTitle()}
              </h1>
              {isOrganiser && (
                <span className="px-1.5 py-0.5 bg-purple-500/20 border border-purple-400/30 text-purple-300 text-[9px] font-bold uppercase rounded shrink-0">
                  PRO
                </span>
              )}
            </div>
            <span
              className={`block text-[10px] uppercase font-bold tracking-wider truncate ${
                isOrganiser ? 'text-purple-300' : 'text-[#6C2BD9]'
              }`}
            >
              {isOrganiser ? 'Apex Entertainment Group' : 'Attendee Discovery & Resale'}
            </span>
          </div>
        </div>

        {/* Action Controls (Specific to each Role) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Organizer Quick Actions */}
          {isOrganiser && onOpenCreateWizard && (
            <button
              onClick={onOpenCreateWizard}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-[#6C2BD9] hover:bg-purple-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95"
              title="Create New Event"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Event</span>
            </button>
          )}

          {isOrganiser && onOpenQRScanner && (
            <button
              onClick={onOpenQRScanner}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 active:scale-95 transition-all"
              title="Live QR Scanner"
            >
              <QrCode className="w-4 h-4" />
            </button>
          )}

          {/* Attendee Search Action */}
          {!isOrganiser && (
            <button
              id="top-bar-search-button"
              onClick={onOpenSearch}
              aria-label="Search events"
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#4a4455] hover:text-[#6C2BD9] hover:bg-purple-50 active:scale-95 transition-all"
            >
              <Search className="w-4.5 h-4.5" />
            </button>
          )}

          {/* Notifications Action */}
          <button
            id="top-bar-notifications-button"
            onClick={onOpenNotifications}
            aria-label="View notifications"
            className={`relative w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-all ${
              isOrganiser
                ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                : 'text-[#4a4455] hover:text-[#6C2BD9] hover:bg-purple-50'
            }`}
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#F5A524] ring-2 ring-white rounded-full animate-pulse" />
            )}
          </button>

          {/* Sign Out / Switch Account */}
          {onSignOut && (
            <button
              onClick={onSignOut}
              aria-label="Sign out"
              title={isOrganiser ? 'Sign Out of Studio' : 'Switch Account / Sign Out'}
              className={`p-2 rounded-xl flex items-center gap-1 text-xs font-bold active:scale-95 transition-all ${
                isOrganiser
                  ? 'text-red-400 hover:bg-red-950/40 border border-red-500/20'
                  : 'text-[#7b7486] hover:text-red-600 hover:bg-red-50'
              }`}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};


