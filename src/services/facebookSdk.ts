/**
 * Real Facebook Login (JS SDK) integration.
 *
 * Requires `VITE_FACEBOOK_APP_ID` to be set (see `.env.example`). When unset,
 * `requestFacebookAccessToken` rejects so callers can fall back to the local
 * mock flow that the backend's `FacebookTokenVerifier` accepts in dev
 * (`mock|<id>|<email>|<name>`).
 */

declare global {
  interface Window {
    FB?: {
      init: (config: {
        appId: string;
        version: string;
        cookie?: boolean;
        xfbml?: boolean;
      }) => void;
      login: (
        callback: (response: {
          status: 'connected' | 'not_authorized' | 'unknown';
          authResponse?: { accessToken: string; userID: string };
        }) => void,
        options?: { scope: string },
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

export const FACEBOOK_APP_ID: string | undefined = (
  import.meta.env.VITE_FACEBOOK_APP_ID as string | undefined
)?.trim() || undefined;

const FB_SDK_SCRIPT_ID = 'facebook-jssdk';
const FB_GRAPH_VERSION = 'v19.0';

let sdkLoadPromise: Promise<void> | null = null;

function loadFacebookSdk(): Promise<void> {
  if (window.FB) {
    return Promise.resolve();
  }
  if (sdkLoadPromise) {
    return sdkLoadPromise;
  }
  sdkLoadPromise = new Promise<void>((resolve, reject) => {
    window.fbAsyncInit = () => {
      window.FB?.init({
        appId: FACEBOOK_APP_ID as string,
        version: FB_GRAPH_VERSION,
        cookie: true,
        xfbml: false,
      });
      resolve();
    };

    if (document.getElementById(FB_SDK_SCRIPT_ID)) {
      return;
    }
    const script = document.createElement('script');
    script.id = FB_SDK_SCRIPT_ID;
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error('Failed to load Facebook SDK script'));
    document.head.appendChild(script);
  });
  return sdkLoadPromise;
}

/**
 * Opens the Facebook login popup and resolves with a real user access token
 * once the user grants `email` + `public_profile` permissions. Rejects if
 * `VITE_FACEBOOK_APP_ID` isn't configured, the SDK fails to load, or the
 * user cancels/denies the login dialog.
 */
export async function requestFacebookAccessToken(): Promise<string> {
  if (!FACEBOOK_APP_ID) {
    throw new Error(
      'VITE_FACEBOOK_APP_ID is not set. Add it to your .env to enable real Facebook Login.',
    );
  }
  await loadFacebookSdk();
  const FB = window.FB;
  if (!FB) {
    throw new Error('Facebook SDK failed to initialize.');
  }

  return new Promise<string>((resolve, reject) => {
    FB.login(
      (response) => {
        if (response.status === 'connected' && response.authResponse?.accessToken) {
          resolve(response.authResponse.accessToken);
        } else {
          reject(new Error('Facebook login was cancelled or not authorized.'));
        }
      },
      { scope: 'public_profile,email' },
    );
  });
}
