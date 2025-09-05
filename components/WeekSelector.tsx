import React from 'react';
import type { UserState } from '../types';

// NOTE: This component is likely deprecated and unused. The app uses DaySelector.tsx instead.
// It is being updated to use 'Day' terminology to reduce confusion.

interface WeekSelectorProps {
  currentDay: number;
  totalDays: number;
  onDayChange: (day: number) => void;
  userRole: UserState['role'];
  realCurrentLeagueDay: number;
}

const WeekSelector: React.FC<WeekSelectorProps> = ({ currentDay, totalDays, onDayChange, userRole, realCurrentLeagueDay }) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 mt-4">
      {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => {
        const isLockedForReferee = userRole === 'REFEREE' && day !== realCurrentLeagueDay;
        const isPublicView = userRole === 'NONE' || userRole === 'PLAYER' || userRole === 'PARENT';
        
        return (
          <button
            key={day}
            onClick={() => onDayChange(day)}
            disabled={isLockedForReferee}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900
              ${currentDay === day 
                ? 'bg-yellow-500 text-gray-900 shadow-lg' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
              }
              ${isLockedForReferee ? 'opacity-75 cursor-not-allowed' : ''}
              ${isPublicView ? 'pointer-events-none' : ''} 
            `}
            aria-disabled={isLockedForReferee}
          >
            Day {day}
          </button>
        )
      })}
    </div>
  );
};

export default WeekSelector;