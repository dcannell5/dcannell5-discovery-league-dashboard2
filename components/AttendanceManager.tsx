

import React from 'react';
import type { DailyAttendance, DailyCourtMatchups, Player, GameMatchup } from '../types';
import PlayerAttendanceRow from './PlayerAttendanceRow';

interface AttendanceManagerProps {
    currentDay: number;
    matchupsForDay: DailyCourtMatchups;
    attendanceForDay?: DailyAttendance;
    onAttendanceChange: (playerId: number, gameIndex: number, isPresent: boolean) => void;
    gamesPerDay: number;
    isDayLocked: boolean;
}

const AttendanceManager: React.FC<AttendanceManagerProps> = ({
    currentDay,
    matchupsForDay,
    attendanceForDay,
    onAttendanceChange,
    gamesPerDay,
    isDayLocked,
}) => {
    // Create a single, unified list of all players for the day.
    const allPlayersMap = new Map<number, Player>();
    Object.values(matchupsForDay).forEach((courtMatchups: GameMatchup[]) => {
        courtMatchups.forEach(game => {
            [...game.teamA, ...game.teamB].forEach(player => {
                if (!allPlayersMap.has(player.id)) {
                    allPlayersMap.set(player.id, player);
                }
            });
        });
    });

    const allPlayers = Array.from(allPlayersMap.values());

    if (allPlayers.length === 0) {
        return null;
    }

    return (
        <div className="bg-gray-900/70 p-6 rounded-2xl border border-gray-700 mb-6 space-y-4">
            <h3 className="text-2xl font-bold text-center text-yellow-400">Manage Attendance: Day {currentDay}</h3>
            {isDayLocked && <p className="text-center text-blue-300 text-sm -mt-2">This day is locked. Attendance cannot be changed.</p>}
            <div className="space-y-2 max-w-4xl mx-auto">
                {allPlayers
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(player => (
                        <PlayerAttendanceRow
                            key={player.id}
                            player={player}
                            attendance={attendanceForDay?.[player.id]}
                            onAttendanceChange={(gameIndex, isPresent) => onAttendanceChange(player.id, gameIndex, isPresent)}
                            gamesPerDay={gamesPerDay}
                            isDayLocked={isDayLocked}
                        />
                    ))}
            </div>
        </div>
    );
};

export default AttendanceManager;
