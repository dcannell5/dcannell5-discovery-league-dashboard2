import type {
  Player,
  PlayerWithStats,
  DailyResults,
  DailyCourtMatchups,
  DailyAttendance,
  GameResult
} from '../types';

export const initializePlayerStats = (players: Player[]): Record<number, PlayerWithStats> => {
    const stats: Record<number, PlayerWithStats> = {};
    players.forEach(p => {
        stats[p.id] = { ...p, dailyPoints: {}, leaguePoints: 0, gamesPlayed: 0, wins: 0, losses: 0, ties: 0, pointsFor: 0, pointsAgainst: 0, pointDifferential: 0 };
    });
    return stats;
};

export const processDayResults = (playerStats: Record<number, PlayerWithStats>, day: number, dayResults: DailyResults | undefined, dayMatchups: DailyCourtMatchups | undefined, dayAttendance: DailyAttendance | undefined) => {
    const dailyPointsMap = new Map<number, number>();
    if (!dayResults || !dayMatchups) return;

    // Create a map to track which players have been processed for each game to avoid double-counting.
    const processedPlayersByGame = new Map<number, Set<number>>(); // Map<gameIndex, Set<playerId>>

    Object.keys(dayMatchups).forEach(court => {
        const courtResults = dayResults[court];
        const courtMatchups = dayMatchups[court];
        if (!courtResults || !courtMatchups) return;

        courtResults.forEach((result: GameResult, gameIndex: number) => {
            if (result === 'unplayed' || result.teamAScore === null || result.teamBScore === null) return;
            const matchup = courtMatchups[gameIndex];
            if (!matchup) return;

            if (!processedPlayersByGame.has(gameIndex)) {
                processedPlayersByGame.set(gameIndex, new Set<number>());
            }
            const processedPlayersThisGame = processedPlayersByGame.get(gameIndex)!;

            const { teamAScore, teamBScore } = result;

            const processTeam = (team: Player[], ownScore: number, opponentScore: number) => {
                const outcome = ownScore > opponentScore ? 'win' : ownScore < opponentScore ? 'loss' : 'tie';

                team.forEach((p: Player) => {
                    // If player has already been processed for this game index, skip them.
                    // This handles data errors where a player is scheduled on two courts at once.
                    if (processedPlayersThisGame.has(p.id)) {
                        return; 
                    }
                    processedPlayersThisGame.add(p.id);
                    
                    const playerIsPresent = dayAttendance?.[p.id]?.[gameIndex] ?? true;
                    const player = playerStats[p.id];
                    if (!player) return;

                    player.gamesPlayed++;
                    
                    if (!playerIsPresent) return; // No W-L-T, points, or PF/PA for absent players

                    player.pointsFor += ownScore;
                    player.pointsAgainst += opponentScore;

                    if (outcome === 'win') {
                        player.wins++;
                        dailyPointsMap.set(p.id, (dailyPointsMap.get(p.id) || 0) + 3);
                    } else if (outcome === 'tie') {
                        player.ties++;
                        dailyPointsMap.set(p.id, (dailyPointsMap.get(p.id) || 0) + 1);
                    } else if(outcome === 'loss') {
                        player.losses++;
                    }
                });
            };

            processTeam(matchup.teamA, teamAScore, teamBScore);
            processTeam(matchup.teamB, teamBScore, teamAScore);
        });
    });

    for (const id in playerStats) {
        if(dailyPointsMap.has(parseInt(id))) {
            playerStats[id].dailyPoints[day] = dailyPointsMap.get(parseInt(id)) || 0;
        }
    }
};