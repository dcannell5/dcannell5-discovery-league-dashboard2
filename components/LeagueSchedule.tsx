import React from 'react';
import type { LeagueConfig } from '../types';
import { IconCalendar } from './Icon';

interface LeagueScheduleProps {
  leagueConfig: LeagueConfig;
}

const LeagueSchedule: React.FC<LeagueScheduleProps> = ({ leagueConfig }) => {
  const { totalDays, daySchedules = {} } = leagueConfig;

  const formatSchedule = (dateString?: string) => {
    if (!dateString) return 'Not Scheduled';
    try {
      const date = new Date(dateString);
      return date.toLocaleString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <div className="my-8 p-6 bg-gray-800/50 rounded-2xl shadow-2xl border border-gray-700">
      <h2 className="text-2xl font-bold text-center text-yellow-400 mb-6 flex items-center justify-center gap-3">
        <IconCalendar className="w-6 h-6" />
        League Schedule
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => (
          <div key={day} className="bg-gray-700/50 p-4 rounded-lg flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-900/50 flex flex-col items-center justify-center text-yellow-400">
              <span className="text-xs">DAY</span>
              <span className="text-xl font-bold">{day}</span>
            </div>
            <div>
              <p className="font-semibold text-white">{formatSchedule(daySchedules[day])}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeagueSchedule;