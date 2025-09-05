
import React from 'react';
import type { Player, PlayerDailyAttendance } from '../types';

interface PlayerAttendanceRowProps {
    player: Player;
    attendance?: PlayerDailyAttendance;
    onAttendanceChange: (gameIndex: number, isPresent: boolean) => void;
    gamesPerDay: number;
    isDayLocked: boolean;
}

const PlayerAttendanceRow: React.FC<PlayerAttendanceRowProps> = ({ player, attendance, onAttendanceChange, gamesPerDay, isDayLocked }) => {
    
    const handleSetAll = (isPresent: boolean) => {
        for (let i = 0; i < gamesPerDay; i++) {
            onAttendanceChange(i, isPresent);
        }
    };

    return (
        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 bg-gray-800 p-2 rounded-lg">
            <p className="font-medium text-white truncate">{player.name}</p>
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {Array.from({ length: gamesPerDay }).map((_, i) => {
                    const isPresent = attendance ? attendance[i] : true; // Default to present
                    return (
                        <button
                            key={i}
                            onClick={() => onAttendanceChange(i, !isPresent)}
                            disabled={isDayLocked}
                            className={`w-8 h-8 rounded text-xs font-bold transition-colors ${
                                isPresent
                                ? 'bg-green-500/80 hover:bg-green-600 text-white'
                                : 'bg-red-500/80 hover:bg-red-600 text-white'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                            aria-label={`Game ${i + 1} for ${player.name}: ${isPresent ? 'Present' : 'Absent'}`}
                        >
                            G{i + 1}
                        </button>
                    )
                })}
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => handleSetAll(true)}
                    disabled={isDayLocked}
                    className="px-3 py-1 text-xs font-bold rounded bg-gray-600 hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    All Day
                </button>
                <button 
                    onClick={() => handleSetAll(false)}
                    disabled={isDayLocked}
                    className="px-3 py-1 text-xs font-bold rounded bg-gray-600 hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    None
                </button>
            </div>
        </div>
    );
};

export default PlayerAttendanceRow;