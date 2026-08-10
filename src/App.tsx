import React, { useEffect, useState } from 'react';
import {
  INITIAL_EVENTS,
  INITIAL_TICKETS,
  INITIAL_USER,
  INITIAL_NOTIFICATIONS,
  INITIAL_ORGANISER_EVENTS,
  INITIAL_RESALE_LISTINGS,
  INITIAL_PROMO_CODES,
  INITIAL_CAMPAIGNS,
  INITIAL_TRANSACTIONS,
  INITIAL_PAYOUTS,
} from './data/mockData';
import {
  INITIAL_BULK_BROADCASTS,
  INITIAL_EVENT_CHANGE_TEMPLATES,
  INITIAL_SOCIAL_CONNECTIONS,
  INITIAL_OMNI_POSTS,
  INITIAL_INBOUND_METRICS,
  INITIAL_INBOUND_COMMENTS,
  INITIAL_CHAT_THREADS,
} from './data/mockPromotionsAndChat';
import {
  EventItem,
  Ticket,
  UserProfile,
  AppNotification,
  ActiveTab,
  UserRole,
  ResaleListing,
  OrganiserEventData,
  OrganiserPersona,
  PromoCode,
  MarketingCampaign,
  FinancialTransaction,
  PayoutRecord,
  AttendeeRecord,
  BulkBroadcastCampaign,
  EventChangeTemplate,
  SocialAccountConnection,
  OmniSocialPost,
  SocialInboundMetric,
  SocialInboundComment,
  ChatThread,
} from './types';
import { SplashView } from './components/SplashView';
import { AuthPortalView } from './components/Auth/AuthPortalView';
import { TopAppBar } from './components/TopAppBar';
import { BottomNavBar } from './components/BottomNavBar';
import { ExploreView } from './components/ExploreView';
import { EventDetailsView } from './components/EventDetailsView';
import { CheckoutModal } from './components/CheckoutModal';
import { BookingConfirmedView } from './components/BookingConfirmedView';
import { MyTicketsView } from './components/MyTicketsView';
import { SavedEventsView } from './components/SavedEventsView';
import { ProfileView } from './components/ProfileView';
import { ResaleMarketplaceView } from './components/ResaleMarketplaceView';
import { ListTicketResaleModal } from './components/ListTicketResaleModal';
import { OrganiserDashboardView } from './components/Organiser/OrganiserDashboardView';
import { OrganiserEventsView } from './components/Organiser/OrganiserEventsView';
import { OrganiserPromotionsView } from './components/Organiser/OrganiserPromotionsView';
import { OrganiserAnalyticsView } from './components/Organiser/OrganiserAnalyticsView';
import { OrganiserSalesAccountView } from './components/Organiser/OrganiserSalesAccountView';
import { OrganiserSettingsView } from './components/Organiser/OrganiserSettingsView';
import { OrganiserEventWizardModal } from './components/Organiser/OrganiserEventWizardModal';
import { QRCheckInScannerModal } from './components/Organiser/QRCheckInScannerModal';
import { AttendeeOrganizerChatModal } from './components/Chat/AttendeeOrganizerChatModal';
import { NotificationsModal } from './components/NotificationsModal';
import { SearchModal } from './components/SearchModal';
import { motion, AnimatePresence } from 'motion/react';
import {
  buyResaleListingApi,
  createEmailCampaignApi,
  createEventApi,
  fetchEventAttendees,
  fetchMyPasses,
  fetchOrganiserAnalyticsApi,
  fetchOrganiserEvents,
  fetchPublishedEvents,
  fetchResaleListings,
  listPassForResaleApi,
  logoutApi,
  manualCheckInApi,
  sendEmailCampaignApi,
  updateEventStatusApi,
  updateTierCapacityApi,
} from './services/snaptixApi';
import { organiserEventToCreatePayload } from './services/mappers';

export default function App() {
  // Screen state: 'splash' | 'auth' | 'main' | 'event_details' | 'booking_confirmed'
  const [currentScreen, setCurrentScreen] = useState<
    'splash' | 'auth' | 'main' | 'event_details' | 'booking_confirmed'
  >('splash');

  // User Role: 'attendee' vs 'organizer' (Separated authentic portals)
  const [userRole, setUserRole] = useState<UserRole>('attendee');

  // Organiser Persona (RBAC): 'admin' vs 'moderator'
  const [currentPersona, setCurrentPersona] = useState<OrganiserPersona>('admin');

  // Active Tab: Attendee ('explore' | 'marketplace' | 'tickets' | 'saved' | 'profile')
  // or Organiser ('org_dashboard' | 'org_events' | 'org_promotions' | 'org_analytics' | 'org_sales_account')
  const [activeTab, setActiveTab] = useState<ActiveTab>('explore');

  // Core Data States — start empty; loaded from Spring Boot after auth / on mount
  const [events, setEvents] = useState<EventItem[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [notifications, setNotifications] = useState<AppNotification[]>(
    INITIAL_NOTIFICATIONS
  );
  const [apiError, setApiError] = useState<string | null>(null);
  const [isBootstrappingApi, setIsBootstrappingApi] = useState(false);

  // Resale Marketplace State
  const [resaleListings, setResaleListings] = useState<ResaleListing[]>([]);
  const [ticketToList, setTicketToList] = useState<Ticket | null>(null);
  const [isListResaleOpen, setIsListResaleOpen] = useState<boolean>(false);

  // Organiser Portal States
  const [organiserEvents, setOrganiserEvents] = useState<OrganiserEventData[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(INITIAL_PROMO_CODES);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(
    INITIAL_CAMPAIGNS
  );
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(
    INITIAL_TRANSACTIONS
  );
  const [payouts, setPayouts] = useState<PayoutRecord[]>(INITIAL_PAYOUTS);

  // New Promotion & Omni-Channel & Chat States
  const [bulkBroadcasts, setBulkBroadcasts] = useState<BulkBroadcastCampaign[]>(
    INITIAL_BULK_BROADCASTS
  );
  const [socialConnections, setSocialConnections] = useState<SocialAccountConnection[]>(
    INITIAL_SOCIAL_CONNECTIONS
  );
  const [omniPosts, setOmniPosts] = useState<OmniSocialPost[]>(
    INITIAL_OMNI_POSTS
  );
  const [inboundMetrics, setInboundMetrics] = useState<SocialInboundMetric[]>(
    INITIAL_INBOUND_METRICS
  );
  const [inboundComments, setInboundComments] = useState<SocialInboundComment[]>(
    INITIAL_INBOUND_COMMENTS
  );
  const [chatThreads, setChatThreads] = useState<ChatThread[]>(
    INITIAL_CHAT_THREADS
  );

  // Attendee-Organizer Live Chat Modal
  const [isChatModalOpen, setIsChatModalOpen] = useState<boolean>(false);
  const [chatActiveTicket, setChatActiveTicket] = useState<Ticket | null>(null);
  const [chatActiveEvent, setChatActiveEvent] = useState<EventItem | null>(null);
  const [chatActiveThread, setChatActiveThread] = useState<ChatThread | null>(null);

  // Organiser Modals & Selection State
  const [isEventWizardOpen, setIsEventWizardOpen] = useState<boolean>(false);
  const [wizardEditEvent, setWizardEditEvent] = useState<OrganiserEventData | null>(
    null
  );
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [scannerSelectedEventId, setScannerSelectedEventId] = useState<string | undefined>();
  const [manageSelectedEventId, setManageSelectedEventId] = useState<string | null>(null);

  // Selected event for details
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  // Checkout modal state
  const [checkoutEvent, setCheckoutEvent] = useState<EventItem | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);

  // Last confirmed ticket for success screen
  const [confirmedTicket, setConfirmedTicket] = useState<Ticket | null>(null);

  // Global modals
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;
  const savedEvents = events.filter((e) => e.isSaved);
  const upcomingTicketsCount = tickets.filter((t) => t.status === 'upcoming').length;
  const availableResaleCount = resaleListings.filter((r) => r.status === 'available').length;

  const refreshFromBackend = async () => {
    setIsBootstrappingApi(true);
    setApiError(null);
    try {
      const published = await fetchPublishedEvents();
      setEvents(published);
      try {
        const myPasses = await fetchMyPasses(published);
        setTickets(myPasses);
      } catch {
        // attendee not logged in / no passes yet
      }
      try {
        const orgEvents = await fetchOrganiserEvents();
        setOrganiserEvents(orgEvents);
      } catch {
        // organiser endpoints require ORGANISER role
      }
      try {
        const listings = await fetchResaleListings(published);
        setResaleListings(listings);
      } catch {
        // public resale may still fail if API down
      }
    } catch (err) {
      console.error(err);
      setApiError(err instanceof Error ? err.message : 'Failed to load API data');
      if (events.length === 0) {
        setEvents(INITIAL_EVENTS);
        setOrganiserEvents(INITIAL_ORGANISER_EVENTS);
        setResaleListings(INITIAL_RESALE_LISTINGS);
        setTickets(INITIAL_TICKETS);
      }
    } finally {
      setIsBootstrappingApi(false);
    }
  };

  // Load live data once after splash → main path; also safe to call after login
  useEffect(() => {
    if (currentScreen === 'main' || currentScreen === 'event_details') {
      void refreshFromBackend();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentScreen === 'main']);

  // Handle Login from Dedicated Auth Portal
  const handleLoginSuccess = (
    role: UserRole,
    details?: { name: string; email: string }
  ) => {
    setUserRole(role);
    if (role === 'organizer') {
      setActiveTab('org_dashboard');
      if (details) {
        setUser((prev) => ({
          ...prev,
          organizerProfile: prev.organizerProfile
            ? {
                ...prev.organizerProfile,
                companyName: details.name,
                businessEmail: details.email,
              }
            : undefined,
        }));
      }
    } else {
      setActiveTab('explore');
      if (details) {
        setUser((prev) => ({
          ...prev,
          name: details.name,
          email: details.email,
        }));
      }
    }
    setTickets([]);
    setCurrentScreen('main');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    void refreshFromBackend();
  };

  // Sign out handler returning to login portal
  const handleSignOut = () => {
    logoutApi();
    setTickets([]);
    setEvents([]);
    setOrganiserEvents([]);
    setResaleListings([]);
    setCurrentScreen('auth');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle saved event
  const handleToggleSave = (eventId: string) => {
    setEvents((prev) =>
      prev.map((evt) =>
        evt.id === eventId ? { ...evt, isSaved: !evt.isSaved } : evt
      )
    );
    if (selectedEvent && selectedEvent.id === eventId) {
      setSelectedEvent((prev) => (prev ? { ...prev, isSaved: !prev.isSaved } : null));
    }
  };

  // Open event details
  const handleSelectEvent = (event: EventItem) => {
    setSelectedEvent(event);
    setCurrentScreen('event_details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open direct booking checkout
  const handleBookDirect = (event: EventItem) => {
    setCheckoutEvent(event);
    setIsCheckoutOpen(true);
  };

  // On successful primary booking
  const handleCheckoutSuccess = (newTicket: Ticket) => {
    setIsCheckoutOpen(false);
    setTickets((prev) => [newTicket, ...prev]);
    setConfirmedTicket(newTicket);
    setUser((prev) => ({
      ...prev,
      rewardPoints: prev.rewardPoints + 250,
    }));

    // Add push notification
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: `Tickets Confirmed: ${newTicket.eventTitle}`,
      message: `Your booking (${newTicket.bookingId}) is ready with dynamic QR access.`,
      time: 'Just now',
      isRead: false,
      type: 'ticket',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    setCurrentScreen('booking_confirmed');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open ticket resale listing modal
  const handleOpenListForResale = (ticket: Ticket) => {
    setTicketToList(ticket);
    setIsListResaleOpen(true);
  };

  // Confirm Resale Listing Creation
  const handleConfirmListResale = async (newListing: ResaleListing) => {
    try {
      const created = await listPassForResaleApi({
        passId: newListing.ticketId,
        listingPrice: newListing.resalePrice,
      });
      const listing: ResaleListing = {
        ...newListing,
        id: String(created.id),
        status: 'available',
      };
      setResaleListings((prev) => [listing, ...prev]);
      setTickets((prev) =>
        prev.map((t) =>
          t.id === listing.ticketId
            ? { ...t, status: 'listed_for_resale', statusLabel: 'LISTED ON RESALE' }
            : t
        )
      );
    } catch (err) {
      console.error(err);
      setApiError(err instanceof Error ? err.message : 'Failed to list for resale');
      // Keep UI responsive with local listing if API rejects (e.g. invalid UUID)
      setResaleListings((prev) => [newListing, ...prev]);
    }

    const listNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: `Ticket Listed for Resale: ${newListing.eventTitle}`,
      message: `Listed at $${newListing.resalePrice}. Escrow protected until verified buyer transfer.`,
      time: 'Just now',
      isRead: false,
      type: 'resale',
    };
    setNotifications((prev) => [listNotif, ...prev]);
    setIsListResaleOpen(false);
    setTicketToList(null);
  };

  // Buy Ticket from Secondary Resale Marketplace
  const handleBuyResaleListing = async (listing: ResaleListing) => {
    try {
      await buyResaleListingApi(listing.id);
    } catch (err) {
      console.error(err);
      setApiError(err instanceof Error ? err.message : 'Resale purchase failed');
    }

    // 1. Mark listing as sold
    setResaleListings((prev) =>
      prev.map((l) => (l.id === listing.id ? { ...l, status: 'sold' } : l))
    );

    // 2. Refresh passes from backend (new pass id after resale transfer)
    try {
      const published = events.length ? events : await fetchPublishedEvents();
      const myPasses = await fetchMyPasses(published);
      setTickets(myPasses);
      const purchased =
        myPasses.find((t) => t.eventId === listing.eventId) || myPasses[0];
      if (purchased) setConfirmedTicket(purchased);
    } catch {
      const purchasedTicket: Ticket = {
        id: `tkt-resale-${Date.now()}`,
        bookingId: `STX-${Math.floor(100000 + Math.random() * 900000)}`,
        eventId: listing.eventId,
        eventTitle: listing.eventTitle,
        eventImage: listing.eventImage,
        date: listing.date,
        time: listing.time || '08:00 PM',
        monthShort: 'JUN',
        dayNumber: '15',
        venue: listing.venue,
        city: listing.city,
        seat: listing.seat,
        tierName: `${listing.tierName} (Verified Resale)`,
        quantity: 1,
        totalPrice: listing.resalePrice,
        status: 'upcoming',
        statusLabel: 'VERIFIED RESALE PASS',
        qrCodeData: `SNAPTIX|${listing.ticketId}|000000`,
        purchasedAt: 'Today, Just Now',
      };
      setTickets((prev) => [purchasedTicket, ...prev]);
      setConfirmedTicket(purchasedTicket);
    }

    // 3. Add financial royalty to organiser account (5% secondary royalty)
    const royalty = Number((listing.resalePrice * 0.05).toFixed(2));
    const newTx: FinancialTransaction = {
      id: `tx-resale-${Date.now()}`,
      type: 'resale_royalty',
      amount: royalty,
      eventTitle: listing.eventTitle,
      date: 'Just now',
      status: 'completed',
      description: `5% Resale Royalty on Ticket #${listing.ticketId} ($${listing.resalePrice})`,
      fee: 0,
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Update organiser available balance
    setUser((prev) => ({
      ...prev,
      organizerProfile: prev.organizerProfile
        ? {
            ...prev.organizerProfile,
            availableBalance: prev.organizerProfile.availableBalance + royalty,
          }
        : undefined,
    }));

    const resaleNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: `Resale Pass Purchased: ${listing.eventTitle}`,
      message: `Verified pass acquired for $${listing.resalePrice}. Old barcode invalidated.`,
      time: 'Just now',
      isRead: false,
      type: 'resale',
    };
    setNotifications((prev) => [resaleNotif, ...prev]);

    setCurrentScreen('booking_confirmed');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Organiser: Create or Update Event
  const handleSaveOrganiserEvent = async (savedEvent: OrganiserEventData) => {
    let persisted = savedEvent;
    try {
      // New events from wizard usually have local ids; always POST to backend
      const isLocalId = !savedEvent.id || savedEvent.id.startsWith('evt-') || savedEvent.id.length < 30;
      if (isLocalId) {
        persisted = await createEventApi(organiserEventToCreatePayload(savedEvent));
      } else if (savedEvent.status) {
        await updateEventStatusApi(savedEvent.id, savedEvent.status);
        persisted = { ...savedEvent };
      }
      await refreshFromBackend();
    } catch (err) {
      console.error(err);
      setApiError(err instanceof Error ? err.message : 'Failed to save event');
      setOrganiserEvents((prev) => {
        const exists = prev.some((e) => e.id === savedEvent.id);
        if (exists) {
          return prev.map((e) => (e.id === savedEvent.id ? savedEvent : e));
        }
        return [savedEvent, ...prev];
      });
    }

    setOrganiserEvents((prev) => {
      const exists = prev.some((e) => e.id === persisted.id);
      if (exists) {
        return prev.map((e) => (e.id === persisted.id ? persisted : e));
      }
      return [persisted, ...prev];
    });

    // If published, also add/update to public explore events
    if (persisted.status === 'published') {
      const publicItem: EventItem = {
        id: persisted.id,
        title: persisted.title,
        tagline: persisted.tagline,
        category: persisted.category,
        badge: 'LIVE ON SALE',
        badgeType: 'primary',
        date: persisted.date,
        monthShort: persisted.monthShort,
        dayNumber: persisted.dayNumber,
        time: persisted.time,
        eventDateIso: persisted.eventDateIso,
        venue: persisted.venue,
        city: persisted.city,
        price: persisted.price,
        image: persisted.image,
        description: persisted.description,
        isSaved: false,
        organizer: {
          name: persisted.organizer.name,
          avatar: persisted.organizer.avatar,
          rating: 4.9,
          reviewsCount: 420,
          isVerified: true,
          followers: 12000,
        },
        tiers: persisted.tiers.map((t) => ({
          id: t.id,
          name: t.name,
          price: t.price,
          description: t.description,
          available: t.available,
          perks: t.perks,
        })),
        locationCoords: persisted.locationCoords,
      };

      setEvents((prev) => {
        const exists = prev.some((e) => e.id === publicItem.id);
        if (exists) {
          return prev.map((e) => (e.id === publicItem.id ? publicItem : e));
        }
        return [publicItem, ...prev];
      });
    }

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: `Event Saved: ${persisted.title}`,
      message: `Your event is saved as ${persisted.status.toUpperCase()}.`,
      time: 'Just now',
      isRead: false,
      type: 'event',
    };
    setNotifications((prev) => [notif, ...prev]);
    setIsEventWizardOpen(false);
    setWizardEditEvent(null);
  };

  // Organiser: Update event status ('published' | 'draft' | 'live' | 'completed')
  const handleUpdateOrganiserEventStatus = async (
    eventId: string,
    status: OrganiserEventData['status']
  ) => {
    try {
      await updateEventStatusApi(eventId, status);
      await refreshFromBackend();
    } catch (err) {
      console.error(err);
      setApiError(err instanceof Error ? err.message : 'Failed to update status');
    }
    setOrganiserEvents((prev) =>
      prev.map((evt) => (evt.id === eventId ? { ...evt, status } : evt))
    );
    setEvents((prev) =>
      prev.map((evt) =>
        evt.id === eventId
          ? {
              ...evt,
              badge: status === 'published' ? 'LIVE' : status.toUpperCase(),
            }
          : evt
      )
    );
  };

  // Organiser: Update Tier Capacity — "available" is remaining slots; the backend
  // tracks total capacity, so we translate: newCapacity = ticketsSold + newAvailable.
  const handleUpdateTierCapacity = async (
    eventId: string,
    tierId: string,
    newAvailable: number
  ) => {
    const event = organiserEvents.find((e) => e.id === eventId);
    const tier = event?.tiers.find((t) => t.id === tierId);
    const ticketsSold = tier?.ticketsSold || 0;
    const newCapacity = Math.max(0, ticketsSold + Math.max(0, newAvailable));

    try {
      const updatedTier = await updateTierCapacityApi(eventId, tierId, newCapacity);
      setOrganiserEvents((prev) =>
        prev.map((evt) => {
          if (evt.id !== eventId) return evt;
          const updatedTiers = evt.tiers.map((t) => (t.id === tierId ? updatedTier : t));
          const totalCapacity = updatedTiers.reduce(
            (acc, t) => acc + (t.ticketsSold || 0) + t.available,
            0
          );
          return { ...evt, tiers: updatedTiers, totalCapacity };
        })
      );
    } catch (err) {
      console.error('Failed to update tier capacity', err);
      setApiError(err instanceof Error ? err.message : 'Failed to update tier capacity');
    }
  };

  // Organiser: Toggle Publish status
  const handleTogglePublishOrganiserEvent = (eventId: string) => {
    setOrganiserEvents((prev) =>
      prev.map((evt) => {
        if (evt.id === eventId) {
          const nextStatus = evt.status === 'published' ? 'draft' : 'published';
          return { ...evt, status: nextStatus };
        }
        return evt;
      })
    );
  };

  // Organiser: Fetch the real attendee roster for one event (GET /events/{id}/attendees)
  const refreshAttendeesForEvent = async (eventId: string) => {
    try {
      const attendees = await fetchEventAttendees(eventId);
      setOrganiserEvents((prev) =>
        prev.map((evt) =>
          evt.id === eventId
            ? { ...evt, attendees, checkedInCount: attendees.filter((a) => a.checkedIn).length }
            : evt
        )
      );
    } catch (err) {
      console.error('Failed to load attendee roster', err);
    }
  };

  // Organiser: Manual desk check-in by real passId (no QR token required).
  // Used both by the roster's "Check In" button (fire-and-forget) and by the
  // QR scanner's real-data-only "Check In Next Pending" shortcut (awaited).
  const handleCheckInAttendee = async (
    eventId: string,
    passId: string
  ): Promise<{ success: boolean; message: string; attendee?: AttendeeRecord }> => {
    try {
      const attendee = await manualCheckInApi(eventId, passId);
      setOrganiserEvents((prev) =>
        prev.map((evt) => {
          if (evt.id !== eventId) return evt;
          const attendees = evt.attendees.map((a) => (a.id === attendee.id ? attendee : a));
          return { ...evt, attendees, checkedInCount: attendees.filter((a) => a.checkedIn).length };
        })
      );
      return {
        success: true,
        message: `VALID ENTRY PASS: Welcome ${attendee.name} (${attendee.tierName})`,
        attendee,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Check-in failed';
      const alreadyChecked = /already|checked_in|checked in/i.test(message);
      return {
        success: false,
        message: alreadyChecked ? `ALREADY SCANNED: ${message}` : `INVALID PASS: ${message}`,
      };
    }
  };


  // Organiser: Toggle Explore Boost Placement
  const handleToggleExploreBoost = (eventId: string) => {
    setOrganiserEvents((prev) =>
      prev.map((e) =>
        e.id === eventId ? { ...e, isBoostedOnExplore: !e.isBoostedOnExplore } : e
      )
    );
  };

  // Organiser: Dispatched Bulk Broadcast — email channel hits real Mailpit SMTP via API
  const handleSendBulkBroadcast = async (newBroadcast: BulkBroadcastCampaign) => {
    setBulkBroadcasts((prev) => [newBroadcast, ...prev]);

    if (newBroadcast.channels.includes('email')) {
      try {
        const bodyHtml = `<p>${newBroadcast.messageBody
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\n/g, '<br/>')}</p>`;
        const campaign = await createEmailCampaignApi({
          eventId: newBroadcast.eventId,
          subject: newBroadcast.subject || newBroadcast.title,
          bodyHtml,
          // Fallback so local Mailpit always receives something when event has no buyers yet
          recipientEmails: ['alex.chen@gmail.com'],
        });
        const sent = await sendEmailCampaignApi(campaign.id);
        const blastNotif: AppNotification = {
          id: `notif-${Date.now()}`,
          title: `Email campaign sent: ${newBroadcast.title}`,
          message: `Delivered ${sent.sentCount}/${sent.recipientCount} via Mailpit (check http://127.0.0.1:8025).`,
          time: 'Just now',
          isRead: false,
          type: 'promo',
        };
        setNotifications((prev) => [blastNotif, ...prev]);
        return;
      } catch (err) {
        console.error(err);
        setApiError(err instanceof Error ? err.message : 'Email campaign failed');
        throw err;
      }
    }

    const blastNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: `Bulk Broadcast Sent: ${newBroadcast.title}`,
      message: `Dispatched to ${newBroadcast.audienceCount.toLocaleString()} fans via ${newBroadcast.channels.join(' & ').toUpperCase()}.`,
      time: 'Just now',
      isRead: false,
      type: 'promo',
    };
    setNotifications((prev) => [blastNotif, ...prev]);
  };

  // Organiser: Omni-channel Social Post Published
  const handlePublishOmniPost = (newPost: OmniSocialPost) => {
    setOmniPosts((prev) => [newPost, ...prev]);
    const omniNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: `1-Shot Social Post Published!`,
      message: `Shared across ${newPost.platforms.join(', ').toUpperCase()} with auto-tagged ticketing links.`,
      time: 'Just now',
      isRead: false,
      type: 'promo',
    };
    setNotifications((prev) => [omniNotif, ...prev]);
  };

  // Organiser: Reply to Inbound Fan Comment
  const handleReplyInboundComment = (commentId: string, replyText: string) => {
    setInboundComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, replied: true, replyText } : c))
    );
  };

  // 2-Way Chat Message Dispatcher (Attendee <-> Organizer)
  const handleSendChatMessage = (
    threadId: string,
    text: string,
    sender: 'attendee' | 'organizer'
  ) => {
    const newMsg = {
      id: `msg-${Date.now()}`,
      threadId,
      sender,
      senderName: sender === 'attendee' ? user.name : 'Apex Host Team',
      text,
      timestamp: 'Just now',
      isRead: true,
    };

    setChatThreads((prev) => {
      const exists = prev.some((t) => t.id === threadId);
      if (exists) {
        return prev.map((t) =>
          t.id === threadId
            ? {
                ...t,
                lastMessage: text,
                lastMessageTime: 'Just now',
                unreadForAttendee: sender === 'organizer' ? t.unreadForAttendee + 1 : t.unreadForAttendee,
                unreadForOrganizer: sender === 'attendee' ? t.unreadForOrganizer + 1 : t.unreadForOrganizer,
                messages: [...t.messages, newMsg],
              }
            : t
        );
      } else {
        const newThread: ChatThread = {
          id: threadId,
          eventId: chatActiveEvent?.id || 'event-neon-horizons',
          eventTitle: chatActiveTicket?.eventTitle || chatActiveEvent?.title || 'Neon Horizons Tour',
          attendeeId: 'user-me',
          attendeeName: user.name || 'Alex Thompson',
          attendeeEmail: user.email || 'alex.thompson@gmail.com',
          attendeeAvatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
          ticketBookingId: chatActiveTicket?.bookingId || '#PX-9920',
          ticketTier: chatActiveTicket?.tierName || 'General Admission',
          ticketSeat: chatActiveTicket?.seat || 'GA Standing (Plaza)',
          checkedIn: false,
          lastMessage: text,
          lastMessageTime: 'Just now',
          unreadForAttendee: 0,
          unreadForOrganizer: 1,
          status: 'open',
          category: 'General',
          messages: [newMsg],
        };
        return [newThread, ...prev];
      }
    });
  };

  // Open Chat Modal for Attendee
  const handleOpenAttendeeChat = (ticket?: Ticket, event?: EventItem) => {
    if (ticket) {
      setChatActiveTicket(ticket);
      const matchedEvent = events.find((e) => e.id === ticket.eventId);
      setChatActiveEvent(matchedEvent || null);
    } else if (event) {
      setChatActiveEvent(event);
      const matchedTicket = tickets.find((t) => t.eventId === event.id);
      setChatActiveTicket(matchedTicket || null);
    }
    setIsChatModalOpen(true);
  };

  // Organiser: Request Payout
  const handleRequestPayout = (amount: number, destination: string) => {
    const newPayout: PayoutRecord = {
      id: `payout-${Date.now()}`,
      amount,
      destination,
      date: 'Today, Just Now',
      status: 'completed',
      referenceId: `ACH_${Math.floor(100000000 + Math.random() * 900000000)}`,
    };

    const newTx: FinancialTransaction = {
      id: `tx-payout-${Date.now()}`,
      type: 'payout',
      amount: -amount,
      eventTitle: 'Snaptix Payout Transfer',
      date: 'Just now',
      status: 'completed',
      description: `Transfer to ${destination}`,
      fee: 0,
    };

    setPayouts((prev) => [newPayout, ...prev]);
    setTransactions((prev) => [newTx, ...prev]);

    setUser((prev) => ({
      ...prev,
      organizerProfile: prev.organizerProfile
        ? {
            ...prev.organizerProfile,
            availableBalance: Math.max(0, prev.organizerProfile.availableBalance - amount),
          }
        : undefined,
    }));
  };

  // Mark all notifications read
  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Update user profile
  const handleUpdateUser = (updated: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updated }));
  };

  // SCREEN 1: SPLASH VIEW
  if (currentScreen === 'splash') {
    return (
      <SplashView
        onComplete={() => setCurrentScreen('auth')}
        onDirectRoleSelect={async (role) => {
          try {
            const { registerApi } = await import('./services/snaptixApi');
            const backendRole = role === 'organizer' ? 'ORGANISER' : 'ATTENDEE';
            const email =
              role === 'organizer'
                ? 'promoter@apexentertainment.io'
                : 'alex.chen@gmail.com';
            const name =
              role === 'organizer' ? 'Apex Entertainment Group' : 'Alex Chen';
            await registerApi({
              email,
              password: 'password123',
              fullName: name,
              role: backendRole,
            });
            handleLoginSuccess(role, { name, email });
          } catch (err) {
            console.error(err);
            handleLoginSuccess(role);
          }
        }}
      />
    );
  }

  // SCREEN 2: AUTH PORTAL VIEW (SEPARATE LOGIN FOR EXPLORER & ORGANIZER)
  if (currentScreen === 'auth') {
    return (
      <AuthPortalView
        initialRole={userRole}
        onLoginSuccess={handleLoginSuccess}
        onBackToSplash={() => setCurrentScreen('splash')}
      />
    );
  }

  // SCREEN 3: EVENT DETAILS VIEW
  if (currentScreen === 'event_details' && selectedEvent) {
    return (
      <>
        <EventDetailsView
          event={selectedEvent}
          allEvents={events}
          onBack={() => setCurrentScreen('main')}
          onBookTickets={handleBookDirect}
          onToggleSave={handleToggleSave}
          onSelectSimilarEvent={handleSelectEvent}
          onOpenChat={(evt) => handleOpenAttendeeChat(undefined, evt)}
        />
        {checkoutEvent && (
          <CheckoutModal
            event={checkoutEvent}
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            onSuccess={handleCheckoutSuccess}
          />
        )}
        <AttendeeOrganizerChatModal
          isOpen={isChatModalOpen}
          onClose={() => setIsChatModalOpen(false)}
          ticket={chatActiveTicket}
          event={chatActiveEvent}
          activeThread={chatActiveThread}
          onSendMessage={handleSendChatMessage}
        />
      </>
    );
  }

  // SCREEN 4: BOOKING CONFIRMED VIEW
  if (currentScreen === 'booking_confirmed' && confirmedTicket) {
    return (
      <BookingConfirmedView
        ticket={confirmedTicket}
        onViewTickets={() => {
          setCurrentScreen('main');
          setUserRole('attendee');
          setActiveTab('tickets');
        }}
        onReturnHome={() => {
          setCurrentScreen('main');
          setUserRole('attendee');
          setActiveTab('explore');
        }}
      />
    );
  }

  // SCREEN 5: MAIN MULTI-ROLE TABBED APP (DISTINCT SEPARATED EXPERIENCES)
  return (
    <div id="snaptix-app-root" className="min-h-screen bg-[#f9f9fb] text-[#1a1c1d] flex flex-col justify-between">
      {/* Top Header App Bar (Role-Specific) */}
      <TopAppBar
        activeTab={activeTab}
        userRole={userRole}
        unreadCount={unreadNotificationsCount}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenCreateWizard={() => {
          setWizardEditEvent(null);
          setIsEventWizardOpen(true);
        }}
        onOpenQRScanner={() => {
          setScannerSelectedEventId(undefined);
          setIsScannerOpen(true);
        }}
        onSignOut={handleSignOut}
      />

      {(apiError || isBootstrappingApi) && (
        <div
          className={`text-center text-xs px-3 py-2 ${
            apiError ? 'bg-amber-50 text-amber-800' : 'bg-violet-50 text-violet-700'
          }`}
        >
          {isBootstrappingApi
            ? `Syncing with API ${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8081/api/v1'}…`
            : `API: ${apiError}`}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {/* ATTENDEE TAB 1: EXPLORE DISCOVERY */}
          {userRole === 'attendee' && activeTab === 'explore' && (
            <motion.div
              key="tab-explore"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <ExploreView
                events={events}
                onSelectEvent={handleSelectEvent}
                onBookDirect={handleBookDirect}
                onToggleSave={handleToggleSave}
                onOpenCreateEvent={() => {
                  setUserRole('organizer');
                  setActiveTab('org_dashboard');
                }}
                onOpenSearch={() => setIsSearchOpen(true)}
              />
            </motion.div>
          )}

          {/* ATTENDEE TAB 2: RESALE MARKETPLACE */}
          {userRole === 'attendee' && activeTab === 'marketplace' && (
            <motion.div
              key="tab-marketplace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <ResaleMarketplaceView
                listings={resaleListings}
                userTickets={tickets}
                onBuyListing={handleBuyResaleListing}
                onSelectListTicket={handleOpenListForResale}
              />
            </motion.div>
          )}

          {/* ATTENDEE TAB 3: MY TICKETS */}
          {userRole === 'attendee' && activeTab === 'tickets' && (
            <motion.div
              key="tab-tickets"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <MyTicketsView
                tickets={tickets}
                onBrowseEvents={() => setActiveTab('explore')}
                onListForResale={handleOpenListForResale}
                onOpenChatWithHost={(ticket) => handleOpenAttendeeChat(ticket)}
              />
            </motion.div>
          )}

          {/* ATTENDEE TAB 4: SAVED EVENTS */}
          {userRole === 'attendee' && activeTab === 'saved' && (
            <motion.div
              key="tab-saved"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <SavedEventsView
                savedEvents={savedEvents}
                onSelectEvent={handleSelectEvent}
                onBookDirect={handleBookDirect}
                onToggleSave={handleToggleSave}
                onBrowseEvents={() => setActiveTab('explore')}
              />
            </motion.div>
          )}

          {/* ATTENDEE TAB 5: PROFILE & SIGN OUT */}
          {userRole === 'attendee' && activeTab === 'profile' && (
            <motion.div
              key="tab-profile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <ProfileView
                user={user}
                tickets={tickets}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onUpdateUser={handleUpdateUser}
                onSignOut={handleSignOut}
              />
            </motion.div>
          )}

          {/* ORGANISER TAB 1: DASHBOARD HUB */}
          {userRole === 'organizer' && activeTab === 'org_dashboard' && (
            <motion.div
              key="tab-org-dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <OrganiserDashboardView
                events={organiserEvents}
                transactions={transactions}
                currentPersona={currentPersona}
                onOpenCreateWizard={() => {
                  setWizardEditEvent(null);
                  setIsEventWizardOpen(true);
                }}
                onOpenQRScanner={() => {
                  setScannerSelectedEventId(undefined);
                  setIsScannerOpen(true);
                }}
                onNavigateTab={(tab) => {
                  setActiveTab(tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onSelectEventManage={(eventId) => {
                  setManageSelectedEventId(eventId);
                  setActiveTab('org_events');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onSignOut={handleSignOut}
              />
            </motion.div>
          )}

          {/* ORGANISER TAB 2: EVENTS & ATTENDEES ROSTER */}
          {userRole === 'organizer' && activeTab === 'org_events' && (
            <motion.div
              key="tab-org-events"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <OrganiserEventsView
                events={organiserEvents}
                selectedEventId={manageSelectedEventId}
                currentPersona={currentPersona}
                onSelectEvent={(id) => {
                  setManageSelectedEventId(id);
                  if (id) void refreshAttendeesForEvent(id);
                }}
                onOpenCreateWizard={() => {
                  setWizardEditEvent(null);
                  setIsEventWizardOpen(true);
                }}
                onOpenQRScanner={() => {
                  setScannerSelectedEventId(undefined);
                  setIsScannerOpen(true);
                }}
                onCheckInAttendee={(eventId, attendeeId) => {
                  void handleCheckInAttendee(eventId, attendeeId);
                }}
                onUpdateEventStatus={handleUpdateOrganiserEventStatus}
                onUpdateTierCapacity={handleUpdateTierCapacity}
              />
            </motion.div>
          )}

          {/* ORGANISER TAB 3: PROMOTIONS & CAMPAIGNS */}
          {userRole === 'organizer' && activeTab === 'org_promotions' && (
            <motion.div
              key="tab-org-promotions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <OrganiserPromotionsView
                events={organiserEvents}
                promoCodes={promoCodes}
                campaigns={campaigns}
                bulkBroadcasts={bulkBroadcasts}
                socialConnections={socialConnections}
                omniPosts={omniPosts}
                inboundMetrics={inboundMetrics}
                inboundComments={inboundComments}
                chatThreads={chatThreads}
                onCreatePromoCode={(newCode) =>
                  setPromoCodes((prev) => [newCode, ...prev])
                }
                onLaunchCampaign={(newCamp) =>
                  setCampaigns((prev) => [newCamp, ...prev])
                }
                onSendBulkBroadcast={handleSendBulkBroadcast}
                onPublishOmniPost={handlePublishOmniPost}
                onReplyInboundComment={handleReplyInboundComment}
                onSendChatMessage={handleSendChatMessage}
                onToggleExploreBoost={handleToggleExploreBoost}
              />
            </motion.div>
          )}

          {/* ORGANISER TAB 4: PERFORMANCE ANALYTICS */}
          {userRole === 'organizer' && activeTab === 'org_analytics' && (
            <motion.div
              key="tab-org-analytics"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <OrganiserAnalyticsView events={organiserEvents} onFetchAnalytics={fetchOrganiserAnalyticsApi} />
            </motion.div>
          )}

          {/* ORGANISER TAB 5: SALES ACCOUNT & PAYOUTS */}
          {userRole === 'organizer' && activeTab === 'org_sales_account' && (
            <motion.div
              key="tab-org-sales"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <OrganiserSalesAccountView
                user={user}
                transactions={transactions}
                payouts={payouts}
                onRequestPayout={handleRequestPayout}
              />
            </motion.div>
          )}

          {/* ORGANISER TAB 6: SETTINGS & RBAC */}
          {userRole === 'organizer' && activeTab === 'org_settings' && (
            <motion.div
              key="tab-org-settings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <OrganiserSettingsView
                currentPersona={currentPersona}
                onSwitchPersona={(p) => setCurrentPersona(p)}
                pendingApprovalCount={organiserEvents.filter((e) => e.status === 'pending_approval').length}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Sticky Tab Navigation (Tailored to current role) */}
      <BottomNavBar
        activeTab={activeTab}
        userRole={userRole}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        ticketsCount={upcomingTicketsCount}
        savedCount={savedEvents.length}
        resaleCount={availableResaleCount}
      />

      {/* MODAL: CHECKOUT DIRECT BOOKING */}
      {checkoutEvent && (
        <CheckoutModal
          event={checkoutEvent}
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          onSuccess={handleCheckoutSuccess}
        />
      )}

      {/* MODAL: RESALE TICKET LISTING */}
      <ListTicketResaleModal
        ticket={ticketToList}
        isOpen={isListResaleOpen}
        onClose={() => {
          setIsListResaleOpen(false);
          setTicketToList(null);
        }}
        onConfirmList={handleConfirmListResale}
      />

      {/* MODAL: ORGANISER EVENT CREATOR & EDITOR WIZARD */}
      <OrganiserEventWizardModal
        isOpen={isEventWizardOpen}
        initialEvent={wizardEditEvent}
        currentPersona={currentPersona}
        onClose={() => {
          setIsEventWizardOpen(false);
          setWizardEditEvent(null);
        }}
        onSaveEvent={handleSaveOrganiserEvent}
      />

      {/* MODAL: ORGANISER QR PASS SCANNER */}
      <QRCheckInScannerModal
        isOpen={isScannerOpen}
        events={organiserEvents}
        defaultEventId={scannerSelectedEventId}
        onClose={() => setIsScannerOpen(false)}
        onCheckIn={handleCheckInAttendee}
        onRefreshAttendees={refreshAttendeesForEvent}
      />

      {/* MODAL: NOTIFICATIONS CENTER */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        notifications={notifications}
        onClose={() => setIsNotificationsOpen(false)}
        onMarkAllRead={handleMarkAllRead}
      />

      {/* MODAL: SEARCH & FILTER */}
      <SearchModal
        isOpen={isSearchOpen}
        events={events}
        onClose={() => setIsSearchOpen(false)}
        onSelectEvent={handleSelectEvent}
      />

      {/* MODAL: ATTENDEE <-> ORGANIZER 2-WAY LIVE CHAT */}
      <AttendeeOrganizerChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        ticket={chatActiveTicket}
        event={chatActiveEvent}
        activeThread={chatActiveThread}
        onSendMessage={handleSendChatMessage}
      />
    </div>
  );
}
