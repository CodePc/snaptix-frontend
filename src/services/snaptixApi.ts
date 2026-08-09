import {
  apiFetch,
  clearStoredAuth,
  setStoredAuth,
  StoredAuthUser,
} from '../utils/api';
import type { EventItem, OrganiserEventData, ResaleListing, Ticket } from '../types';
import {
  mapBackendEventToEventItem,
  mapBackendEventToOrganiserEvent,
  mapOrderToTicket,
  mapPassToTicket,
  mapResaleListing,
  BackendEvent,
  BackendOrderResponse,
  BackendPass,
  BackendResaleListing,
  BackendResalePurchase,
} from './mappers';

export type AuthResponse = {
  token: string;
  userId: string;
  email?: string;
  phone?: string;
  fullName?: string;
  role: string;
  persona?: string;
};

function storeAuth(data: AuthResponse, fallbackName?: string): StoredAuthUser {
  const user: StoredAuthUser = {
    token: data.token,
    userId: String(data.userId),
    email: data.email || data.phone || '',
    role: data.role,
    name: data.fullName || fallbackName,
  };
  setStoredAuth(user);
  return user;
}

export function roleToBackend(role: 'attendee' | 'organizer'): 'ATTENDEE' | 'ORGANISER' {
  return role === 'organizer' ? 'ORGANISER' : 'ATTENDEE';
}

export function backendRoleToUi(role: string): 'attendee' | 'organizer' {
  return role === 'ORGANISER' || role === 'ORGANIZER' ? 'organizer' : 'attendee';
}

export async function loginApi(email: string, password: string): Promise<StoredAuthUser> {
  const data = await apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return storeAuth(data);
}

export async function registerApi(input: {
  email: string;
  password: string;
  fullName: string;
  role: 'ATTENDEE' | 'ORGANISER';
}): Promise<StoredAuthUser> {
  try {
    const data = await apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return storeAuth(data, input.fullName);
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    if (message.includes('already') || message.includes('400')) {
      return loginApi(input.email, input.password);
    }
    throw err;
  }
}

/** Local/dev Google: backend accepts mock|<sub>|<email>|<name> when GOOGLE_CLIENT_ID unset */
export async function googleAuthApi(input: {
  idToken: string;
  role: 'ATTENDEE' | 'ORGANISER';
  fullName?: string;
}): Promise<StoredAuthUser> {
  const data = await apiFetch<AuthResponse>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken: input.idToken, role: input.role }),
  });
  return storeAuth(data, input.fullName);
}

export async function facebookAuthApi(input: {
  email: string;
  fullName: string;
  role: 'ATTENDEE' | 'ORGANISER';
  accessToken?: string;
}): Promise<StoredAuthUser> {
  const data = await apiFetch<AuthResponse>('/auth/facebook', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return storeAuth(data, input.fullName);
}

export async function phoneStartApi(phone: string): Promise<void> {
  await apiFetch('/auth/phone/start', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

export async function phoneVerifyApi(input: {
  phone: string;
  code: string;
  role: 'ATTENDEE' | 'ORGANISER';
  fullName?: string;
}): Promise<StoredAuthUser> {
  const data = await apiFetch<AuthResponse>('/auth/phone/verify', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return storeAuth(data, input.fullName);
}

export async function fetchMe(): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/me');
}

export function logoutApi(): void {
  clearStoredAuth();
}

export async function fetchPublishedEvents(): Promise<EventItem[]> {
  const rows = await apiFetch<BackendEvent[]>('/events');
  return (rows || []).map(mapBackendEventToEventItem);
}

export async function fetchOrganiserEvents(): Promise<OrganiserEventData[]> {
  try {
    const rows = await apiFetch<BackendEvent[]>('/events/mine');
    return (rows || []).map(mapBackendEventToOrganiserEvent);
  } catch {
    const rows = await apiFetch<BackendEvent[]>('/events');
    return (rows || []).map(mapBackendEventToOrganiserEvent);
  }
}

export async function createEventApi(payload: {
  title: string;
  description: string;
  category: string;
  city: string;
  venue: string;
  imageUrl: string;
  eventDate: string;
  createdByPersona: string;
  tiers: { name: string; price: number; capacity: number }[];
}): Promise<OrganiserEventData> {
  const created = await apiFetch<BackendEvent>('/events', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return mapBackendEventToOrganiserEvent(created);
}

export async function updateEventStatusApi(eventId: string, status: string): Promise<EventItem> {
  const updated = await apiFetch<BackendEvent>(`/events/${eventId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
  return mapBackendEventToEventItem(updated);
}

export async function createOrderApi(
  event: EventItem,
  tierId: string,
  tierName: string,
  quantity: number,
): Promise<Ticket> {
  const order = await apiFetch<BackendOrderResponse>('/orders', {
    method: 'POST',
    body: JSON.stringify({ tierId, quantity }),
  });
  return mapOrderToTicket(order, event, tierName, quantity);
}

export async function fetchMyPasses(events: EventItem[]): Promise<Ticket[]> {
  const passes = await apiFetch<BackendPass[]>('/passes/mine');
  return (passes || []).map((p) => mapPassToTicket(p, events));
}

export async function fetchPassToken(passId: string): Promise<{
  passId: string;
  currentToken: string;
  secondsRemaining: number;
  passStatus: string;
}> {
  return apiFetch(`/passes/${passId}/token`);
}

export async function validatePassApi(
  passId: string,
  token: string,
): Promise<{ valid: boolean; message: string; passId: string }> {
  return apiFetch(`/passes/${passId}/validate`, {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

export async function fetchResaleListings(events: EventItem[]): Promise<ResaleListing[]> {
  const rows = await apiFetch<BackendResaleListing[]>('/resale');
  return (rows || []).map((r) => mapResaleListing(r, events));
}

export async function listPassForResaleApi(input: {
  passId: string;
  listingPrice: number;
}): Promise<BackendResaleListing> {
  const qs = new URLSearchParams({
    passId: input.passId,
    listingPrice: String(input.listingPrice),
  });
  return apiFetch<BackendResaleListing>(`/resale/list?${qs.toString()}`, {
    method: 'POST',
  });
}

export async function buyResaleListingApi(listingId: string): Promise<BackendResalePurchase> {
  return apiFetch<BackendResalePurchase>(`/resale/${listingId}/buy`, { method: 'POST' });
}

export type EmailCampaign = {
  id: string;
  organiserId: string;
  eventId?: string;
  subject: string;
  bodyHtml: string;
  status: string;
  createdAt?: string;
  sentAt?: string;
  recipientCount: number;
  sentCount: number;
};

export async function createEmailCampaignApi(input: {
  eventId?: string;
  subject: string;
  bodyHtml: string;
  recipientEmails?: string[];
}): Promise<EmailCampaign> {
  return apiFetch('/organiser/email-campaigns', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function sendEmailCampaignApi(id: string): Promise<EmailCampaign> {
  return apiFetch(`/organiser/email-campaigns/${id}/send`, { method: 'POST' });
}

export async function listEmailCampaignsApi(): Promise<EmailCampaign[]> {
  return apiFetch('/organiser/email-campaigns');
}

/** Build QR payload scanned by organiser app */
export function buildPassQrPayload(passId: string, token: string): string {
  return `SNAPTIX|${passId}|${token}`;
}

export function parsePassQrPayload(raw: string): { passId: string; token: string } | null {
  const trimmed = raw.trim();
  const parts = trimmed.split('|');
  if (parts.length >= 3 && parts[0].toUpperCase() === 'SNAPTIX') {
    return { passId: parts[1], token: parts[2] };
  }
  // fallback: "passId token" or "passId:token"
  const m = trimmed.match(
    /^([0-9a-fA-F-]{36})\s*[|:\s]\s*(\d{6})$/,
  );
  if (m) return { passId: m[1], token: m[2] };
  return null;
}
