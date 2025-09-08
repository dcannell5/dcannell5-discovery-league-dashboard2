
import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { AppData } from '../types';
import { initialAppData } from '../data/initialData.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let appData: AppData | null = await (kv as any).get('discoveryLeagueData');

    // If no data exists in the database (e.g., first-time run),
    // initialize it with a clean, empty state.
    if (!appData) {
      console.log('No data found in Vercel KV, attempting to initialize.');
      appData = initialAppData;
      try {
        await (kv as any).set('discoveryLeagueData', appData);
        console.log('Successfully initialized Vercel KV with initial data.');
      } catch (initError) {
        console.error("CRITICAL: Failed to initialize Vercel KV. Serving initial data without persistence.", initError);
        // If setting also fails, we still serve the initial data so the app can load.
        // It will be a non-persistent session.
      }
    }
    
    res.status(200).json(appData);
  } catch (error) {
    console.error("CRITICAL: Error fetching data from Vercel KV. The database might be misconfigured. Serving initial data as a fallback.", error);
    // On any error fetching from KV, we fall back to the initial app data.
    // This allows the app to load, although it will be in a non-persistent state
    // until the database issue is resolved.
    res.status(200).json(initialAppData);
  }
}