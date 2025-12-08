
import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Storage } from '@google-cloud/storage';
import { GoogleGenAI, Type } from "@google/genai";

// --- Type Imports ---
import type { AppData, UserState, LeagueConfig, AllDailyResults, AllDailyMatchups, PlayerWithStats } from '../types.js';
import { initialAppData } from '../data/initialData.js';

// --- Express App Setup ---
const app = express();
app.use(express.json({ limit: '10mb' }));

// --- Configuration ---
const BUCKET_NAME = process.env.GCS_BUCKET_NAME;
const DATA_FILE_NAME = 'league_data.json';

// Initialize Storage (Auto-authenticates on Cloud Run)
const storage = new Storage();

// --- Helper Functions ---
const getBucket = () => {
    if (!BUCKET_NAME) {
        console.error("CRITICAL: GCS_BUCKET_NAME environment variable is not set.");
        throw new Error("Server configuration error: GCS_BUCKET_NAME is missing.");
    }
    return storage.bucket(BUCKET_NAME);
};

const getAiClient = () => {
    if (!process.env.API_KEY) {
        console.error("CRITICAL: API_KEY environment variable is not set for AI service.");
        throw new Error("AI Service API key is not configured on the server.");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
}

// --- API Routes ---

// GET /api/getData
app.get('/api/getData', async (req: Request, res: Response) => {
    try {
        const bucket = getBucket();
        const file = bucket.file(DATA_FILE_NAME);
        const [exists] = await file.exists();

        if (exists) {
            const [content] = await file.download();
            const jsonString = content.toString();
            // Basic validation to ensure it's valid JSON
            try {
                const data = JSON.parse(jsonString);
                return res.status(200).json(data);
            } catch (parseError) {
                console.error("Corrupt JSON in storage, returning initial data.");
                return res.status(200).json(initialAppData);
            }
        } else {
            // Initialize file if it doesn't exist
            await file.save(JSON.stringify(initialAppData), {
                contentType: 'application/json',
                resumable: false
            });
            return res.status(200).json(initialAppData);
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error("Error in /api/getData:", errorMessage);
        res.status(500).json({ error: 'Failed to retrieve data from Cloud Storage.', details: errorMessage });
    }
});

// POST /api/saveData
app.post('/api/saveData', async (req: Request, res: Response) => {
    try {
        const bucket = getBucket();
        const file = bucket.file(DATA_FILE_NAME);
        const appData = req.body as AppData;

        if (!appData || typeof appData !== 'object') {
            return res.status(400).json({ error: 'Invalid appData format.' });
        }

        await file.save(JSON.stringify(appData), {
            contentType: 'application/json',
            resumable: false
        });
        
        res.status(200).json({ success: true });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error("Error in /api/saveData:", errorMessage);
        res.status(500).json({ error: 'Failed to save data to Cloud Storage.', details: errorMessage });
    }
});

// POST /api/resetData
app.post('/api/resetData', async (req: Request, res: Response) => {
    try {
        const bucket = getBucket();
        const file = bucket.file(DATA_FILE_NAME);
        
        // Overwrite with initial data instead of deleting, to preserve permissions/existence
        await file.save(JSON.stringify(initialAppData), {
            contentType: 'application/json',
            resumable: false
        });
        
        res.status(200).json({ success: true, message: 'Data reset successfully.' });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ error: 'Failed to reset data.', details: errorMessage });
    }
});

// POST /api/aiHelper
app.post('/api/aiHelper', async (req: Request, res: Response) => {
    try {
        const ai = getAiClient();
        const { query, appData, userState } = req.body as { query: string, appData: AppData, userState: UserState };
        
        if (!query || !appData) {
            return res.status(400).json({ error: 'Missing query or appData.' });
        }
        
        const systemInstruction = `You are the "League AI Assistant" for the Discovery League Dashboard. Your goal is to provide helpful, concise, and accurate answers based on the JSON data provided.
- Analyze the provided 'appData' JSON to answer questions about league structure, players, scores, standings, and schedules.
- The 'activeLeagueId' points to the currently viewed league. Use data within that league's slices (e.g., appData.leagues[activeLeagueId], appData.dailyResults[activeLeagueId]).
- When asked about standings, explain that they are based on points (3 for a win, 1 for a tie).
- Be friendly and conversational.
- Keep your answers brief and to the point.
- Do not invent data. If the answer isn't in the provided JSON, state that you don't have that information.
- The current user's role is '${userState.role}'. You can tailor your response if they are an admin.`;
        const contents = `CONTEXT DATA:\n\`\`\`json\n${JSON.stringify(appData, null, 2)}\n\`\`\`\n\nUSER QUERY: "${query}"`;
        
        const responseSchema = { type: Type.OBJECT, properties: { response: { type: Type.STRING, description: "Your response to the user's query." } } };
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: { systemInstruction, responseMimeType: "application/json", responseSchema }
        });
        
        res.status(200).json(JSON.parse(response.text ?? '{}'));
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ response: 'AI helper failed.', details: errorMessage });
    }
});

// POST /api/generateCoachingTip
app.post('/api/generateCoachingTip', async (req: Request, res: Response) => {
    try {
        const ai = getAiClient();
        const coachingTipSchema = {
            type: Type.OBJECT,
            properties: {
                skillTip: {
                    type: Type.OBJECT,
                    description: 'A specific, actionable volleyball skill tip.',
                    properties: {
                        title: { type: Type.STRING, description: 'A catchy title for the skill tip, e.g., "The Floater Serve".' },
                        content: { type: Type.STRING, description: 'A 2-3 sentence explanation of the skill or drill.' },
                    },
                },
                quote: {
                    type: Type.OBJECT,
                    description: 'An inspirational quote related to sports, teamwork, or perseverance.',
                    properties: {
                        text: { type: Type.STRING, description: 'The text of the quote.' },
                        author: { type: Type.STRING, description: 'The person who said the quote.' },
                    },
                },
                communicationTip: { type: Type.STRING, description: 'A short, practical tip for on-court communication.' },
            },
        };

        const systemInstruction = `You are Discovery Coach, an AI assistant for a youth volleyball league called the "Discovery League". Your purpose is to provide short, insightful, and inspiring coaching content for the app's "Coach's Playbook" section. The content should be appropriate for young athletes (ages 12-16).`;
        const userPrompt = `Generate a new playbook tip. Ensure it includes a skill tip, a communication tip, and a quote. The content should be fresh and different from previous tips.`;
  
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: { systemInstruction, responseMimeType: "application/json", responseSchema: coachingTipSchema }
        });
        
        res.status(200).json(JSON.parse(response.text ?? '{}'));
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ error: 'Failed to generate tip.', details: errorMessage });
    }
});

// POST /api/generateTeamOfTheDay
app.post('/api/generateTeamOfTheDay', async (req: Request, res: Response) => {
     try {
        const ai = getAiClient();
        const { day, leagueConfig, dailyResults, dailyMatchups, playerStats } = req.body as { day: number, leagueConfig: LeagueConfig, dailyResults: AllDailyResults, dailyMatchups: AllDailyMatchups, playerStats: Partial<PlayerWithStats>[] };
        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                teamPlayerIds: {
                    type: Type.ARRAY,
                    description: "An array of the numeric IDs of the players on the winning team.",
                    items: { type: Type.INTEGER },
                },
                summary: {
                    type: Type.STRING,
                    description: "A short, exciting, 1-2 sentence summary explaining why this team was chosen as the 'Team of the Day', highlighting their performance, teamwork, or a key moment."
                }
            }
        };
        const systemInstruction = `You are "Stat-Bot 9000", an AI sports analyst for the Discovery League. Your task is to analyze game data for a specific day and select a single "Team of the Day". This is not just about the team with the most wins. Consider factors like:
- **Clutch Performance:** Did a team win a very close, high-stakes game?
- **Team Chemistry:** Did a specific combination of players on a team seem to play exceptionally well together?
- **Dominance:** Did one team consistently outperform others with high point differentials?
- **Upset Victory:** Did a lower-ranked team defeat a higher-ranked one?

You must select ONE team from ONE of the games played. Your response must be in the specified JSON format.`;
        const userPrompt = `Analyze the data for Day ${day} of the "${leagueConfig.title}" league.
The league has ${leagueConfig.players.length} players.
Today's game matchups, results, and player point totals are provided below.

Based on this data, select one team from one game to be the "Team of the Day". Return their player IDs and a short summary explaining your choice.

DATA:
\`\`\`json
{
  "matchups": ${JSON.stringify(dailyMatchups, null, 2)},
  "results": ${JSON.stringify(dailyResults, null, 2)},
  "playerStatsForDay": ${JSON.stringify(playerStats, null, 2)}
}
\`\`\`
`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: { systemInstruction, responseMimeType: "application/json", responseSchema }
        });
        
        res.status(200).json(JSON.parse(response.text ?? '{}'));
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ error: 'Failed to generate Team of the Day.', details: errorMessage });
    }
});

// GET /api/system-health
app.get('/api/system-health', async (req: Request, res: Response) => {
    const checkGcs = async () => {
        try {
            const bucket = getBucket(); // Throws if bucket name is missing
            const [exists] = await bucket.exists();
            if (!exists) {
                return { status: 'ERROR', details: `Bucket '${BUCKET_NAME}' does not exist.` };
            }
            // Optional: Check if we can write/read a test file if strictly necessary, 
            // but checking bucket existence + simple metadata is usually enough to verify credentials.
            return { status: 'OK', details: `Connected to bucket '${BUCKET_NAME}'.` };
        } catch (error) {
            return { status: 'ERROR', details: (error as Error).message };
        }
    };
    const checkAi = () => {
        try {
            getAiClient(); // Throws if API key is missing
            return { status: 'OK', details: 'API key is present.' };
        } catch(error) {
            return { status: 'ERROR', details: (error as Error).message };
        }
    };
    res.status(200).json({
        storage: await checkGcs(),
        aiService: checkAi(),
    });
});

// --- Static File Serving ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildPath = path.join(__dirname, '../../dist');
app.use(express.static(buildPath));

app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
});

// --- Server Start ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Serving static files from ${buildPath}`);
});
