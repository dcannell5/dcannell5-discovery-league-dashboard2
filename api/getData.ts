

import { Redis } from '@upstash/redis';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initialAppData } from '../data/initialData';

// Initialize the Redis client using the recommended `fromEnv` method for Vercel KV.
// This automatically picks up the correct environment variables.
const redis = Redis.fromEnv();

const APP_DATA_KEY = 'discovery-league-data';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = await redis.get<string>(APP_DATA_KEY);

    if (data) {
      // Data exists, parse and return it.
      return res.status(200).json(JSON.parse(data));
    } else {
      // No data found, initialize it with default data.
      console.log('No data found in Redis, initializing with default structure.');
      await redis.set(APP_DATA_KEY, JSON.stringify(initialAppData));
      console.log('Successfully initialized Redis with initial data.');
      return res.status(200).json(initialAppData);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error("CRITICAL: Error fetching data from Redis.", error);
    res.status(500).json({ error: 'Failed to connect to the database.', details: errorMessage });
  }
}