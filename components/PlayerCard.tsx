

import React from 'react';
import type { Player, PlayerWithStats } from '../types';

interface PlayerCardProps {
  player: PlayerWithStats;
  onClick: (playerId: number) => void;
  isClickable: boolean;
  isSwapMode?: boolean;
  playerToSwap?: Player | null;
  onPlayerSelectForSwap?: (player: Player) => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ 
    player, 
    onClick, 
    isClickable,
    isSwapMode = false,
    playerToSwap = null,
    onPlayerSelectForSwap
}) => {
  const gradeText = player.grade ? `G${player.grade}` : 'N/A';
  
  const isSelectedForSwap = isSwapMode && playerToSwap?.id === player.id;
  
  const cardClasses = [
    "bg-gray-700 p-3 rounded-lg text-center h-full flex flex-col justify-center transform transition-all duration-300",
    (isClickable || isSwapMode) ? "hover:-translate-y-1 hover:shadow-lg hover:shadow-yellow-500/10" : "",
    isSelectedForSwap ? "ring-2 ring-yellow-400 shadow-lg shadow-yellow-500/20" : "",
    isSwapMode ? "cursor-pointer" : ""
  ].join(' ');

  const content = (
      <div className={cardClasses}>
        <div className="font-bold text-white truncate text-base">{player.name}</div>
        <div className="text-sm text-gray-400">{gradeText}</div>
        <div className="text-lg font-semibold text-yellow-400 mt-1">{player.leaguePoints} pts</div>
      </div>
  );

  const handleClick = () => {
    if (isSwapMode && onPlayerSelectForSwap) {
        onPlayerSelectForSwap(player);
    } else if (isClickable) {
        onClick(player.id);
    }
  };

  if (isClickable || (isSwapMode && onPlayerSelectForSwap)) {
    return <button onClick={handleClick} className="w-full h-full text-left">{content}</button>;
  }

  return content;
};

export default PlayerCard;