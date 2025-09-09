import { Redis } from '@upstash/redis';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let dbStatus: 'OK' | 'ERROR' = 'OK';
  let aiStatus: 'OK' | 'ERROR' = 'OK';

  // Check 1: Redis Database Connection
  try {
    // Perform a quick, non-destructive operation to test the connection.
    await redis.get('health_check');
  } catch (error) {
    console.error("Health Check: Redis connection failed.", error);
    dbStatus = 'ERROR';
  }

  // Check 2: AI Service Configuration
  // We check if the environment variable is present on the server.
  // This is a proxy for "is the service configured?". It avoids making a costly API call.
  if (!process.env.API_KEY) {
    console.error("Health Check: Gemini API_KEY is not configured on the server.");
    aiStatus = 'ERROR';
  }

  res.status(200).json({
    database: dbStatus,
    aiService: aiStatus,
  });
}