import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { AppData } from '../types';

// The initial data structure acts as a schema and default values.
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
  systemLogs: [],
  activeLeagueId: null,
  upcomingEvent: {
    title: 'Discovery League Summer Camp',
    description: 'Join us for our annual Summer Camp! Sessions are available from July 2nd to July 11th. Focus on skill development, teamwork, and fun in a positive learning environment.',
    buttonText: 'Learn More & Register',
    buttonUrl: 'https://canadianeliteacademy.corsizio.com/',
  },
};

// Define the keys we expect to fetch from KV
const APP_DATA_KEYS: (keyof AppData)[] = Object.keys(initialAppData) as (keyof AppData)[];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch all keys at once
    const values = await kv.mget<Array<AppData[keyof AppData]>>(...APP_DATA_KEYS);
    
    const fetchedData: Partial<AppData> = {};
    let dataExists = false;
    
    APP_DATA_KEYS.forEach((key, index) => {
        if (values[index] !== null) {
            fetchedData[key] = values[index] as any;
            dataExists = true;
        }
    });

    let finalAppData: AppData;

    // This handles migration from the old single-key format.
    if (!dataExists) {
        const oldData: AppData | null = await kv.get('discoveryLeagueData');
        if (oldData) {
            console.log("Migrating data from old single-key format.");
            finalAppData = { ...initialAppData, ...oldData };
            // Save data in the new format
             const multi = kv.multi();
             for (const key of APP_DATA_KEYS) {
                 if (finalAppData[key] !== undefined) {
                    multi.set(key, finalAppData[key]);
                 }
             }
             await multi.exec();
             // Optionally, delete the old key after successful migration
             await kv.del('discoveryLeagueData');
             console.log("Migration complete.");
        } else {
            console.log('No data found for any key in KV, initializing.');
            finalAppData = initialAppData;
            // Initialize the database with the split-key structure
            const multiInit = kv.multi();
            for (const key of APP_DATA_KEYS) {
                multiInit.set(key, initialAppData[key]);
            }
            await multiInit.exec();
            console.log('Successfully initialized KV with initial data in split-key format.');
        }
    } else {
      // Merge fetched data with defaults to ensure all keys are present
      finalAppData = { ...initialAppData, ...fetchedData };
    }
    
    res.status(200).json(finalAppData);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error("CRITICAL: Error fetching data from KV. The database might be misconfigured.", error);
    res.status(500).json({ error: 'Failed to connect to the database.', details: errorMessage });
  }
}
