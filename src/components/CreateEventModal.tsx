import React, { useState } from 'react';
import {
  X,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Sparkles,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { EventItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEvent: (newEvent: EventItem) => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onCreateEvent,
}) => {
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<EventItem['category']>('Music');
  const [date, setDate] = useState<string>('Saturday, Nov 30, 2024');
  const [time, setTime] = useState<string>('8:00 PM - 1:00 AM');
  const [venue, setVenue] = useState<string>('');
  const [city, setCity] = useState<string>('New York, NY');
  const [price, setPrice] = useState<string>('45');
  const [description, setDescription] = useState<string>('');
  const [image, setImage] = useState<string>(
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !venue.trim()) return;

    const numPrice = parseFloat(price) || 0;
    const newEvt: EventItem = {
      id: `custom-event-${Date.now()}`,
      title,
      tagline: 'Exciting live event hosted on Snaptix.',
      category,
      badge: 'NEW',
      badgeType: 'primary',
      date,
      monthShort: 'NOV',
      dayNumber: '30',
      time,
      doorsOpen: '7:30 PM',
      venue,
      city,
      distance: 'In your area',
      price: numPrice,
      isFree: numPrice === 0,
      image:
        image ||
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop',
      description:
        description ||
        'Join us for this exciting live event experience curated on the Snaptix platform with instant digital QR entry passes.',
      organizer: {
        name: 'You (Organizer)',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop',
        rating: 5.0,
        reviewsCount: 1,
        isVerified: true,
        followers: 120,
      },
      tiers: [
        {
          id: 'tier-custom-ga',
          name: 'General Admission',
          price: numPrice,
          description: 'Standard event pass and entry.',
          available: 100,
          perks: ['Standard Entry', 'Digital QR Pass'],
        },
      ],
      locationCoords: {
        lat: 40.7128,
        lng: -74.006,
        address: `${venue}, ${city}`,
        mapQuery: `${venue} ${city}`,
      },
      isTrending: true,
      isSaved: false,
    };

    onCreateEvent(newEvt);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#edeef0] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[#6C2BD9]">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="font-heading font-bold text-lg text-[#1a1c1d]">
                Host Your Own Event
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#f3f3f5] flex items-center justify-center text-[#4a4455] hover:bg-[#edeef0]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 hide-scrollbar text-xs">
            <div>
              <label className="font-bold text-[#1a1c1d] block mb-1">
                Event Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Brooklyn Synthwave Rooftop Night"
                className="w-full h-11 px-3 bg-[#f9f9fb] rounded-xl border border-[#ccc3d7]/50 focus:ring-2 focus:ring-[#6C2BD9] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#1a1c1d] block mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as EventItem['category'])}
                  className="w-full h-11 px-3 bg-[#f9f9fb] rounded-xl border border-[#ccc3d7]/50 focus:ring-2 focus:ring-[#6C2BD9] outline-none"
                >
                  <option value="Music">Music</option>
                  <option value="Tech">Tech</option>
                  <option value="Sports">Sports</option>
                  <option value="Food">Food</option>
                  <option value="Arts">Arts</option>
                  <option value="Workshops">Workshops</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#1a1c1d] block mb-1">
                  Ticket Price ($)
                </label>
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0 for Free"
                  className="w-full h-11 px-3 bg-[#f9f9fb] rounded-xl border border-[#ccc3d7]/50 focus:ring-2 focus:ring-[#6C2BD9] outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#1a1c1d] block mb-1">
                  Date
                </label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="e.g. Saturday, Nov 30, 2024"
                  className="w-full h-11 px-3 bg-[#f9f9fb] rounded-xl border border-[#ccc3d7]/50 focus:ring-2 focus:ring-[#6C2BD9] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#1a1c1d] block mb-1">
                  Time
                </label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="e.g. 8:00 PM - 1:00 AM"
                  className="w-full h-11 px-3 bg-[#f9f9fb] rounded-xl border border-[#ccc3d7]/50 focus:ring-2 focus:ring-[#6C2BD9] outline-none"
                />
              </div>
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
                  className="w-full h-11 px-3 bg-[#f9f9fb] rounded-xl border border-[#ccc3d7]/50 focus:ring-2 focus:ring-[#6C2BD9] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#1a1c1d] block mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. New York, NY"
                  className="w-full h-11 px-3 bg-[#f9f9fb] rounded-xl border border-[#ccc3d7]/50 focus:ring-2 focus:ring-[#6C2BD9] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-[#1a1c1d] block mb-1">
                Event Banner Photo (URL)
              </label>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="Image URL"
                className="w-full h-11 px-3 bg-[#f9f9fb] rounded-xl border border-[#ccc3d7]/50 focus:ring-2 focus:ring-[#6C2BD9] outline-none text-[11px]"
              />
            </div>

            <div>
              <label className="font-bold text-[#1a1c1d] block mb-1">
                Event Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell guests about your event, schedule, music style, and perks..."
                className="w-full p-3 bg-[#f9f9fb] rounded-xl border border-[#ccc3d7]/50 focus:ring-2 focus:ring-[#6C2BD9] outline-none text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full h-13 bg-[#6C2BD9] hover:bg-purple-700 text-white rounded-2xl font-heading font-bold text-sm shadow-xl shadow-purple-600/25 active:scale-95 transition-all mt-2"
            >
              Publish Event & Open Ticket Sales
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
