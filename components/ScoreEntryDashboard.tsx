

import React, { useState } from 'react';
import type { DailyResults, GameResult, UserState, DailyCourtMatchups, DailyAttendance, Player } from '../types';
import CourtScoreEntry from './CourtScoreEntry';
import AttendanceManager from './AttendanceManager';
import { IconClipboardList, IconInfo, IconArrowsRightLeft, IconUserSwap, IconLightbulb, IconLock } from './Icon';

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
    onSaveRefereeNote: (playerId: number, note: string, day: number) => void;
    onSaveAdminFeedback: (feedbackText: string) => void;
    onToggleDayLock: (day: number) => void;
    onPrintCourt: (courtTitle: string, day: number) => void;
    isDayLocked: boolean;
    userState: UserState;
    isSwapMode: boolean;
    playerToSwap: { player: Player; gameIndex: number } | null;
    toggleSwapMode: () => void;
    onPlayerSelectForSwap: (player: Player, gameIndex: number) => void;
}

const FeedbackModal: React.FC<{
    onClose: () => void;
    onSubmit: (feedback: string) => void;
}> = ({ onClose, onSubmit }) => {
    const [feedbackText, setFeedbackText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (feedbackText.trim()) {
            onSubmit(feedbackText.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div 
                className="w-full max-w-lg mx-auto p-8 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-center items-center gap-3 mb-4 text-center">
                    <IconLightbulb className="w-8 h-8 text-yellow-400" />
                    <h2 className="text-2xl font-bold text-white">Share Your Feedback</h2>
                </div>
                <p className="text-gray-400 mb-6 text-center">Have an idea, suggestion, or comment to improve the league? Share it with the admin.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        rows={6}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="Type your feedback here..."
                        autoFocus
                    />
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={!feedbackText.trim()} className="px-4 py-2 text-sm font-bold rounded-lg bg-yellow-500 text-gray-900 hover:bg-yellow-400 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                            Submit Feedback
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const RefereeInfoBox: React.FC<{onDismiss: () => void}> = ({onDismiss}) => (
    <div className="relative bg-blue-900/50 border border-blue-500 text-blue-200 px-4 py-3 rounded-lg text-sm mb-6 flex items-start gap-4">
        <IconInfo className="w-5 h-5 mt-0.5 shrink-0" />
        <div>
            <h4 className="font-bold">Referee Quick Guide</h4>
            <ul className="list-disc pl-5 mt-1">
                <li>Enter the final score for each team. Results save automatically.</li>
                <li>Use <span className="font-bold">Manage Attendance</span> to mark players absent.</li>
                <li>Use <IconArrowsRightLeft className="w-3 h-3 inline-block -mt-1" /> to manually swap players between teams if needed.</li>
                <li>Super Admins can use <IconUserSwap className="w-3 h-3 inline-block -mt-1" /> to swap players between different courts within the same game.</li>
                <li>Super Admins can use <IconLock className="w-3 h-3 inline-block -mt-1" /> to lock a day's results, preventing further edits.</li>
            </ul>
        </div>
        <button onClick={onDismiss} className="absolute top-2 right-2 text-blue-300 hover:text-white">&times;</button>
    </div>
);


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
    onSaveRefereeNote,
    onSaveAdminFeedback,
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
    const [isInfoVisible, setIsInfoVisible] = useState(true);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

    if (userState.role !== 'REFEREE' && userState.role !== 'SUPER_ADMIN') {
        return null;
    }
    
    const handleFeedbackSubmit = (feedbackText: string) => {
        onSaveAdminFeedback(feedbackText);
        setIsFeedbackModalOpen(false);
        alert("Thank you! Your feedback has been sent to the admin.");
    };

    const visibleCourts = userState.role === 'REFEREE' ? courtKeys.filter(c => c === userState.court) : courtKeys;

    if (!matchupsForDay) {
        return (
            <div className="my-8 p-6 bg-gray-800/50 rounded-2xl shadow-2xl border border-gray-700 text-center text-gray-400">
                Generating matchups for Day {currentDay}...
            </div>
        );
    }

    const dashboardTitle = userState.role === 'REFEREE' 
        ? `${userState.court} - Day ${currentDay}`
        : `Referee Dashboard: Day ${currentDay}`;

    const swapButtonText = isSwapMode 
        ? (playerToSwap ? `Select player to swap with ${playerToSwap.player.name}`: 'Select first player')
        : 'Swap Game Players';

    return (
        <div className={`my-8 p-6 bg-gray-800/50 rounded-2xl shadow-2xl border transition-colors duration-300 ${isDayLocked ? 'border-red-500/50' : 'border-gray-700'}`}>
            <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-6 text-center">
              <h2 className="text-3xl font-bold text-white">{dashboardTitle}</h2>
              <div className="flex gap-2 flex-wrap justify-center">
                <button
                    onClick={() => setIsAttendanceVisible(!isAttendanceVisible)}
                    disabled={isDayLocked}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <IconClipboardList className="w-5 h-5" />
                    {isAttendanceVisible ? 'Hide Attendance' : 'Manage Attendance'}
                </button>
                {userState.role === 'SUPER_ADMIN' && (
                     <button onClick={toggleSwapMode} disabled={isDayLocked} className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${isSwapMode ? 'bg-yellow-500 text-black' : 'bg-gray-700 hover:bg-gray-600'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                        <IconUserSwap className="w-5 h-5"/> {swapButtonText}
                    </button>
                )}
                {userState.role === 'REFEREE' && (
                    <button 
                        onClick={() => setIsFeedbackModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300 bg-teal-600 hover:bg-teal-500 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    >
                        <IconLightbulb className="w-5 h-5" />
                        Submit Feedback
                    </button>
                )}
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
            
            {userState.role === 'REFEREE' && isInfoVisible && <RefereeInfoBox onDismiss={() => setIsInfoVisible(false)} />}
            
            {isAttendanceVisible && (
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
                        onSaveRefereeNote={onSaveRefereeNote}
                        onPrintCourt={onPrintCourt}
                        userState={userState}
                        isDayLocked={isDayLocked}
                        isSwapMode={isSwapMode}
                        playerToSwap={playerToSwap}
                        onPlayerSelectForSwap={onPlayerSelectForSwap}
                        toggleSwapMode={toggleSwapMode}
                    />
                ))}
                 {visibleCourts.length === 0 && userState.role === 'REFEREE' && (
                    <p className="text-gray-400 text-center">Your assigned court ({userState.court}) is not scheduled for this day's games.</p>
                )}
            </div>
            {isFeedbackModalOpen && (
                <FeedbackModal 
                    onClose={() => setIsFeedbackModalOpen(false)}
                    onSubmit={handleFeedbackSubmit}
                />
            )}
        </div>
    );
};

export default ScoreEntryDashboard;