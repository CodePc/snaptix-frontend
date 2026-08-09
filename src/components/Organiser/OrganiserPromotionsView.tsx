import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Sparkles,
  Send,
  Share2,
  Copy,
  TrendingUp,
  MessageSquare,
  Mail,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  CheckCheck,
  AlertCircle,
  ExternalLink,
  Eye,
  DollarSign,
  RefreshCw,
  Link,
  ChevronRight,
  Layers,
  Radio,
  Sliders,
  Check,
  Users,
} from 'lucide-react';
import {
  PromoCode,
  MarketingCampaign,
  OrganiserEventData,
  BulkBroadcastCampaign,
  EventChangeTemplate,
  SocialAccountConnection,
  OmniSocialPost,
  SocialInboundMetric,
  SocialInboundComment,
  ChatThread,
} from '../../types';
import {
  INITIAL_BULK_BROADCASTS,
  INITIAL_EVENT_CHANGE_TEMPLATES,
  INITIAL_SOCIAL_CONNECTIONS,
  INITIAL_OMNI_POSTS,
  INITIAL_INBOUND_METRICS,
  INITIAL_INBOUND_COMMENTS,
  INITIAL_CHAT_THREADS,
} from '../../data/mockPromotionsAndChat';
import { motion, AnimatePresence } from 'motion/react';

interface OrganiserPromotionsViewProps {
  events?: OrganiserEventData[];
  promoCodes?: PromoCode[];
  campaigns?: MarketingCampaign[];
  bulkBroadcasts?: BulkBroadcastCampaign[];
  socialConnections?: SocialAccountConnection[];
  omniPosts?: OmniSocialPost[];
  inboundMetrics?: SocialInboundMetric[];
  inboundComments?: SocialInboundComment[];
  chatThreads?: ChatThread[];
  onCreatePromoCode: (newCode: PromoCode) => void;
  onLaunchCampaign: (newCampaign: MarketingCampaign) => void;
  onSendBulkBroadcast?: (broadcast: BulkBroadcastCampaign) => void | Promise<void>;
  onPublishOmniPost?: (post: OmniSocialPost) => void;
  onReplyInboundComment?: (commentId: string, replyText: string) => void;
  onSendChatMessage?: (threadId: string, text: string, sender: 'attendee' | 'organizer') => void;
  onToggleExploreBoost: (eventId: string) => void;
}

export const OrganiserPromotionsView: React.FC<OrganiserPromotionsViewProps> = ({
  events = [],
  promoCodes = [],
  campaigns = [],
  bulkBroadcasts = INITIAL_BULK_BROADCASTS,
  socialConnections = INITIAL_SOCIAL_CONNECTIONS,
  omniPosts = INITIAL_OMNI_POSTS,
  inboundMetrics = INITIAL_INBOUND_METRICS,
  inboundComments = INITIAL_INBOUND_COMMENTS,
  chatThreads = INITIAL_CHAT_THREADS,
  onCreatePromoCode,
  onLaunchCampaign,
  onSendBulkBroadcast,
  onPublishOmniPost,
  onReplyInboundComment,
  onSendChatMessage,
  onToggleExploreBoost,
}) => {
  // Main Category Navigation
  const [mainCategory, setMainCategory] = useState<'outreach' | 'social_chat' | 'growth'>('outreach');

  // Sub-section state
  const [activeSection, setActiveSection] = useState<
    | 'bulk_blast'
    | 'event_change_alerts'
    | 'omni_social_publish'
    | 'social_inbound_analytics'
    | 'attendee_chat'
    | 'promo_codes'
    | 'boost'
  >('bulk_blast');

  const safeEvents = events || [];
  const safePromoCodes = promoCodes || [];

  // Local state for broadcasts, omni posts, comments, chat threads
  const [broadcastsList, setBroadcastsList] = useState<BulkBroadcastCampaign[]>(bulkBroadcasts);
  const [connectionsList] = useState<SocialAccountConnection[]>(socialConnections);
  const [postsList, setPostsList] = useState<OmniSocialPost[]>(omniPosts);
  const [commentsList, setCommentsList] = useState<SocialInboundComment[]>(inboundComments);
  const [threadsList, setThreadsList] = useState<ChatThread[]>(chatThreads);
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // TAB 1: BULK EMAIL & SMS BROADCAST STATE
  // --------------------------------------------------------------------------
  const [bulkEventId, setBulkEventId] = useState<string>(safeEvents[0]?.id || 'event-neon-horizons');
  const [bulkChannels, setBulkChannels] = useState<('email' | 'sms')[]>(['email', 'sms']);
  const [bulkTarget, setBulkTarget] = useState<
    'all_attendees' | 'vip_only' | 'category_fans' | 'waitlist' | 'past_buyers'
  >('all_attendees');
  const [bulkTitle, setBulkTitle] = useState<string>('🎟️ Final 50 VIP & GA Passes Drop');
  const [bulkSubject, setBulkSubject] = useState<string>('🎟️ Exclusive VIP & Early Bird Drop for Neon Horizons!');
  const [bulkBody, setBulkBody] = useState<string>(
    'Hey {{attendee_name}}, we just unlocked the final tier of tickets for {{event_title}} at {{venue_name}}! Use promo code NEON20 for 20% off before doors close.'
  );
  const [bulkDiscountCode, setBulkDiscountCode] = useState<string>('NEON20');
  const [isDispatchingBulk, setIsDispatchingBulk] = useState<boolean>(false);
  const [bulkSuccessToast, setBulkSuccessToast] = useState<string | null>(null);

  const getAudienceCount = (target: string) => {
    switch (target) {
      case 'all_attendees': return 3840;
      case 'vip_only': return 480;
      case 'category_fans': return 5620;
      case 'waitlist': return 1240;
      case 'past_buyers': return 8900;
      default: return 2500;
    }
  };

  const handleDispatchBulkBlast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkBody.trim()) return;

    setIsDispatchingBulk(true);
    const audience = getAudienceCount(bulkTarget);
    const targetEvent = safeEvents.find((evt) => evt.id === bulkEventId) || safeEvents[0];

    const newBroadcast: BulkBroadcastCampaign = {
      id: `bulk-${Date.now()}`,
      eventId: bulkEventId,
      eventTitle: targetEvent?.title || 'Featured Live Event',
      title: bulkTitle,
      channels: bulkChannels,
      targetAudience: bulkTarget,
      audienceCount: audience,
      subject: bulkSubject,
      messageBody: bulkBody,
      discountCode: bulkDiscountCode || undefined,
      sentAt: 'Just now',
      status: 'sent',
      stats: {
        delivered: Math.floor(audience * 0.995),
        deliveryRate: 99.5,
        opens: Math.floor(audience * 0.46),
        openRate: 46.0,
        clicks: Math.floor(audience * 0.22),
        clickRate: 22.0,
        ticketsSold: Math.floor(audience * 0.015),
        revenue: Math.floor(audience * 0.015 * (targetEvent?.price || 89)),
      },
    };

    setBroadcastsList((prev) => [newBroadcast, ...prev]);
    try {
      if (onSendBulkBroadcast) await onSendBulkBroadcast(newBroadcast);
      setBulkSuccessToast(
        bulkChannels.includes('email')
          ? 'Email campaign created & sent (check Mailpit :8025)'
          : `🚀 Bulk broadcast dispatched to ${audience.toLocaleString()} fans!`,
      );
    } catch (err) {
      setBulkSuccessToast(err instanceof Error ? err.message : 'Broadcast failed');
    } finally {
      setIsDispatchingBulk(false);
      setTimeout(() => setBulkSuccessToast(null), 4000);
    }
  };

  const [isAiGeneratingPromo, setIsAiGeneratingPromo] = useState<boolean>(false);

  const handleAiGeneratePromo = async (channel: 'email' | 'social') => {
    setIsAiGeneratingPromo(true);
    try {
      const selectedEvt = safeEvents.find((e) => e.id === (channel === 'email' ? bulkEventId : omniSelectedEventId)) || safeEvents[0];
      const res = await fetch('/api/ai/generate-promotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventTitle: selectedEvt?.title || 'Live Experience',
          eventCategory: selectedEvt?.category || 'Music',
          channel: channel,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        if (channel === 'email') {
          if (json.data.caption) setBulkBody(json.data.caption);
          if (json.data.subjectLine) setBulkSubject(json.data.subjectLine);
        } else {
          if (json.data.caption) setOmniCaption(json.data.caption);
          if (json.data.hashtags && Array.isArray(json.data.hashtags)) {
            setOmniHashtags(json.data.hashtags.join(' '));
          }
        }
      }
    } catch (err) {
      console.error('Failed AI promo generation:', err);
    } finally {
      setIsAiGeneratingPromo(false);
    }
  };

  // --------------------------------------------------------------------------
  // TAB 2: EVENT CHANGE TEMPLATES & ALERTS STATE
  // --------------------------------------------------------------------------
  const [selectedTemplate, setSelectedTemplate] = useState<EventChangeTemplate>(
    INITIAL_EVENT_CHANGE_TEMPLATES[0]
  );
  const [changeEventId, setChangeEventId] = useState<string>(safeEvents[0]?.id || 'event-neon-horizons');
  const [customNewTime, setCustomNewTime] = useState<string>('7:00 PM (Doors 6:00 PM)');
  const [customGateInfo, setCustomGateInfo] = useState<string>('Gate 2 (Main Plaza Entrance)');
  const [customNewDate, setCustomNewDate] = useState<string>('Saturday, July 20, 2024');
  const [previewMode, setPreviewMode] = useState<'email' | 'sms'>('email');
  const [isSendingChangeAlert, setIsSendingChangeAlert] = useState<boolean>(false);
  const [changeSuccessToast, setChangeSuccessToast] = useState<string | null>(null);

  const activeChangeEvent = safeEvents.find((e) => e.id === changeEventId) || safeEvents[0];

  const interpolateTemplate = (rawText: string) => {
    if (!rawText) return '';
    return rawText
      .replace(/{{attendee_name}}/g, 'Alex Thompson')
      .replace(/{{event_title}}/g, activeChangeEvent?.title || 'Neon Horizons Tour')
      .replace(/{{event_date}}/g, activeChangeEvent?.date || 'Saturday, June 15')
      .replace(/{{venue_name}}/g, activeChangeEvent?.venue || 'The Grand Arena Plaza')
      .replace(/{{new_time}}/g, customNewTime)
      .replace(/{{gate_info}}/g, customGateInfo)
      .replace(/{{new_date}}/g, customNewDate)
      .replace(/{{doors_time}}/g, '6:00 PM')
      .replace(/{{ticket_code}}/g, '#PX-9920')
      .replace(/{{organizer_name}}/g, activeChangeEvent?.organizer?.name || 'Apex Entertainment');
  };

  const handleBroadcastChangeAlert = () => {
    setIsSendingChangeAlert(true);
    setTimeout(() => {
      setIsSendingChangeAlert(false);
      setChangeSuccessToast(
        `✅ Event change notification sent to all ${activeChangeEvent?.ticketsSold || 48} verified ticket holders!`
      );
      setTimeout(() => setChangeSuccessToast(null), 4000);
    }, 1400);
  };

  // --------------------------------------------------------------------------
  // TAB 3: OMNI-CHANNEL SOCIAL PUBLISHING STATE
  // --------------------------------------------------------------------------
  const [omniSelectedEventId, setOmniSelectedEventId] = useState<string>(
    safeEvents[0]?.id || 'event-neon-horizons'
  );
  const [selectedPlatforms, setSelectedPlatforms] = useState<('facebook' | 'instagram' | 'tiktok')[]>([
    'facebook',
    'instagram',
    'tiktok',
  ]);
  const [omniCaption, setOmniCaption] = useState<string>(
    '🚀 LOS ANGELES! Neon Horizons returns June 15 at The Grand Arena Plaza. Holographic visuals & unreleased tracks. Only 50 passes remaining! 🎟️'
  );
  const [omniHashtags, setOmniHashtags] = useState<string>(
    '#NeonHorizons #LiveConcert #ElectronicPop #SnaptixLive'
  );
  const [isPublishingOmni, setIsPublishingOmni] = useState<boolean>(false);
  const [omniSuccessToast, setOmniSuccessToast] = useState<string | null>(null);

  const omniTargetEvent = safeEvents.find((evt) => evt.id === omniSelectedEventId) || safeEvents[0];

  const togglePlatform = (p: 'facebook' | 'instagram' | 'tiktok') => {
    if (selectedPlatforms.includes(p)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter((item) => item !== p));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const handlePublishOmniPost = () => {
    if (!omniCaption.trim()) return;
    setIsPublishingOmni(true);

    setTimeout(() => {
      const newPost: OmniSocialPost = {
        id: `post-${Date.now()}`,
        eventId: omniSelectedEventId,
        eventTitle: omniTargetEvent?.title || 'Featured Event',
        platforms: selectedPlatforms,
        caption: omniCaption,
        hashtags: omniHashtags.split(' ').filter(Boolean),
        linkUrl: `https://snaptix.app/e/${omniSelectedEventId}?utm_source=omni_social`,
        mediaUrl: omniTargetEvent?.image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop',
        mediaType: 'image',
        publishedAt: 'Just now',
        status: 'published',
        results: {
          facebookUrl: selectedPlatforms.includes('facebook') ? 'https://facebook.com/ApexEvents' : undefined,
          instagramUrl: selectedPlatforms.includes('instagram') ? 'https://instagram.com/apex.events' : undefined,
          tiktokUrl: selectedPlatforms.includes('tiktok') ? 'https://tiktok.com/@apexevents' : undefined,
        },
      };

      setPostsList((prev) => [newPost, ...prev]);
      if (onPublishOmniPost) onPublishOmniPost(newPost);

      setIsPublishingOmni(false);
      setOmniSuccessToast(`🎉 Published across ${selectedPlatforms.map((p) => p.toUpperCase()).join(', ')}!`);
      setTimeout(() => setOmniSuccessToast(null), 4000);
    }, 1500);
  };

  // --------------------------------------------------------------------------
  // TAB 4: INBOUND COMMENTS & REPLIES
  // --------------------------------------------------------------------------
  const [replyInput, setReplyInput] = useState<{ [commentId: string]: string }>({});

  const handleSendCommentReply = (commentId: string) => {
    const text = replyInput[commentId];
    if (!text || !text.trim()) return;

    setCommentsList((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, replied: true, replyText: text } : c))
    );
    if (onReplyInboundComment) onReplyInboundComment(commentId, text);

    setReplyInput((prev) => ({ ...prev, [commentId]: '' }));
    setCopiedToast('Reply published to social thread!');
    setTimeout(() => setCopiedToast(null), 2500);
  };

  // --------------------------------------------------------------------------
  // TAB 5: ATTENDEE LIVE CHAT
  // --------------------------------------------------------------------------
  const [selectedThreadId, setSelectedThreadId] = useState<string>(threadsList[0]?.id || '');
  const [chatReplyText, setChatReplyText] = useState<string>('');

  const activeChatThread = threadsList.find((t) => t.id === selectedThreadId) || threadsList[0];

  const handleOrganizerSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatReplyText.trim() || !activeChatThread) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      threadId: activeChatThread.id,
      sender: 'organizer' as const,
      senderName: 'Apex Host Team',
      text: chatReplyText.trim(),
      timestamp: 'Just now',
      isRead: true,
    };

    setThreadsList((prev) =>
      prev.map((thread) => {
        if (thread.id === activeChatThread.id) {
          return {
            ...thread,
            lastMessage: newMsg.text,
            lastMessageTime: 'Just now',
            unreadForAttendee: thread.unreadForAttendee + 1,
            unreadForOrganizer: 0,
            messages: [...thread.messages, newMsg],
          };
        }
        return thread;
      })
    );

    if (onSendChatMessage) {
      onSendChatMessage(activeChatThread.id, newMsg.text, 'organizer');
    }

    setChatReplyText('');
  };

  const handleToggleThreadStatus = (threadId: string) => {
    setThreadsList((prev) =>
      prev.map((t) =>
        t.id === threadId ? { ...t, status: t.status === 'open' ? 'resolved' : 'open' } : t
      )
    );
  };

  // --------------------------------------------------------------------------
  // TAB 6: PROMO CODES
  // --------------------------------------------------------------------------
  const [showCodeModal, setShowCodeModal] = useState<boolean>(false);
  const [codeName, setCodeName] = useState<string>('');
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [maxUses, setMaxUses] = useState<number>(100);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToast(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedToast(null), 2500);
  };

  const handleCreateCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeName.trim()) return;

    const newCode: PromoCode = {
      id: `promo-${Date.now()}`,
      code: codeName.toUpperCase().trim(),
      eventId: 'all',
      discountType,
      discountValue,
      usedCount: 0,
      maxUses,
      expiryDate: '2024-12-31',
      isActive: true,
    };

    onCreatePromoCode(newCode);
    setShowCodeModal(false);
    setCodeName('');
  };

  return (
    <main id="organiser-promotions-view" className="space-y-6 pb-28 px-4 sm:px-6 pt-2 max-w-7xl mx-auto">
      {/* Toast Notification Alert */}
      {(copiedToast || bulkSuccessToast || changeSuccessToast || omniSuccessToast) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-slate-900 text-white rounded-2xl text-xs font-bold shadow-xl flex items-center justify-between border border-purple-500/30"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>{copiedToast || bulkSuccessToast || changeSuccessToast || omniSuccessToast}</span>
          </div>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </motion.div>
      )}

      {/* Top Header Banner */}
      <section className="bg-white rounded-3xl p-6 border border-[#ccc3d7]/40 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#6C2BD9] mb-1">
              <Zap className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Promoter & Fan Studio</span>
            </div>
            <h2 className="font-heading text-2xl font-extrabold text-[#1a1c1d]">
              Campaigns, Fan Chat & Growth Engine
            </h2>
            <p className="text-xs text-[#7b7486] mt-0.5">
              Broadcast Email & SMS blasts, alert fans to event changes, publish to socials, and reply to live queries.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setMainCategory('growth');
              setActiveSection('promo_codes');
              setShowCodeModal(true);
            }}
            className="px-4 py-2.5 bg-[#6C2BD9] hover:bg-purple-700 text-white font-heading font-bold text-xs rounded-2xl shadow-sm flex items-center gap-2 transition-all shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Discount Code</span>
          </button>
        </div>

        {/* Top Metric Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 bg-[#f9f9fb] rounded-2xl border border-[#edeef0]">
            <span className="text-[10px] font-bold text-[#7b7486] uppercase block">Total Fan Reach</span>
            <span className="font-heading font-bold text-lg text-[#1a1c1d]">388,400</span>
            <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">+18.4% this month</span>
          </div>
          <div className="p-3.5 bg-[#f9f9fb] rounded-2xl border border-[#edeef0]">
            <span className="text-[10px] font-bold text-[#7b7486] uppercase block">Avg Open Rate</span>
            <span className="font-heading font-bold text-lg text-[#6C2BD9]">46.0%</span>
            <span className="text-[10px] font-bold text-purple-600 block mt-0.5">2.1x Industry Benchmark</span>
          </div>
          <div className="p-3.5 bg-[#f9f9fb] rounded-2xl border border-[#edeef0]">
            <span className="text-[10px] font-bold text-[#7b7486] uppercase block">Active Promo Codes</span>
            <span className="font-heading font-bold text-lg text-[#1a1c1d]">{safePromoCodes.length} Codes</span>
            <span className="text-[10px] font-bold text-[#7b7486] block mt-0.5">Used in 142 purchases</span>
          </div>
          <div className="p-3.5 bg-[#f9f9fb] rounded-2xl border border-[#edeef0]">
            <span className="text-[10px] font-bold text-[#7b7486] uppercase block">Open Inquiries</span>
            <span className="font-heading font-bold text-lg text-amber-600">
              {threadsList.filter((t) => t.status === 'open').length} Fan Chats
            </span>
            <span className="text-[10px] font-bold text-amber-600 block mt-0.5">Requires Host Response</span>
          </div>
        </div>
      </section>

      {/* Main Studio Category Navigation Tabs */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 border-b border-[#ccc3d7]/40 pb-2 overflow-x-auto hide-scrollbar">
          <button
            type="button"
            onClick={() => {
              setMainCategory('outreach');
              setActiveSection('bulk_blast');
            }}
            className={`px-4 py-2.5 rounded-2xl font-heading font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap ${
              mainCategory === 'outreach'
                ? 'bg-[#6C2BD9] text-white shadow-md'
                : 'bg-white text-[#4a4455] border border-[#ccc3d7]/40 hover:bg-[#f9f9fb]'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Direct Outreach & Alerts</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMainCategory('social_chat');
              setActiveSection('omni_social_publish');
            }}
            className={`px-4 py-2.5 rounded-2xl font-heading font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap ${
              mainCategory === 'social_chat'
                ? 'bg-[#6C2BD9] text-white shadow-md'
                : 'bg-white text-[#4a4455] border border-[#ccc3d7]/40 hover:bg-[#f9f9fb]'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Social & Fan Chat</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMainCategory('growth');
              setActiveSection('promo_codes');
            }}
            className={`px-4 py-2.5 rounded-2xl font-heading font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap ${
              mainCategory === 'growth'
                ? 'bg-[#6C2BD9] text-white shadow-md'
                : 'bg-white text-[#4a4455] border border-[#ccc3d7]/40 hover:bg-[#f9f9fb]'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Discounts & Boosts</span>
          </button>
        </div>

        {/* Sub-Pills Selector */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pt-1">
          {mainCategory === 'outreach' && (
            <>
              <button
                type="button"
                onClick={() => setActiveSection('bulk_blast')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeSection === 'bulk_blast'
                    ? 'bg-purple-100 text-[#6C2BD9] border border-purple-300'
                    : 'bg-white text-[#7b7486] border border-[#ccc3d7]/30'
                }`}
              >
                Bulk Email & SMS Blast
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('event_change_alerts')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeSection === 'event_change_alerts'
                    ? 'bg-purple-100 text-[#6C2BD9] border border-purple-300'
                    : 'bg-white text-[#7b7486] border border-[#ccc3d7]/30'
                }`}
              >
                Event Change Alerts
              </button>
            </>
          )}

          {mainCategory === 'social_chat' && (
            <>
              <button
                type="button"
                onClick={() => setActiveSection('omni_social_publish')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeSection === 'omni_social_publish'
                    ? 'bg-purple-100 text-[#6C2BD9] border border-purple-300'
                    : 'bg-white text-[#7b7486] border border-[#ccc3d7]/30'
                }`}
              >
                1-Shot Social Publisher
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('social_inbound_analytics')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeSection === 'social_inbound_analytics'
                    ? 'bg-purple-100 text-[#6C2BD9] border border-purple-300'
                    : 'bg-white text-[#7b7486] border border-[#ccc3d7]/30'
                }`}
              >
                Inbound Tracking & Comments
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('attendee_chat')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeSection === 'attendee_chat'
                    ? 'bg-purple-100 text-[#6C2BD9] border border-purple-300'
                    : 'bg-white text-[#7b7486] border border-[#ccc3d7]/30'
                }`}
              >
                Attendee Live Chat ({threadsList.length})
              </button>
            </>
          )}

          {mainCategory === 'growth' && (
            <>
              <button
                type="button"
                onClick={() => setActiveSection('promo_codes')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeSection === 'promo_codes'
                    ? 'bg-purple-100 text-[#6C2BD9] border border-purple-300'
                    : 'bg-white text-[#7b7486] border border-[#ccc3d7]/30'
                }`}
              >
                Promo Codes ({safePromoCodes.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('boost')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeSection === 'boost'
                    ? 'bg-purple-100 text-[#6C2BD9] border border-purple-300'
                    : 'bg-white text-[#7b7486] border border-[#ccc3d7]/30'
                }`}
              >
                Explore Screen Boost
              </button>
            </>
          )}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 1. BULK EMAIL & SMS BLAST */}
      {/* ===================================================================== */}
      {activeSection === 'bulk_blast' && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form Composer */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#ccc3d7]/40 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#edeef0] pb-3">
              <div className="flex items-center gap-2 text-[#6C2BD9]">
                <Send className="w-5 h-5" />
                <h3 className="font-heading font-bold text-base text-[#1a1c1d]">
                  Compose Bulk Broadcast
                </h3>
              </div>
              <span className="px-2.5 py-1 bg-purple-50 text-[#6C2BD9] font-bold text-[11px] rounded-full">
                ~{getAudienceCount(bulkTarget).toLocaleString()} Target Fans
              </span>
            </div>

            <form onSubmit={handleDispatchBulkBlast} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#7b7486] uppercase tracking-wider block">
                    Target Event
                  </label>
                  <select
                    value={bulkEventId}
                    onChange={(e) => setBulkEventId(e.target.value)}
                    className="w-full h-10 px-3 bg-[#f9f9fb] border border-[#ccc3d7]/50 rounded-xl text-xs font-bold text-[#1a1c1d]"
                  >
                    {safeEvents.map((evt) => (
                      <option key={evt.id} value={evt.id}>
                        {evt.title} ({evt.date})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#7b7486] uppercase tracking-wider block">
                    Recipient Segment
                  </label>
                  <select
                    value={bulkTarget}
                    onChange={(e) => setBulkTarget(e.target.value as any)}
                    className="w-full h-10 px-3 bg-[#f9f9fb] border border-[#ccc3d7]/50 rounded-xl text-xs font-bold text-[#1a1c1d]"
                  >
                    <option value="all_attendees">All Verified Ticket Holders (3,840)</option>
                    <option value="vip_only">VIP Pass Holders Only (480)</option>
                    <option value="category_fans">Genre & Category Subscribers (5,620)</option>
                    <option value="waitlist">Waitlist & RSVP Subscribers (1,240)</option>
                    <option value="past_buyers">Past Ticket Buyers (8,900)</option>
                  </select>
                </div>
              </div>

              {/* Channel Selector */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#7b7486] uppercase tracking-wider block">
                  Delivery Channels
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (bulkChannels.includes('email')) {
                        if (bulkChannels.length > 1) setBulkChannels(bulkChannels.filter((c) => c !== 'email'));
                      } else {
                        setBulkChannels([...bulkChannels, 'email']);
                      }
                    }}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      bulkChannels.includes('email')
                        ? 'bg-purple-50 border-[#6C2BD9] text-[#6C2BD9]'
                        : 'bg-white border-[#ccc3d7]/40 text-[#7b7486]'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email Broadcast</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (bulkChannels.includes('sms')) {
                        if (bulkChannels.length > 1) setBulkChannels(bulkChannels.filter((c) => c !== 'sms'));
                      } else {
                        setBulkChannels([...bulkChannels, 'sms']);
                      }
                    }}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      bulkChannels.includes('sms')
                        ? 'bg-purple-50 border-[#6C2BD9] text-[#6C2BD9]'
                        : 'bg-white border-[#ccc3d7]/40 text-[#7b7486]'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>SMS Blast</span>
                  </button>
                </div>
              </div>

              {/* Title & Subject */}
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-purple-50 p-2.5 rounded-2xl border border-purple-200">
                  <div className="flex items-center gap-1.5 text-[#6C2BD9]">
                    <Sparkles className="w-4 h-4" />
                    <span className="font-bold text-xs">AI Copy Co-Pilot</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAiGeneratePromo('email')}
                    disabled={isAiGeneratingPromo}
                    className="px-3 py-1 bg-[#6C2BD9] hover:bg-purple-700 text-white font-bold text-[11px] rounded-xl flex items-center gap-1 shadow-xs transition-all active:scale-95"
                  >
                    {isAiGeneratingPromo ? 'Generating...' : '✨ Auto-Generate Copy with AI'}
                  </button>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#7b7486] uppercase tracking-wider block mb-1">
                    Campaign Internal Label
                  </label>
                  <input
                    type="text"
                    value={bulkTitle}
                    onChange={(e) => setBulkTitle(e.target.value)}
                    className="w-full h-10 px-3 bg-[#f9f9fb] border border-[#ccc3d7]/50 rounded-xl text-xs font-bold text-[#1a1c1d]"
                  />
                </div>

                {bulkChannels.includes('email') && (
                  <div>
                    <label className="text-[11px] font-bold text-[#7b7486] uppercase tracking-wider block mb-1">
                      Email Subject Line
                    </label>
                    <input
                      type="text"
                      value={bulkSubject}
                      onChange={(e) => setBulkSubject(e.target.value)}
                      className="w-full h-10 px-3 bg-[#f9f9fb] border border-[#ccc3d7]/50 rounded-xl text-xs font-bold text-[#1a1c1d]"
                    />
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold text-[#7b7486] uppercase tracking-wider block">
                      Message Content
                    </label>
                    <span className="text-[10px] text-[#6C2BD9] font-bold">
                      Variables: {'{{attendee_name}}'}, {'{{event_title}}'}
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={bulkBody}
                    onChange={(e) => setBulkBody(e.target.value)}
                    className="w-full p-3 bg-[#f9f9fb] border border-[#ccc3d7]/50 rounded-xl text-xs text-[#1a1c1d] outline-none focus:ring-1 focus:ring-[#6C2BD9]"
                  />
                </div>
              </div>

              {/* Promo Code Injection */}
              <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-100 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <Tag className="w-4 h-4 text-[#6C2BD9]" />
                  <span className="font-bold text-[#1a1c1d]">Attach Promo Code:</span>
                  <input
                    type="text"
                    value={bulkDiscountCode}
                    onChange={(e) => setBulkDiscountCode(e.target.value.toUpperCase())}
                    className="w-24 h-8 px-2 bg-white border border-purple-200 rounded-lg font-mono font-bold text-xs text-[#6C2BD9]"
                  />
                </div>
                <span className="text-[10px] text-[#7b7486]">Includes 1-click redemption link</span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isDispatchingBulk || !bulkBody.trim()}
                  className="w-full py-3 bg-[#6C2BD9] hover:bg-purple-700 disabled:bg-slate-300 text-white font-heading font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  {isDispatchingBulk ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Dispatching Broadcast...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Dispatch Broadcast (~{getAudienceCount(bulkTarget).toLocaleString()} Fans)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Live Fan Screen Phone Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 text-white space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" />
                  <span>Live Recipient Mobile Preview</span>
                </span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full">
                  Real-Time
                </span>
              </div>

              {/* Simulated Mobile Device Frame */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-white/10 space-y-3 font-sans">
                <div className="flex items-center justify-between text-[10px] text-slate-400 pb-2 border-b border-white/10">
                  <span>From: Apex Events Studio</span>
                  <span>To: Alex Thompson</span>
                </div>

                {bulkChannels.includes('email') && (
                  <div className="bg-white text-slate-900 p-4 rounded-xl space-y-2">
                    <p className="font-bold text-xs text-[#6C2BD9] border-b pb-1.5">
                      {bulkSubject || 'Exclusive Ticket Drop'}
                    </p>
                    <p className="text-xs leading-relaxed text-slate-700">
                      {bulkBody.replace(/{{attendee_name}}/g, 'Alex').replace(/{{event_title}}/g, 'Neon Horizons')}
                    </p>
                    {bulkDiscountCode && (
                      <div className="mt-2 p-2 bg-purple-50 text-center rounded-lg border border-purple-200 text-xs font-bold text-[#6C2BD9]">
                        🎟️ Use Code: {bulkDiscountCode} (20% OFF)
                      </div>
                    )}
                  </div>
                )}

                {bulkChannels.includes('sms') && !bulkChannels.includes('email') && (
                  <div className="p-3 bg-emerald-500/10 text-emerald-300 rounded-xl text-xs font-mono space-y-1">
                    <p>{bulkBody.replace(/{{attendee_name}}/g, 'Alex').replace(/{{event_title}}/g, 'Neon Horizons')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Broadcast History Summary */}
            <div className="bg-white rounded-3xl p-5 border border-[#ccc3d7]/40 space-y-3">
              <h4 className="font-heading font-bold text-xs text-[#1a1c1d]">
                Recent Dispatched Broadcasts ({broadcastsList.length})
              </h4>
              <div className="space-y-2 max-h-56 overflow-y-auto hide-scrollbar">
                {broadcastsList.map((blast) => (
                  <div key={blast.id} className="p-3 bg-[#f9f9fb] rounded-2xl border border-[#edeef0] text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-[#1a1c1d]">
                      <span>{blast.title}</span>
                      <span className="text-[10px] text-emerald-600 font-mono">${blast.stats.revenue.toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-[#7b7486]">
                      {blast.eventTitle} • {blast.stats.opens} Opens ({blast.stats.openRate}%)
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===================================================================== */}
      {/* 2. EVENT CHANGE ALERTS */}
      {/* ===================================================================== */}
      {activeSection === 'event_change_alerts' && (
        <section className="bg-white rounded-3xl p-6 border border-[#ccc3d7]/40 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#edeef0] pb-3">
            <div className="flex items-center gap-2 text-[#6C2BD9]">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-heading font-bold text-base text-[#1a1c1d]">
                Event Change Notification & Smart Templating
              </h3>
            </div>
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200">
              1-Click Instant Broadcast
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#7b7486] uppercase tracking-wider block">
                  Select Event for Change Alert
                </label>
                <select
                  value={changeEventId}
                  onChange={(e) => setChangeEventId(e.target.value)}
                  className="w-full h-10 px-3 bg-[#f9f9fb] border border-[#ccc3d7]/50 rounded-xl text-xs font-bold text-[#1a1c1d]"
                >
                  {safeEvents.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.title} ({evt.ticketsSold || 48} Pass Holders)
                    </option>
                  ))}
                </select>
              </div>

              {/* Template Selectors */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#7b7486] uppercase tracking-wider block">
                  Change Scenario Templates
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {INITIAL_EVENT_CHANGE_TEMPLATES.map((tpl) => {
                    const isSelected = selectedTemplate.id === tpl.id;
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => setSelectedTemplate(tpl)}
                        className={`p-3 rounded-2xl text-left border transition-all ${
                          isSelected
                            ? 'bg-purple-50 border-[#6C2BD9] shadow-xs'
                            : 'bg-white border-[#ccc3d7]/40 hover:bg-[#f9f9fb]'
                        }`}
                      >
                        <h4 className={`font-bold text-xs ${isSelected ? 'text-[#6C2BD9]' : 'text-[#1a1c1d]'}`}>
                          {tpl.name}
                        </h4>
                        <p className="text-[10px] text-[#7b7486] line-clamp-1 mt-0.5">{tpl.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Variable Controls */}
              <div className="p-4 bg-[#f9f9fb] rounded-2xl border border-[#edeef0] space-y-3">
                <span className="font-heading font-bold text-xs text-[#1a1c1d] block">Customize Alert Values</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-[#7b7486] block">Doors / Set Time</label>
                    <input
                      type="text"
                      value={customNewTime}
                      onChange={(e) => setCustomNewTime(e.target.value)}
                      className="w-full h-8 px-2.5 bg-white border border-[#ccc3d7]/50 rounded-lg text-xs font-bold mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#7b7486] block">Gate Entrance</label>
                    <input
                      type="text"
                      value={customGateInfo}
                      onChange={(e) => setCustomGateInfo(e.target.value)}
                      className="w-full h-8 px-2.5 bg-white border border-[#ccc3d7]/50 rounded-lg text-xs font-bold mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Live Interpolated Preview */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-5 bg-purple-50/70 rounded-3xl border border-purple-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-xs text-[#1a1c1d]">Alert Preview</span>
                  <div className="flex gap-1 bg-white p-1 rounded-xl text-[10px] font-bold border">
                    <button
                      type="button"
                      onClick={() => setPreviewMode('email')}
                      className={`px-2 py-0.5 rounded-lg ${previewMode === 'email' ? 'bg-[#6C2BD9] text-white' : 'text-[#7b7486]'}`}
                    >
                      Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode('sms')}
                      className={`px-2 py-0.5 rounded-lg ${previewMode === 'sms' ? 'bg-[#6C2BD9] text-white' : 'text-[#7b7486]'}`}
                    >
                      SMS
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-purple-100 text-xs space-y-2">
                  <p className="font-bold text-[#1a1c1d] border-b pb-2">
                    Subject: {interpolateTemplate(selectedTemplate.subjectTemplate)}
                  </p>
                  <pre className="text-xs text-[#4a4455] whitespace-pre-wrap font-sans leading-relaxed">
                    {previewMode === 'email'
                      ? interpolateTemplate(selectedTemplate.bodyTemplate)
                      : interpolateTemplate(selectedTemplate.smsTemplate)}
                  </pre>
                </div>

                <button
                  type="button"
                  onClick={handleBroadcastChangeAlert}
                  disabled={isSendingChangeAlert}
                  className="w-full py-3 bg-[#6C2BD9] hover:bg-purple-700 disabled:bg-slate-300 text-white font-heading font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
                >
                  {isSendingChangeAlert ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Broadcasting Change Alert...</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      <span>Send Change Alert to All Ticket Holders ({activeChangeEvent?.ticketsSold || 48})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===================================================================== */}
      {/* 3. 1-SHOT OMNI SOCIAL PUBLISHER */}
      {/* ===================================================================== */}
      {activeSection === 'omni_social_publish' && (
        <section className="bg-white rounded-3xl p-6 border border-[#ccc3d7]/40 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#edeef0] pb-3">
            <div className="flex items-center gap-2 text-[#6C2BD9]">
              <Share2 className="w-5 h-5" />
              <h3 className="font-heading font-bold text-base text-[#1a1c1d]">
                1-Shot Multi-Platform Social Publisher
              </h3>
            </div>
            <span className="px-2.5 py-0.5 bg-purple-50 text-[#6C2BD9] text-[10px] font-bold rounded-full">
              Publish to {selectedPlatforms.length} Channels
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#7b7486] uppercase tracking-wider block">
                  Target Event
                </label>
                <select
                  value={omniSelectedEventId}
                  onChange={(e) => setOmniSelectedEventId(e.target.value)}
                  className="w-full h-10 px-3 bg-[#f9f9fb] border border-[#ccc3d7]/50 rounded-xl text-xs font-bold text-[#1a1c1d]"
                >
                  {safeEvents.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.title} (${evt.price} GA • {evt.date})
                    </option>
                  ))}
                </select>
              </div>

              {/* Platform Toggles */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#7b7486] uppercase tracking-wider block">
                  Select Platforms
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => togglePlatform('facebook')}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      selectedPlatforms.includes('facebook')
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-[#ccc3d7]/40 text-[#7b7486]'
                    }`}
                  >
                    <span>Facebook</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => togglePlatform('instagram')}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      selectedPlatforms.includes('instagram')
                        ? 'bg-pink-50 border-pink-500 text-pink-700'
                        : 'bg-white border-[#ccc3d7]/40 text-[#7b7486]'
                    }`}
                  >
                    <span>Instagram</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => togglePlatform('tiktok')}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      selectedPlatforms.includes('tiktok')
                        ? 'bg-slate-900 border-black text-white'
                        : 'bg-white border-[#ccc3d7]/40 text-[#7b7486]'
                    }`}
                  >
                    <span>TikTok</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-[#7b7486] uppercase tracking-wider block">
                    Post Caption
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAiGeneratePromo('social')}
                    disabled={isAiGeneratingPromo}
                    className="px-2.5 py-0.5 bg-purple-50 hover:bg-purple-100 text-[#6C2BD9] font-bold text-[10px] rounded-lg flex items-center gap-1 transition-all"
                  >
                    <Sparkles className="w-3 h-3 text-[#6C2BD9]" />
                    <span>{isAiGeneratingPromo ? 'Generating...' : '✨ AI Caption & Hashtags'}</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={omniCaption}
                  onChange={(e) => setOmniCaption(e.target.value)}
                  className="w-full p-3 bg-[#f9f9fb] border border-[#ccc3d7]/50 rounded-xl text-xs text-[#1a1c1d]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#7b7486] uppercase tracking-wider block">
                  Hashtags
                </label>
                <input
                  type="text"
                  value={omniHashtags}
                  onChange={(e) => setOmniHashtags(e.target.value)}
                  className="w-full h-10 px-3 bg-[#f9f9fb] border border-[#ccc3d7]/50 rounded-xl text-xs text-[#6C2BD9] font-mono font-bold"
                />
              </div>

              <button
                type="button"
                onClick={handlePublishOmniPost}
                disabled={isPublishingOmni || !omniCaption.trim()}
                className="w-full py-3 bg-[#6C2BD9] hover:bg-purple-700 disabled:bg-slate-300 text-white font-heading font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                {isPublishingOmni ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Publishing across channels...</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Publish in 1 Shot ({selectedPlatforms.map((p) => p.toUpperCase()).join(' + ')})</span>
                  </>
                )}
              </button>
            </div>

            {/* Right: Published Feed */}
            <div className="lg:col-span-5 space-y-3">
              <span className="font-heading font-bold text-xs text-[#1a1c1d] uppercase block">
                Published Feed ({postsList.length})
              </span>
              <div className="space-y-3 max-h-[420px] overflow-y-auto hide-scrollbar">
                {postsList.map((post) => (
                  <div key={post.id} className="p-4 bg-[#f9f9fb] rounded-2xl border border-[#edeef0] text-xs space-y-2">
                    <div className="flex justify-between items-center font-bold text-[#1a1c1d]">
                      <span>{post.eventTitle}</span>
                      <span className="text-[10px] text-[#7b7486]">{post.publishedAt}</span>
                    </div>
                    <p className="text-xs text-[#4a4455] leading-relaxed">{post.caption}</p>
                    <div className="flex gap-1">
                      {post.platforms.map((p) => (
                        <span key={p} className="px-2 py-0.5 bg-purple-100 text-[#6C2BD9] text-[9px] font-bold rounded-full uppercase">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===================================================================== */}
      {/* 4. INBOUND TRACKING & FAN COMMENTS */}
      {/* ===================================================================== */}
      {activeSection === 'social_inbound_analytics' && (
        <section className="space-y-5">
          <div className="bg-white rounded-3xl p-6 border border-[#ccc3d7]/40 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-base text-[#1a1c1d]">
              Inbound Campaign & Channel Attribution (UTM Tracking)
            </h3>
            <div className="space-y-2">
              {inboundMetrics.map((item) => (
                <div key={item.id} className="p-3.5 bg-[#f9f9fb] rounded-2xl border border-[#edeef0] flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div>
                    <h4 className="font-bold text-[#1a1c1d]">{item.postTitle}</h4>
                    <span className="text-[10px] font-mono text-[#7b7486]">{item.utmSource}</span>
                  </div>
                  <div className="flex gap-4 text-right font-bold">
                    <div>
                      <span className="text-[10px] text-[#7b7486] block">Clicks</span>
                      <span>{item.inboundClicks.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#7b7486] block">Passes Sold</span>
                      <span className="text-purple-600">{item.ticketsSold}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#7b7486] block">Revenue</span>
                      <span className="text-emerald-600">${item.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#ccc3d7]/40 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-base text-[#1a1c1d]">
              Inbound Fan Questions & Sentiment Feed
            </h3>
            <div className="space-y-3">
              {commentsList.map((comm) => (
                <div key={comm.id} className="p-4 bg-[#f9f9fb] rounded-2xl border border-[#edeef0] space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#1a1c1d]">{comm.author} ({comm.platform})</span>
                    <span className="px-2 py-0.5 bg-purple-100 text-[#6C2BD9] text-[9px] font-bold rounded-full">
                      {comm.sentiment}
                    </span>
                  </div>
                  <p className="text-xs text-[#4a4455]">"{comm.content}"</p>
                  {comm.replied ? (
                    <p className="text-[11px] text-emerald-600 font-bold">✓ Replied: {comm.replyText}</p>
                  ) : (
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        value={replyInput[comm.id] || ''}
                        onChange={(e) => setReplyInput((prev) => ({ ...prev, [comm.id]: e.target.value }))}
                        placeholder="Reply to fan..."
                        className="flex-1 h-8 px-3 bg-white border border-[#ccc3d7]/50 rounded-xl text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleSendCommentReply(comm.id)}
                        className="px-3 py-1 bg-[#6C2BD9] text-white rounded-xl font-bold text-xs"
                      >
                        Reply
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===================================================================== */}
      {/* 5. ATTENDEE LIVE CHAT */}
      {/* ===================================================================== */}
      {activeSection === 'attendee_chat' && (
        <section className="bg-white rounded-3xl p-6 border border-[#ccc3d7]/40 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#edeef0] pb-3">
            <h3 className="font-heading font-bold text-base text-[#1a1c1d]">
              Attendee Live Inquiries & Chat Hub
            </h3>
            <span className="px-2.5 py-0.5 bg-purple-50 text-[#6C2BD9] text-[10px] font-bold rounded-full">
              {threadsList.length} Conversations
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 min-h-[460px]">
            {/* Left: Threads */}
            <div className="md:col-span-4 space-y-2 border-r border-[#edeef0] pr-3">
              {threadsList.map((th) => {
                const isSelected = th.id === activeChatThread?.id;
                return (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setSelectedThreadId(th.id)}
                    className={`w-full p-3 rounded-2xl text-left border transition-all ${
                      isSelected ? 'bg-purple-50 border-[#6C2BD9]' : 'bg-white border-[#ccc3d7]/40'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-[#1a1c1d]">{th.attendeeName}</span>
                      <span className="text-[9px] font-bold uppercase text-[#6C2BD9]">{th.status}</span>
                    </div>
                    <p className="text-[10px] text-[#7b7486] truncate mt-1">{th.lastMessage}</p>
                  </button>
                );
              })}
            </div>

            {/* Right: Active Chat */}
            {activeChatThread && (
              <div className="md:col-span-8 bg-[#f9f9fb] rounded-2xl p-4 border border-[#edeef0] flex flex-col justify-between">
                <div className="flex justify-between items-center border-b pb-2">
                  <div>
                    <h4 className="font-bold text-xs text-[#1a1c1d]">{activeChatThread.attendeeName}</h4>
                    <p className="text-[10px] text-[#7b7486]">Pass #{activeChatThread.ticketBookingId}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleThreadStatus(activeChatThread.id)}
                    className="px-2.5 py-1 text-[10px] font-bold bg-white border rounded-lg text-[#6C2BD9]"
                  >
                    {activeChatThread.status === 'open' ? 'Mark Resolved' : 'Re-open'}
                  </button>
                </div>

                {/* Messages */}
                <div className="py-3 space-y-2 overflow-y-auto max-h-64 hide-scrollbar">
                  {activeChatThread.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'organizer' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`p-3 rounded-2xl text-xs max-w-[80%] ${
                          msg.sender === 'organizer'
                            ? 'bg-[#6C2BD9] text-white'
                            : 'bg-white text-[#1a1c1d] border'
                        }`}
                      >
                        <p>{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleOrganizerSendChat} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={chatReplyText}
                    onChange={(e) => setChatReplyText(e.target.value)}
                    placeholder="Type response..."
                    className="flex-1 h-9 px-3 bg-white border border-[#ccc3d7]/50 rounded-xl text-xs"
                  />
                  <button type="submit" className="px-4 py-2 bg-[#6C2BD9] text-white rounded-xl text-xs font-bold">
                    Send
                  </button>
                </form>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===================================================================== */}
      {/* 6. PROMO CODES */}
      {/* ===================================================================== */}
      {activeSection === 'promo_codes' && (
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-heading font-bold text-sm text-[#1a1c1d]">
              Active Discount Promo Codes
            </span>
            <button
              type="button"
              onClick={() => setShowCodeModal(true)}
              className="px-3.5 py-1.5 bg-[#6C2BD9] text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-xs hover:bg-purple-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Code</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {safePromoCodes.map((promo) => (
              <div key={promo.id} className="p-4 bg-white rounded-3xl border border-[#ccc3d7]/40 shadow-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-sm text-[#6C2BD9] bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200">
                    {promo.code}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(promo.code, 'Promo code')}
                    className="text-[#7b7486] hover:text-[#6C2BD9] text-xs font-bold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>
                <div className="flex justify-between text-xs text-[#7b7486]">
                  <span>Discount: {promo.discountValue}{promo.discountType === 'percentage' ? '%' : '$'} OFF</span>
                  <span>{promo.usedCount}/{promo.maxUses} used</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===================================================================== */}
      {/* 7. EXPLORE BOOST */}
      {/* ===================================================================== */}
      {activeSection === 'boost' && (
        <section className="space-y-3">
          <div className="p-4 bg-purple-50 rounded-3xl border border-purple-200 text-xs space-y-1">
            <span className="font-bold text-[#6C2BD9] block">Explore Screen Featured Placement</span>
            <p className="text-[#4a4455]">Pin your event to the top hero discovery banner for maximum view-through bookings.</p>
          </div>

          <div className="space-y-3">
            {safeEvents.map((evt) => (
              <div key={evt.id} className="p-4 bg-white rounded-3xl border border-[#ccc3d7]/40 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-[#1a1c1d]">{evt.title}</h4>
                  <p className="text-[#7b7486]">{evt.date}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleExploreBoost(evt.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    evt.isBoostedOnExplore
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-[#6C2BD9] text-white'
                  }`}
                >
                  {evt.isBoostedOnExplore ? 'Featured Active' : 'Boost Event'}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CREATE PROMO CODE MODAL */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 space-y-4 shadow-2xl border border-[#ccc3d7]/50">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-base text-[#1a1c1d]">Create Discount Code</h3>
              <button type="button" onClick={() => setShowCodeModal(false)} className="text-[#7b7486] hover:text-[#1a1c1d]">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCode} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#7b7486]">Coupon Code</label>
                <input
                  type="text"
                  value={codeName}
                  onChange={(e) => setCodeName(e.target.value.toUpperCase())}
                  placeholder="e.g. SUMMER20"
                  className="w-full h-10 px-3 bg-[#f9f9fb] border border-[#ccc3d7]/50 rounded-xl font-mono font-bold text-[#6C2BD9]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-[#7b7486]">Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full h-10 px-2 bg-[#f9f9fb] border border-[#ccc3d7]/50 rounded-xl font-bold"
                  >
                    <option value="percentage">% Percentage</option>
                    <option value="fixed">$ Fixed Amount</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#7b7486]">Value</label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-[#f9f9fb] border border-[#ccc3d7]/50 rounded-xl font-bold"
                    min={1}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#7b7486]">Max Uses</label>
                <input
                  type="number"
                  value={maxUses}
                  onChange={(e) => setMaxUses(Number(e.target.value))}
                  className="w-full h-10 px-3 bg-[#f9f9fb] border border-[#ccc3d7]/50 rounded-xl font-bold"
                  min={1}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCodeModal(false)}
                  className="px-4 py-2 bg-slate-100 text-[#4a4455] rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#6C2BD9] text-white rounded-xl font-bold shadow-md hover:bg-purple-700"
                >
                  Create Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};
