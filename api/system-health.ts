import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let dbStatus: 'OK' | 'ERROR' = 'OK';
  let aiStatus: 'OK' | 'ERROR' = 'OK';

  // Check 1: Vercel KV Database Connection (Read/Write Test)
  try {
    // Perform a robust check by writing a value and reading it back.
    const testKey = 'health_check';
    const testValue = `health-check-${Date.now()}`;
    
    await kv.set(testKey, testValue, { ex: 10 }); // Set with 10-second expiry
    const readValue = await kv.get(testKey);

    if (readValue !== testValue) {
      throw new Error('Read/write validation failed. Value read back did not match value written.');
    }
    await kv.del(testKey); // Clean up the test key
  } catch (error) {
    console.error("Health Check: Vercel KV connection failed.", error);
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