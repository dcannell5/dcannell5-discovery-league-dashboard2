

import React from 'react';
import type { CourtResults, GameResult, UserState, GameMatchup, Player, DailyAttendance } from '../types';
import GameMatchupControl from './GameMatchupControl';
import { IconUserSwap, IconPrinter } from './Icon';

type PlayerToSwap = { player: Player; gameIndex: number };

interface CourtScoreEntryProps {
    courtTitle: string;
    courtIndex: number;
    currentDay: number;
    matchups: GameMatchup[];
    results?: CourtResults;
    attendanceForDay?: DailyAttendance;
    onResultChange: (gameIndex: number, result: GameResult) => void;
    onPlayerMove: (gameIndex: number, playerId: number, fromTeam: 'teamA' | 'teamB') => void;
    onSaveRefereeNote: (playerId: number, note: string, day: number) => void;
    onPrintCourt: (courtTitle: string, day: number) => void;
    userState: UserState;
    isDayLocked: boolean;
    isSwapMode: boolean;
    playerToSwap: PlayerToSwap | null;
    onPlayerSelectForSwap: (player: Player, gameIndex: number) => void;
    toggleSwapMode: () => void;
}

const courtBorderColors = [
    'border-yellow-400',
    'border-gray-400',
    'border-yellow-600',
];

const CourtScoreEntry: React.FC<CourtScoreEntryProps> = ({ 
    courtTitle, courtIndex, currentDay, matchups, results, onResultChange, onPlayerMove, onSaveRefereeNote, userState,
    isDayLocked, isSwapMode, playerToSwap, onPlayerSelectForSwap, attendanceForDay, toggleSwapMode, onPrintCourt
}) => {
    const borderColor = courtBorderColors[courtIndex % courtBorderColors.length];
    
    if (!matchups || matchups.length === 0) {
        return <div className={`p-4 rounded-lg border-l-4 ${borderColor}`}>Calculating matchups for {courtTitle}...</div>
    }

    const textColor = borderColor.replace('border', 'text');

    return (
        <div className={`bg-gray-800 p-6 rounded-2xl border-t-4 ${borderColor} ${isDayLocked ? 'opacity-70' : ''}`}>
            <div className="flex flex-col sm:flex-row justify-center items-center text-center gap-4 mb-6">
                <h3 className={`text-2xl font-bold ${textColor}`}>{courtTitle}</h3>
                {userState.role === 'SUPER_ADMIN' && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleSwapMode}
                            disabled={isDayLocked}
                            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 ${
                                isSwapMode ? 'bg-yellow-500 text-black ring-2 ring-offset-2 ring-offset-gray-800 ring-yellow-500' : 'bg-gray-700 hover:bg-gray-600'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                            aria-pressed={isSwapMode}
                        >
                            <IconUserSwap className="w-4 h-4"/>
                            Swap Player
                        </button>
                        <button
                            onClick={() => onPrintCourt(courtTitle, currentDay)}
                            disabled={isDayLocked || !matchups || matchups.length === 0}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Print court matchups"
                        >
                            <IconPrinter className="w-4 h-4" />
                            Print
                        </button>
                    </div>
                )}
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {matchups.map((matchup, index) => (
                    <GameMatchupControl
                        key={index}
                        gameIndex={index}
                        currentDay={currentDay}
                        matchup={matchup}
                        result={results ? results[index] : 'unplayed'}
                        attendanceForDay={attendanceForDay}
                        onResultChange={onResultChange}
                        onPlayerMove={(playerId, fromTeam) => onPlayerMove(index, playerId, fromTeam)}
                        onSaveRefereeNote={onSaveRefereeNote}
                        userState={userState}
                        isDayLocked={isDayLocked}
                        isSwapMode={isSwapMode}
                        playerToSwap={playerToSwap}
                        onPlayerSelectForSwap={onPlayerSelectForSwap}
                    />
                ))}
            </div>
        </div>
    );
};

export default CourtScoreEntry;