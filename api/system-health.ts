import { kv } from '@vercel/kv';
import { put, head, del } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const checkKv = async (): Promise<'OK' | 'ERROR'> => {
    try {
      const testKey = 'health_check_kv';
      const testValue = `health-check-${Date.now()}`;
      await kv.set(testKey, testValue, { ex: 10 });
      const readValue = await kv.get(testKey);
      if (readValue !== testValue) throw new Error('KV read/write validation failed.');
      await kv.del(testKey);
      return 'OK';
    } catch (error) {
      console.error("Health Check: Vercel KV connection failed.", error);
      return 'ERROR';
    }
  };

  const checkBlob = async (): Promise<'OK' | 'ERROR'> => {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        console.error("Health Check: BLOB_READ_WRITE_TOKEN is not configured.");
        return 'ERROR';
    }
    try {
      const testFilename = `health-check/blob_${Date.now()}.txt`;
      const testContent = 'health check';
      
      const { url } = await put(testFilename, testContent, { access: 'public' });
      await head(url); // Check if it exists
      await del(url); // Clean up
      
      return 'OK';
    } catch (error) {
      console.error("Health Check: Vercel Blob connection failed.", error);
      return 'ERROR';
    }
  };

  const checkAi = (): 'OK' | 'ERROR' => {
    if (!process.env.API_KEY) {
      console.error("Health Check: Gemini API_KEY is not configured.");
      return 'ERROR';
    }
    return 'OK';
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