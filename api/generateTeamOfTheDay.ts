import { GoogleGenAI, Type } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { LeagueConfig, AllDailyResults, AllDailyMatchups, PlayerWithStats } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        teamPlayerIds: {
            type: Type.ARRAY,
            description: "An array of the numeric player IDs for the members of the chosen 'Team of the Day'.",
            items: { type: Type.INTEGER }
        },
        summary: {
            type: Type.STRING,
            description: "A short, exciting summary (2-4 sentences) explaining why this team was chosen. Highlight their performance, like win streaks, point differentials, or clutch plays."
        }
    },
    required: ["teamPlayerIds", "summary"]
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { day, leagueConfig, dailyResults, dailyMatchups, playerStats } = req.body as {
            day: number;
            leagueConfig: LeagueConfig;
            dailyResults: AllDailyResults;
            dailyMatchups: AllDailyMatchups;
            playerStats: PlayerWithStats[];
        };

        const systemInstruction = `You are "Stat-Bot 9000", an expert sports analyst for a youth volleyball league. Your tone is energetic and positive. Your task is to analyze the provided game data for a specific day and select a "Team of the Day". This isn't a predefined team, but rather a group of players who played together in at least one game and demonstrated exceptional performance as a unit.`;

        const userPrompt = `
        Analyze the data for Day ${day} of the "${leagueConfig.title}" league and pick one "Team of the Day".

        Your criteria for selection should be:
        1.  **Winning Record:** Prioritize teams that won most or all of their games together.
        2.  **Dominance:** Look for large point differentials in their wins.
        3.  **Teamwork:** The chosen players must have played on the same team (e.g., Team A or Team B) in at least one game during the day.
        4.  **Narrative:** Is there a story? An underdog victory? Consistent high-level play?

        Based on your analysis, provide the player IDs of the team and a summary of why they were chosen.

        **Here is the data for Day ${day}:**
        - League Configuration: ${JSON.stringify(leagueConfig, null, 2)}
        - Game Matchups: ${JSON.stringify(dailyMatchups[day], null, 2)}
        - Game Results: ${JSON.stringify(dailyResults[day], null, 2)}
        - Overall Player Stats for the Day: ${JSON.stringify(playerStats, null, 2)}
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
                systemInstruction,
                temperature: 0.5,
                responseMimeType: "application/json",
                responseSchema
            }
        });

        const jsonText = (response.text ?? '').trim();
        const responseObject = JSON.parse(jsonText);

        res.status(200).json(responseObject);

    } catch (error) {
        console.error("Error in generateTeamOfTheDay function:", error);
        res.status(500).json({ error: 'Failed to generate Team of the Day' });
    }
}
