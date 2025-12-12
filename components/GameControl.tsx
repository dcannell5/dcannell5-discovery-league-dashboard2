
import React, { useState, useEffect } from 'react';
import type { GameResult, UserState } from '../types';

interface GameControlProps {
    gameIndex: number;
    result: GameResult;
    onResultChange: (gameIndex: number, result: GameResult) => void;
    userRole: UserState['role'];
    isDayLocked: boolean;
}

const GameControl: React.FC<GameControlProps> = ({ gameIndex, result, onResultChange, userRole, isDayLocked }) => {
    const scores = result === 'unplayed' ? { teamAScore: null, teamBScore: null } : result;
    
    // Use local state to handle controlled inputs
    const [scoreA, setScoreA] = useState<string>(scores.teamAScore?.toString() ?? '');
    const [scoreB, setScoreB] = useState<string>(scores.teamBScore?.toString() ?? '');

    // Sync local state if the prop changes from above (e.g., initial load, or change by another user)
    useEffect(() => {
        setScoreA(scores.teamAScore?.toString() ?? '');
        setScoreB(scores.teamBScore?.toString() ?? '');
    }, [scores.teamAScore, scores.teamBScore]);

    const handleBlur = () => {
        const numA = scoreA.trim() === '' ? null : parseInt(scoreA, 10);
        const numB = scoreB.trim() === '' ? null : parseInt(scoreB, 10);

        // Check for NaN to ensure we don't save invalid text.
        const newScoreA = !isNaN(numA!) ? numA : null;
        const newScoreB = !isNaN(numB!) ? numB : null;

        // Only call the update function if the value has actually changed to prevent unnecessary re-renders.
        if (newScoreA !== scores.teamAScore || newScoreB !== scores.teamBScore) {
            onResultChange(gameIndex, { teamAScore: newScoreA, teamBScore: newScoreB });
        }
    };
    
    // Super Admins and Referees can edit scores, unless the day is locked.
    const canEdit = userRole === 'SUPER_ADMIN' || userRole === 'REFEREE';
    const isDisabled = !canEdit || isDayLocked;

    const inputClasses = "w-full text-center bg-gray-900/50 rounded-md py-2 px-1 text-white font-bold text-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed";

    return (
        <div className="flex justify-center items-center gap-2 mt-3">
            <input
                type="number"
                value={scoreA}
                onChange={(e) => setScoreA(e.target.value)}
                onBlur={handleBlur}
                disabled={isDisabled}
                className={inputClasses}
                aria-label="Team A Score"
                placeholder="-"
                min="0"
            />
            <span className="text-gray-400 font-bold text-xl">-</span>
            <input
                type="number"
                value={scoreB}
                onChange={(e) => setScoreB(e.target.value)}
                onBlur={handleBlur}
                disabled={isDisabled}
                className={inputClasses}
                aria-label="Team B Score"
                placeholder="-"
                min="0"
            />
        </div>
    );
};

export default GameControl;
