

import { Redis } from '@upstash/redis';
import { put, head, del } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

type HealthStatus = {
  status: 'OK' | 'ERROR';
  details: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const checkKv = async (): Promise<HealthStatus> => {
    const url = process.env.leaguestorage_KV_REST_API_URL;
    const token = process.env.leaguestorage_KV_REST_API_TOKEN;

    if (!url || !token) {
        const missingVars = [!url && 'leaguestorage_KV_REST_API_URL', !token && 'leaguestorage_KV_REST_API_TOKEN'].filter(Boolean).join(' and ');
        const details = `Missing required environment variable(s): ${missingVars}. This usually happens when the Vercel KV integration is not set up correctly. Ensure a KV store named 'leaguestorage' is linked to this project in your Vercel dashboard. Important: The application specifically requires these prefixed variables. Generic names like 'KV_REST_API_URL' will not work.`;
        console.error("Health Check: Vercel KV configuration error.", details);
        return { status: 'ERROR', details };
    }

    try {
      const redis = new Redis({ url, token });
      const testKey = 'health_check_redis';
      const testValue = `health-check-${Date.now()}`;
      await redis.set(testKey, testValue, { ex: 10 });
      const readValue = await redis.get(testKey);
      if (readValue !== testValue) throw new Error('Read/write validation failed.');
      await redis.del(testKey);
      return { status: 'OK', details: 'Successfully connected and performed read/write test.' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Health Check: Vercel KV connection failed.", errorMessage);
      return { status: 'ERROR', details: `Connection test failed. Details: ${errorMessage}` };
    }
  };

  const checkBlob = async (): Promise<HealthStatus> => {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      const msg = "BLOB_READ_WRITE_TOKEN is not configured on the server.";
      console.error("Health Check:", msg);
      return { status: 'ERROR', details: msg };
    }
    try {
      const testFilename = `health-check/blob_${Date.now()}.txt`;
      const testContent = 'health check';
      
      const { url } = await put(testFilename, testContent, { access: 'public' });
      await head(url); 
      await del(url); 
      
      return { status: 'OK', details: 'Successfully connected and performed upload/delete test.' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Health Check: Vercel Blob connection failed.", errorMessage);
      return { status: 'ERROR', details: errorMessage };
    }
  };

  const checkAi = (): HealthStatus => {
    if (!process.env.API_KEY) {
      const msg = "Gemini API_KEY is not configured on the server.";
      console.error("Health Check:", msg);
      return { status: 'ERROR', details: msg };
    }
    return { status: 'OK', details: 'API key is present in server environment.' };
  };

  const [kvDatabase, blobStorage, aiService] = await Promise.all([
    checkKv(),
    checkBlob(),
    Promise.resolve(checkAi())
  ]);

  res.status(200).json({
    kvDatabase,
    blobStorage,
    aiService,
  });
}