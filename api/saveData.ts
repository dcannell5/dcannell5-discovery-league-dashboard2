
import { Redis } from '@upstash/redis';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { AppData } from '../types';

const redis = new Redis({
  url: process.env.leaguestorage_KV_REST_API_URL!,
  token: process.env.leaguestorage_KV_REST_API_TOKEN!,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const appData = req.body as AppData;

    if (!appData || typeof appData !== 'object') {
        return res.status(400).json({ error: 'Invalid appData format: not an object.' });
    }
    
    const pipeline = redis.pipeline();

    for (const key in appData) {
        if (Object.prototype.hasOwnProperty.call(appData, key)) {
            const typedKey = key as keyof AppData;
            if (appData[typedKey] !== undefined) {
                // Upstash Redis SDK expects values to be strings, so we must stringify objects/arrays.
                pipeline.set(typedKey, JSON.stringify(appData[typedKey]));
            }
        }
    }
    
    await pipeline.exec();
    
    res.status(200).json({ success: true });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error("Critical Error saving data to Redis:", errorMessage);
    res.status(500).json({ error: 'Failed to save data to the database.', details: errorMessage });
  }
}