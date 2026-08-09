export interface EventTier {
  id: string;
  name: string;
  price: number;
  description: string;
  available: number;
  perks: string[];
}

export interface EventOrganizer {
  name: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  isVerified: boolean;
  followers: number;
}

export interface EventItem {
  id: string;
  title: string;
  tagline?: string;
  category: 'Music' | 'Tech' | 'Sports' | 'Arts' | 'Food' | 'Nightlife' | 'Workshops';
  badge?: string;
  badgeType?: 'primary' | 'secondary' | 'warning' | 'error' | 'success';
  date: string;
  monthShort?: string;
  dayNumber?: string;
  time: string;
  doorsOpen?: string;
  venue: string;
  city: string;
  distance?: string;
  price: number;
  isFree?: boolean;
  image: string;
  description: string;
  organizer: EventOrganizer;
  tiers: EventTier[];
  locationCoords: {
    lat: number;
    lng: number;
    address: string;
    mapQuery: string;
  };
  isTrending?: boolean;
  isSaved?: boolean;
  attendeeAvatars?: string[];
  attendeesCount?: number;
  status?: 'published' | 'draft' | 'pending_approval' | 'rejected' | 'live' | 'completed' | 'paused';
}

export interface Ticket {
  id: string;
  bookingId: string;
  eventId: string;
  eventTitle: string;
  eventImage: string;
  date: string;
  monthShort: string;
  dayNumber: string;
  time: string;
  venue: string;
  city: string;
  seat: string;
  tierName: string;
  quantity: number;
  totalPrice: number;
  status: 'upcoming' | 'past' | 'listed_for_resale' | 'resold';
  statusLabel: string;
  qrCodeData: string;
  purchasedAt: string;
  resalePrice?: number;
}

// Resale Marketplace Listing
export interface ResaleListing {
  id: string;
  ticketId: string;
  eventId: string;
  eventTitle: string;
  eventImage: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  tierName: string;
  seat: string;
  originalPrice: number;
  resalePrice: number;
  sellerName: string;
  sellerAvatar: string;
  sellerVerified: boolean;
  status: 'available' | 'sold' | 'cancelled';
  listedAt: string;
  antiScalpVerified: boolean;
  instantTransfer: boolean;
}

// Organiser Specific Types
export interface AttendeeRecord {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  tierName: string;
  seat: string;
  bookingId: string;
  ticketCode: string;
  checkedIn: boolean;
  checkInTime?: string;
  purchaseDate: string;
  pricePaid: number;
}

export interface PromoCode {
  id: string;
  code: string;
  eventId: string; // or 'all'
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  usedCount: number;
  maxUses: number;
  expiryDate: string;
  isActive: boolean;
}

export interface MarketingCampaign {
  id: string;
  eventId: string;
  eventTitle: string;
  name: string;
  channel: 'email' | 'sms' | 'social_boost' | 'affiliate';
  recipientsCount: number;
  clicksCount: number;
  ticketsSold: number;
  revenueGenerated: number;
  status: 'active' | 'completed' | 'scheduled';
  scheduledDate: string;
}

export type OrganiserPersona = 'admin' | 'moderator';

export interface OrganiserEventData extends EventItem {
  status: 'published' | 'draft' | 'pending_approval' | 'rejected' | 'live' | 'completed' | 'paused';
  totalCapacity: number;
  ticketsSold: number;
  grossSales: number;
  checkedInCount: number;
  attendees: AttendeeRecord[];
  isBoostedOnExplore?: boolean;
  createdByPersona?: OrganiserPersona;
  approvalNote?: string;
  aiGeneratedDetails?: {
    suggestedHashtags?: string[];
    bannerPrompt?: string;
    targetDemographics?: string;
  };
}

export interface FinancialTransaction {
  id: string;
  type: 'ticket_sale' | 'resale_royalty' | 'refund' | 'payout';
  amount: number;
  eventTitle?: string;
  date: string;
  status: 'completed' | 'pending' | 'processing';
  description: string;
  fee: number;
}

export interface PayoutRecord {
  id: string;
  amount: number;
  destination: string;
  date: string;
  status: 'completed' | 'processing' | 'pending';
  referenceId: string;
}

export interface ConnectedWallet {
  address: string;
  chain: string;
  balance: string;
  isSimulated?: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  location: string;
  rewardPoints: number;
  interests: string[];
  connectedWallet: ConnectedWallet | null;
  paymentMethods: {
    id: string;
    type: 'card' | 'apple_pay' | 'google_pay' | 'crypto';
    label: string;
    last4?: string;
    expiry?: string;
    isDefault: boolean;
  }[];
  // Organiser Financial Info
  organizerProfile?: {
    companyName: string;
    stripeConnected: boolean;
    bankName: string;
    bankAccountLast4: string;
    availableBalance: number;
    pendingBalance: number;
    lifetimeGrossRevenue: number;
  };
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'ticket' | 'event' | 'reward' | 'system' | 'resale' | 'payout' | 'promo';
}

export type UserRole = 'attendee' | 'organizer';

export type AttendeeTab = 'explore' | 'marketplace' | 'tickets' | 'saved' | 'profile';

export type OrganiserTab = 'org_dashboard' | 'org_events' | 'org_promotions' | 'org_analytics' | 'org_sales_account' | 'org_settings';

export type ActiveTab = AttendeeTab | OrganiserTab;

// ============================================================================
// PROMOTIONS & COMMUNICATIONS ENGINE TYPES
// ============================================================================

export interface BulkBroadcastCampaign {
  id: string;
  eventId: string;
  eventTitle: string;
  title: string;
  channels: ('email' | 'sms')[];
  targetAudience: 'all_attendees' | 'vip_only' | 'category_fans' | 'waitlist' | 'past_buyers';
  audienceCount: number;
  subject?: string;
  messageBody: string;
  discountCode?: string;
  sentAt: string;
  status: 'sent' | 'scheduled' | 'draft';
  stats: {
    delivered: number;
    deliveryRate: number; // e.g. 99.6%
    opens: number;
    openRate: number; // e.g. 48.2%
    clicks: number;
    clickRate: number; // e.g. 21.4%
    ticketsSold: number;
    revenue: number;
  };
}

export interface EventChangeTemplate {
  id: string;
  name: string;
  category: 'schedule_change' | 'venue_change' | 'lineup_update' | 'weather_alert' | 'parking_transit' | 'reschedule_refund';
  icon: string;
  description: string;
  channels: ('email' | 'sms')[];
  subjectTemplate: string;
  bodyTemplate: string;
  smsTemplate: string;
}

export interface SocialAccountConnection {
  platform: 'facebook' | 'instagram' | 'tiktok';
  accountName: string;
  handle: string;
  avatar: string;
  connected: boolean;
  followers: number;
  connectedAt?: string;
  pageId?: string;
}

export interface OmniSocialPost {
  id: string;
  eventId: string;
  eventTitle: string;
  platforms: ('facebook' | 'instagram' | 'tiktok')[];
  caption: string;
  hashtags: string[];
  linkUrl: string;
  mediaUrl: string;
  mediaType: 'image' | 'video' | 'poster';
  publishedAt: string;
  status: 'published' | 'scheduled' | 'draft';
  results?: {
    facebookPostId?: string;
    instagramPostId?: string;
    tiktokPostId?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    tiktokUrl?: string;
  };
}

export interface SocialInboundMetric {
  id: string;
  platform: 'facebook' | 'instagram' | 'tiktok' | 'direct';
  postTitle: string;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  inboundClicks: number;
  ticketsSold: number;
  revenue: number;
  utmSource: string;
  conversionRate: number;
}

export interface SocialInboundComment {
  id: string;
  platform: 'facebook' | 'instagram' | 'tiktok';
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  postTitle: string;
  sentiment: 'positive' | 'question' | 'excited' | 'support';
  replied: boolean;
  replyText?: string;
}

// ============================================================================
// ATTENDEE & ORGANIZER LIVE CHAT TYPES
// ============================================================================

export interface ChatMessage {
  id: string;
  threadId: string;
  sender: 'attendee' | 'organizer';
  senderName: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface ChatThread {
  id: string;
  eventId: string;
  eventTitle: string;
  attendeeId: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeeAvatar: string;
  ticketBookingId: string;
  ticketTier: string;
  ticketSeat: string;
  checkedIn: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadForAttendee: number;
  unreadForOrganizer: number;
  status: 'open' | 'resolved';
  category: 'General' | 'Gate & Parking' | 'VIP Perks' | 'Reschedule' | 'ADA';
  messages: ChatMessage[];
}

