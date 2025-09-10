
import { Redis } from '@upstash/redis';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const redis = new Redis({
  url: process.env.leaguestorage_KV_REST_API_URL!,
  token: process.env.leaguestorage_KV_REST_API_TOKEN!,
});

const APP_DATA_KEYS_TO_DELETE = [
  'leagues', 'dailyResults', 'allDailyMatchups', 'allDailyAttendance', 
  'allPlayerProfiles', 'allRefereeNotes', 'allAdminFeedback', 'allPlayerFeedback', 
  'allPlayerPINs', 'loginCounters', 'projectLogs', 'systemLogs', 'teamOfTheDay',
  'activeLeagueId', 'upcomingEvent'
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (APP_DATA_KEYS_TO_DELETE.length > 0) {
        await redis.del(...APP_DATA_KEYS_TO_DELETE);
    }

    res.status(200).json({ success: true, message: 'Data reset successfully.' });
  } catch (error) {
    console.error("Error resetting data in Redis:", error);
    res.status(500).json({ error: 'Failed to reset data' });
  }
}