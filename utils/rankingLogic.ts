

import type { PlayerWithStats } from "../types";

/**
 * A helper function to calculate the Points For / Points Against ratio, handling division by zero.
 * A higher ratio is better.
 * @param player The player stats object.
 * @returns The calculated ratio.
 */
function getPointsRatio(player: PlayerWithStats): number {
    const { pointsFor, pointsAgainst } = player;
    if (pointsAgainst === 0) {
        // If a player has scored points and has none against, their ratio is infinitely good.
        if (pointsFor > 0) return Infinity;
        // If they have scored no points and have none against, the ratio is 0.
        return 0;
    }
    return pointsFor / pointsAgainst;
}


/**
 * Sorts players using a multi-level tie-breaking system based on the logic from the league's spreadsheet.
 * The hierarchy is:
 * 1. League Points (desc)
 * 2. Points For / Points Against Ratio (desc)
 * 3. Points For (desc)
 * 4. Points Against (asc)
 * 5. Player ID (asc, for stability)
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

        // 2. Points For / Points Against Ratio (descending)
        const ratioA = getPointsRatio(a);
        const ratioB = getPointsRatio(b);
        if (ratioA !== ratioB) {
            return ratioB - ratioA;
        }

        // 3. Points For (descending)
        if (a.pointsFor !== b.pointsFor) {
            return b.pointsFor - a.pointsFor;
        }
        
        // 4. Points Against (ascending)
        if (a.pointsAgainst !== b.pointsAgainst) {
            return a.pointsAgainst - b.pointsAgainst;
        }

        // 5. Stable Sort Key (Player ID, ascending)
        return a.id - b.id;
    });

    return sortedPlayers;
}