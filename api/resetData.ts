
import { Redis } from '@upstash/redis';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const APP_DATA_KEY = 'discovery-league-data';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const url = process.env.LEAGUESTORAGE_KV_REST_API_URL || process.env.KV_REST_API_URL;
  const token = process.env.LEAGUESTORAGE_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    const message = "Database connection credentials are not configured on the server.";
    console.error(`CRITICAL: ${message}`);
    return res.status(500).json({ error: message, details: "Missing Vercel KV environment variables. Ensure a KV store is linked to this project in your Vercel dashboard settings." });
  }

  try {
    const redis = new Redis({ url, token });
    
    await redis.del(APP_DATA_KEY);
    res.status(200).json({ success: true, message: 'Data reset successfully.' });
  } catch (error) {
    console.error("Error resetting data in Redis:", error);
    res.status(500).json({ error: 'Failed to reset data' });
  }
}
