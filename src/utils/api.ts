/** Spring Boot API base URL from `.env` (`VITE_API_BASE_URL`). */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ||
  'http://127.0.0.1:8081/api/v1';

const AUTH_TOKEN_KEY = 'snaptix_token';
const AUTH_USER_KEY = 'snaptix_user';

export type StoredAuthUser = {
  token: string;
  userId: string;
  email: string;
  role: string;
  name?: string;
};

export function apiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
}

export function getStoredAuth(): StoredAuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? (JSON.parse(raw) as StoredAuthUser) : null;
  } catch {
    return null;
  }
}

export function setStoredAuth(user: StoredAuthUser): void {
  localStorage.setItem(AUTH_TOKEN_KEY, user.token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export async function apiFetch<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const auth = getStoredAuth();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (auth?.token) {
    headers.Authorization = `Bearer ${auth.token}`;
  }

  const res = await fetch(apiUrl(path), {
    ...init,
    headers,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${body || res.statusText}`);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  const text = await res.text();
  if (!text) {
    return undefined as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}
