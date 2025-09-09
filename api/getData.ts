import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { AppData } from '../types';

// A minimal, empty structure to initialize the database on first load.
// This prevents overwriting user data with a hardcoded state.
const initialAppData: AppData = {
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
  projectLogs: [],
  activeLeagueId: null,
  upcomingEvent: {
    title: 'Discovery League Summer Camp',
    description: 'Join us for our annual Summer Camp! Sessions are available from July 2nd to July 11th. Focus on skill development, teamwork, and fun in a positive learning environment.',
    buttonText: 'Learn More & Register',
    buttonUrl: 'https://canadianeliteacademy.corsizio.com/',
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let appData: AppData | null = await kv.get('discoveryLeagueData');

    // If no data exists in the database (e.g., first-time run),
    // initialize it with a clean, empty state.
    if (!appData) {
      console.log('No data found in KV, attempting to initialize.');
      appData = initialAppData;
      try {
        await kv.set('discoveryLeagueData', appData);
        console.log('Successfully initialized KV with initial data.');
      } catch (initError) {
        console.error("CRITICAL: Failed to initialize KV. Serving initial data without persistence.", initError);
        // If setting also fails, we still serve the initial data so the app can load.
        // It will be a non-persistent session.
      }
    } else {
      // Data exists, so we ensure it's complete by merging it with the initial data structure.
      // This acts as a simple, forward-compatible migration for any new top-level keys added to the app.
      appData = { ...initialAppData, ...appData };
    }
    
    res.status(200).json(appData);
  } catch (error) {
    console.error("CRITICAL: Error fetching data from KV. The database might be misconfigured. Serving initial data as a fallback.", error);
    // On any error fetching from Redis, we fall back to the initial app data.
    // This allows the app to load, although it will be in a non-persistent state
    // until the database issue is resolved.
    res.status(200).json(initialAppData);
  }
}
