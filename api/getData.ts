
import { Redis } from '@upstash/redis';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { AppData } from '../types';
import { initialAppData } from '../data/initialData';

const redis = new Redis({
  url: process.env.leaguestorage_KV_REST_API_URL!,
  token: process.env.leaguestorage_KV_REST_API_TOKEN!,
});

const APP_DATA_KEYS: (keyof AppData)[] = Object.keys(initialAppData) as (keyof AppData)[];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const values = await redis.mget<string[]>(...APP_DATA_KEYS);
    
    const dataExists = values.some(v => v !== null);

    if (dataExists) {
      const fetchedData: Partial<AppData> = {};
      APP_DATA_KEYS.forEach((key, index) => {
        const value = values[index];
        if (value !== null) {
          try {
            fetchedData[key] = JSON.parse(value);
          } catch (e) {
            console.warn(`Could not parse JSON for key "${key}", using raw value.`);
            fetchedData[key] = value as any;
          }
        }
      });

      const finalAppData: AppData = { ...initialAppData, ...fetchedData };
      return res.status(200).json(finalAppData);

    } else {
      console.log('No data found in Redis, initializing.');
      const multiInit = redis.pipeline();
      for (const key of APP_DATA_KEYS) {
        multiInit.set(key, JSON.stringify(initialAppData[key]));
      }
      await multiInit.exec();
      console.log('Successfully initialized Redis with initial data.');
      
      return res.status(200).json(initialAppData);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error("CRITICAL: Error fetching data from Redis. The database might be misconfigured.", error);
    res.status(500).json({ error: 'Failed to connect to the database.', details: errorMessage });
  }
}