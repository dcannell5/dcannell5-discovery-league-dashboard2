

import React from 'react';
import type { UserState } from '../types';
import { IconLock } from './Icon';

interface DaySelectorProps {
  currentDay: number;
  totalDays: number;
  daySchedules?: Record<number, string>;
  lockedDays?: Record<number, boolean>;
  onDayChange: (day: number) => void;
  userRole: UserState['role'];
  realCurrentLeagueDay: number;
}

const DaySelector: React.FC<DaySelectorProps> = ({ currentDay, totalDays, daySchedules, lockedDays, onDayChange }) => {
    
    const formatSchedule = (dateString?: string) => {
        if (!dateString) return null;
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric'});
        } catch {
            return null;
        }
    };

    return (
    <div className="flex flex-wrap justify-center gap-2 mt-4">
      {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => {
        const schedule = formatSchedule(daySchedules?.[day]);
        const isLocked = lockedDays?.[day] || false;
        
        return (
          <button
            key={day}
            onClick={() => onDayChange(day)}
            className={`px-3 py-2 text-sm font-bold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900 flex flex-col items-center
              ${currentDay === day 
                ? 'bg-yellow-500 text-gray-900 shadow-lg' 
                : isLocked 
                ? 'bg-gray-600/50 text-gray-300' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
              }
            `}
          >
            <span className="flex items-center gap-1.5">
                {isLocked && <IconLock className="w-3 h-3 text-red-400"/>}
                <span>Day {day}</span>
            </span>
            {schedule && <span className="text-xs font-normal opacity-80 mt-0.5">{schedule}</span>}
          </button>
        )
      })}
    </div>
  );
};

export default DaySelector;
