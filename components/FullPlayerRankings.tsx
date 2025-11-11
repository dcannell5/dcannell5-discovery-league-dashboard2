import React from 'react';
import type { PlayerWithStats } from '../types';

interface FullPlayerRankingsProps {
  players: PlayerWithStats[];
}

const FullPlayerRankings: React.FC<FullPlayerRankingsProps> = ({ players }) => {
  if (players.length === 0) {
    return null; // Don't render if there are no players to show
  }
  
  return (
    <div className="mt-8">
       <h3 className="text-xl font-bold text-white mb-4 text-center">Full Player Standings</h3>
        <div className="overflow-x-auto bg-gray-700/50 p-4 rounded-xl border border-gray-600">
            <table className="min-w-full divide-y divide-gray-600">
                <thead className="bg-gray-800/50">
                    <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rank</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Player</th>
                        <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Points</th>
                        <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">W-L-T</th>
                        <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider hidden sm:table-cell">Games Played</th>
                        <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider hidden md:table-cell">Point Diff.</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {players.map((player, index) => (
                        <tr key={player.id} className="hover:bg-gray-700/50 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">{index + 1}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-200">{player.name}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-yellow-400 font-bold text-center">{player.leaguePoints}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400 text-center">{`${player.wins}-${player.losses}-${player.ties}`}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400 text-center hidden sm:table-cell">{player.gamesPlayed}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400 text-center hidden md:table-cell">{player.pointDifferential}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default FullPlayerRankings;
