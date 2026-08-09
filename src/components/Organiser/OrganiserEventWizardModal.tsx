import React, { useState } from 'react';
import {
  X,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Sparkles,
  Plus,
  Trash2,
  Check,
  ChevronRight,
  ChevronLeft,
  Users,
  ShieldCheck,
  Layers,
  Image as ImageIcon,
  Zap,
  Wand2,
  Tag,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { OrganiserEventData, EventTier, OrganiserPersona } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface OrganiserEventWizardModalProps {
  isOpen: boolean;
  initialEvent?: OrganiserEventData | null;
  currentPersona?: OrganiserPersona;
  onClose: () => void;
  onSaveEvent?: (event: OrganiserEventData) => void;
  onCreateEvent?: (event: OrganiserEventData) => void;
}

export const OrganiserEventWizardModal: React.FC<OrganiserEventWizardModalProps> = ({
  isOpen,
  initialEvent,
  currentPersona = 'admin',
  onClose,
  onSaveEvent,
  onCreateEvent,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Free vs Paid Toggle
  const [eventType, setEventType] = useState<'paid' | 'free'>(
    initialEvent?.isFree || initialEvent?.price === 0 ? 'free' : 'paid'
  );

  // Step 1: Basics
  const [title, setTitle] = useState<string>(initialEvent?.title || '');
  const [tagline, setTagline] = useState<string>(initialEvent?.tagline || '');
  const [category, setCategory] = useState<OrganiserEventData['category']>(
    initialEvent?.category || 'Music'
  );
  const [description, setDescription] = useState<string>(
    initialEvent?.description || ''
  );
  const [image, setImage] = useState<string>(
    initialEvent?.image ||
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop'
  );

  // AI Co-Pilot State
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [aiConceptInput, setAiConceptInput] = useState<string>('');
  const [showAiBox, setShowAiBox] = useState<boolean>(false);

  // Step 2: Date, Time & Location
  const [date, setDate] = useState<string>(
    initialEvent?.date || 'Saturday, Nov 30, 2024'
  );
  const [time, setTime] = useState<string>(
    initialEvent?.time || '8:00 PM - 1:00 AM'
  );
  const [doorsOpen, setDoorsOpen] = useState<string>(
    initialEvent?.doorsOpen || '7:00 PM'
  );
  const [venue, setVenue] = useState<string>(initialEvent?.venue || '');
  const [city, setCity] = useState<string>(initialEvent?.city || 'New York, NY');
  const [address, setAddress] = useState<string>(
    initialEvent?.locationCoords?.address || ''
  );

  // Step 3: Tiers & Capacity
  const [tiers, setTiers] = useState<EventTier[]>(
    initialEvent?.tiers && initialEvent.tiers.length > 0
      ? initialEvent.tiers
      : [
          {
            id: 'tier-ga',
            name: 'General Admission',
            price: eventType === 'free' ? 0 : 45,
            description: 'Standard floor access and digital pass.',
            available: 200,
            perks: ['Standard Entry', 'Floor Access'],
          },
          {
            id: 'tier-vip',
            name: 'VIP Experience',
            price: eventType === 'free' ? 0 : 120,
            description: 'Express entry, elevated VIP lounge and drinks.',
            available: 50,
            perks: ['Fast-track Entry', 'VIP Lounge'],
          },
        ]
  );

  // Step 4: Settings
  const [allowResale, setAllowResale] = useState<boolean>(true);
  const [boostOnExplore, setBoostOnExplore] = useState<boolean>(
    initialEvent?.isBoostedOnExplore || false
  );
  const [status, setStatus] = useState<OrganiserEventData['status']>(
    initialEvent?.status || (currentPersona === 'moderator' ? 'pending_approval' : 'published')
  );

  // Reset or prefill when initialEvent changes or opens
  React.useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title);
      setTagline(initialEvent.tagline || '');
      setCategory(initialEvent.category);
      setDescription(initialEvent.description || '');
      setImage(initialEvent.image);
      setDate(initialEvent.date);
      setTime(initialEvent.time);
      setDoorsOpen(initialEvent.doorsOpen || '7:00 PM');
      setVenue(initialEvent.venue);
      setCity(initialEvent.city);
      setAddress(initialEvent.locationCoords?.address || '');
      setTiers(initialEvent.tiers || []);
      setBoostOnExplore(initialEvent.isBoostedOnExplore || false);
      setEventType(initialEvent.isFree || initialEvent.price === 0 ? 'free' : 'paid');
      setStatus(initialEvent.status || (currentPersona === 'moderator' ? 'pending_approval' : 'published'));
    } else {
      setStatus(currentPersona === 'moderator' ? 'pending_approval' : 'published');
    }
  }, [initialEvent, currentPersona]);

  if (!isOpen) return null;

  // Handle Free vs Paid event type switch
  const handleToggleEventType = (type: 'paid' | 'free') => {
    setEventType(type);
    if (type === 'free') {
      setTiers(
        tiers.map((t, idx) => ({
          ...t,
          price: 0,
          name: idx === 0 ? 'Free RSVP Pass' : 'VIP Community Pass ($0)',
        }))
      );
    } else {
      setTiers(
        tiers.map((t, idx) => ({
          ...t,
          price: idx === 0 ? 35 : 85,
          name: idx === 0 ? 'General Admission' : 'VIP Pass',
        }))
      );
    }
  };

  // AI Generation API Call
  const handleAiGenerate = async () => {
    setIsAiGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiConceptInput || `${category} rooftop party`,
          category,
          isFree: eventType === 'free',
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        if (d.title) setTitle(d.title);
        if (d.tagline) setTagline(d.tagline);
        if (d.description) setDescription(d.description);
        if (d.suggestedTiers && d.suggestedTiers.length > 0) {
          setTiers(
            d.suggestedTiers.map((t: any, idx: number) => ({
              id: `tier-ai-${idx}-${Date.now()}`,
              name: t.name || 'Tier Pass',
              price: eventType === 'free' ? 0 : t.price || 40,
              description: t.description || 'Access tier',
              available: t.available || 100,
              perks: t.perks || ['Digital QR Ticket'],
            }))
          );
        }
        setShowAiBox(false);
      }
    } catch (err) {
      console.error('Failed to generate AI event:', err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleAddTier = () => {
    const newTier: EventTier = {
      id: `tier-${Date.now()}`,
      name: eventType === 'free' ? 'Community RSVP Pass' : 'Special Admission',
      price: eventType === 'free' ? 0 : 60,
      description: 'Custom attendee tier access.',
      available: 50,
      perks: ['Standard Entry'],
    };
    setTiers([...tiers, newTier]);
  };

  const handleRemoveTier = (id: string) => {
    if (tiers.length <= 1) return;
    setTiers(tiers.filter((t) => t.id !== id));
  };

  const handleUpdateTier = (id: string, updated: Partial<EventTier>) => {
    setTiers(tiers.map((t) => (t.id === id ? { ...t, ...updated } : t)));
  };

  const totalCapacity = tiers.reduce((acc, t) => acc + t.available, 0);
  const minPrice = Math.min(...tiers.map((t) => t.price));
  const isFreeEventCalculated = eventType === 'free' || minPrice === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !venue.trim()) return;

    // Determine status based on persona & current state
    let finalStatus: OrganiserEventData['status'] = status;
    if (currentPersona === 'moderator' && status === 'published') {
      finalStatus = 'pending_approval';
    }

    const savedEvent: OrganiserEventData = {
      id: initialEvent?.id || `org-evt-${Date.now()}`,
      title,
      tagline: tagline || 'Exclusive live event hosted on Snaptix.',
      category,
      badge: isFreeEventCalculated ? 'FREE RSVP' : initialEvent?.badge || 'NEW',
      badgeType: isFreeEventCalculated ? 'success' : 'primary',
      date,
      monthShort: initialEvent?.monthShort || 'NOV',
      dayNumber: initialEvent?.dayNumber || '30',
      time,
      doorsOpen,
      venue,
      city,
      distance: initialEvent?.distance || 'In your area',
      price: isFreeEventCalculated ? 0 : minPrice,
      isFree: isFreeEventCalculated,
      image,
      description:
        description ||
        'Join us for an unforgettable live experience curated on Snaptix with direct dynamic QR ticket issuance and verified entry.',
      organizer: initialEvent?.organizer || {
        name: 'Snaptix Events Group',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
        rating: 5.0,
        reviewsCount: 1,
        isVerified: true,
        followers: 120,
      },
      tiers,
      locationCoords: {
        lat: initialEvent?.locationCoords?.lat || 40.7128,
        lng: initialEvent?.locationCoords?.lng || -74.006,
        address: address || `${venue}, ${city}`,
        mapQuery: `${venue} ${city}`,
      },
      status: finalStatus,
      createdByPersona: currentPersona as OrganiserPersona,
      totalCapacity,
      ticketsSold: initialEvent?.ticketsSold || 0,
      grossSales: initialEvent?.grossSales || 0,
      checkedInCount: initialEvent?.checkedInCount || 0,
      isBoostedOnExplore: boostOnExplore,
      attendees: initialEvent?.attendees || [],
    };

    if (onSaveEvent) {
      onSaveEvent(savedEvent);
    } else if (onCreateEvent) {
      onCreateEvent(savedEvent);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Wizard Header */}
          <div className="p-5 border-b border-[#edeef0] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-purple-50 flex items-center justify-center text-[#6C2BD9]">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-[#1a1c1d]">
                  Create & Launch Event
                </h3>
                <p className="text-[11px] text-[#7b7486]">
                  Step {currentStep} of 4 • {currentStep === 1 ? 'Event Overview & AI' : currentStep === 2 ? 'Date & Venue' : currentStep === 3 ? 'Ticket Tiers' : 'Publish & RBAC'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#f3f3f5] flex items-center justify-center text-[#4a4455] hover:bg-[#edeef0]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-4 h-1 bg-[#edeef0]">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-full transition-all ${
                  s <= currentStep ? 'bg-[#6C2BD9]' : 'bg-transparent'
                }`}
              />
            ))}
          </div>

          {/* Form Wizard Body */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 hide-scrollbar text-xs flex-1">
            {/* Moderator Persona Notice Banner */}
            {currentPersona === 'moderator' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2 text-amber-800 text-[11px]">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  <strong>Moderator Persona:</strong> Events will be submitted to the <strong>Admin Approval Queue</strong> before going public on Explore.
                </span>
              </div>
            )}

            {/* Step 1: Basics & AI Assistant */}
            {currentStep === 1 && (
              <div className="space-y-3.5">
                {/* Event Type: Free vs Paid Selector */}
                <div>
                  <label className="font-bold text-[#1a1c1d] block mb-1.5">
                    Event Monetization Model *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleEventType('paid')}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-2 transition-all ${
                        eventType === 'paid'
                          ? 'bg-purple-50 border-[#6C2BD9] text-[#6C2BD9] font-bold shadow-xs'
                          : 'bg-[#f9f9fb] border-[#ccc3d7]/40 text-[#4a4455]'
                      }`}
                    >
                      <DollarSign className="w-4 h-4" />
                      <div>
                        <span className="block text-xs font-bold">Paid Event</span>
                        <span className="text-[10px] text-[#7b7486] font-normal">Tiered Ticket Sales ($)</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleEventType('free')}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-2 transition-all ${
                        eventType === 'free'
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-bold shadow-xs'
                          : 'bg-[#f9f9fb] border-[#ccc3d7]/40 text-[#4a4455]'
                      }`}
                    >
                      <Tag className="w-4 h-4 text-emerald-600" />
                      <div>
                        <span className="block text-xs font-bold text-emerald-700">Free Event</span>
                        <span className="text-[10px] text-emerald-600/80 font-normal">Complimentary RSVP ($0)</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* AI Event Co-Pilot Trigger Bar */}
                <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-4 rounded-2xl space-y-2 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                      <span className="font-heading font-bold text-xs text-amber-300">
                        AI Co-Pilot Assistant
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAiBox(!showAiBox)}
                      className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-[10px] font-bold backdrop-blur-md transition-all"
                    >
                      {showAiBox ? 'Close AI' : '✨ Generate Event with AI'}
                    </button>
                  </div>

                  <AnimatePresence>
                    {showAiBox && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 pt-2 border-t border-white/20 overflow-hidden"
                      >
                        <p className="text-[11px] text-slate-200">
                          Enter keywords or event theme, and Gemini AI will auto-generate titles, descriptions, and recommended tiers:
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={aiConceptInput}
                            onChange={(e) => setAiConceptInput(e.target.value)}
                            placeholder="e.g. Underground Synthwave & VR Art Showcase"
                            className="flex-1 h-9 px-3 bg-white/10 rounded-xl text-white placeholder:text-slate-300 text-xs border border-white/20 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleAiGenerate}
                            disabled={isAiGenerating}
                            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 shadow-md shrink-0"
                          >
                            {isAiGenerating ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Generating...</span>
                              </>
                            ) : (
                              <>
                                <Wand2 className="w-3.5 h-3.5" />
                                <span>Generate</span>
                              </>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className="font-bold text-[#1a1c1d] block mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Brooklyn Synthwave Rooftop Night 2024"
                    className="w-full h-11 px-3.5 bg-[#f9f9fb] rounded-xl border border-[#ccc3d7]/50 focus:ring-2 focus:ring-[#6C2BD9] outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#1a1c1d] block mb-1">
                    Tagline (Catchy 1-line hook)
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. High-energy modular synthesizer beats under the stars."
                    className="w-full h-11 px-3.5 bg-[#f9f9fb] rounded-xl border border-[#ccc3d7]/50 focus:ring-2 focus:ring-[#6C2BD9] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#1a1c1d] block mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as OrganiserEventData['category'])}
                      className="w-full h-11 px-3 bg-[#f9f9fb] rounded-xl border border-[#ccc3d7]/50 focus:ring-2 focus:ring-[#6C2BD9] outline-none font-bold"
                    >
                      <option value="Music">Music</option>
                      <option value="Nightlife">Nightlife</option>
                      <option value="Tech">Tech</option>
                      <option value="Sports">Sports</option>
                      <option value="Food">Food</option>
                      <option value="Arts">Arts</option>
                      <option value="Workshops">Workshops</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#1a1c1d] block mb-1">
                      Banner Image (URL)
                    </label>
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="Image URL"
                      className="w-full h-11 px-3 bg-[#f9f9fb] rounded-xl border border-[#ccc3d7]/50 focus:ring-2 focus:ring-[#6C2BD9] outline-none text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#1a1c1d] block mb-1">
                    Detailed Event Description
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell guests about line-ups, agenda, dress code, amenities, and expectations..."
                    className="w-full p-3 bg-[#f9f9fb] rounded-xl border border-[#ccc3d7]/50 focus:ring-2 focus:ring-[#6C2BD9] outline-none"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Date & Venue */}
            {currentStep === 2 && (
              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#1a1c1d] block mb-1">
                      Date *
                    </label>
                    <input
                      type="text"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      placeholder="e.g. Saturday, Nov 30, 2024"
                      className="w-full h-11 px-3.5 bg-[#f9f9fb] rounded-xl border border-[#ccc3d7]/50 focus:ring-2 focus:ring-[#6C2BD9] outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#1a1c1d] block mb-1">
                      Doors Open Time
                    </label>
                    <input
                      type="text"
                      value={doorsOpen}
                      onChange={(e) => setDoorsOpen(e.target.value)}
                      placeholder="e.g. 7:00 PM"
                      className="w-full h-11 px-3.5 bg-[#f9f9fb] rounded-xl border border-[#ccc3d7]/50 focus:ring-2 focus:ring-[#6C2BD9] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#1a1c1d] block mb-1">
                    Event Schedule / Hours *
                  </label>
                  <input
                    type="text"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g. 8:00 PM - 1:00 AM"
                    className="w-full h-11 px-3.5 bg-[#f9f9fb] rounded-xl border border-[#ccc3d7]/50 focus:ring-2 focus:ring-[#6C2BD9] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#1a1c1d] block mb-1">
                      Venue Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      placeholder="e.g. Skyline Rooftop Lounge"
                      className="w-full h-11 px-3.5 bg-[#f9f9fb] rounded-xl border border-[#ccc3d7]/50 focus:ring-2 focus:ring-[#6C2BD9] outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#1a1c1d] block mb-1">
                      City & State
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. New York, NY"
                      className="w-full h-11 px-3.5 bg-[#f9f9fb] rounded-xl border border-[#ccc3d7]/50 focus:ring-2 focus:ring-[#6C2BD9] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#1a1c1d] block mb-1">
                    Full Physical Street Address (for GPS Map)
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 450 Broadway, New York, NY 10013"
                    className="w-full h-11 px-3.5 bg-[#f9f9fb] rounded-xl border border-[#ccc3d7]/50 focus:ring-2 focus:ring-[#6C2BD9] outline-none"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Ticket Tiers & Pricing */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-heading font-bold text-sm text-[#1a1c1d]">
                      Ticket Inventory & Tiers ({eventType === 'free' ? 'Free RSVP' : 'Paid Tiers'})
                    </h4>
                    <p className="text-[11px] text-[#7b7486]">
                      Total Capacity: <span className="font-bold text-[#6C2BD9]">{totalCapacity} seats</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddTier}
                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#6C2BD9] font-bold rounded-xl flex items-center gap-1 text-[11px]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Tier</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {tiers.map((tier, idx) => (
                    <div
                      key={tier.id}
                      className="p-4 bg-[#f9f9fb] rounded-2xl border border-[#ccc3d7]/40 space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-heading font-bold text-xs text-[#6C2BD9]">
                          Tier #{idx + 1} {eventType === 'free' ? '(Free RSVP)' : ''}
                        </span>
                        {tiers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTier(tier.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <label className="font-bold text-[10px] text-[#7b7486] block mb-0.5">
                            Tier Name
                          </label>
                          <input
                            type="text"
                            value={tier.name}
                            onChange={(e) => handleUpdateTier(tier.id, { name: e.target.value })}
                            className="w-full h-9 px-2.5 bg-white rounded-lg border border-[#ccc3d7]/50 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-[10px] text-[#7b7486] block mb-0.5">
                            Price ($)
                          </label>
                          <input
                            type="number"
                            min="0"
                            disabled={eventType === 'free'}
                            value={tier.price}
                            onChange={(e) => handleUpdateTier(tier.id, { price: Number(e.target.value) })}
                            className="w-full h-9 px-2.5 bg-white rounded-lg border border-[#ccc3d7]/50 text-xs font-mono font-bold text-[#6C2BD9] disabled:bg-slate-100"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="font-bold text-[10px] text-[#7b7486] block mb-0.5">
                            Capacity / Available
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={tier.available}
                            onChange={(e) => handleUpdateTier(tier.id, { available: Number(e.target.value) })}
                            className="w-full h-9 px-2.5 bg-white rounded-lg border border-[#ccc3d7]/50 text-xs font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-[10px] text-[#7b7486] block mb-0.5">
                            Perks (comma-separated)
                          </label>
                          <input
                            type="text"
                            value={tier.perks.join(', ')}
                            onChange={(e) =>
                              handleUpdateTier(tier.id, {
                                perks: e.target.value.split(',').map((p) => p.trim()),
                              })
                            }
                            className="w-full h-9 px-2.5 bg-white rounded-lg border border-[#ccc3d7]/50 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Settings & Publishing */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#6C2BD9]" />
                    <h4 className="font-heading font-bold text-sm text-[#1a1c1d]">
                      Event Launch Summary
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-[#4a4455] pt-1">
                    <p>Title: <span className="font-bold text-[#1a1c1d]">{title || 'Untitled'}</span></p>
                    <p>Total Capacity: <span className="font-bold text-[#6C2BD9]">{totalCapacity} tickets</span></p>
                    <p>Venue: <span className="font-bold">{venue}, {city}</span></p>
                    <p>Pricing: <span className="font-bold font-mono text-emerald-600">{isFreeEventCalculated ? 'FREE RSVP ($0)' : `$${minPrice}`}</span></p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3.5 bg-[#f9f9fb] rounded-2xl border border-[#edeef0] cursor-pointer">
                    <div>
                      <p className="font-bold text-[#1a1c1d]">Enable Secondary Ticket Resale</p>
                      <p className="text-[11px] text-[#7b7486]">
                        Allow buyers to list tickets on Snaptix Marketplace (5% organizer royalty)
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={allowResale}
                      onChange={(e) => setAllowResale(e.target.checked)}
                      className="w-4 h-4 accent-[#6C2BD9] rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 bg-[#f9f9fb] rounded-2xl border border-[#edeef0] cursor-pointer">
                    <div>
                      <p className="font-bold text-[#1a1c1d]">Feature Boost on Explore Screen</p>
                      <p className="text-[11px] text-[#7b7486]">
                        Display hero banner placement to local event seekers
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={boostOnExplore}
                      onChange={(e) => setBoostOnExplore(e.target.checked)}
                      className="w-4 h-4 accent-[#6C2BD9] rounded"
                    />
                  </label>

                  <div className="p-3.5 bg-[#f9f9fb] rounded-2xl border border-[#edeef0] space-y-1.5">
                    <label className="font-bold text-[#1a1c1d] block">
                      Publishing Status
                    </label>

                    {currentPersona === 'moderator' ? (
                      <div className="p-3 bg-amber-100/70 text-amber-900 rounded-xl text-xs space-y-1">
                        <p className="font-bold flex items-center gap-1">
                          <ShieldCheck className="w-4 h-4 text-amber-700" />
                          Submitting as Moderator
                        </p>
                        <p className="text-[11px] text-amber-800">
                          Your event will sit in the <strong>Admin Approval Queue</strong> (`pending_approval`) until an Admin reviews and approves it.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setStatus('published')}
                          className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                            status === 'published'
                              ? 'bg-[#6C2BD9] text-white border-[#6C2BD9]'
                              : 'bg-white text-[#4a4455] border-[#ccc3d7]/50'
                          }`}
                        >
                          Publish Live Now
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatus('draft')}
                          className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                            status === 'draft'
                              ? 'bg-[#6C2BD9] text-white border-[#6C2BD9]'
                              : 'bg-white text-[#4a4455] border-[#ccc3d7]/50'
                          }`}
                        >
                          Save as Draft
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Footer */}
            <div className="pt-3 border-t border-[#edeef0] flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-4 py-2.5 bg-[#f3f3f5] text-[#4a4455] font-bold text-xs rounded-xl flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (currentStep === 1 && !title.trim()) {
                      alert('Please enter an event title');
                      return;
                    }
                    if (currentStep === 2 && !venue.trim()) {
                      alert('Please enter a venue name');
                      return;
                    }
                    setCurrentStep(currentStep + 1);
                  }}
                  className="px-6 py-2.5 bg-[#6C2BD9] text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-md shadow-purple-600/20"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#6C2BD9] hover:bg-purple-700 text-white font-heading font-bold text-xs rounded-xl shadow-lg shadow-purple-600/25 active:scale-95 transition-all"
                >
                  {currentPersona === 'moderator'
                    ? 'Submit to Admin Approval Queue'
                    : status === 'published'
                    ? 'Publish & Open Ticket Sales'
                    : 'Save Event Draft'}
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
