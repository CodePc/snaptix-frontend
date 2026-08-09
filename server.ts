import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  // 3000 is often taken by Docker; Vite convention is 5173
  const PORT = Number(process.env.PORT) || 5173;
  const server = http.createServer(app);

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 1. AI Event Assistant: Generate Event Title, Tagline, Description, Pricing Tiers, Tags
  app.post('/api/ai/generate-event', async (req, res) => {
    try {
      const { prompt, category = 'Music', isFree = false } = req.body || {};

      const apiKey = process.env.GEMINI_API_KEY;

      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        const systemInstruction = `You are Snaptix AI Event Co-Pilot. Generate a high-converting event outline based on the user's input.
Return ONLY valid JSON with keys:
"title": string,
"tagline": string,
"description": string,
"category": string,
"recommendedPrice": number (0 if free, or typical tier price like 25, 45, 95),
"isFree": boolean,
"suggestedTiers": Array of { "name": string, "price": number, "description": string, "available": number, "perks": string[] },
"bannerPrompt": string (Unsplash query or art style description),
"suggestedHashtags": string[],
"targetAudience": string`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Event concept: ${prompt || 'Underground music and lights festival'}. Category: ${category}. Is free event: ${isFree}.`,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
          },
        });

        const text = response.text;
        if (text) {
          const parsed = JSON.parse(text);
          return res.json({ success: true, data: parsed, provider: 'gemini' });
        }
      }

      // Fallback AI Engine if GEMINI_API_KEY is not configured or fails
      const fallbackTitle = prompt
        ? `${prompt.trim().replace(/\b\w/g, (l) => l.toUpperCase())}`
        : `${category} Live Session 2024`;

      const fallbackData = {
        title: fallbackTitle,
        tagline: isFree
          ? `Exclusive free RSVP entry experience for true ${category} enthusiasts.`
          : `High-energy live ${category.toLowerCase()} event featuring top performers and immersive sound.`,
        description: `Join us for an unforgettable ${category.toLowerCase()} gathering at our premier venue. Experience cutting-edge sound systems, curated food and drink options, dynamic rotating QR pass ticketing, and exclusive VIP access tiers.`,
        category: category,
        recommendedPrice: isFree ? 0 : category === 'Tech' ? 95 : 45,
        isFree: isFree,
        suggestedTiers: isFree
          ? [
              {
                id: `tier-free-${Date.now()}`,
                name: 'Free RSVP Pass',
                price: 0,
                description: 'Complimentary standard entry with dynamic QR pass.',
                available: 250,
                perks: ['Standard Entry', 'Digital QR Ticket', 'Venue Access'],
              },
              {
                id: `tier-[#1a1c1d]-${Date.now()}`,
                name: 'VIP Supporter Pass',
                price: 20,
                description: 'Priority fast-track entry plus commemorative digital badge.',
                available: 50,
                perks: ['Fast-track Door Entry', 'Digital Badge', 'Priority Bar Line'],
              },
            ]
          : [
              {
                id: `tier-ga-${Date.now()}`,
                name: 'General Admission',
                price: category === 'Tech' ? 65 : 35,
                description: 'Standard access floor pass with rotating anti-screenshot QR.',
                available: 200,
                perks: ['Main Floor Access', 'Dynamic Pass'],
              },
              {
                id: `tier-vip-${Date.now()}`,
                name: 'VIP Front Row Experience',
                price: category === 'Tech' ? 149 : 95,
                description: 'Elevated seating, express entry, and complimentary welcome drink.',
                available: 40,
                perks: ['Express VIP Entry', 'Elevated Lounge', '2 Free Drinks', 'Free Merch Item'],
              },
            ],
        bannerPrompt: `https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop`,
        suggestedHashtags: [`#${category}Live`, '#SnaptixEvents', '#LiveConcert', '#VIPExperience'],
        targetAudience: `Music lovers, event seekers aged 21-45 looking for immersive weekend nightlife.`,
      };

      return res.json({ success: true, data: fallbackData, provider: 'intelligent_template' });
    } catch (err: any) {
      console.error('Error generating AI event:', err);
      return res.status(500).json({ success: false, error: err.message || 'AI Generation failed' });
    }
  });

  // 2. AI Marketing & Promotion Assistant: Social Post & Broadcast Copy
  app.post('/api/ai/generate-promotion', async (req, res) => {
    try {
      const { eventTitle, eventCategory, tone = 'exciting', channel = 'social' } = req.body || {};
      const apiKey = process.env.GEMINI_API_KEY;

      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        const systemInstruction = `You are a world-class event marketer for Snaptix.
Return ONLY valid JSON with keys:
"caption": string (High converting social caption or email body),
"hashtags": string[],
"subjectLine": string,
"suggestedAngle": string,
"callToAction": string`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Write marketing campaign for event: "${eventTitle || 'Neon Horizons Raves'}". Category: ${eventCategory}. Channel: ${channel}. Tone: ${tone}.`,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
          },
        });

        const text = response.text;
        if (text) {
          const parsed = JSON.parse(text);
          return res.json({ success: true, data: parsed, provider: 'gemini' });
        }
      }

      // Fallback
      const fallbackPromo = {
        caption: `🔥 JUST DROPPED: Tickets for ${eventTitle || 'our next live show'} are officially LIVE on Snaptix! Don't miss out on an extraordinary night of music, energy, and memories. Secure your anti-screenshot digital pass before tiers sell out! 🎟️✨`,
        hashtags: [`#${(eventCategory || 'Live').replace(/\s+/g, '')}`, '#SnaptixPass', '#SellingFast', '#LiveMusic', '#WeekendVibes'],
        subjectLine: `⚡ Flash Alert: ${eventTitle || 'Live Event'} Passes Are Selling Fast!`,
        suggestedAngle: 'Urgency & Scarcity (Tier 1 early bird tickets ending soon)',
        callToAction: 'Claim Your Dynamic Pass Now →',
      };

      return res.json({ success: true, data: fallbackPromo, provider: 'intelligent_template' });
    } catch (err: any) {
      console.error('Error generating promotion:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        // Reuse the Express HTTP server so HMR does not bind a second port (24678)
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
