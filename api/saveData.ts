// FIX: Reverted to using the `kv` object from `@vercel/kv` to resolve module export errors.
import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { AppData } from '../types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const appData = req.body as AppData;

    if (!appData || typeof appData !== 'object') {
        return res.status(400).json({ error: 'Invalid appData format: not an object.' });
    }
    
    // Use a transaction to set all keys atomically, which is safer and more efficient.
    // FIX: Use the imported 'multi' function (aliased to createMulti) instead of kv.multi.
    const multi = kv.multi();

    // Iterate over the top-level keys of the AppData object and set each one individually in the KV store.
    // This avoids hitting the single-value size limit of Vercel KV.
    for (const key in appData) {
        if (Object.prototype.hasOwnProperty.call(appData, key)) {
            const typedKey = key as keyof AppData;
            // Ensure we don't try to save undefined values
            if (appData[typedKey] !== undefined) {
                multi.set(typedKey, appData[typedKey]);
            }
        }
    }
    
    await multi.exec();
    
    res.status(200).json({ success: true });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error("Critical Error saving data to KV:", errorMessage);
    res.status(500).json({ error: 'Failed to save data to the database.', details: errorMessage });
  }
}
