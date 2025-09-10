// FIX: Reverted to using the `kv` object from `@vercel/kv` to resolve module export errors.
import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Define the complete list of keys to be deleted, ensuring a full reset.
const APP_DATA_KEYS_TO_DELETE = [
  'leagues', 'dailyResults', 'allDailyMatchups', 'allDailyAttendance', 
  'allPlayerProfiles', 'allRefereeNotes', 'allAdminFeedback', 'allPlayerFeedback', 
  'allPlayerPINs', 'loginCounters', 'projectLogs', 'systemLogs', 
  'activeLeagueId', 'upcomingEvent'
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // This is a destructive operation.
    
    // Clean up the old single key format, in case it still exists from a previous version.
    // FIX: Use the imported 'del' function instead of kv.del.
    await kv.del('discoveryLeagueData');

    // Delete all the new individual keys to completely reset the application state.
    if (APP_DATA_KEYS_TO_DELETE.length > 0) {
        // FIX: Use the imported 'del' function instead of kv.del.
        await kv.del(...APP_DATA_KEYS_TO_DELETE);
    }

    res.status(200).json({ success: true, message: 'Data reset successfully.' });
  } catch (error) {
    console.error("Error resetting data in KV:", error);
    res.status(500).json({ error: 'Failed to reset data' });
  }
}
