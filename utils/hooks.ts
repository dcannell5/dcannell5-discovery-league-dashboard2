import { useMemo } from 'react';
import type { LeagueConfig, AllDailyResults, AllDailyMatchups, AllDailyAttendance, PlayerWithStats } from '../types';
import { initializePlayerStats, processDayResults } from './statsLogic';
import { sortPlayersWithTieBreaking } from './rankingLogic';

/**
 * A custom hook to calculate player statistics for a league up to a specific day.
 * It handles standard and seeded leagues, processes game results, and returns sorted player stats.
 * @param leagueConfig The configuration for the current league.
 * @param gameResults All game results for all leagues.
 * @param allMatchups All matchups for all leagues.
 * @param allAttendance All attendance data for all leagues.
 * @param upToDay The day number to calculate stats up to (inclusive).
 * @returns An object containing `sortedPlayers` (an array of PlayerWithStats sorted by rank)
 *          and `playerStatsById` (a record of PlayerWithStats keyed by player ID).
 */
export const useLeagueStats = (
  leagueConfig: LeagueConfig,
  gameResults: AllDailyResults,
  allMatchups: AllDailyMatchups,
  allAttendance: AllDailyAttendance,
  upToDay: number
): { sortedPlayers: PlayerWithStats[]; playerStatsById: Record<number, PlayerWithStats> } => {
  return useMemo(() => {
    const stats = initializePlayerStats(leagueConfig.players);

    // Handle seeded stats for Day 3 and beyond
    if (leagueConfig.seededStats && upToDay >= 3) {
      Object.entries(leagueConfig.seededStats).forEach(([playerIdStr, seeded]) => {
          const playerId = parseInt(playerIdStr);
          if (stats[playerId] && seeded) {
              Object.assign(stats[playerId], seeded);
              stats[playerId].dailyPoints = {}; // Reset daily points from seed as they are baked in
          }
      });
      
      const startDay = 4; // Start processing new results from Day 4 onwards
      for (let day = startDay; day <= upToDay; day++) {
          processDayResults(stats, day, gameResults[day], allMatchups[day], allAttendance[day]);
      }

      // Sum up points from days *after* the seed.
      Object.values(stats).forEach(p => {
          const newDailyTotal = Object.values(p.dailyPoints).reduce((sum, points) => sum + points, 0);
          p.leaguePoints = (p.leaguePoints || 0) + newDailyTotal;
          p.pointDifferential = (p.pointsFor || 0) - (p.pointsAgainst || 0);
      });

    } else {
      // For Day 1, Day 2, or any un-seeded league, calculate from scratch.
      for (let day = 1; day <= upToDay; day++) {
        processDayResults(stats, day, gameResults[day], allMatchups[day], allAttendance[day]);
      }
      
      // Sum up all calculated daily points.
      Object.values(stats).forEach(p => {
        p.leaguePoints = Object.values(p.dailyPoints).reduce((sum, points) => sum + points, 0);
        p.pointDifferential = p.pointsFor - p.pointsAgainst;
      });
    }
    
    const sortedPlayers = sortPlayersWithTieBreaking(Object.values(stats));

    return { sortedPlayers, playerStatsById: stats };

  }, [leagueConfig, gameResults, allMatchups, allAttendance, upToDay]);
};
