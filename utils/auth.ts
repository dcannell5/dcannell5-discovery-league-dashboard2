
import type { Player, LeagueConfig } from "../types";

// This is a simple, client-side "security" mechanism for demonstration purposes.
// In a real application, this would be handled by a secure backend server.

export const SUPER_ADMIN_CODE = 'DISCOVERY2025';

// As per the prompt, the league starts on July 1, 2025.
export const LEAGUE_START_DATE = new Date('2025-07-01T00:00:00Z');

/**
 * Generates a daily access code for a specific court referee.
 * @param date The current date.
 * @param courtName The name of the court.
 * @returns A string in the format 'REF-[COURT_ABBR]-YYYYMMDD'.
 */
export function getRefereeCodeForCourt(date: Date, courtName: string): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const courtAbbr = courtName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    return `REF-${courtAbbr}-${year}${month}${day}`;
}

/**
 * Generates a unique login code for a player.
 */
export function getPlayerCode(player: Player): string {
    const namePart = player.name.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '');
    return `PLYR-${player.id}-${namePart}`;
}

/**
 * Generates a unique login code for a player's parent/guardian.
 */
export function getParentCode(player: Player): string {
    const namePart = player.name.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '');
    return `PRNT-${player.id}-${namePart}`;
}


/**
 * Calculates the current active day of the league.
 * It prioritizes the explicitly set schedule, finding the most recent past or current day.
 * If no schedule is set, it falls back to a default progression based on the league type:
 * - 'standard' leagues progress weekly.
 * - 'custom' leagues (e.g., camps) progress daily.
 * @param currentDate The current date.
 * @param leagueConfig The league's configuration object.
 * @returns The current league day number, clamped to the league duration.
 */
export function getActiveDay(currentDate: Date, leagueConfig: LeagueConfig): number {
    const { totalDays, daySchedules, leagueType } = leagueConfig;

    if (daySchedules && Object.keys(daySchedules).length > 0) {
        const today = new Date(currentDate);
        today.setHours(0, 0, 0, 0);

        const pastOrPresentDays = Object.entries(daySchedules)
            .map(([day, dateStr]) => ({ day: parseInt(day), date: new Date(dateStr) }))
            .filter(({ date }) => !isNaN(date.getTime()) && date <= today)
            .sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort descending by date

        if (pastOrPresentDays.length > 0) {
            return pastOrPresentDays[0].day;
        }

        // If all scheduled days are in the future, default to Day 1
        return 1;
    }

    // Fallback for leagues without schedules
    if (currentDate < LEAGUE_START_DATE) {
        return 1;
    }
    const diffTime = Math.abs(currentDate.getTime() - LEAGUE_START_DATE.getTime());
    
    let currentDay;

    if (leagueType === 'standard') {
        // Standard leagues progress weekly by default from the start date.
        const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
        currentDay = diffWeeks + 1;
    } else {
        // Custom leagues (camps) progress daily by default.
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        currentDay = diffDays + 1;
    }
    
    return Math.max(1, Math.min(currentDay, totalDays));
}