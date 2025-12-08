
import React, { useState } from 'react';
import type { PlayerWithStats } from '../types';
import { IconMedal, IconX, IconChartBar, IconTrophy } from './Icon';

interface LeaderboardProps {
  players: PlayerWithStats[];
}

const medalColors = [
    'text-yellow-400', // Gold
    'text-gray-300',   // Silver
    'text-yellow-600'  // Bronze
];

const Leaderboard: React.FC<LeaderboardProps> = ({ players }) => {
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerWithStats | null>(null);

  if (players.length === 0) {
    return <div className="text-center text-gray-500 mt-8">Standings are being calculated...</div>;
  }

  const handlePlayerClick = (player: PlayerWithStats) => {
    setSelectedPlayer(player);
  };

  const closeModal = () => {
    setSelectedPlayer(null);
  };
  
  return (
    <>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        {players.map((player, index) => (
          <div 
            key={player.id} 
            onClick={() => handlePlayerClick(player)}
            className={`cursor-pointer bg-gray-700/50 p-6 rounded-xl border border-gray-600 transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:border-yellow-400 hover:shadow-xl hover:shadow-yellow-500/10 ${index === 0 ? 'md:scale-110 md:z-10 bg-gray-700 md:hover:scale-115' : ''}`}
          >
            <div className="flex justify-center items-center mb-3">
              <IconMedal className={`w-10 h-10 ${medalColors[index]}`} />
            </div>
            <h3 className="text-2xl font-bold truncate text-white">{player.name}</h3>
            {player.grade && <p className="text-sm text-gray-400">Grade {player.grade}</p>}
            <p className={`text-3xl font-bold mt-2 ${medalColors[index]}`}>{player.leaguePoints} pts</p>
            <p className="text-xs text-gray-500 mt-2">Click for stats</p>
          </div>
        ))}
      </div>

      {/* Player Stats Modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div 
            className="bg-gray-800 rounded-2xl p-6 md:p-8 max-w-md w-full relative border border-gray-600 shadow-2xl transform transition-all animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <IconX className="w-6 h-6" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-yellow-500/50">
                 <IconTrophy className="w-8 h-8 text-yellow-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">{selectedPlayer.name}</h2>
              <p className="text-gray-400 uppercase tracking-wide text-xs font-semibold mt-1">Player Profile</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-700/50 p-3 rounded-lg text-center">
                    <span className="block text-xs text-gray-400 uppercase">Total Points</span>
                    <span className="block text-2xl font-bold text-yellow-400">{selectedPlayer.leaguePoints}</span>
                </div>
                <div className="bg-gray-700/50 p-3 rounded-lg text-center">
                    <span className="block text-xs text-gray-400 uppercase">Record (W-L-T)</span>
                    <span className="block text-xl font-bold text-white">{selectedPlayer.wins} - {selectedPlayer.losses} - {selectedPlayer.ties}</span>
                </div>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                <h4 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                    <IconChartBar className="w-4 h-4 text-blue-400"/> Detailed Statistics
                </h4>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                        <span className="text-gray-400">Games Played</span>
                        <span className="text-white font-medium">{selectedPlayer.gamesPlayed}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                        <span className="text-gray-400">Points Scored (PF)</span>
                        <span className="text-green-400 font-medium">{selectedPlayer.pointsFor}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                        <span className="text-gray-400">Points Against (PA)</span>
                        <span className="text-red-400 font-medium">{selectedPlayer.pointsAgainst}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                        <span className="text-gray-400">Point Differential</span>
                        <span className={`font-bold ${selectedPlayer.pointDifferential >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {selectedPlayer.pointDifferential > 0 ? '+' : ''}{selectedPlayer.pointDifferential}
                        </span>
                    </div>
                </div>
            </div>
            
            {/* Simple Daily Points History Visualization */}
            {Object.keys(selectedPlayer.dailyPoints).length > 0 && (
                <div className="mt-6">
                    <h4 className="text-xs text-gray-500 uppercase font-bold mb-2 text-center">Daily Points History</h4>
                    <div className="flex justify-center items-end gap-2 h-16">
                        {Object.entries(selectedPlayer.dailyPoints)
                            .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                            .map(([day, points]) => {
                                const heightPercent = Math.min(100, Math.max(10, (points / 18) * 100)); // Assuming ~18 is a high daily score (6 games * 3 pts)
                                return (
                                    <div key={day} className="flex flex-col items-center gap-1 group w-6">
                                        <div 
                                            className="w-full bg-blue-500/60 rounded-t-sm hover:bg-blue-400 transition-all relative group"
                                            style={{ height: `${heightPercent}%` }}
                                        >
                                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-600 pointer-events-none">
                                                {points} pts
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-gray-500">D{day}</span>
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Leaderboard;
