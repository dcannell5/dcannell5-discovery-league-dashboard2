
import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { AppData } from '../types';
import { initialAppData } from '../data/initialData';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let appData: AppData | null = await (kv as any).get('discoveryLeagueData');

    // If no data exists in the database (e.g., first-time run),
    // initialize it with a clean, empty state.
    if (!appData) {
      console.log('No data found in Vercel KV, initializing with empty data structure.');
      appData = initialAppData;
      await (kv as any).set('discoveryLeagueData', appData);
    }
    
    res.status(200).json(appData);
  } catch (error) {
    console.error("Error fetching data from Vercel KV:", error);
    // On error, return an empty but valid structure to prevent frontend crash
    const minimalData: AppData = {
        leagues: {}, 
        dailyResults: {}, 
        allDailyMatchups: {}, 
        allDailyAttendance: {}, 
        allPlayerProfiles: {}, 
        allRefereeNotes: {}, 
        allAdminFeedback: {},
        allPlayerFeedback: {},
        allPlayerPINs: {},
        loginCounters: {},
        activeLeagueId: null,
        upcomingEvent: {
          title: 'Error Loading Data',
          description: 'Could not connect to the database. Please try again later.',
          buttonText: '',
          buttonUrl: '#',
        }
    };
    res.status(500).json(minimalData);
  }
}