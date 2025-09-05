
import React from 'react';
import type { PlayerWithStats } from '../types';
import { IconMedal } from './Icon';

interface LeaderboardProps {
  players: PlayerWithStats[];
}

const medalColors = [
    'text-yellow-400', // Gold
    'text-gray-300',   // Silver
    'text-yellow-600'  // Bronze
];

const Leaderboard: React.FC<LeaderboardProps> = ({ players }) => {
  if (players.length === 0) {
    return <div className="text-center text-gray-500 mt-8">Standings are being calculated...</div>;
  }
  
  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
      {players.map((player, index) => (
        <div 
          key={player.id} 
          className={`bg-gray-700/50 p-6 rounded-xl border border-gray-600 transform transition-transform duration-300 hover:scale-105 hover:border-yellow-400 ${index === 0 ? 'md:scale-110 md:z-10 bg-gray-700' : ''}`}
        >
          <div className="flex justify-center items-center mb-3">
            <IconMedal className={`w-10 h-10 ${medalColors[index]}`} />
          </div>
          <h3 className="text-2xl font-bold truncate text-white">{player.name}</h3>
          {player.grade && <p className="text-sm text-gray-400">Grade {player.grade}</p>}
          <p className={`text-3xl font-bold mt-2 ${medalColors[index]}`}>{player.leaguePoints} pts</p>
        </div>
      ))}
    </div>
  );
};

export default Leaderboard;