

import { Redis } from '@upstash/redis';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { AppData } from '../types';

// Initialize the Redis client using the recommended `fromEnv` method for Vercel KV.
const redis = Redis.fromEnv();

const APP_DATA_KEY = 'discovery-league-data';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const appData = req.body as AppData;

    if (!appData || typeof appData !== 'object') {
        return res.status(400).json({ error: 'Invalid appData format: must be an object.' });
    }
    
    // Save the entire appData object as a single JSON string.
    await redis.set(APP_DATA_KEY, JSON.stringify(appData));
    
    res.status(200).json({ success: true });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error("Critical Error saving data to Redis:", errorMessage);
    res.status(500).json({ error: 'Failed to save data to the database.', details: errorMessage });
  }
}