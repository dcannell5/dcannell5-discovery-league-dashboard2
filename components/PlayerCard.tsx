import React from 'react';
import type { PlayerWithStats } from '../types';
import { IconUserCircle } from './Icon';

interface PlayerCardProps {
  player: PlayerWithStats;
  onClick: (playerId: number) => void;
  isClickable: boolean;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, onClick, isClickable }) => {
  const handleClick = () => {
    if (isClickable) {
      onClick(player.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`flex flex-col items-center text-center p-2 rounded-lg transition-colors ${
        isClickable ? 'cursor-pointer bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-700/50'
      }`}
    >
      <IconUserCircle className="w-10 h-10 text-gray-400 mb-2" />
      <p className="font-semibold text-white text-sm truncate w-full">{player.name}</p>
      <p className="text-xs text-yellow-400">{player.leaguePoints} pts</p>
    </div>
  );
};

export default PlayerCard;
