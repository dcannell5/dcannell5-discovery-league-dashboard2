

import { Redis } from '@upstash/redis';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize the Redis client using the recommended `fromEnv` method for Vercel KV.
const redis = Redis.fromEnv();

const APP_DATA_KEY = 'discovery-league-data';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await redis.del(APP_DATA_KEY);
    res.status(200).json({ success: true, message: 'Data reset successfully.' });
  } catch (error) {
    console.error("Error resetting data in Redis:", error);
    res.status(500).json({ error: 'Failed to reset data' });
  }
}