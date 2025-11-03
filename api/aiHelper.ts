import { GoogleGenAI, Type } from "@google/genai";
import type { AppData, UserState } from '../types';
import type { VercelRequest, VercelResponse } from '@vercel/node';

if (!process.env.API_KEY) {
    console.error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        response: {
            type: Type.STRING,
            description: "The natural language response to the user's query."
        }
    }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    if (!process.env.API_KEY) {
        return res.status(500).json({ response: 'API key is not configured on the server.' });
    }
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { query, appData, userState } = req.body as { query: string, appData: AppData, userState: UserState };
        
        if (!query || !appData) {
            return res.status(400).json({ error: 'Missing query or appData in request body' });
        }

        const systemInstruction = `You are the "League AI Assistant" for the Canadian Elite Academy's Discovery League.
- Your role is to be a helpful and knowledgeable assistant for players, parents, and administrators.
- Your tone is friendly, positive, and concise.
- You will answer questions based ONLY on the JSON data provided below. Do not invent information.
- If a question cannot be answered from the data, say "I don't have that information in the league data."
- The current user's role is: ${userState.role}. Tailor your response slightly if relevant (e.g., an admin might see more detail than a parent).
- The current date is ${new Date().toDateString()}.
- The entire application's data is provided below in JSON format. Use it as your single source of truth.`;

        const contents = `CONTEXT DATA:\n\`\`\`json\n${JSON.stringify(appData, null, 2)}\n\`\`\`\n\nUSER QUERY: "${query}"`;
  
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.2,
                topP: 0.95,
                responseMimeType: "application/json",
                responseSchema: responseSchema
            }
        });
        
        const jsonText = (response.text ?? '').trim();
        const responseObject = JSON.parse(jsonText);

        res.status(200).json(responseObject);

    } catch (error) {
        console.error("Error in aiHelper serverless function:", error);
        res.status(500).json({ response: 'An error occurred while communicating with the AI. Please try again.' });
    }
}