import type { PlayerWithStats } from "../types";

/**
 * Sorts players using a multi-level tie-breaking system.
 * The hierarchy is:
 * 1. League Points (desc)
 * 2. Points For (desc)
 * 3. Points Against (asc)
 * 4. Player ID (asc, for stability)
 */
export function sortPlayersWithTieBreaking(
    players: PlayerWithStats[]
): PlayerWithStats[] {
    const sortedPlayers = [...players];

    sortedPlayers.sort((a, b) => {
        // 1. League Points (descending)
        if (a.leaguePoints !== b.leaguePoints) {
            return b.leaguePoints - a.leaguePoints;
        }

        // 2. Points For (descending)
        if (a.pointsFor !== b.pointsFor) {
            return b.pointsFor - a.pointsFor;
        }
        
        // 3. Points Against (ascending)
        if (a.pointsAgainst !== b.pointsAgainst) {
            return a.pointsAgainst - b.pointsAgainst;
        }

        // 4. Stable Sort Key (Player ID, ascending)
        return a.id - b.id;
    });

    return sortedPlayers;
}