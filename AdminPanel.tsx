


import React, { useState, useEffect, useCallback } from 'react';
import type { AdminFeedback, PlayerFeedback, LeagueConfig, AppData, LoginCounts } from '../types';
import { getPlayerCode, getParentCode, getRefereeCodeForCourt } from '../utils/auth';
import { getAllCourtNames } from '../utils/leagueLogic';
import HelpIcon from './HelpIcon';
import { IconLightbulb, IconRefresh, IconDownload, IconUsers, IconShieldCheck, IconShieldExclamation } from './Icon';

interface AdminPanelProps {
  appData: AppData;
  leagueConfig: LeagueConfig;
  onScheduleSave: (newSchedules: Record<number, string>) => void;
  allPlayerPINs: Record<number, string>;
  onResetPlayerPIN: (playerId: number) => void;
  allAdminFeedback: AdminFeedback[];
  allPlayerFeedback: PlayerFeedback[];
  loginCounters: Record<number, LoginCounts>;
}

const CodeRow: React.FC<{label: string, code: string, isPIN?: boolean, onReset?: () => void}> = ({label, code, isPIN, onReset}) => (
    <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">{label}:</span>
        <div className="flex items-center gap-2">
          <code 
              className="bg-gray-900 text-yellow-300 px-2 py-1 rounded cursor-pointer hover:bg-gray-800"
              onClick={() => navigator.clipboard.writeText(code)}
              title="Click to copy"
          >
              {isPIN ? '****' : code}
          </code>
          {isPIN && (
            <button onClick={onReset} title="Reset PIN to default code" className="text-gray-500 hover:text-red-400">
              <IconRefresh className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
    </div>
);

const AdminPanel: React.FC<AdminPanelProps> = ({ appData, leagueConfig, onScheduleSave, allPlayerPINs, onResetPlayerPIN, allAdminFeedback, allPlayerFeedback, loginCounters }) => {
  const today = new Date();
  const courtNames = getAllCourtNames(leagueConfig);
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

  const handleResetPIN = (playerId: number, playerName: string) => {
    if (window.confirm(`Are you sure you want to reset the PIN for ${playerName}? They will need to use their default code to log in again.`)) {
      onResetPlayerPIN(playerId);
    }
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
              Daily Referee Codes
              <HelpIcon text="These codes change daily. One for each court."/>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courtNames.map(courtName => (
                <div key={courtName} className="bg-gray-700/50 p-3 rounded-lg space-y-2">
                  <h4 className="font-bold text-white text-center">{courtName}</h4>
                  <CodeRow label="Access Code" code={getRefereeCodeForCourt(today, courtName)} />
                </div>
              ))}
              {courtNames.length === 0 && <p className="text-gray-500 text-center col-span-full">No courts available.</p>}
            </div>
          </div>
          
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

           <div>
                <h3 className="text-lg font-semibold text-white mb-3 text-center flex items-center justify-center">
                    Data Backup
                    <HelpIcon text="Export a JSON file containing all league data. It's a good idea to do this after finalizing each day's scores."/>
                </h3>
                <button onClick={handleExport} className="w-full bg-green-600/80 hover:bg-green-500 text-white font-semibold p-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <IconDownload className="w-6 h-6"/> Export Full Backup
                </button>
           </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3 text-center flex items-center justify-center">
              <IconLightbulb className="w-5 h-5 mr-2" />
              Referee Feedback
              <HelpIcon text="Ideas and comments submitted by referees."/>
            </h3>
            <div className="bg-gray-700/50 p-3 rounded-lg space-y-3 max-h-60 overflow-y-auto">
              {allAdminFeedback.length > 0 ? (
                [...allAdminFeedback].reverse().map(feedback => (
                  <div key={feedback.id} className="bg-gray-900/70 p-3 rounded-md">
                    <p className="text-gray-200 text-sm whitespace-pre-wrap">"{feedback.feedbackText}"</p>
                    <p className="text-xs text-gray-400 mt-2 text-right">
                        — From {feedback.submittedBy.court} on {new Date(feedback.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center text-sm py-4">No referee feedback has been submitted yet.</p>
              )}
            </div>
          </div>

        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 text-center flex items-center justify-center">
              Player & Parent Codes
              <HelpIcon text="Permanent access codes. Click a code to copy it. Use the refresh icon to reset a custom PIN."/>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] lg:max-h-[500px] overflow-y-auto pr-2">
              {leagueConfig.players.sort((a,b) => a.name.localeCompare(b.name)).map(player => (
                <div key={player.id} className="bg-gray-700/50 p-3 rounded-lg space-y-2">
                  <h4 className="font-bold text-white text-center border-b border-gray-600 pb-2">{player.name}</h4>
                  <CodeRow label="Player Code" code={getPlayerCode(player)} />
                  <CodeRow label="Parent Code" code={getParentCode(player)} />
                  {allPlayerPINs[player.id] && (
                    <div className="border-t border-dashed border-gray-600 pt-2 mt-2">
                      <CodeRow 
                        label="Custom PIN" 
                        code={allPlayerPINs[player.id]}
                        isPIN={true}
                        onReset={() => handleResetPIN(player.id, player.name)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
           <div>
            <h3 className="text-lg font-semibold text-white mb-3 text-center flex items-center justify-center">
              <IconUsers className="w-5 h-5 mr-2" />
              Player Login Activity
              <HelpIcon text="Tracks the number of times each user type logs in."/>
            </h3>
            <div className="bg-gray-700/50 p-3 rounded-lg max-h-60 overflow-y-auto">
                <div className="sticky top-0 bg-gray-700/50 grid grid-cols-4 gap-2 text-xs font-bold text-gray-400 border-b border-gray-600 pb-2 mb-2">
                    <span>Player</span>
                    <span className="text-center">Player</span>
                    <span className="text-center">Parent</span>
                    <span className="text-center">PIN Set?</span>
                </div>
                <div className="space-y-2">
                {leagueConfig.players.sort((a,b) => a.name.localeCompare(b.name)).map(player => {
                    const counts = loginCounters[player.id] || { playerLogins: 0, parentLogins: 0 };
                    const hasPIN = !!allPlayerPINs[player.id];
                    return (
                        <div key={player.id} className="grid grid-cols-4 gap-2 items-center text-sm">
                            <span className="text-white truncate">{player.name}</span>
                            <span className="text-center text-gray-300">{counts.playerLogins}</span>
                            <span className="text-center text-gray-300">{counts.parentLogins}</span>
                            <span className={`text-center font-semibold ${hasPIN ? 'text-green-400' : 'text-gray-500'}`}>{hasPIN ? 'Yes' : 'No'}</span>
                        </div>
                    );
                })}
                </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3 text-center flex items-center justify-center">
              <IconLightbulb className="w-5 h-5 mr-2" />
              Player & Parent Feedback
              <HelpIcon text="Ideas and comments submitted by players and their parents."/>
            </h3>
            <div className="bg-gray-700/50 p-3 rounded-lg space-y-3 max-h-60 overflow-y-auto">
              {allPlayerFeedback.length > 0 ? (
                [...allPlayerFeedback].reverse().map(feedback => (
                  <div key={feedback.id} className="bg-gray-900/70 p-3 rounded-md">
                    <p className="text-gray-200 text-sm whitespace-pre-wrap">"{feedback.feedbackText}"</p>
                    <p className="text-xs text-gray-400 mt-2 text-right">
                        — From {feedback.submittedBy.playerName} ({feedback.submittedBy.role}) on {new Date(feedback.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center text-sm py-4">No player or parent feedback has been submitted yet.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminPanel;