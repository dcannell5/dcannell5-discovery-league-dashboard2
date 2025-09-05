

import React from 'react';
import type { PlayerWithStats, UserState } from '../types';
import PlayerCard from './PlayerCard';

interface DailyGroupsProps {
  dailyCourtGroups: Record<string, PlayerWithStats[]>;
  courtOrder: string[];
  onPlayerClick: (playerId: number) => void;
  userState: UserState;
}

const courtColors = [
    '#facc15', // Gold
    '#d1d5db', // Silver
    '#ca8a04', // Bronze
];

const GroupSection: React.FC<{ 
    title: string; 
    players: PlayerWithStats[]; 
    borderColor: string; 
    onPlayerClick: (playerId: number) => void; 
    isClickable: boolean;
}> = ({ title, players, borderColor, onPlayerClick, isClickable }) => (
    <div className="bg-gray-800/50 p-6 rounded-2xl shadow-xl border-t-4" style={{borderColor: borderColor}}>
        <h3 className="text-2xl font-bold mb-6 text-center" style={{color: borderColor}}>{title}</h3>
        {players.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {players.map(player => (
                    <PlayerCard 
                        key={player.id} 
                        player={player} 
                        onClick={onPlayerClick}
                        isClickable={isClickable}
                    />
                ))}
            </div>
        ) : (
            <p className="text-center text-gray-500">No players in this group for this day.</p>
        )}
    </div>
);

const DailyGroups: React.FC<DailyGroupsProps> = ({ dailyCourtGroups, courtOrder, onPlayerClick, userState }) => {
    const isClickable = userState.role !== 'NONE';
  
    return (
    <div className="space-y-12">
        {courtOrder.map((courtKey, index) => {
            const players = dailyCourtGroups[courtKey];
            if (!players) return null; // Safety check for mismatched data
            return (
                <GroupSection 
                    key={courtKey} 
                    title={courtKey} 
                    players={players} 
                    borderColor={courtColors[index % courtColors.length]} 
                    onPlayerClick={onPlayerClick}
                    isClickable={isClickable}
                />
            );
        })}
    </div>
  );
};

export default DailyGroups;