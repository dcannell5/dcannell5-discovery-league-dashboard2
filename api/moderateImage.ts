import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { base64Image } = req.body;

        if (!base64Image) {
            return res.status(400).json({ error: 'Missing image data' });
        }

        const prompt = `Review this user-uploaded profile picture for a youth sports league. Is it appropriate? The image must be a headshot or action shot of a person playing a sport. It must NOT contain any of the following: violence, self-harm, hate speech, sexually explicit content, or dangerous content. Respond with only 'SAFE' or 'UNSAFE'.`;

        const imagePart = {
            inlineData: {
                mimeType: 'image/jpeg', // Assuming jpeg, client could specify this in future
                data: base64Image,
            },
        };
        const textPart = { text: prompt };

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, textPart] },
            config: {
                safetySettings: [
                    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                ]
            }
        });
        
        const decision = (response.text ?? '').trim().toUpperCase();
        
        if (decision === 'SAFE' || decision === 'UNSAFE') {
            res.status(200).send(decision);
        } else {
            // If the model gives an unexpected response, default to UNSAFE for security.
            console.warn(`Unexpected moderation decision from Gemini: "${decision}"`);
            res.status(200).send('UNSAFE');
        }

    } catch (error: any) {
        console.error("Error during image moderation:", error);
        // If the API itself blocks the content, it's definitely unsafe.
        if (error.toString().includes('blocked by safety')) {
            return res.status(200).send('UNSAFE');
        }
        res.status(500).send('ERROR');
    }
}