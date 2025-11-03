import { GoogleGenAI, Type } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

// This serverless function will be hosted by platforms like Vercel.
// It securely handles the API key, which is stored as an environment variable on the server.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const coachingTipSchema = {
    type: Type.OBJECT,
    properties: {
        skillTip: {
            type: Type.OBJECT,
            description: "A simple, practical volleyball skill tip (2-3 sentences) suitable for beginners. Focus on fundamentals like passing, setting, or serving posture.",
            properties: {
                title: { type: Type.STRING, description: "A catchy title for the skill tip." },
                content: { type: Type.STRING, description: "The main content of the skill tip." }
            }
        },
        quote: {
            type: Type.OBJECT,
            description: "An inspiring quote for young athletes.",
            properties: {
                text: { type: Type.STRING, description: "The text of the inspiring quote." },
                author: { type: Type.STRING, description: "The author of the quote. Use 'Anonymous' if unknown." }
            }
        },
        communicationTip: {
            type: Type.STRING,
            description: "A friendly tip (2-3 sentences) encouraging players to communicate, introduce themselves to new teammates, and embrace the discovery learning aspect of the league."
        }
    }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const systemInstruction = `You are Discovery Coach, a motivational youth volleyball coach for the Canadian Volleyball Elite Academy. Your tone is positive, supportive, and focuses on development, teamwork, and fun. Generate unique and fresh coaching insights for beginner players.`;
        const userPrompt = `Generate a new playbook tip with a skill tip, a communication tip, and an inspiring quote.`;
  
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.9,
                topP: 0.95,
                responseMimeType: "application/json",
                responseSchema: coachingTipSchema
            }
        });
        
        const jsonText = (response.text ?? '').trim();
        const tipObject = JSON.parse(jsonText);

        res.status(200).json(tipObject);

    } catch (error) {
        console.error("Error in generateCoachingTip serverless function:", error);
        res.status(500).json({ error: 'Failed to generate coaching tip' });
    }
}