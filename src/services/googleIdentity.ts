/**
 * Real Google Identity Services (GIS) integration.
 *
 * Requires `VITE_GOOGLE_CLIENT_ID` to be set (see `.env.example`). When unset,
 * callers should use the local mock `mock|<sub>|<email>|<name>` flow.
 *
 * Uses the OAuth token client popup (not One Tap) so a real Google account
 * chooser window opens on button click. The returned access token is accepted
 * by the backend `GoogleTokenVerifier` when `GOOGLE_CLIENT_ID` is configured.
 */

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            ux_mode?: 'popup' | 'redirect';
          }) => void;
          prompt: (
            momentListener?: (notification: {
              isNotDisplayed?: () => boolean;
              isSkippedMoment?: () => boolean;
              getNotDisplayedReason?: () => string;
              getSkippedReason?: () => string;
            }) => void,
          ) => void;
        };
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: {
              access_token?: string;
              error?: string;
              error_description?: string;
            }) => void;
            error_callback?: (error: { type?: string; message?: string }) => void;
          }) => { requestAccessToken: (overrideConfig?: { prompt?: string }) => void };
        };
      };
    };
  }
}

export const GOOGLE_CLIENT_ID: string | undefined = (
  import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
)?.trim() || undefined;

const GSI_SCRIPT_ID = 'google-identity-services-script';
const GSI_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

let scriptLoadPromise: Promise<void> | null = null;

function loadGsiScript(): Promise<void> {
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve();
  }
  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }
  scriptLoadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(GSI_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () =>
        reject(new Error('Failed to load Google Identity Services script')),
      );
      return;
    }
    const script = document.createElement('script');
    script.id = GSI_SCRIPT_ID;
    script.src = GSI_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services script'));
    document.head.appendChild(script);
  });
  return scriptLoadPromise;
}

/**
 * Opens the Google OAuth popup and resolves with an access token (or ID token
 * if GIS returns one). Rejects if `VITE_GOOGLE_CLIENT_ID` isn't configured,
 * GIS fails to load, or the user cancels.
 */
export async function requestGoogleIdToken(): Promise<string> {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error(
      'VITE_GOOGLE_CLIENT_ID is not set. Add it to your .env to enable real Google Sign-In.',
    );
  }
  await loadGsiScript();
  const google = window.google;
  if (!google?.accounts?.oauth2) {
    throw new Error('Google Identity Services failed to initialize.');
  }

  return new Promise<string>((resolve, reject) => {
    try {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID as string,
        scope: 'openid email profile',
        callback: (response) => {
          if (response?.access_token) {
            resolve(response.access_token);
            return;
          }
          reject(
            new Error(
              response?.error_description ||
                response?.error ||
                'Google sign-in did not return a token.',
            ),
          );
        },
        error_callback: (error) => {
          reject(new Error(error?.message || error?.type || 'Google sign-in failed.'));
        },
      });
      client.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      reject(err instanceof Error ? err : new Error('Google sign-in failed to start.'));
    }
  });
}
