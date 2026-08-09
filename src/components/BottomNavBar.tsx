import React from 'react';
import {
  Compass,
  Ticket,
  Heart,
  User,
  Tag,
  LayoutDashboard,
  Layers,
  BarChart3,
  DollarSign,
  Share2,
  Settings,
} from 'lucide-react';
import { ActiveTab, UserRole } from '../types';

interface BottomNavBarProps {
  activeTab: ActiveTab;
  userRole: UserRole;
  onChangeTab: (tab: ActiveTab) => void;
  ticketsCount?: number;
  savedCount?: number;
  resaleCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  userRole,
  onChangeTab,
  ticketsCount = 0,
  savedCount = 0,
  resaleCount = 0,
}) => {
  const isOrganiser = userRole === 'organizer';

  const attendeeNavItems: {
    id: ActiveTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }[] = [
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'marketplace', label: 'Resale', icon: Tag, badge: resaleCount },
    { id: 'tickets', label: 'Tickets', icon: Ticket, badge: ticketsCount },
    { id: 'saved', label: 'Saved', icon: Heart, badge: savedCount },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const organiserNavItems: {
    id: ActiveTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }[] = [
    { id: 'org_dashboard', label: 'Hub', icon: LayoutDashboard },
    { id: 'org_events', label: 'Events', icon: Layers },
    { id: 'org_promotions', label: 'Promote', icon: Share2 },
    { id: 'org_analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'org_sales_account', label: 'Sales', icon: DollarSign },
    { id: 'org_settings', label: 'Settings', icon: Settings },
  ];

  const navItems = isOrganiser ? organiserNavItems : attendeeNavItems;

  return (
    <nav
      id="main-bottom-nav-bar"
      className="fixed bottom-0 left-0 w-full z-40 bg-[#f9f9fb]/95 backdrop-blur-2xl border-t border-[#ccc3d7]/30 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] transition-all"
    >
      <div className="max-w-md mx-auto flex items-center justify-around h-18 px-1 pb-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onChangeTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-2.5 rounded-2xl transition-all duration-200 active:scale-90 flex-1 ${
                isActive
                  ? 'text-[#6C2BD9]'
                  : 'text-[#7b7486] hover:text-[#4a4455]'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.5px]' : 'stroke-2'
                  }`}
                />
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[15px] h-3.5 px-1 bg-[#6C2BD9] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] mt-0.5 tracking-tight ${
                  isActive ? 'font-bold' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 bg-[#6C2BD9] rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

