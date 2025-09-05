

import type { CoachingTip } from "../types";

export const generateCoachingTip = async (): Promise<CoachingTip | null> => {
  try {
    const response = await fetch('/api/generateCoachingTip', { method: 'POST' });
    
    if (!response.ok) {
        console.error("Failed to fetch coaching tip:", response.statusText);
        return null;
    }
    
    const tip: CoachingTip = await response.json();
    return tip;

  } catch (error) {
    console.error("Error calling backend for coaching tip:", error);
    return null;
  }
};
