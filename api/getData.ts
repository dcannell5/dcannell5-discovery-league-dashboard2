
import { createClient } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { AppData } from '../types';
import { initialAppData } from '../data/initialData';

// Initialize the KV client with specific environment variables
const kv = createClient({
  url: process.env.leaguestorage_KV_REST_API_URL!,
  token: process.env.leaguestorage_KV_REST_API_TOKEN!,
});

// Define the keys we expect to fetch from KV based on the initial data structure.
const APP_DATA_KEYS: (keyof AppData)[] = Object.keys(initialAppData) as (keyof AppData)[];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch all keys at once for efficiency.
    const values = await kv.mget<Array<AppData[keyof AppData]>>(...APP_DATA_KEYS);
    
    // Check if at least one key returned a non-null value, indicating data exists.
    const dataExists = values.some(v => v !== null);

    if (dataExists) {
      // If data exists, construct the AppData object from the fetched values.
      const fetchedData: Partial<AppData> = {};
      APP_DATA_KEYS.forEach((key, index) => {
        if (values[index] !== null) {
            fetchedData[key] = values[index] as any;
        }
      });

      // Merge fetched data with defaults to ensure the data structure is always complete.
      const finalAppData: AppData = { ...initialAppData, ...fetchedData };
      return res.status(200).json(finalAppData);

    } else {
      // If no data exists, this is a first-time run. Initialize the database.
      console.log('No data found in KV, initializing.');
      const multiInit = kv.multi();
      for (const key of APP_DATA_KEYS) {
        multiInit.set(key, initialAppData[key]);
      }
      await multiInit.exec();
      console.log('Successfully initialized KV with initial data.');
      
      // Return the initial data structure.
      return res.status(200).json(initialAppData);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error("CRITICAL: Error fetching data from KV. The database might be misconfigured.", error);
    res.status(500).json({ error: 'Failed to connect to the database.', details: errorMessage });
  }
}
