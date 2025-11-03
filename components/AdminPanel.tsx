

import React, { useState, useEffect } from 'react';
import type { LeagueConfig, AppData } from '../types';
import HelpIcon from './HelpIcon';
import { IconDownload } from './Icon';

interface AdminPanelProps {
  appData: AppData;
  leagueConfig: LeagueConfig;
  onScheduleSave: (newSchedules: Record<number, string>) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ appData, leagueConfig, onScheduleSave }) => {
  const [schedules, setSchedules] = useState(leagueConfig.daySchedules || {});
  
  useEffect(() => {
    setSchedules(leagueConfig.daySchedules || {});
  }, [leagueConfig.daySchedules]);
  
  const handleScheduleChange = (day: number, value: string) => {
    const newSchedules = {...schedules, [day]: value };
    setSchedules(newSchedules);
  };
  
  const handleSaveSchedules = () => {
    onScheduleSave(schedules);
    alert('Schedule updated!');
  };

  const handleExport = () => {
    if (!appData) return;
    const dataStr = JSON.stringify(appData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `discovery-league-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="my-8 p-6 bg-gray-800/50 rounded-2xl shadow-2xl border border-gray-700">
      <h2 className="text-2xl font-bold text-yellow-400 mb-6 text-center">
        League Admin Panel 
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 text-center flex items-center justify-center">
                Day Schedule
                <HelpIcon text="Set the date and time for each event day."/>
            </h3>
             <div className="bg-gray-700/50 p-3 rounded-lg space-y-3">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Array.from({ length: leagueConfig.totalDays }).map((_, i) => (
                        <div key={i}>
                            <label htmlFor={`day-${i+1}-schedule-admin`} className="text-xs text-gray-400">Day {i+1}</label>
                            <input
                                type="datetime-local"
                                id={`day-${i+1}-schedule-admin`}
                                value={schedules[i+1] || ''}
                                onChange={e => handleScheduleChange(i + 1, e.target.value)}
                                className="w-full mt-1 px-2 py-1 bg-gray-900 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400"
                            />
                        </div>
                    ))}
                </div>
                 <button onClick={handleSaveSchedules} className="w-full mt-2 px-4 py-2 text-sm font-bold rounded-lg bg-yellow-500 text-gray-900 hover:bg-yellow-400 transition-colors">
                    Save Schedule
                </button>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
           <div>
                <h3 className="text-lg font-semibold text-white mb-3 text-center flex items-center justify-center">
                    Data Backup
                    <HelpIcon text="Export a JSON file containing all league data. It's a good idea to do this after finalizing each day's scores."/>
                </h3>
                <button onClick={handleExport} className="w-full bg-green-600/80 hover:bg-green-500 text-white font-semibold p-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <IconDownload className="w-6 h-6"/> Export Full Backup
                </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
