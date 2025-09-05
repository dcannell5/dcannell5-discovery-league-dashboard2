

import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { LeagueConfig, Player } from '../types';
import { IconVolleyball, IconSettings, IconUpload } from './Icon';
import { getDefaultCourtName } from '../utils/leagueLogic';

interface SetupScreenProps {
  onSetupComplete: (config: Omit<LeagueConfig, 'id'>) => void;
  onCancel?: () => void;
}

const combinations = (n: number, k: number): number => {
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;
    if (k > n / 2) k = n - k;
    let res = 1;
    for (let i = 1; i <= k; i++) {
        res = res * (n - i + 1) / i;
    }
    return res;
};


const SetupScreen: React.FC<SetupScreenProps> = ({ onSetupComplete, onCancel }) => {
  const [leagueType, setLeagueType] = useState<'standard' | 'custom'>('standard');

  // Common fields
  const [title, setTitle] = useState('Discovery League');
  const [totalDays, setTotalDays] = useState(4);
  const [playerNames, setPlayerNames] = useState('');
  const [announcements, setAnnouncements] = useState('Welcome to the league! Check back here for updates.');
  
  // Custom tournament fields
  const [customNumCourts, setCustomNumCourts] = useState(3);
  const [customPlayersPerSide, setCustomPlayersPerSide] = useState(2);
  const [customGamesPerDay, setCustomGamesPerDay] = useState(6);

  // Standard league fields
  const [standardPlayersPerTeam, setStandardPlayersPerTeam] = useState(9);
  
  // Advanced settings
  const [courtNames, setCourtNames] = useState<string[]>([]);
  const [daySchedules, setDaySchedules] = useState<Record<number, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState('');

  // Estimator fields
  const [gameDuration, setGameDuration] = useState(15);
  
  const fileInputRef = useRef<HTMLInputElement>(null);


  const parsedPlayers = useMemo(() => playerNames.split('\n').filter(Boolean), [playerNames]);
  const totalPlayers = parsedPlayers.length;
  
  useEffect(() => {
    // Reset fields to defaults when switching league type
    if (leagueType === 'standard') {
        setStandardPlayersPerTeam(9);
    } else {
        setCustomNumCourts(3);
        setCustomPlayersPerSide(2);
        setCustomGamesPerDay(6);
    }
  }, [leagueType]);
  
  const { playersPerTeam, gamesPerDay, numCourts } = useMemo(() => {
    if (leagueType === 'standard') {
      const playersPerCourt = standardPlayersPerTeam * 2;
      const calculatedNumCourts = playersPerCourt > 0 && totalPlayers > 0 
          ? Math.floor(totalPlayers / playersPerCourt) 
          : 0;
      return {
        playersPerTeam: standardPlayersPerTeam,
        gamesPerDay: 6,
        numCourts: calculatedNumCourts,
      };
    } else { // Custom
      return {
        playersPerTeam: customPlayersPerSide,
        gamesPerDay: customGamesPerDay,
        numCourts: customNumCourts,
      };
    }
  }, [leagueType, totalPlayers, standardPlayersPerTeam, customNumCourts, customPlayersPerSide, customGamesPerDay]);


  useEffect(() => {
    const defaultNames = Array.from({ length: numCourts }, (_, i) => getDefaultCourtName(i, numCourts));
    setCourtNames(defaultNames);
  }, [numCourts]);
  
  // Estimator calculation
  const estimatorResult = useMemo(() => {
    if (totalPlayers < 2 || playersPerTeam !== 2 || leagueType !== 'custom') return null;
    const totalPossiblePairs = combinations(totalPlayers, 2);
    const pairsPerGame = numCourts * 2; // 2 pairs per court
    if(pairsPerGame === 0) return null;
    const gamesNeeded = Math.ceil(totalPossiblePairs / pairsPerGame);
    const totalTimeMinutes = gamesNeeded * gameDuration;
    const hours = Math.floor(totalTimeMinutes / 60);
    const minutes = totalTimeMinutes % 60;
    return {
        totalPossiblePairs,
        gamesNeeded,
        time: `${hours}h ${minutes}m`
    };
  }, [totalPlayers, numCourts, gameDuration, playersPerTeam, leagueType]);

  const handleCourtNameChange = (index: number, name: string) => {
    const newCourtNames = [...courtNames];
    newCourtNames[index] = name;
    setCourtNames(newCourtNames);
  };
  
  const handleScheduleChange = (day: number, value: string) => {
    setDaySchedules(prev => ({...prev, [day]: value}));
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result as string;
            const lines = text.split(/\r\n|\n/);
            // Ignore header if it's 'Name'
            const startIndex = lines[0].trim().toLowerCase() === 'name' ? 1 : 0;
            const names = lines.slice(startIndex)
                               .map(line => line.split(',')[0].trim()) // Take only first column
                               .filter(name => name); // Filter out empty lines
            setPlayerNames(names.join('\n'));
        } catch (error) {
            setError('Failed to parse CSV file.');
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset for re-upload
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (totalPlayers === 0) {
        setError('Please add at least one player.');
        return;
    }
    
    if (leagueType === 'standard') {
      const playersPerCourt = playersPerTeam * 2;
      if (playersPerCourt <= 0 || totalPlayers % playersPerCourt !== 0) {
        setError(`For a Standard League, the total number of players must be a multiple of 'Players Per Team' x 2. You have ${totalPlayers} players, which is not divisible by ${playersPerCourt}.`);
        return;
      }
    } else { // Custom
        const playersPerCourt = playersPerTeam * 2;
        if (totalPlayers < playersPerCourt) {
            setError(`You need at least ${playersPerCourt} players for ${numCourts} court(s) with ${playersPerTeam} players per side.`);
            return;
        }
    }

    const players: Player[] = parsedPlayers.map((name, index) => ({ id: index + 1, name }));

    onSetupComplete({
      title,
      totalDays,
      players,
      announcements,
      daySchedules,
      leagueType,
      numCourts,
      playersPerTeam,
      gamesPerDay,
      courtNames: courtNames.slice(0, numCourts),
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-2xl mx-auto p-8 bg-gray-800/50 rounded-2xl shadow-2xl border border-gray-700">
        <div className="text-center">
            <div className="flex justify-center items-center gap-3 mb-4">
                <IconVolleyball className="w-10 h-10 text-yellow-400" />
                <h1 className="text-3xl font-bold text-white">
                    Event Setup
                </h1>
            </div>
            <p className="text-gray-400 mb-8">Configure your new event to get started.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">What kind of event are you creating?</label>
                <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setLeagueType('standard')} className={`p-3 rounded-lg border-2 text-center transition-all ${leagueType === 'standard' ? 'bg-yellow-500/10 border-yellow-500' : 'bg-gray-700 border-gray-600 hover:border-gray-500'}`}>
                        <span className="font-bold text-white">Standard League</span>
                        <span className="text-xs block text-gray-400">Day 1 discovery, ranked after.</span>
                    </button>
                    <button type="button" onClick={() => setLeagueType('custom')} className={`p-3 rounded-lg border-2 text-center transition-all ${leagueType === 'custom' ? 'bg-yellow-500/10 border-yellow-500' : 'bg-gray-700 border-gray-600 hover:border-gray-500'}`}>
                        <span className="font-bold text-white">Custom Tournament</span>
                        <span className="text-xs block text-gray-400">Total control. All days are mixed.</span>
                    </button>
                </div>
            </div>

            <div className="border-t border-gray-700 pt-6 space-y-6">
                <div>
                    <label htmlFor="league-title" className="block text-sm font-medium text-gray-300 mb-1">Event Title</label>
                    <input
                        type="text"
                        id="league-title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        required
                    />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="total-days" className="block text-sm font-medium text-gray-300 mb-1">Total Days</label>
                        <input
                            type="number"
                            id="total-days"
                            value={totalDays}
                            onChange={(e) => setTotalDays(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            min="1"
                            required
                        />
                    </div>
                     {leagueType === 'custom' ? (
                        <div>
                             <label htmlFor="games-per-day" className="block text-sm font-medium text-gray-300 mb-1">Games Per Day</label>
                            <input
                                type="number"
                                id="games-per-day"
                                value={customGamesPerDay}
                                onChange={(e) => setCustomGamesPerDay(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                min="1"
                                required
                            />
                        </div>
                    ) : (
                        <div className="bg-gray-700/50 p-3 rounded-lg text-center">
                            <span className="block text-xs text-gray-400">Games Per Day</span>
                            <span className="block font-bold text-lg text-white">6</span>
                        </div>
                    )}
                </div>

                {leagueType === 'standard' ? (
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label htmlFor="standard-players-per-team" className="block text-sm font-medium text-gray-300 mb-1">Players Per Team (incl. subs)</label>
                            <input
                                type="number"
                                id="standard-players-per-team"
                                value={standardPlayersPerTeam}
                                onChange={(e) => setStandardPlayersPerTeam(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                min="1"
                                required
                            />
                        </div>
                        <div className="bg-gray-700/50 p-3 rounded-lg text-center">
                            <span className="block text-xs text-gray-400">Calculated Courts</span>
                            <span className="block font-bold text-lg text-white">{numCourts > 0 ? numCourts : '...'}</span>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="num-courts" className="block text-sm font-medium text-gray-300 mb-1">Number of Courts</label>
                            <input
                                type="number"
                                id="num-courts"
                                value={customNumCourts}
                                onChange={(e) => setCustomNumCourts(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                min="1"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="players-per-side" className="block text-sm font-medium text-gray-300 mb-1">Players Per Side</label>
                            <input
                                type="number"
                                id="players-per-side"
                                value={customPlayersPerSide}
                                onChange={(e) => setCustomPlayersPerSide(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                min="1"
                                required
                            />
                        </div>
                    </div>
                )}
            </div>
            
            <div>
                 <div className="flex justify-between items-center mb-1">
                    <label htmlFor="player-roster" className="block text-sm font-medium text-gray-300">Player Roster</label>
                    <button 
                        type="button" 
                        onClick={handleUploadClick}
                        className="flex items-center gap-2 text-xs font-semibold text-yellow-400 hover:text-yellow-300 transition-colors"
                    >
                        <IconUpload className="w-4 h-4" />
                        Upload CSV
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
                 </div>
                <textarea
                    id="player-roster"
                    rows={10}
                    value={playerNames}
                    onChange={(e) => setPlayerNames(e.target.value)}
                    placeholder="Enter one player name per line, or upload a CSV file."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    required
                />
                 {leagueType === 'standard' ? (
                     <p className="text-xs text-gray-500 mt-1">Total player count must be a multiple of ({playersPerTeam} x 2 = {playersPerTeam * 2}) to ensure full courts.</p>
                 ) : (
                     <p className="text-xs text-gray-500 mt-1">Each court requires {playersPerTeam * 2} players. Your roster has {totalPlayers} players.</p>
                 )}
            </div>

             {leagueType === 'custom' && playersPerTeam === 2 && (
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                    <h4 className="font-semibold text-white mb-3 text-center">2v2 Tournament Estimator</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label htmlFor="game-duration" className="block text-sm font-medium text-gray-300 mb-1">Game Duration (min)</label>
                             <input type="number" id="game-duration" value={gameDuration} onChange={e => setGameDuration(parseInt(e.target.value) || 15)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"/>
                        </div>
                        <div className="text-center bg-gray-800/50 p-3 rounded-lg">
                             <span className="block text-xs text-gray-400">Est. Time for Full Pairing</span>
                             <span className="block font-bold text-lg text-yellow-400">{estimatorResult ? estimatorResult.time : '-'}</span>
                             <span className="block text-xs text-gray-500">({estimatorResult?.gamesNeeded} games)</span>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="border-t border-gray-700 pt-4">
                 <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300 w-full text-left font-semibold">
                    <IconSettings className="w-4 h-4" />
                    {showAdvanced ? 'Hide' : 'Show'} Advanced Settings (Court Names & Scheduling)
                </button>
                {showAdvanced && (
                    <div className="mt-4 space-y-6 bg-gray-900/50 p-4 rounded-lg">
                        {numCourts > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Custom Court Names</label>
                                <div className="space-y-2">
                                    {Array.from({ length: numCourts }).map((_, i) => (
                                        <input
                                            key={i}
                                            type="text"
                                            value={courtNames[i] || ''}
                                            onChange={(e) => handleCourtNameChange(i, e.target.value)}
                                            placeholder={`Court ${i+1} Name`}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                        />
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Court order determines player ranking groups (1st is highest).</p>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Day Schedule (Optional)</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {Array.from({ length: totalDays }).map((_, i) => (
                                    <div key={i}>
                                        <label htmlFor={`day-${i+1}-schedule`} className="text-xs text-gray-400">Day {i+1}</label>
                                        <input
                                            type="datetime-local"
                                            id={`day-${i+1}-schedule`}
                                            value={daySchedules[i+1] || ''}
                                            onChange={e => handleScheduleChange(i + 1, e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div>
                <label htmlFor="announcements" className="block text-sm font-medium text-gray-300 mb-1">Initial Announcement (Optional)</label>
                <textarea
                    id="announcements"
                    rows={3}
                    value={announcements}
                    onChange={(e) => setAnnouncements(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
            </div>
          
            {error && <p className="text-red-400 text-sm">{error}</p>}
          
            <div className="flex flex-col-reverse sm:flex-row gap-4 pt-2">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-full sm:w-auto px-6 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    className="w-full flex-1 py-3 px-4 bg-yellow-500 text-gray-900 font-bold rounded-lg hover:bg-yellow-400 transition-all duration-300 disabled:bg-gray-600"
                >
                    Create Event
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default SetupScreen;