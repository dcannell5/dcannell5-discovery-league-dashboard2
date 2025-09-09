import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { AppData } from '../types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const appData = req.body as AppData;

    if (!appData || !appData.leagues) {
        return res.status(400).json({ error: 'Invalid appData format received.' });
    }
    
    // Log the size of the data to monitor for potential limits
    const dataSize = JSON.stringify(appData).length;
    console.log(`Received data payload of size: ${Math.round(dataSize / 1024)} KB`);

    await kv.set('discoveryLeagueData', appData);
    
    res.status(200).json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error("Critical Error saving data to KV:", errorMessage);
    res.status(500).json({ error: 'Failed to save data to the database.', details: errorMessage });
  }
}
