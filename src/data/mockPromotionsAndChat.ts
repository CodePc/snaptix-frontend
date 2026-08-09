import {
  BulkBroadcastCampaign,
  EventChangeTemplate,
  SocialAccountConnection,
  OmniSocialPost,
  SocialInboundMetric,
  SocialInboundComment,
  ChatThread,
} from '../types';

export const INITIAL_BULK_BROADCASTS: BulkBroadcastCampaign[] = [
  {
    id: 'bulk-1',
    eventId: 'event-neon-horizons',
    eventTitle: 'Neon Horizons: The 2024 Global Tour',
    title: '🔥 Final 50 VIP & GA Passes Release (Early Access)',
    channels: ['email', 'sms'],
    targetAudience: 'all_attendees',
    audienceCount: 3840,
    subject: '🎟️ Last chance: Final 50 VIP & GA passes dropped for Neon Horizons LA!',
    messageBody: 'Hey {{attendee_name}}, we just unlocked the final tier of tickets for Neon Horizons at The Grand Arena Plaza! Use promo code NEON20 for 20% off before doors close.',
    discountCode: 'NEON20',
    sentAt: 'Yesterday, 4:15 PM',
    status: 'sent',
    stats: {
      delivered: 3824,
      deliveryRate: 99.6,
      opens: 1845,
      openRate: 48.2,
      clicks: 812,
      clickRate: 21.2,
      ticketsSold: 42,
      revenue: 4120,
    },
  },
  {
    id: 'bulk-2',
    eventId: 'event-neon-nights',
    eventTitle: 'Neon Nights Festival',
    title: '⚡ Weekend Flash Sale - Underground Stage Access',
    channels: ['email'],
    targetAudience: 'category_fans',
    audienceCount: 2150,
    subject: '🚨 Neon Nights NYC: 48-Hour Weekend Flash Pass',
    messageBody: 'Electronic fans! Grab exclusive underground laser tunnel passes for this Saturday. Secure instant anti-scalp dynamic QR entry today.',
    discountCode: 'FLASH15',
    sentAt: '2 days ago',
    status: 'sent',
    stats: {
      delivered: 2140,
      deliveryRate: 99.5,
      opens: 980,
      openRate: 45.8,
      clicks: 430,
      clickRate: 20.1,
      ticketsSold: 28,
      revenue: 2492,
    },
  },
];

export const INITIAL_EVENT_CHANGE_TEMPLATES: EventChangeTemplate[] = [
  {
    id: 'tpl-schedule-shift',
    name: 'Schedule / Door Time Shift',
    category: 'schedule_change',
    icon: 'Clock',
    description: 'Alert ticket holders if door opening or headliner set times are adjusted.',
    channels: ['email', 'sms'],
    subjectTemplate: '⏰ Important Schedule Update: {{event_title}}',
    bodyTemplate: `Hi {{attendee_name}},

Please note an important schedule update for {{event_title}} on {{event_date}} at {{venue_name}}.

• Updated Doors Open: {{new_time}} (previously {{old_time}})
• Main Headliner Set: 8:45 PM Sharp
• Gate Entrance: {{gate_info}}

Your rotating dynamic QR pass (Booking ID: {{ticket_code}}) remains fully active in your Snaptix wallet. We recommend arriving 30 minutes early to clear security smoothly.

Warm regards,
{{organizer_name}} Operations Team`,
    smsTemplate: '⚡ Snaptix Alert: {{event_title}} door time updated to {{new_time}} on {{event_date}}. Your mobile pass is ready in Snaptix wallet.',
  },
  {
    id: 'tpl-venue-stage',
    name: 'Venue / Gate / Stage Relocation',
    category: 'venue_change',
    icon: 'MapPin',
    description: 'Inform fans about stage adjustments, new entrance gates, or parking lots.',
    channels: ['email', 'sms'],
    subjectTemplate: '📍 Entrance & Venue Advisory: {{event_title}}',
    bodyTemplate: `Hello {{attendee_name}},

To ensure seamless ingress for {{event_title}}, please take note of our verified entrance and parking instructions:

• Main General Admission Gate: {{gate_info}}
• VIP & Fast-Track Access: East Gate (Plaza Level)
• Parking Structure: Deck B (Pre-paid passes validated via Snaptix)
• Venue: {{venue_name}}

Open your Snaptix app to access live offline barcode rotation and turn-by-turn navigation.

See you at the show!
{{organizer_name}}`,
    smsTemplate: '📍 Gate update for {{event_title}}: Main entry via {{gate_info}} at {{venue_name}}. Open Snaptix for turn-by-turn map.',
  },
  {
    id: 'tpl-lineup-guest',
    name: 'Lineup & Special Guest Announcement',
    category: 'lineup_update',
    icon: 'Sparkles',
    description: 'Hype up ticket holders with surprise artist additions and set order drops.',
    channels: ['email', 'sms'],
    subjectTemplate: '🎤 Special Guest Added to {{event_title}} Lineup!',
    bodyTemplate: `Exciting news {{attendee_name}}!

We just confirmed a massive special guest addition for {{event_title}} on {{event_date}} at {{venue_name}}.

Join us early for the opening soundcheck session. Your existing ticket tier gives you full access to all stages.

Check the live set schedule in Snaptix!`,
    smsTemplate: '🎤 Surprise lineup addition confirmed for {{event_title}}! Open Snaptix app to view the updated timetable.',
  },
  {
    id: 'tpl-weather-indoor',
    name: 'Weather Advisory & Door Policy',
    category: 'weather_alert',
    icon: 'CloudSun',
    description: 'Send rain-or-shine policies, covered pavilion notices, or climate advisories.',
    channels: ['email', 'sms'],
    subjectTemplate: '☀️ Weather & Comfort Advisory for {{event_title}}',
    bodyTemplate: `Hi {{attendee_name}},

Here is your event day weather & venue comfort check for {{event_title}} on {{event_date}}:

• Pavilion & main stages are 100% climate-controlled and covered.
• Water stations are free throughout {{venue_name}}.
• Clear bag policy: Bags up to 12"x12" permitted.

Bring your mobile phone with Snaptix app ready for instant NFC/QR contactless check-in.`,
    smsTemplate: '☀️ Weather notice for {{event_title}}: Indoor pavilion is 100% climate-controlled. Show runs as scheduled!',
  },
  {
    id: 'tpl-parking-transit',
    name: 'Parking, Shuttle & Transit Logistics',
    category: 'parking_transit',
    icon: 'Car',
    description: 'Provide shuttle departure times, rideshare drop-off zones, and parking discounts.',
    channels: ['email', 'sms'],
    subjectTemplate: '🚗 Fast Transit & Parking Guide for {{event_title}}',
    bodyTemplate: `Hello {{attendee_name}},

Avoid traffic delays! Here are the fastest transportation options for {{event_title}} at {{venue_name}}:

• Free Metro Shuttle: Runs every 10 mins from Central Transit Center.
• Rideshare Zone: Designated pickup/drop-off at Gate 4.
• Parking Lots open 90 minutes before doors open at {{doors_time}}.

Have a safe trip!
{{organizer_name}}`,
    smsTemplate: '🚗 Transit info for {{event_title}}: Shuttles run every 10m from Central Station. Rideshare drop-off at Gate 4.',
  },
  {
    id: 'tpl-reschedule-policy',
    name: 'Reschedule & 100% Escrow Guarantee Notice',
    category: 'reschedule_refund',
    icon: 'ShieldCheck',
    description: 'Formal announcement for date changes with automatic ticket rollover or refund.',
    channels: ['email', 'sms'],
    subjectTemplate: '🔄 Important Notice Regarding {{event_title}}',
    bodyTemplate: `Dear {{attendee_name}},

We want to inform you of a date rescheduling for {{event_title}}.

• New Verified Date: {{new_date}}
• Venue: {{venue_name}}
• Your Ticket: Valid automatically for the new date. No action required.
• Refund Guarantee: If you cannot attend the new date, 1-click 100% refund is available in your Snaptix wallet for 14 days.

Thank you for your understanding.
{{organizer_name}} Support`,
    smsTemplate: '🔄 Date change for {{event_title}}: Moved to {{new_date}}. Your ticket rolled over automatically or 1-click refund in Snaptix.',
  },
];

export const INITIAL_SOCIAL_CONNECTIONS: SocialAccountConnection[] = [
  {
    platform: 'facebook',
    accountName: 'Apex Entertainment Live',
    handle: 'ApexEntertainmentHQ',
    avatar: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop',
    connected: true,
    followers: 128500,
    connectedAt: '2024-01-15',
    pageId: 'fb-page-88219',
  },
  {
    platform: 'instagram',
    accountName: 'Apex Events Official',
    handle: '@apex.events',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    connected: true,
    followers: 84200,
    connectedAt: '2024-02-01',
  },
  {
    platform: 'tiktok',
    accountName: 'Apex Live Music & Raves',
    handle: '@apexevents',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    connected: true,
    followers: 215800,
    connectedAt: '2024-03-10',
  },
];

export const INITIAL_OMNI_POSTS: OmniSocialPost[] = [
  {
    id: 'post-1',
    eventId: 'event-neon-horizons',
    eventTitle: 'Neon Horizons: The 2024 Global Tour',
    platforms: ['facebook', 'instagram', 'tiktok'],
    caption: '🚀 LOS ANGELES! Neon Horizons returns June 15 at The Grand Arena Plaza. Holographic visuals, dynamic synth-wave, and unreleased tracks. Only 50 passes remaining! 🎟️ Grab verified anti-scalp passes now on @snaptix',
    hashtags: ['#NeonHorizons', '#LiveConcert', '#ElectronicPop', '#SnaptixLive', '#LAEvents'],
    linkUrl: 'https://snaptix.app/e/event-neon-horizons?utm_source=omni_social',
    mediaUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop',
    mediaType: 'image',
    publishedAt: 'Today, 2:30 PM',
    status: 'published',
    results: {
      facebookPostId: 'fb-post-9921',
      instagramPostId: 'ig-post-3841',
      tiktokPostId: 'tt-post-1948',
      facebookUrl: 'https://facebook.com/ApexEntertainmentHQ/posts/9921',
      instagramUrl: 'https://instagram.com/p/C8k9xL2p',
      tiktokUrl: 'https://tiktok.com/@apexevents/video/7382910482',
    },
  },
  {
    id: 'post-2',
    eventId: 'event-neon-nights',
    eventTitle: 'Neon Nights Festival',
    platforms: ['facebook', 'instagram'],
    caption: '⚡ NYC Bassheads: Neon Nights laser tunnel lineup drops tonight! Are you ready for 6 hours of non-stop techno & synth? Secure early passes before tier 2 sells out.',
    hashtags: ['#NeonNightsNYC', '#TechnoFestival', '#NYCRaves', '#SnaptixPass'],
    linkUrl: 'https://snaptix.app/e/event-neon-nights?utm_source=instagram_fb_blast',
    mediaUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop',
    mediaType: 'poster',
    publishedAt: 'Yesterday, 6:00 PM',
    status: 'published',
    results: {
      facebookPostId: 'fb-post-9918',
      instagramPostId: 'ig-post-3839',
      facebookUrl: 'https://facebook.com/ApexEntertainmentHQ/posts/9918',
      instagramUrl: 'https://instagram.com/p/C8j48v1m',
    },
  },
];

export const INITIAL_INBOUND_METRICS: SocialInboundMetric[] = [
  {
    id: 'metric-1',
    platform: 'tiktok',
    postTitle: 'Neon Horizons Stage Hologram Preview',
    impressions: 148500,
    likes: 18900,
    comments: 1240,
    shares: 4820,
    inboundClicks: 3420,
    ticketsSold: 112,
    revenue: 9968,
    utmSource: 'utm_source=tiktok_creator_viral',
    conversionRate: 3.27,
  },
  {
    id: 'metric-2',
    platform: 'instagram',
    postTitle: 'VIP Lounge Perks & Headliner Lineup Carousel',
    impressions: 89400,
    likes: 9420,
    comments: 630,
    shares: 1840,
    inboundClicks: 2150,
    ticketsSold: 84,
    revenue: 7476,
    utmSource: 'utm_source=instagram_feed_carousel',
    conversionRate: 3.91,
  },
  {
    id: 'metric-3',
    platform: 'facebook',
    postTitle: 'Official Ticket Release & Group Discount Notice',
    impressions: 42300,
    likes: 2450,
    comments: 310,
    shares: 890,
    inboundClicks: 1420,
    ticketsSold: 46,
    revenue: 4094,
    utmSource: 'utm_source=facebook_events_group',
    conversionRate: 3.24,
  },
  {
    id: 'metric-4',
    platform: 'direct',
    postTitle: 'Direct Link Share & Organic Referrals',
    impressions: 18200,
    likes: 0,
    comments: 0,
    shares: 540,
    inboundClicks: 1980,
    ticketsSold: 58,
    revenue: 5162,
    utmSource: 'utm_source=direct_fan_share',
    conversionRate: 2.93,
  },
];

export const INITIAL_INBOUND_COMMENTS: SocialInboundComment[] = [
  {
    id: 'comment-1',
    platform: 'tiktok',
    author: '@marcus_beats',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
    content: 'Are tickets transferable if my friend can’t make it to Neon Horizons?',
    timestamp: '18m ago',
    postTitle: 'Neon Horizons Hologram Preview',
    sentiment: 'question',
    replied: true,
    replyText: 'Yes! Snaptix offers 1-click verified anti-scalp face-value transfer directly in the app.',
  },
  {
    id: 'comment-2',
    platform: 'instagram',
    author: 'claire.designs',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
    content: 'Just booked our VIP front row squad passes! The visual stage looks insane 🔥',
    timestamp: '42m ago',
    postTitle: 'VIP Lounge Perks Carousel',
    sentiment: 'excited',
    replied: true,
    replyText: 'See you in the front row Claire! Check your Snaptix wallet for your rotating pass.',
  },
  {
    id: 'comment-3',
    platform: 'facebook',
    author: 'David Kowalski',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
    content: 'What time do doors open for ADA accessible seating at Grand Arena?',
    timestamp: '1h ago',
    postTitle: 'Official Ticket Release Notice',
    sentiment: 'support',
    replied: false,
  },
  {
    id: 'comment-4',
    platform: 'tiktok',
    author: '@synth_wave_queen',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=150&auto=format&fit=crop',
    content: 'Is there any chance for an afterparty in downtown LA after the tour show? 🙏',
    timestamp: '2h ago',
    postTitle: 'Neon Horizons Hologram Preview',
    sentiment: 'positive',
    replied: false,
  },
];

export const INITIAL_CHAT_THREADS: ChatThread[] = [
  {
    id: 'thread-alex-chen',
    eventId: 'event-neon-horizons',
    eventTitle: 'Neon Horizons: The 2024 Global Tour',
    attendeeId: 'att-alex-chen',
    attendeeName: 'Alex Chen',
    attendeeEmail: 'alex.chen@gmail.com',
    attendeeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
    ticketBookingId: '#PX-9920',
    ticketTier: 'General Admission',
    ticketSeat: 'GA-402',
    checkedIn: false,
    lastMessage: 'Great, thank you! Will there be charging lockers inside the arena?',
    lastMessageTime: '10:45 AM',
    unreadForAttendee: 0,
    unreadForOrganizer: 1,
    status: 'open',
    category: 'Gate & Parking',
    messages: [
      {
        id: 'msg-1',
        threadId: 'thread-alex-chen',
        sender: 'attendee',
        senderName: 'Alex Chen',
        text: 'Hi Apex team! I have ticket #PX-9920 for Neon Horizons. What time is the recommended arrival for security check?',
        timestamp: '10:30 AM',
        isRead: true,
      },
      {
        id: 'msg-2',
        threadId: 'thread-alex-chen',
        sender: 'organizer',
        senderName: 'Apex Host Team',
        text: 'Hi Alex! Doors open at 6:00 PM. We recommend arriving around 5:45 PM at Gate 2 (Main Plaza) to breeze through contactless QR scanning.',
        timestamp: '10:38 AM',
        isRead: true,
      },
      {
        id: 'msg-3',
        threadId: 'thread-alex-chen',
        sender: 'attendee',
        senderName: 'Alex Chen',
        text: 'Great, thank you! Will there be charging lockers inside the arena?',
        timestamp: '10:45 AM',
        isRead: false,
      },
    ],
  },
  {
    id: 'thread-sarah-jenkins',
    eventId: 'event-neon-horizons',
    eventTitle: 'Neon Horizons: The 2024 Global Tour',
    attendeeId: 'att-sarah-jenkins',
    attendeeName: 'Sarah Jenkins',
    attendeeEmail: 'sarah.j@outlook.com',
    attendeeAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
    ticketBookingId: '#PX-8841',
    ticketTier: 'VIP Front Row + Lounge',
    ticketSeat: 'VIP-Deck-04',
    checkedIn: false,
    lastMessage: 'Your VIP wristband and complimentary merch kit will be ready at the VIP check-in desk at East Plaza!',
    lastMessageTime: 'Yesterday',
    unreadForAttendee: 0,
    unreadForOrganizer: 0,
    status: 'resolved',
    category: 'VIP Perks',
    messages: [
      {
        id: 'msg-10',
        threadId: 'thread-sarah-jenkins',
        sender: 'attendee',
        senderName: 'Sarah Jenkins',
        text: 'Hi! Where do I pick up the VIP exclusive merch kit included with my ticket?',
        timestamp: 'Yesterday, 3:15 PM',
        isRead: true,
      },
      {
        id: 'msg-11',
        threadId: 'thread-sarah-jenkins',
        sender: 'organizer',
        senderName: 'Apex Host Team',
        text: 'Your VIP wristband and complimentary merch kit will be ready at the VIP check-in desk at East Plaza! Just show your dynamic rotating QR pass on your phone.',
        timestamp: 'Yesterday, 3:20 PM',
        isRead: true,
      },
    ],
  },
  {
    id: 'thread-marcus-vance',
    eventId: 'event-neon-nights',
    eventTitle: 'Neon Nights Festival',
    attendeeId: 'att-marcus-vance',
    attendeeName: 'Marcus Vance',
    attendeeEmail: 'marcus.v@techcorp.io',
    attendeeAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
    ticketBookingId: '#PX-1044',
    ticketTier: 'General Admission',
    ticketSeat: 'Table T-08',
    checkedIn: true,
    lastMessage: 'Is there a re-entry policy if I need to step out to my car?',
    lastMessageTime: '2 hours ago',
    unreadForAttendee: 0,
    unreadForOrganizer: 1,
    status: 'open',
    category: 'General',
    messages: [
      {
        id: 'msg-20',
        threadId: 'thread-marcus-vance',
        sender: 'attendee',
        senderName: 'Marcus Vance',
        text: 'Is there a re-entry policy if I need to step out to my car?',
        timestamp: '2 hours ago',
        isRead: false,
      },
    ],
  },
];
