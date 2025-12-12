
import React, { useState } from 'react';
import type { DailyResults, GameResult, UserState, DailyCourtMatchups, DailyAttendance, Player } from '../types';
import CourtScoreEntry from './CourtScoreEntry';
import AttendanceManager from './AttendanceManager';
import { IconClipboardList, IconUserSwap, IconLock } from './Icon';

interface ScoreEntryDashboardProps {
    currentDay: number;
    courtKeys: string[];
    matchupsForDay?: DailyCourtMatchups;
    resultsForDay?: DailyResults;
    attendanceForDay?: DailyAttendance;
    gamesPerDay: number;
    onGameResultChange: (court: string, gameIndex: number, result: GameResult) => void;
    onAttendanceChange: (playerId: number, gameIndex: number, isPresent: boolean) => void;
    onPlayerMove: (court: string, gameIndex: number, playerId: number, fromTeam: 'teamA' | 'teamB') => void;
    onToggleDayLock: (day: number) => void;
    onPrintCourt: (courtTitle: string, day: number) => void;
    isDayLocked: boolean;
    userState: UserState;
    isSwapMode: boolean;
    playerToSwap: { player: Player; gameIndex: number } | null;
    toggleSwapMode: () => void;
    onPlayerSelectForSwap: (player: Player, gameIndex: number) => void;
}

const ScoreEntryDashboard: React.FC<ScoreEntryDashboardProps> = ({ 
    currentDay, 
    courtKeys,
    matchupsForDay, 
    resultsForDay, 
    attendanceForDay,
    gamesPerDay,
    onGameResultChange,
    onAttendanceChange,
    onPlayerMove,
    onToggleDayLock,
    onPrintCourt,
    isDayLocked,
    userState,
    isSwapMode,
    playerToSwap,
    toggleSwapMode,
    onPlayerSelectForSwap,
}) => {
    const [isAttendanceVisible, setIsAttendanceVisible] = useState(false);

    // Allow both Super Admins and Referees to see the dashboard
    if (userState.role === 'NONE') {
        return null;
    }
    
    const visibleCourts = courtKeys;

    if (!matchupsForDay) {
        return (
            <div className="my-8 p-6 bg-gray-800/50 rounded-2xl shadow-2xl border border-gray-700 text-center text-gray-400">
                Generating matchups for Day {currentDay}...
            </div>
        );
    }

    const dashboardTitle = `Score Entry Dashboard: Day ${currentDay}`;

    const swapButtonText = isSwapMode 
        ? (playerToSwap ? `Select player to swap with ${playerToSwap.player.name}`: 'Select first player')
        : 'Swap Game Players';

    return (
        <div className={`my-8 p-6 bg-gray-800/50 rounded-2xl shadow-2xl border transition-colors duration-300 ${isDayLocked ? 'border-red-500/50' : 'border-gray-700'}`}>
            <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-6 text-center">
              <h2 className="text-3xl font-bold text-white">{dashboardTitle}</h2>
              <div className="flex gap-2 flex-wrap justify-center">
                {/* Only Super Admin can manage attendance */}
                {userState.role === 'SUPER_ADMIN' && (
                    <button
                        onClick={() => setIsAttendanceVisible(!isAttendanceVisible)}
                        disabled={isDayLocked}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <IconClipboardList className="w-5 h-5" />
                        {isAttendanceVisible ? 'Hide Attendance' : 'Manage Attendance'}
                    </button>
                )}
                
                {/* Only Super Admin can swap players */}
                {userState.role === 'SUPER_ADMIN' && (
                     <button onClick={toggleSwapMode} disabled={isDayLocked} className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${isSwapMode ? 'bg-yellow-500 text-black' : 'bg-gray-700 hover:bg-gray-600'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                        <IconUserSwap className="w-5 h-5"/> {swapButtonText}
                    </button>
                )}
                
                {/* Only Super Admin can lock/unlock days */}
                {userState.role === 'SUPER_ADMIN' && (
                    <button 
                        onClick={() => onToggleDayLock(currentDay)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${isDayLocked ? 'bg-red-600 hover:bg-red-500' : 'bg-yellow-500 text-gray-900 hover:bg-yellow-400'}`}
                    >
                        <IconLock className="w-5 h-5" />
                        {isDayLocked ? 'Unlock Day for Edits' : 'Lock Day & Finalize'}
                    </button>
                )}
              </div>
            </div>
            
            {isAttendanceVisible && userState.role === 'SUPER_ADMIN' && (
                <AttendanceManager
                    currentDay={currentDay}
                    matchupsForDay={matchupsForDay}
                    attendanceForDay={attendanceForDay}
                    onAttendanceChange={onAttendanceChange}
                    gamesPerDay={gamesPerDay}
                    isDayLocked={isDayLocked}
                />
            )}

            <div className="space-y-10 mt-6">
                {visibleCourts.map((court, index) => (
                    <CourtScoreEntry 
                        key={court}
                        courtTitle={court}
                        courtIndex={index}
                        currentDay={currentDay}
                        matchups={matchupsForDay[court]}
                        results={resultsForDay?.[court]}
                        attendanceForDay={attendanceForDay}
                        onResultChange={(gameIndex: number, result: GameResult) => onGameResultChange(court, gameIndex, result)}
                        onPlayerMove={(gameIndex: number, playerId: number, fromTeam: 'teamA' | 'teamB') => onPlayerMove(court, gameIndex, playerId, fromTeam)}
                        onPrintCourt={onPrintCourt}
                        userState={userState}
                        isDayLocked={isDayLocked}
                        isSwapMode={isSwapMode}
                        playerToSwap={playerToSwap}
                        onPlayerSelectForSwap={onPlayerSelectForSwap}
                        toggleSwapMode={toggleSwapMode}
                    />
                ))}
            </div>
        </div>
    );
};

export default ScoreEntryDashboard;
