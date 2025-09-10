import React from 'react';
import type { Player, UserState } from '../types';
import { IconTrophy, IconRefresh } from './Icon';

interface TeamOfTheDayProps {
  day: number;
  players: Player[];
  teamData?: { teamPlayerIds: number[]; summary: string };
  userRole: UserState['role'];
  onGenerate: () => void;
  isLoading: boolean;
  error: string | null;
}

const TeamOfTheDay: React.FC<TeamOfTheDayProps> = ({ day, players, teamData, userRole, onGenerate, isLoading, error }) => {
    const teamPlayers = teamData ? players.filter(p => teamData.teamPlayerIds.includes(p.id)) : [];

    return (
        <div className="my-8 p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-yellow-500/30">
            <h2 className="text-2xl font-bold text-center text-yellow-400 mb-4 flex items-center justify-center gap-3">
                <IconTrophy className="w-6 h-6" />
                Day {day}: Team of the Day
            </h2>
            
            {isLoading ? (
                <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Analyzing game data to find the top team...</p>
                </div>
            ) : error ? (
                <div className="text-center py-8 bg-red-900/30 p-4 rounded-lg">
                    <p className="text-red-400 font-semibold">Could not generate Team of the Day.</p>
                    <p className="text-sm text-red-300/80 mt-1">{error}</p>
                    {userRole === 'SUPER_ADMIN' && <button onClick={onGenerate} className="mt-4 px-4 py-2 text-sm font-bold rounded-lg bg-yellow-500 text-gray-900 hover:bg-yellow-400">Try Again</button>}
                </div>
            ) : teamData ? (
                <div className="text-center">
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4">
                        {teamPlayers.map(player => (
                            <span key={player.id} className="text-xl font-bold text-white">{player.name}</span>
                        ))}
                    </div>
                    <p className="text-gray-300 max-w-2xl mx-auto italic">"{teamData.summary}"</p>
                    {userRole === 'SUPER_ADMIN' && (
                         <button onClick={onGenerate} className="mt-6 flex items-center gap-2 mx-auto text-sm text-gray-400 hover:text-yellow-400 transition-colors">
                            <IconRefresh className="w-4 h-4" />
                            Regenerate
                        </button>
                    )}
                </div>
            ) : (
                <div className="text-center py-8">
                    <p className="text-gray-500">The Team of the Day has not been generated yet.</p>
                    {userRole === 'SUPER_ADMIN' && (
                        <button onClick={onGenerate} className="mt-4 px-4 py-2 text-sm font-bold rounded-lg bg-yellow-500 text-gray-900 hover:bg-yellow-400">
                            Generate with AI
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default TeamOfTheDay;
