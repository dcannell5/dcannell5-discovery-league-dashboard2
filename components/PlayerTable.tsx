import React from 'react';
import type { PlayerWithStats, UserState } from '../types';

interface PlayerTableProps {
  players: PlayerWithStats[];
  onPlayerClick: (playerId: number) => void;
  userState: UserState;
}

const PlayerTable: React.FC<PlayerTableProps> = ({ players, onPlayerClick, userState }) => {
  const hasGrades = players.some(p => p.grade);
  const isClickable = userState.role !== 'NONE';

  return (
    <div className="bg-gray-800/50 p-6 rounded-2xl shadow-2xl border border-gray-700">
      <h2 className="text-3xl font-bold mb-6 text-center text-white">Overall Player Rankings</h2>
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
            {players.map((player, index) => (
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
                    {index + 1}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlayerTable;