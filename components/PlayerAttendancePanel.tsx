

import React from 'react';
import type { AllDailyAttendance, LeagueConfig, UserState } from '../types';
import { IconUserCheck, IconChevronDown } from './Icon';

interface PlayerAttendancePanelProps {
  leagueConfig: LeagueConfig;
  userState: UserState;
  allAttendance: AllDailyAttendance;
  onSetPlayerDailyAttendance: (day: number, playerId: number, isPresent: boolean) => void;
  realCurrentLeagueDay: number;
}

const PlayerAttendancePanel: React.FC<PlayerAttendancePanelProps> = ({
  leagueConfig,
  userState,
  allAttendance,
  onSetPlayerDailyAttendance,
  realCurrentLeagueDay,
}) => {
  const [isOpen, setIsOpen] = React.useState(true);

  if (userState.role !== 'PLAYER' && userState.role !== 'PARENT') {
    return null;
  }

  const { playerId } = userState;

  const handleToggle = (day: number, isPresent: boolean) => {
    onSetPlayerDailyAttendance(day, playerId, !isPresent);
  };

  return (
    <div className="my-8 bg-gray-800/50 rounded-2xl shadow-2xl border border-teal-500/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-6 text-lg font-bold text-teal-400 hover:text-teal-300 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-3">
          <IconUserCheck className="w-6 h-6" /> My Attendance
        </span>
        <IconChevronDown className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="px-6 pb-6">
          <p className="text-sm text-gray-400 mb-4">
            Let coaches know if you'll be absent for a league day. This helps with planning and team balancing.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: leagueConfig.totalDays }, (_, i) => i + 1).map(day => {
              const isPresent = allAttendance[day]?.[playerId]?.[0] ?? true;
              const scheduleDate = leagueConfig.daySchedules?.[day] 
                ? new Date(leagueConfig.daySchedules[day]).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) 
                : null;
              
              const isDayLockedByAdmin = leagueConfig.lockedDays?.[day] === true;
              const isPastDay = day < realCurrentLeagueDay;
              const isEditable = !isDayLockedByAdmin && !isPastDay;

              return (
                <div key={day} className={`p-3 rounded-lg text-center border-2 ${
                  isDayLockedByAdmin ? 'border-red-500/50 bg-red-900/20' :
                  !isEditable ? 'border-gray-600/50 bg-gray-800/30' :
                  (isPresent ? 'border-green-500/50 bg-green-900/20' : 'border-red-500/50 bg-red-900/20')
                }`}>
                  <div className={`font-bold ${!isEditable ? 'text-gray-400' : 'text-white'}`}>Day {day}</div>
                  {scheduleDate && <div className="text-xs text-gray-400 mb-2">{scheduleDate}</div>}
                  
                  {isEditable ? (
                    <button
                      onClick={() => handleToggle(day, isPresent)}
                      className={`w-full py-1.5 px-3 rounded font-bold text-sm transition-colors ${
                        isPresent
                          ? 'bg-green-600 hover:bg-green-500 text-white'
                          : 'bg-red-600 hover:bg-red-500 text-white'
                      }`}
                    >
                      {isPresent ? 'Attending' : 'Absent'}
                    </button>
                  ) : (
                      <div className={`w-full py-1.5 px-3 rounded font-bold text-sm ${
                          isDayLockedByAdmin ? 'text-red-300' :
                          (isPresent ? 'text-green-400' : 'text-red-400')
                      }`}>
                          {isDayLockedByAdmin ? 'Locked' : (isPresent ? 'Attended' : 'Absent')}
                      </div>
                  )}
                </div>
              );
            })}
          </div>
           <p className="text-xs text-gray-500 mt-4 text-center">
            Attendance for past or admin-locked days cannot be changed. Please contact a league admin for any necessary changes.
          </p>
        </div>
      )}
    </div>
  );
};

export default PlayerAttendancePanel;