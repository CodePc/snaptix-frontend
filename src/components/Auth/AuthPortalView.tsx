import React, { useState } from 'react';
import {
  Ticket,
  Briefcase,
  Sparkles,
  ShieldCheck,
  QrCode,
  ArrowRight,
  ArrowLeft,
  User,
  Building2,
  Lock,
  Mail,
  CheckCircle2,
  Eye,
  EyeOff,
  Zap,
  Phone,
  KeyRound,
  TrendingUp,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import { UserRole } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  backendRoleToUi,
  facebookAuthApi,
  googleAuthApi,
  loginApi,
  phoneStartApi,
  phoneVerifyApi,
  registerApi,
  roleToBackend,
} from '../../services/snaptixApi';
import { GOOGLE_CLIENT_ID, requestGoogleIdToken } from '../../services/googleIdentity';
import { FACEBOOK_APP_ID, requestFacebookAccessToken } from '../../services/facebookSdk';

interface AuthPortalViewProps {
  initialRole?: UserRole;
  onLoginSuccess: (role: UserRole, userDetails?: { name: string; email: string }) => void;
  onBackToSplash?: () => void;
}

type AuthMode = 'social' | 'phone' | 'email';

export const AuthPortalView: React.FC<AuthPortalViewProps> = ({
  initialRole = 'attendee',
  onLoginSuccess,
  onBackToSplash,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [authMode, setAuthMode] = useState<AuthMode>('social');
  const [isSignUp, setIsSignUp] = useState<boolean>(false);

  // Phone OTP Authentication states
  const [countryCode, setCountryCode] = useState<string>('+1');
  const [phoneNumber, setPhoneNumber] = useState<string>('(555) 382-9104');
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string[]>(['0', '0', '0', '0', '0', '0']);
  const [resendTimer, setResendTimer] = useState<number>(45);

  // Email / Password states for Attendee
  const [attendeeEmail, setAttendeeEmail] = useState<string>('alex.chen@gmail.com');
  const [attendeePassword, setAttendeePassword] = useState<string>('password123');
  const [attendeeName, setAttendeeName] = useState<string>('Alex Chen');

  // Form states for Organizer
  const [orgEmail, setOrgEmail] = useState<string>('promoter@apexentertainment.io');
  const [orgPassword, setOrgPassword] = useState<string>('password123');
  const [orgCompany, setOrgCompany] = useState<string>('Apex Entertainment Group');
  const [orgAccessPin, setOrgAccessPin] = useState<string>('HOST-9021');

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const completeLogin = (
    preferredRole: UserRole,
    auth: { name?: string; email: string; role?: string },
    fallbackName: string,
  ) => {
    // Trust the JWT role from the API — UI selection alone cannot create events
    // if the account is still ATTENDEE (POST /events → 403).
    const role = auth.role ? backendRoleToUi(auth.role) : preferredRole;
    if (preferredRole === 'organizer' && role !== 'organizer') {
      setStatusMessage(
        'This account is an Attendee. Choose Organizer mode and sign in again, or use Demo Host.',
      );
      return;
    }
    onLoginSuccess(role, {
      name: auth.name || fallbackName,
      email: auth.email,
    });
  };

  const finishEmailAuth = async (
    role: UserRole,
    email: string,
    password: string,
    fullName: string,
    preferRegister: boolean,
  ) => {
    const backendRole = roleToBackend(role);
    const auth = preferRegister
      ? await registerApi({ email, password, fullName, role: backendRole })
      : await loginApi(email, password);
    completeLogin(role, auth, fullName);
  };

  const toE164Phone = () => {
    const digits = phoneNumber.replace(/\D/g, '');
    return `${countryCode}${digits}`;
  };

  /** Explicit demo SSO only — never called implicitly from the Google/FB buttons. */
  const completeMockSocialLogin = async (provider: 'google' | 'facebook') => {
    setIsLoading(true);
    const fallbackName =
      selectedRole === 'attendee' ? 'Alex Chen' : 'Apex Entertainment Group';
    try {
      if (provider === 'google') {
        const email =
          selectedRole === 'attendee' ? 'alex.chen@gmail.com' : 'promoter@apexentertainment.io';
        const sub =
          selectedRole === 'attendee' ? 'google-attendee-demo' : 'google-organiser-demo';
        const auth = await googleAuthApi({
          idToken: `mock|${sub}|${email}|${fallbackName}`,
          role: roleToBackend(selectedRole),
          fullName: fallbackName,
        });
        completeLogin(selectedRole, auth, fallbackName);
      } else {
        const email =
          selectedRole === 'attendee' ? 'alex.chen.fb@example.com' : 'promoter.fb@apexentertainment.io';
        const fbId =
          selectedRole === 'attendee' ? 'facebook-attendee-demo' : 'facebook-organiser-demo';
        const auth = await facebookAuthApi({
          accessToken: `mock|${fbId}|${email}|${fallbackName}`,
          role: roleToBackend(selectedRole),
          fallbackName,
        });
        completeLogin(selectedRole, auth, fallbackName);
      }
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'Demo social login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Real Google popup only when VITE_GOOGLE_CLIENT_ID is set (see docs/OAUTH_SETUP.md).
  const handleGoogleLogin = async () => {
    if (!GOOGLE_CLIENT_ID) {
      setStatusMessage(
        'Real Google login needs VITE_GOOGLE_CLIENT_ID (+ backend GOOGLE_CLIENT_ID). See docs/OAUTH_SETUP.md — or use Demo login below.',
      );
      return;
    }
    setIsLoading(true);
    const fallbackName =
      selectedRole === 'attendee' ? 'Alex Chen' : 'Apex Entertainment Group';
    try {
      setStatusMessage('Opening Google sign-in…');
      const idToken = await requestGoogleIdToken();
      const auth = await googleAuthApi({
        idToken,
        role: roleToBackend(selectedRole),
        fullName: fallbackName,
      });
      completeLogin(selectedRole, auth, fallbackName);
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'Google login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Real Facebook popup only when VITE_FACEBOOK_APP_ID is set.
  const handleFacebookLogin = async () => {
    if (!FACEBOOK_APP_ID) {
      setStatusMessage(
        'Real Facebook login needs VITE_FACEBOOK_APP_ID (+ backend FACEBOOK_APP_ID/SECRET). See docs/OAUTH_SETUP.md — or use Demo login below.',
      );
      return;
    }
    setIsLoading(true);
    const fallbackName =
      selectedRole === 'attendee' ? 'Alex Chen' : 'Apex Entertainment Group';
    try {
      setStatusMessage('Opening Facebook sign-in…');
      const accessToken = await requestFacebookAccessToken();
      const auth = await facebookAuthApi({
        accessToken,
        role: roleToBackend(selectedRole),
        fallbackName,
      });
      completeLogin(selectedRole, auth, fallbackName);
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'Facebook login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick 1-Click Demo Login.
  //
  // Get-or-create, not register-only: this button gets clicked over and over
  // across testing sessions against the same backend/DB, so it must succeed
  // whether or not the demo account already exists. It previously always
  // called registerApi(), which meant it only ever worked once per email,
  // ever — every later click failed with "Email already exists".
  const handleQuickDemoLogin = async () => {
    setIsLoading(true);
    const email =
      selectedRole === 'attendee' ? 'alex.chen@gmail.com' : 'promoter@apexentertainment.io';
    const fullName =
      selectedRole === 'attendee' ? 'Alex Chen' : 'Apex Entertainment Group';
    const password = 'password123';
    setStatusMessage(
      selectedRole === 'attendee'
        ? 'Logging in as Demo Explorer (Alex Chen)...'
        : 'Logging in as Demo Host (Apex Entertainment Group)...',
    );
    try {
      let auth;
      try {
        auth = await loginApi(email, password);
      } catch {
        // Demo account doesn't exist on this backend/DB yet — provision it once.
        auth = await registerApi({ email, password, fullName, role: roleToBackend(selectedRole) });
      }
      completeLogin(selectedRole, auth, fullName);
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Send Phone OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    setIsLoading(true);
    const phone = toE164Phone();
    setStatusMessage(`Sending 6-digit SMS verification code to ${phone}...`);
    try {
      await phoneStartApi(phone);
      setIsOtpSent(true);
      setOtpCode(['0', '0', '0', '0', '0', '0']);
      setStatusMessage('Local OTP: use 000000 (or check backend logs)');
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP digit entry
  const handleOtpChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, '').slice(-1);
    const newOtp = [...otpCode];
    newOtp[index] = cleanVal;
    setOtpCode(newOtp);

    // Auto-focus next input
    if (cleanVal && index < 5) {
      const nextInput = document.getElementById(`otp-cell-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage('Verifying SMS security code...');
    try {
      const code = otpCode.join('');
      const fullName =
        selectedRole === 'attendee'
          ? attendeeName || 'Alex Chen'
          : orgCompany || 'Apex Entertainment Group';
      const auth = await phoneVerifyApi({
        phone: toE164Phone(),
        code: code || '000000',
        role: roleToBackend(selectedRole),
        fullName,
      });
      completeLogin(selectedRole, auth, fullName);
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'OTP login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Email Submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(
      selectedRole === 'attendee'
        ? 'Authenticating Event Explorer account...'
        : 'Verifying Organiser Studio credentials...',
    );
    try {
      const email = selectedRole === 'attendee' ? attendeeEmail : orgEmail;
      const password = selectedRole === 'attendee' ? attendeePassword : orgPassword;
      const fullName =
        selectedRole === 'attendee'
          ? attendeeName || 'Alex Chen'
          : orgCompany || 'Apex Entertainment Group';
      await finishEmailAuth(selectedRole, email, password || 'password123', fullName, isSignUp);
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      id="auth-portal-screen"
      className="min-h-screen bg-[#f8f8fb] text-[#1a1c1d] flex flex-col justify-between py-6 px-4 sm:px-6 md:px-8 relative overflow-hidden"
    >
      {/* Ambient background decorative mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-gradient-to-b from-purple-200/40 via-purple-100/20 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Bar */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between z-10 pt-1 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6C2BD9] to-[#9333ea] flex items-center justify-center text-white shadow-md shadow-purple-900/20">
            <Ticket className="w-5 h-5 -rotate-12" />
          </div>
          <div>
            <span className="font-heading font-extrabold text-xl tracking-tight text-[#1a1c1d] block">
              Snaptix
            </span>
            <span className="text-[11px] text-[#7b7486] font-medium block -mt-0.5">
              Zero-Fraud Live Event Ecosystem
            </span>
          </div>
        </div>

        {/* Return to Carousel button */}
        {onBackToSplash && (
          <button
            type="button"
            onClick={onBackToSplash}
            className="px-3.5 py-1.5 rounded-full bg-white hover:bg-[#f2f0f7] border border-[#ccc3d7]/50 text-xs font-heading font-bold text-[#4a4455] hover:text-[#6C2BD9] active:scale-95 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Feature Overview</span>
            <span className="sm:hidden">Back</span>
          </button>
        )}
      </header>

      {/* Main Modern Bento Stage */}
      <div className="w-full max-w-5xl mx-auto my-auto z-10 py-2">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Column: Visual Showcase & Security Badges (Hidden on small mobile if space is tight, or compact) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col space-y-4">
            {/* Live Interactive Security Preview Card */}
            <div className="bg-gradient-to-br from-[#6C2BD9] to-[#4338CA] text-white p-6 rounded-3xl shadow-xl space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-white/20 pb-3">
                <span className="px-2.5 py-1 bg-white/15 backdrop-blur-md rounded-full text-[10px] font-extrabold tracking-wider uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Verified Gate Security
                </span>
                <span className="text-xs text-white/80 font-mono font-bold">SEC-2026</span>
              </div>

              <div className="space-y-2">
                <h3 className="font-heading font-extrabold text-2xl leading-tight">
                  {selectedRole === 'attendee'
                    ? 'Dynamic Rotating QR Passes & Face-Value Resale'
                    : 'Real-Time Promoter Gate Control & Direct Payouts'}
                </h3>
                <p className="text-xs text-purple-100/90 leading-relaxed">
                  {selectedRole === 'attendee'
                    ? 'Say goodbye to duplicate barcodes and fake tickets. Passes rotate every 15s with instant escrow protection.'
                    : 'Scan door barcodes at 0.2s with camera offline validation, tier capacity management, and automatic sales deposits.'}
                </p>
              </div>

              {/* Bento Trust Highlights */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/15 text-[11px]">
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/15">
                  <div className="font-bold flex items-center gap-1 text-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% Capped
                  </div>
                  <div className="text-white/70 text-[10px] mt-0.5">Anti-scalp escrow guarantee</div>
                </div>
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/15">
                  <div className="font-bold flex items-center gap-1 text-amber-300">
                    <RefreshCw className="w-3.5 h-3.5" /> 15s Rotate
                  </div>
                  <div className="text-white/70 text-[10px] mt-0.5">Dynamic screen-safe QR</div>
                </div>
              </div>
            </div>

            {/* Quick Micro Stat Pills */}
            <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-[#ccc3d7]/40 shadow-xs text-xs text-[#4a4455]">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#6C2BD9]" />
                <span className="font-medium">256-Bit Cryptography</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Active System
              </span>
            </div>
          </div>

          {/* Right Column: Modern Authentication Card */}
          <div className="lg:col-span-7 w-full max-w-lg mx-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ccc3d7]/40 shadow-xl space-y-6">
              {/* Role Switcher: State-of-the-Art Segmented Control */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#7b7486]">
                    Select Portal Persona
                  </span>
                  <span className="text-[11px] text-[#6C2BD9] font-bold">
                    {selectedRole === 'attendee' ? 'Fan Mode' : 'Organizer Mode'}
                  </span>
                </div>

                <div
                  id="auth-role-segmented-switcher"
                  className="bg-[#f0edf5] p-1.5 rounded-2xl flex items-center gap-1.5 relative border border-[#ccc3d7]/30"
                >
                  {/* Explorer Tab */}
                  <button
                    type="button"
                    id="role-tab-attendee"
                    onClick={() => {
                      setSelectedRole('attendee');
                      setIsOtpSent(false);
                    }}
                    className={`flex-1 py-3 px-3 rounded-xl font-heading font-bold text-xs flex items-center justify-center gap-2 transition-all relative z-10 active:scale-98 ${
                      selectedRole === 'attendee'
                        ? 'text-white shadow-md'
                        : 'text-[#5a5465] hover:text-[#1a1c1d]'
                    }`}
                  >
                    {selectedRole === 'attendee' && (
                      <motion.div
                        layoutId="authRoleHighlight"
                        className="absolute inset-0 bg-[#6C2BD9] rounded-xl shadow-md shadow-purple-600/30"
                        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>Event Explorer</span>
                    </span>
                  </button>

                  {/* Organizer Studio Tab */}
                  <button
                    type="button"
                    id="role-tab-organizer"
                    onClick={() => {
                      setSelectedRole('organizer');
                      setIsOtpSent(false);
                    }}
                    className={`flex-1 py-3 px-3 rounded-xl font-heading font-bold text-xs flex items-center justify-center gap-2 transition-all relative z-10 active:scale-98 ${
                      selectedRole === 'organizer'
                        ? 'text-white shadow-md'
                        : 'text-[#5a5465] hover:text-[#1a1c1d]'
                    }`}
                  >
                    {selectedRole === 'organizer' && (
                      <motion.div
                        layoutId="authRoleHighlight"
                        className="absolute inset-0 bg-slate-900 rounded-xl shadow-md shadow-slate-900/30"
                        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-purple-300" />
                      <span>Organiser Studio</span>
                      <span className="px-1 py-0.2 bg-purple-500/30 text-purple-200 text-[9px] font-bold rounded">
                        PRO
                      </span>
                    </span>
                  </button>
                </div>
              </div>

              {/* 1-Click Fast Instant Demo Access Pill */}
              <button
                type="button"
                id="btn-fast-demo-login"
                disabled={isLoading}
                onClick={handleQuickDemoLogin}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#6C2BD9] to-[#7C3AED] hover:from-purple-700 hover:to-purple-800 text-white rounded-2xl font-heading font-bold text-xs flex items-center justify-between shadow-md shadow-purple-600/20 active:scale-98 transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-amber-400/20 text-amber-300 rounded-lg">
                    <Zap className="w-3.5 h-3.5 fill-amber-300" />
                  </span>
                  <span>
                    1-Click Instant Demo Login (
                    {selectedRole === 'attendee' ? 'Alex Chen' : 'Apex Entertainment'})
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-purple-200" />
              </button>

              {/* LOGO-ONLY FAST SIGN-IN ROW (Clean, modern logo buttons without long names) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-heading font-bold text-[#7b7486] uppercase tracking-wider">
                    Fast Sign-In
                  </span>
                  {activeTooltip && (
                    <motion.span
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[11px] font-bold text-[#6C2BD9]"
                    >
                      {activeTooltip}
                    </motion.span>
                  )}
                </div>

                {(!GOOGLE_CLIENT_ID || !FACEBOOK_APP_ID) && (
                  <p className="text-[11px] text-[#7b7486] leading-snug">
                    {!GOOGLE_CLIENT_ID && !FACEBOOK_APP_ID
                      ? 'Google/Facebook popups need OAuth app IDs in .env (see docs/OAUTH_SETUP.md). Until then use 1-Click Demo Login.'
                      : !GOOGLE_CLIENT_ID
                        ? 'Google popup needs VITE_GOOGLE_CLIENT_ID in .env (docs/OAUTH_SETUP.md).'
                        : 'Facebook popup needs VITE_FACEBOOK_APP_ID in .env (docs/OAUTH_SETUP.md).'}
                  </p>
                )}

                {statusMessage && !isLoading && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900 space-y-1.5">
                    <p>{statusMessage}</p>
                    {(!GOOGLE_CLIENT_ID || !FACEBOOK_APP_ID) && (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() =>
                          completeMockSocialLogin(!GOOGLE_CLIENT_ID ? 'google' : 'facebook')
                        }
                        className="underline font-semibold text-[#6C2BD9]"
                      >
                        Continue with local demo SSO instead
                      </button>
                    )}
                  </div>
                )}

                {/* Logo-Only Icon Grid */}
                <div className="grid grid-cols-3 gap-2.5">
                  {/* Google Logo Button */}
                  <button
                    type="button"
                    id="btn-logo-google"
                    title={
                      GOOGLE_CLIENT_ID
                        ? 'Sign in with Google / Gmail'
                        : 'Set VITE_GOOGLE_CLIENT_ID for real Google login'
                    }
                    aria-label="Sign in with Google"
                    disabled={isLoading}
                    onClick={handleGoogleLogin}
                    onMouseEnter={() => setActiveTooltip('Google / Gmail Single Sign-On')}
                    onMouseLeave={() => setActiveTooltip(null)}
                    className="h-12 rounded-2xl bg-white hover:bg-slate-50 border-2 border-[#ede9fe] hover:border-[#6C2BD9]/50 flex items-center justify-center shadow-xs active:scale-95 transition-all group"
                  >
                    <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                  </button>

                  {/* Facebook Logo Button */}
                  <button
                    type="button"
                    id="btn-logo-facebook"
                    title="Sign in with Facebook"
                    aria-label="Sign in with Facebook"
                    disabled={isLoading}
                    onClick={handleFacebookLogin}
                    onMouseEnter={() => setActiveTooltip('Facebook Single Sign-On')}
                    onMouseLeave={() => setActiveTooltip(null)}
                    className="h-12 rounded-2xl bg-[#1877F2] hover:bg-[#166fe5] text-white flex items-center justify-center shadow-xs active:scale-95 transition-all group"
                  >
                    <svg className="w-5 h-5 fill-current transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </button>

                  {/* Phone SMS Option Button */}
                  <button
                    type="button"
                    id="btn-logo-phone"
                    title="Sign in with SMS One-Time Passcode"
                    aria-label="Sign in with SMS OTP"
                    disabled={isLoading}
                    onClick={() => {
                      setAuthMode('phone');
                      setIsOtpSent(false);
                    }}
                    onMouseEnter={() => setActiveTooltip('SMS 6-Digit One-Time Code')}
                    onMouseLeave={() => setActiveTooltip(null)}
                    className={`h-12 rounded-2xl border-2 flex items-center justify-center shadow-xs active:scale-95 transition-all group ${
                      authMode === 'phone'
                        ? 'bg-purple-100 border-[#6C2BD9] text-[#6C2BD9]'
                        : 'bg-white hover:bg-purple-50/50 border-[#ede9fe] text-[#6C2BD9]'
                    }`}
                  >
                    <Phone className="w-5 h-5 transition-transform group-hover:scale-110" />
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-[#ede9fe]" />
                <span className="bg-white px-3 text-[11px] font-bold text-[#7b7486] uppercase tracking-wider absolute">
                  or continue with {authMode === 'phone' ? 'phone' : 'email'}
                </span>
              </div>

              {/* Dynamic Input Form: Phone SMS or Email/Password */}
              <div className="pt-1">
                {/* Method A: Phone SMS OTP Flow */}
                {authMode === 'phone' ? (
                  <div className="space-y-4">
                    {!isOtpSent ? (
                      <form onSubmit={handleSendOtp} className="space-y-3.5">
                        <div>
                          <label className="block text-[11px] font-heading font-bold text-[#4a4455] mb-1">
                            Mobile Phone Number
                          </label>
                          <div className="flex gap-2">
                            <select
                              value={countryCode}
                              onChange={(e) => setCountryCode(e.target.value)}
                              className="h-11 px-3 bg-[#f8f8fb] rounded-xl border border-[#ccc3d7]/60 text-xs font-bold text-[#1a1c1d] outline-none focus:ring-2 focus:ring-[#6C2BD9]"
                            >
                              <option value="+1">🇺🇸 +1</option>
                              <option value="+44">🇬🇧 +44</option>
                              <option value="+61">🇦🇺 +61</option>
                              <option value="+49">🇩🇪 +49</option>
                              <option value="+81">🇯🇵 +81</option>
                              <option value="+91">🇮🇳 +91</option>
                              <option value="+33">🇫🇷 +33</option>
                            </select>

                            <div className="relative flex-1">
                              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7b7486]" />
                              <input
                                type="tel"
                                required
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="(555) 000-0000"
                                className="w-full h-11 pl-10 pr-4 bg-[#f8f8fb] rounded-xl border border-[#ccc3d7]/60 text-xs font-medium focus:ring-2 focus:ring-[#6C2BD9] focus:border-transparent outline-none transition-all"
                              />
                            </div>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full py-3 bg-[#6C2BD9] hover:bg-purple-700 text-white rounded-xl font-heading font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
                        >
                          <KeyRound className="w-4 h-4" />
                          <span>Send 6-Digit SMS Security Code</span>
                        </button>

                        <div className="text-center pt-1">
                          <button
                            type="button"
                            onClick={() => setAuthMode('email')}
                            className="text-xs text-[#6C2BD9] font-bold hover:underline"
                          >
                            Switch to Email & Password
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* 6-Digit OTP Entry */
                      <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div className="text-center space-y-1">
                          <p className="text-xs font-bold text-[#1a1c1d]">
                            Enter 6-Digit Security Passcode
                          </p>
                          <p className="text-[11px] text-[#7b7486]">
                            Sent to {countryCode} {phoneNumber}
                          </p>
                        </div>

                        {/* 6 OTP Cells */}
                        <div className="flex justify-center gap-2">
                          {otpCode.map((digit, idx) => (
                            <input
                              key={idx}
                              id={`otp-cell-${idx}`}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(idx, e.target.value)}
                              className="w-10 h-12 text-center text-lg font-bold font-mono bg-[#f8f8fb] border-2 border-[#ccc3d7]/60 focus:border-[#6C2BD9] rounded-xl outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                            />
                          ))}
                        </div>

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full py-3 bg-[#6C2BD9] hover:bg-purple-700 text-white rounded-xl font-heading font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                        >
                          <span>Verify & Sign In</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <button
                            type="button"
                            onClick={() => setIsOtpSent(false)}
                            className="text-[#7b7486] hover:text-[#1a1c1d] flex items-center gap-1"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Change phone</span>
                          </button>

                          <button
                            type="button"
                            onClick={async () => {
                              setResendTimer(45);
                              setIsLoading(true);
                              setStatusMessage('Resending code...');
                              try {
                                await phoneStartApi(toE164Phone());
                                setOtpCode(['0', '0', '0', '0', '0', '0']);
                              } catch (err) {
                                setStatusMessage(
                                  err instanceof Error ? err.message : 'Resend failed',
                                );
                              } finally {
                                setIsLoading(false);
                              }
                            }}
                            className="text-[#6C2BD9] font-bold hover:underline"
                          >
                            Resend code ({resendTimer}s)
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                ) : (
                  /* Method B: Email & Password for Attendee or Organizer */
                  <form onSubmit={handleEmailSubmit} className="space-y-3.5">
                    {selectedRole === 'attendee' ? (
                      /* Attendee Fields */
                      <>
                        {isSignUp && (
                          <div>
                            <label className="block text-[11px] font-heading font-bold text-[#4a4455] mb-1">
                              Full Name
                            </label>
                            <div className="relative">
                              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7b7486]" />
                              <input
                                type="text"
                                required
                                value={attendeeName}
                                onChange={(e) => setAttendeeName(e.target.value)}
                                placeholder="e.g. Alex Chen"
                                className="w-full h-11 pl-10 pr-4 bg-[#f8f8fb] rounded-xl border border-[#ccc3d7]/60 text-xs font-medium focus:ring-2 focus:ring-[#6C2BD9] focus:border-transparent outline-none transition-all"
                              />
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="block text-[11px] font-heading font-bold text-[#4a4455] mb-1">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7b7486]" />
                            <input
                              type="email"
                              required
                              value={attendeeEmail}
                              onChange={(e) => setAttendeeEmail(e.target.value)}
                              placeholder="alex.chen@gmail.com"
                              className="w-full h-11 pl-10 pr-4 bg-[#f8f8fb] rounded-xl border border-[#ccc3d7]/60 text-xs font-medium focus:ring-2 focus:ring-[#6C2BD9] focus:border-transparent outline-none transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="block text-[11px] font-heading font-bold text-[#4a4455]">
                              Password
                            </label>
                            {!isSignUp && (
                              <span className="text-[10px] text-[#6C2BD9] font-bold hover:underline cursor-pointer">
                                Forgot?
                              </span>
                            )}
                          </div>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7b7486]" />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              required
                              value={attendeePassword}
                              onChange={(e) => setAttendeePassword(e.target.value)}
                              placeholder="••••••••••••"
                              className="w-full h-11 pl-10 pr-10 bg-[#f8f8fb] rounded-xl border border-[#ccc3d7]/60 text-xs font-medium focus:ring-2 focus:ring-[#6C2BD9] focus:border-transparent outline-none transition-all font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7b7486] hover:text-[#1a1c1d]"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full py-3.5 bg-[#1a1c1d] hover:bg-slate-800 text-white rounded-xl font-heading font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                        >
                          <span>{isSignUp ? 'Create Explorer Account' : 'Sign In with Email'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      /* Organizer Fields */
                      <>
                        <div>
                          <label className="block text-[11px] font-heading font-bold text-[#4a4455] mb-1">
                            Organization / Production Company
                          </label>
                          <div className="relative">
                            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7b7486]" />
                            <input
                              type="text"
                              required
                              value={orgCompany}
                              onChange={(e) => setOrgCompany(e.target.value)}
                              placeholder="Apex Entertainment Group"
                              className="w-full h-11 pl-10 pr-4 bg-[#f8f8fb] rounded-xl border border-[#ccc3d7]/60 text-xs font-medium text-[#1a1c1d] focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-heading font-bold text-[#4a4455] mb-1">
                            Work Email
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7b7486]" />
                            <input
                              type="email"
                              required
                              value={orgEmail}
                              onChange={(e) => setOrgEmail(e.target.value)}
                              placeholder="promoter@apexentertainment.io"
                              className="w-full h-11 pl-10 pr-4 bg-[#f8f8fb] rounded-xl border border-[#ccc3d7]/60 text-xs font-medium text-[#1a1c1d] focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition-all"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-heading font-bold text-[#4a4455] mb-1">
                              Password
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7b7486]" />
                              <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={orgPassword}
                                onChange={(e) => setOrgPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full h-11 pl-8 pr-3 bg-[#f8f8fb] rounded-xl border border-[#ccc3d7]/60 text-xs font-medium text-[#1a1c1d] focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition-all font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-heading font-bold text-[#4a4455] mb-1">
                              Host PIN Key
                            </label>
                            <div className="relative">
                              <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6C2BD9]" />
                              <input
                                type="text"
                                required
                                value={orgAccessPin}
                                onChange={(e) => setOrgAccessPin(e.target.value)}
                                placeholder="HOST-9021"
                                className="w-full h-11 pl-8 pr-3 bg-[#f8f8fb] rounded-xl border border-[#ccc3d7]/60 text-xs font-bold text-[#6C2BD9] focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition-all font-mono uppercase"
                              />
                            </div>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-heading font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all"
                        >
                          <span>{isSignUp ? 'Create Promoter Workspace' : 'Enter Organiser Studio'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {/* Toggle Sign in vs Sign up */}
                    <div className="flex justify-center items-center gap-1 text-xs text-[#7b7486] pt-1">
                      <span>
                        {isSignUp ? 'Already registered?' : "Don't have an account yet?"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-[#6C2BD9] font-bold hover:underline"
                      >
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="w-full max-w-5xl mx-auto text-center text-xs text-[#7b7486] pt-4 pb-2 z-10">
        <p>Snaptix Multi-Role Live Event Ecosystem • Protected by 256-Bit Dynamic Rotating Cryptography</p>
      </footer>

      {/* Full-screen Loading Overlay with Smooth Spinner */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 text-center space-y-3 max-w-xs w-full shadow-2xl"
          >
            <div className="w-12 h-12 rounded-full border-3 border-purple-200 border-t-[#6C2BD9] animate-spin mx-auto" />
            <h4 className="font-heading font-bold text-sm text-[#1a1c1d]">
              Please wait
            </h4>
            <p className="text-xs text-[#7b7486]">
              {statusMessage || 'Loading your session...'}
            </p>
          </motion.div>
        </div>
      )}
    </main>
  );
};
