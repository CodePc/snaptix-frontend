# Real Google / Facebook login (local)

Google and Facebook **cannot** open their login pages without OAuth app credentials.
If `VITE_GOOGLE_CLIENT_ID` / `VITE_FACEBOOK_APP_ID` are empty, SnapTix used to fall back to a silent mock login — that is disabled. Use **Demo Host / Demo Explorer** for credential-free testing.

## 1) Google

1. Open [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Create **OAuth client ID** → type **Web application**.
3. **Authorized JavaScript origins**
   - `http://localhost:5173`
   - `http://127.0.0.1:5173`
4. Copy the Client ID (`….apps.googleusercontent.com`).

**Frontend** (`snaptix-frontend/.env`):

```bash
VITE_GOOGLE_CLIENT_ID=YOUR_ID.apps.googleusercontent.com
```

**Backend** (shell or `snaptix-backend/env/dev.env`):

```bash
GOOGLE_CLIENT_ID=YOUR_ID.apps.googleusercontent.com
```

Same value on both sides. Restart Vite **and** the Spring app after changing env.

## 2) Facebook

1. Open [Facebook Developers](https://developers.facebook.com/apps) → create an app with **Facebook Login**.
2. Add **Valid OAuth Redirect URIs** / site URL for `http://localhost:5173`.
3. Copy **App ID** and **App Secret**.

**Frontend**:

```bash
VITE_FACEBOOK_APP_ID=YOUR_APP_ID
```

**Backend**:

```bash
FACEBOOK_APP_ID=YOUR_APP_ID
FACEBOOK_APP_SECRET=YOUR_APP_SECRET
```

Restart both apps.

## 3) Verify

1. Restart FE (`npm run dev` / your usual command) so Vite reloads `VITE_*`.
2. Restart BE with `GOOGLE_CLIENT_ID` exported (or via `env/dev.env` + compose).
3. Click Google → Google account popup/chooser should open (not instant dummy login).
4. Click Facebook → Facebook login popup should open.

## Credential-free local login

Use **Quick demo** / email / phone OTP (`000000` in dev). Those do not need Google or Facebook apps.
