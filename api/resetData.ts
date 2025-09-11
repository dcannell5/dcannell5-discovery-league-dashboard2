

import { Redis } from '@upstash/redis';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const APP_DATA_KEY = 'discovery-league-data';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vercel KV is configured with a specific store name, "leaguestorage",
    // creating prefixed environment variables.
    const redis = new Redis({
      url: process.env.leaguestorage_KV_REST_API_URL!,
      token: process.env.leaguestorage_KV_REST_API_TOKEN!,
    });
    
    await redis.del(APP_DATA_KEY);
    res.status(200).json({ success: true, message: 'Data reset successfully.' });
  } catch (error) {
    console.error("Error resetting data in Redis:", error);
    res.status(500).json({ error: 'Failed to reset data' });
  }
}