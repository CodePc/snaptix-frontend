import type {
  AttendeeRecord,
  EventItem,
  EventTier,
  OrganiserAnalytics,
  OrganiserEventData,
  ResaleListing,
  Ticket,
} from '../types';

export type BackendTier = {
  id: string;
  name: string;
  price: number;
  capacity: number;
  ticketsSold: number;
};

export type BackendEvent = {
  id: string;
  organizerId?: string;
  title: string;
  description?: string;
  category: string;
  city: string;
  venue: string;
  imageUrl?: string;
  status?: string;
  createdByPersona?: string;
  eventDate: string;
  createdAt?: string;
  tiers?: BackendTier[];
};

export type BackendTicketPass = {
  passId: string;
  tierId: string;
  orderId?: string;
  passStatus: string;
  currentToken?: string | null;
  secondsRemaining?: number | null;
};

export type BackendPass = BackendTicketPass;

export type BackendOrderResponse = {
  orderId: string;
  totalAmount: number;
  paymentStatus: string;
  passes: BackendTicketPass[];
};

export type BackendResaleListing = {
  id: string;
  passId: string;
  sellerId?: string;
  buyerId?: string;
  listingPrice: number;
  originalFaceValue: number;
  status: string;
  createdAt?: string;
};

export type BackendResalePurchase = {
  listingId: string;
  newPassId: string;
  message: string;
};

export type BackendAttendee = {
  passId: string;
  orderId?: string;
  fullName?: string;
  email?: string;
  tierName: string;
  passStatus: string;
  issuedAt?: string;
};

export type BackendDailyRevenuePoint = {
  date: string;
  revenue: number;
};

export type BackendTierBreakdownPoint = {
  tierName: string;
  ticketsSold: number;
  revenue: number;
};

export type BackendOrganiserAnalytics = {
  totalGrossRevenue: number;
  totalTicketsSold: number;
  totalCapacity: number;
  checkedInCount: number;
  avgOrderValue: number;
  resaleRoyalties: number;
  dailyRevenue: BackendDailyRevenuePoint[];
  tierBreakdown: BackendTierBreakdownPoint[];
};

const CATEGORY_FALLBACK = 'Music' as const;

function parseEventDate(iso: string): Date {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function formatParts(iso: string) {
  const d = parseEventDate(iso);
  return {
    date: d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    monthShort: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    dayNumber: String(d.getDate()),
    time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
  };
}

function mapTier(t: BackendTier): EventTier {
  return {
    id: String(t.id),
    name: t.name,
    price: Number(t.price) || 0,
    description: `${t.name} access`,
    available: Math.max(0, (t.capacity || 0) - (t.ticketsSold || 0)),
    ticketsSold: t.ticketsSold || 0,
    perks: ['Digital dynamic pass', 'Gate QR check-in'],
  };
}

/** Maps the raw tier entity returned by PUT /events/{id}/tiers/{tierId}. */
export const mapBackendTierToEventTier = mapTier;

function normalizeCategory(category: string): EventItem['category'] {
  const allowed: EventItem['category'][] = [
    'Music',
    'Tech',
    'Sports',
    'Arts',
    'Food',
    'Nightlife',
    'Workshops',
  ];
  const match = allowed.find((c) => c.toLowerCase() === category?.toLowerCase());
  return match || CATEGORY_FALLBACK;
}

export function mapBackendEventToEventItem(e: BackendEvent): EventItem {
  const parts = formatParts(e.eventDate);
  const tiers = (e.tiers || []).map(mapTier);
  const minPrice = tiers.length ? Math.min(...tiers.map((t) => t.price)) : 0;
  const image =
    e.imageUrl ||
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=80';

  return {
    id: String(e.id),
    title: e.title,
    tagline: e.description?.slice(0, 80) || undefined,
    category: normalizeCategory(e.category),
    badge: e.status === 'published' ? 'LIVE' : (e.status || '').toUpperCase(),
    badgeType: 'primary',
    date: parts.date,
    monthShort: parts.monthShort,
    dayNumber: parts.dayNumber,
    time: parts.time,
    eventDateIso: e.eventDate,
    venue: e.venue,
    city: e.city,
    price: minPrice,
    isFree: minPrice === 0,
    image,
    description: e.description || '',
    organizer: {
      name: 'SnapTix Host',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=snaptix',
      rating: 4.9,
      reviewsCount: 120,
      isVerified: true,
      followers: 2400,
    },
    tiers,
    locationCoords: {
      lat: 40.7128,
      lng: -74.006,
      address: `${e.venue}, ${e.city}`,
      mapQuery: `${e.venue} ${e.city}`,
    },
    isSaved: false,
    status: (e.status as EventItem['status']) || 'published',
  };
}

export function mapBackendEventToOrganiserEvent(e: BackendEvent): OrganiserEventData {
  const base = mapBackendEventToEventItem(e);
  const ticketsSold = (e.tiers || []).reduce((acc, t) => acc + (t.ticketsSold || 0), 0);
  const totalCapacity = (e.tiers || []).reduce((acc, t) => acc + (t.capacity || 0), 0);
  // Weighted by each tier's own price, not tickets * cheapest tier's price.
  const grossSales = (e.tiers || []).reduce(
    (acc, t) => acc + (t.ticketsSold || 0) * (Number(t.price) || 0),
    0,
  );
  return {
    ...base,
    status: (e.status as OrganiserEventData['status']) || 'published',
    totalCapacity,
    ticketsSold,
    grossSales,
    checkedInCount: 0,
    attendees: [],
    createdByPersona: (e.createdByPersona as 'admin' | 'moderator') || 'admin',
  };
}

export function mapOrderToTicket(
  order: BackendOrderResponse,
  event: EventItem,
  tierName: string,
  quantity: number,
): Ticket {
  const firstPass = order.passes?.[0];
  const passId = String(firstPass?.passId || order.orderId);
  const token = firstPass?.currentToken || '000000';

  return {
    id: passId,
    bookingId: `#${String(order.orderId).slice(0, 8).toUpperCase()}`,
    eventId: event.id,
    eventTitle: event.title,
    eventImage: event.image,
    date: event.date,
    monthShort: event.monthShort || 'NOW',
    dayNumber: event.dayNumber || '1',
    time: event.time,
    venue: event.venue,
    city: event.city,
    seat: `PASS-${passId.slice(0, 4).toUpperCase()}`,
    tierName,
    quantity,
    totalPrice: Number(order.totalAmount) || 0,
    status: 'upcoming',
    statusLabel: order.paymentStatus || 'CONFIRMED',
    qrCodeData: `SNAPTIX|${passId}|${token}`,
    purchasedAt: new Date().toISOString(),
  };
}

export function mapPassToTicket(pass: BackendPass, events: EventItem[]): Ticket {
  const event =
    events.find((e) => e.tiers.some((t) => t.id === String(pass.tierId))) || events[0];
  const passId = String(pass.passId);
  const token = pass.currentToken || '------';
  const status =
    pass.passStatus === 'CHECKED_IN'
      ? 'past'
      : pass.passStatus === 'LISTED_FOR_RESALE'
        ? 'listed_for_resale'
        : pass.passStatus === 'RESOLD'
          ? 'resold'
          : 'upcoming';

  return {
    id: passId,
    bookingId: `#${passId.slice(0, 8).toUpperCase()}`,
    eventId: event?.id || '',
    eventTitle: event?.title || 'SnapTix Event',
    eventImage: event?.image || '',
    date: event?.date || '',
    monthShort: event?.monthShort || 'NOW',
    dayNumber: event?.dayNumber || '1',
    time: event?.time || '',
    venue: event?.venue || '',
    city: event?.city || '',
    seat: `PASS-${passId.slice(0, 4).toUpperCase()}`,
    tierName: event?.tiers.find((t) => t.id === String(pass.tierId))?.name || 'Pass',
    quantity: 1,
    totalPrice: event?.tiers.find((t) => t.id === String(pass.tierId))?.price || 0,
    status,
    statusLabel: pass.passStatus,
    qrCodeData: `SNAPTIX|${passId}|${token}`,
    purchasedAt: new Date().toISOString(),
  };
}

export function mapResaleListing(r: BackendResaleListing, events: EventItem[]): ResaleListing {
  const event = events[0];
  return {
    id: String(r.id),
    ticketId: String(r.passId),
    eventId: event?.id || '',
    eventTitle: event?.title || 'SnapTix Event',
    eventImage: event?.image || '',
    date: event?.date || '',
    time: event?.time || '',
    venue: event?.venue || '',
    city: event?.city || '',
    tierName: 'Resale Pass',
    seat: `PASS-${String(r.passId).slice(0, 4).toUpperCase()}`,
    originalPrice: Number(r.originalFaceValue) || 0,
    resalePrice: Number(r.listingPrice) || 0,
    sellerName: 'SnapTix Seller',
    sellerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=seller',
    sellerVerified: true,
    status: r.status === 'ACTIVE' ? 'available' : r.status === 'SOLD' ? 'sold' : 'cancelled',
    listedAt: r.createdAt || new Date().toISOString(),
    antiScalpVerified: true,
    instantTransfer: true,
  };
}

export function mapAttendeeResponse(a: BackendAttendee): AttendeeRecord {
  const passId = String(a.passId);
  const isCheckedIn = a.passStatus === 'CHECKED_IN';
  return {
    id: passId,
    name: a.fullName || 'Ticket Holder',
    email: a.email || '',
    tierName: a.tierName || 'Pass',
    seat: `PASS-${passId.slice(0, 4).toUpperCase()}`,
    bookingId: `#${String(a.orderId || passId).slice(0, 8).toUpperCase()}`,
    ticketCode: passId,
    checkedIn: isCheckedIn,
    checkInTime: isCheckedIn ? 'Checked in' : undefined,
    purchaseDate: a.issuedAt || new Date().toISOString(),
    pricePaid: 0,
  };
}

export function mapOrganiserAnalytics(a: BackendOrganiserAnalytics): OrganiserAnalytics {
  return {
    totalGrossRevenue: Number(a.totalGrossRevenue) || 0,
    totalTicketsSold: a.totalTicketsSold || 0,
    totalCapacity: a.totalCapacity || 0,
    checkedInCount: a.checkedInCount || 0,
    avgOrderValue: Number(a.avgOrderValue) || 0,
    resaleRoyalties: Number(a.resaleRoyalties) || 0,
    dailyRevenue: (a.dailyRevenue || []).map((d) => ({
      date: d.date,
      revenue: Number(d.revenue) || 0,
    })),
    tierBreakdown: (a.tierBreakdown || []).map((t) => ({
      tierName: t.tierName,
      ticketsSold: t.ticketsSold || 0,
      revenue: Number(t.revenue) || 0,
    })),
  };
}

/** Build CreateEventRequest payload from organiser wizard UI model. */
export function organiserEventToCreatePayload(event: OrganiserEventData) {
  // The wizard's date/time pickers populate eventDateIso as a LocalDateTime string
  // ("YYYY-MM-DDTHH:mm:00"); fall back to "now + 14 days" only if it's missing.
  const fallback = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  const eventDate = event.eventDateIso || fallback.toISOString().slice(0, 19);

  return {
    title: event.title,
    description: event.description || event.tagline || '',
    category: event.category,
    city: event.city,
    venue: event.venue,
    imageUrl: event.image,
    eventDate,
    createdByPersona: event.createdByPersona || 'admin',
    tiers: event.tiers.map((t) => ({
      name: t.name,
      price: t.price,
      capacity: t.available > 0 ? t.available : 100,
    })),
  };
}
