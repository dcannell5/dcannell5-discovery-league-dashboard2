import { Redis } from '@upstash/redis';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const redis = Redis.fromEnv();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // This is a destructive operation. In a real app, this would be heavily protected by auth checks.
    await redis.del('discoveryLeagueData');
    res.status(200).json({ success: true, message: 'Data reset successfully.' });
  } catch (error) {
    console.error("Error resetting data in Redis:", error);
    res.status(500).json({ error: 'Failed to reset data' });
  }
}