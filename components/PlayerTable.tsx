import React, { useState, useMemo } from 'react';
import type { PlayerWithStats, UserState } from '../types';
import { IconSearch } from './Icon';

interface PlayerTableProps {
  players: PlayerWithStats[];
  onPlayerClick: (playerId: number) => void;
  userState: UserState;
}

const PlayerTable: React.FC<PlayerTableProps> = ({ players, onPlayerClick, userState }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const hasGrades = players.some(p => p.grade);
  const isClickable = userState.role !== 'NONE';

  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) {
      return players;
    }
    return players.filter(player =>
      player.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [players, searchQuery]);

  return (
    <div className="bg-gray-800/50 p-6 rounded-2xl shadow-2xl border border-gray-700">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-center text-white shrink-0">Overall Player Rankings</h2>
        <div className="relative w-full md:w-auto md:max-w-xs">
          <input
            type="text"
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-gray-700/50 text-sm uppercase text-gray-400">
            <tr>
              <th className="p-4 rounded-l-lg">Rank</th>
              <th className="p-4">Name</th>
              {hasGrades && <th className="p-4 text-center">Grade</th>}
              <th className="p-4 text-center">W</th>
              <th className="p-4 text-center">L</th>
              <th className="p-4 text-center">T</th>
              <th className="p-4 text-center">PF</th>
              <th className="p-4 text-center">PA</th>
              <th className="p-4 text-center">PD</th>
              <th className="p-4 text-right rounded-r-lg">League Pts</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.length > 0 ? (
              filteredPlayers.map((player) => {
                const originalIndex = players.findIndex(p => p.id === player.id);
                const index = originalIndex; // for medal colors
                return (
                  <tr 
                    key={player.id} 
                    className={`border-b border-gray-700 transition-colors duration-200 ${isClickable ? 'cursor-pointer hover:bg-gray-700/50' : ''}`}
                    onClick={isClickable ? () => onPlayerClick(player.id) : undefined}
                  >
                    <td className="p-4 font-bold text-lg">
                      <span className={`
                        ${index === 0 ? 'text-yellow-400' : ''}
                        ${index === 1 ? 'text-gray-300' : ''}
                        ${index === 2 ? 'text-yellow-600' : ''}
                      `}>
                        {originalIndex + 1}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-white">{player.name}</td>
                    {hasGrades && <td className="p-4 text-center text-gray-300">{player.grade || 'N/A'}</td>}
                    <td className="p-4 text-center text-green-400">{player.wins}</td>
                    <td className="p-4 text-center text-red-400">{player.losses}</td>
                    <td className="p-4 text-center text-gray-400">{player.ties}</td>
                    <td className="p-4 text-center text-gray-300">{player.pointsFor}</td>
                    <td className="p-4 text-center text-gray-300">{player.pointsAgainst}</td>
                    <td className={`p-4 text-center font-semibold ${player.pointDifferential > 0 ? 'text-green-400' : player.pointDifferential < 0 ? 'text-red-400' : 'text-gray-400'}`}>{player.pointDifferential}</td>
                    <td className="p-4 text-right font-semibold text-yellow-400 text-lg">{player.leaguePoints}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={hasGrades ? 10 : 9} className="text-center py-8 text-gray-500">
                  No players found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlayerTable;