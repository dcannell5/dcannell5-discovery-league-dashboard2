
import React, { useState, useEffect, useMemo } from 'react';
import type { LeagueConfig, AppData, Player } from '../types';
import HelpIcon from './HelpIcon';
import { IconDownload, IconTable, IconClipboardCheck, IconAlertCircle, IconCheck } from './Icon';

interface AdminPanelProps {
  appData: AppData;
  leagueConfig: LeagueConfig;
  onScheduleSave: (newSchedules: Record<number, string>) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ appData, leagueConfig, onScheduleSave }) => {
  const [schedules, setSchedules] = useState(leagueConfig.daySchedules || {});
  
  // Audit State
  const [showAudit, setShowAudit] = useState(false);
  const [auditDay, setAuditDay] = useState<number | 'all'>('all');
  const [auditTab, setAuditTab] = useState<'scores' | 'attendance'>('scores');
  
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

  // --- Audit Logic ---
  
  const auditData = useMemo(() => {
      const rows: any[] = [];
      const leagueMatchups = appData.allDailyMatchups[leagueConfig.id] || {};
      const leagueResults = appData.dailyResults[leagueConfig.id] || {};
      
      const daysToProcess = auditDay === 'all' 
        ? Object.keys(leagueMatchups).map(Number).sort((a,b) => a - b)
        : [auditDay];

      daysToProcess.forEach(day => {
          const courts = leagueMatchups[day] || {};
          Object.keys(courts).forEach(court => {
              const matchups = courts[court];
              const results = leagueResults[day]?.[court] || [];
              
              matchups.forEach((matchup, idx) => {
                  const result = results[idx];
                  const scores = (result && result !== 'unplayed') ? result : { teamAScore: null, teamBScore: null };
                  const isComplete = scores.teamAScore !== null && scores.teamBScore !== null;
                  
                  rows.push({
                      day,
                      court,
                      game: idx + 1,
                      teamA: matchup.teamA.map(p => p.name).join(', '),
                      teamB: matchup.teamB.map(p => p.name).join(', '),
                      scoreA: scores.teamAScore,
                      scoreB: scores.teamBScore,
                      status: isComplete ? 'Complete' : 'Incomplete'
                  });
              });
          });
      });
      return rows;
  }, [appData, leagueConfig.id, auditDay]);

  const attendanceIssues = useMemo(() => {
      const issues: any[] = [];
      const attendance = appData.allDailyAttendance[leagueConfig.id] || {};
      
      const daysToProcess = auditDay === 'all' 
          ? Object.keys(attendance).map(Number).sort((a,b) => a - b)
          : [auditDay];
          
      daysToProcess.forEach(day => {
          const playerAttendance = attendance[day] || {};
          Object.entries(playerAttendance).forEach(([playerId, games]) => {
             const missedGames = games.map((present, idx) => !present ? idx + 1 : null).filter(g => g !== null);
             if (missedGames.length > 0) {
                 const player = leagueConfig.players.find(p => p.id === parseInt(playerId));
                 if (player) {
                     issues.push({
                         day,
                         name: player.name,
                         missedGames: missedGames.join(', ')
                     });
                 }
             }
          });
      });
      return issues;
  }, [appData, leagueConfig, auditDay]);

  const handleAuditExport = () => {
      let csvContent = "data:text/csv;charset=utf-8,";
      
      if (auditTab === 'scores') {
          csvContent += "Day,Court,Game,Team A,Score A,Score B,Team B,Status\n";
          auditData.forEach(row => {
              const rowStr = `${row.day},"${row.court}",${row.game},"${row.teamA}",${row.scoreA ?? '-'},${row.scoreB ?? '-'},"${row.teamB}",${row.status}`;
              csvContent += rowStr + "\n";
          });
      } else {
          csvContent += "Day,Player Name,Missed Games\n";
          attendanceIssues.forEach(row => {
              csvContent += `${row.day},"${row.name}","${row.missedGames}"\n`;
          });
      }

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `league_audit_${auditTab}_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };


  return (
    <div className="my-8 p-6 bg-gray-800/50 rounded-2xl shadow-2xl border border-gray-700">
      <h2 className="text-2xl font-bold text-yellow-400 mb-6 text-center">
        League Admin Panel 
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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

      {/* Audit Section */}
      <div className="border-t border-gray-700 pt-8">
          <button 
            onClick={() => setShowAudit(!showAudit)}
            className="w-full flex items-center justify-between text-xl font-bold text-white mb-4 hover:text-yellow-400 transition-colors"
          >
             <span className="flex items-center gap-2">
                 <IconTable className="w-6 h-6"/>
                 Data Audit & Verification
                 <HelpIcon text="Double check data per week. Review a flat list of scores or check attendance anomalies." />
             </span>
             <span className="text-sm bg-gray-700 px-2 py-1 rounded">{showAudit ? 'Hide' : 'Show'}</span>
          </button>
          
          {showAudit && (
              <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-600">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                      <div className="flex gap-2">
                          <button 
                            onClick={() => setAuditTab('scores')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${auditTab === 'scores' ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700 text-gray-300'}`}
                          >
                              <IconTable className="w-4 h-4"/> Game Scores
                          </button>
                          <button 
                            onClick={() => setAuditTab('attendance')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${auditTab === 'attendance' ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700 text-gray-300'}`}
                          >
                              <IconClipboardCheck className="w-4 h-4"/> Attendance Check
                          </button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-400">Filter Day:</label>
                          <select 
                            value={auditDay} 
                            onChange={(e) => setAuditDay(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                            className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-yellow-400"
                          >
                              <option value="all">All Days</option>
                              {Array.from({ length: leagueConfig.totalDays }).map((_, i) => (
                                  <option key={i+1} value={i+1}>Day {i+1}</option>
                              ))}
                          </select>
                           <button onClick={handleAuditExport} className="p-2 bg-green-600/80 rounded hover:bg-green-500 ml-2" title="Export CSV">
                              <IconDownload className="w-4 h-4 text-white"/>
                           </button>
                      </div>
                  </div>

                  <div className="overflow-x-auto max-h-[500px]">
                      <table className="min-w-full divide-y divide-gray-700 text-sm">
                          <thead className="bg-gray-800 sticky top-0">
                              {auditTab === 'scores' ? (
                                  <tr>
                                      <th className="px-4 py-2 text-left text-gray-400">Day</th>
                                      <th className="px-4 py-2 text-left text-gray-400">Court</th>
                                      <th className="px-4 py-2 text-center text-gray-400">Game</th>
                                      <th className="px-4 py-2 text-left text-gray-400">Team A</th>
                                      <th className="px-4 py-2 text-center text-gray-400">Score</th>
                                      <th className="px-4 py-2 text-right text-gray-400">Team B</th>
                                      <th className="px-4 py-2 text-center text-gray-400">Status</th>
                                  </tr>
                              ) : (
                                  <tr>
                                      <th className="px-4 py-2 text-left text-gray-400">Day</th>
                                      <th className="px-4 py-2 text-left text-gray-400">Player</th>
                                      <th className="px-4 py-2 text-left text-gray-400">Missed Games</th>
                                      <th className="px-4 py-2 text-left text-gray-400">Check</th>
                                  </tr>
                              )}
                          </thead>
                          <tbody className="divide-y divide-gray-800 bg-gray-900/30">
                              {auditTab === 'scores' ? (
                                  auditData.length > 0 ? auditData.map((row, i) => (
                                      <tr key={i} className="hover:bg-gray-800/50">
                                          <td className="px-4 py-2 text-gray-300">{row.day}</td>
                                          <td className="px-4 py-2 text-gray-300 font-medium">{row.court}</td>
                                          <td className="px-4 py-2 text-center text-gray-400">{row.game}</td>
                                          <td className="px-4 py-2 text-gray-300 max-w-xs truncate" title={row.teamA}>{row.teamA}</td>
                                          <td className="px-4 py-2 text-center">
                                              <span className="font-bold text-white">{row.scoreA ?? '-'}</span>
                                              <span className="mx-1 text-gray-500">:</span>
                                              <span className="font-bold text-white">{row.scoreB ?? '-'}</span>
                                          </td>
                                          <td className="px-4 py-2 text-right text-gray-300 max-w-xs truncate" title={row.teamB}>{row.teamB}</td>
                                          <td className="px-4 py-2 text-center">
                                              {row.status === 'Complete' 
                                                ? <span className="text-green-400 text-xs px-2 py-0.5 rounded bg-green-900/30">Complete</span>
                                                : <span className="text-yellow-400 text-xs px-2 py-0.5 rounded bg-yellow-900/30">Incomplete</span>
                                              }
                                          </td>
                                      </tr>
                                  )) : <tr><td colSpan={7} className="text-center py-8 text-gray-500">No game data found for selected period.</td></tr>
                              ) : (
                                  attendanceIssues.length > 0 ? attendanceIssues.map((row, i) => (
                                      <tr key={i} className="hover:bg-gray-800/50">
                                          <td className="px-4 py-2 text-gray-300">{row.day}</td>
                                          <td className="px-4 py-2 text-white font-medium">{row.name}</td>
                                          <td className="px-4 py-2 text-red-400">Games: {row.missedGames}</td>
                                          <td className="px-4 py-2 text-gray-500 text-xs">
                                              <div className="flex items-center gap-1">
                                                <IconAlertCircle className="w-3 h-3 text-yellow-500"/> Verify
                                              </div>
                                          </td>
                                      </tr>
                                  )) : <tr><td colSpan={4} className="text-center py-8 text-green-500"><div className="flex flex-col items-center gap-2"><IconCheck className="w-6 h-6"/><span>Perfect Attendance! No absences recorded.</span></div></td></tr>
                              )}
                          </tbody>
                      </table>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};

export default AdminPanel;
