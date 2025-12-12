
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Player, AllDailyResults, GameResult, UserState, AllDailyMatchups, AllDailyAttendance, LeagueConfig, CourtResults, CoachingTip, AppData } from '../types';
import { generateCoachingTip } from '../services/geminiService';
import { generateDailyMatchups, getAllCourtNames } from '../utils/leagueLogic';
import { getActiveDay } from '../utils/auth';
import { useLeagueStats } from '../utils/hooks';
import { initializePlayerStats, processDayResults } from '../utils/statsLogic';
import Header from './Header';
import Leaderboard from './Leaderboard';
import DaySelector from './DaySelector';
import ScoreEntryDashboard from './ScoreEntryDashboard';
import Announcements from './Announcements';
import AdminPanel from './AdminPanel';
import LinksAndShare from './LinksAndShare';
import { IconLightbulb, IconQuote, IconVideo, IconLock, IconMessage, IconSettings } from './Icon';
import TeamOfTheDay from './TeamOfTheDay';
import PublicGamesDisplay from './PublicGamesDisplay';
import LeagueSchedule from './LeagueSchedule';
import FullPlayerRankings from './FullPlayerRankings';

interface DashboardProps {
    appData: AppData;
    leagueConfig: LeagueConfig;
    userState: UserState;
    onLoginClick: () => void;
    onLogout: () => void;
    onDeleteLeague: () => void;
    onSwitchLeague: () => void;
    onAnnouncementsSave: (newText: string) => void;
    onScheduleSave: (newSchedules: Record<number, string>) => void;
    onToggleDayLock: (day: number) => void;
    gameResults: AllDailyResults;
    setGameResults: React.Dispatch<React.SetStateAction<AllDailyResults>>;
    allMatchups: AllDailyMatchups;
    setAllMatchups: React.Dispatch<React.SetStateAction<AllDailyMatchups>>;
    allAttendance: AllDailyAttendance;
    setAllAttendance: React.Dispatch<React.SetStateAction<AllDailyAttendance>>;
    teamOfTheDay: Record<number, { teamPlayerIds: number[], summary: string }>;
    setTeamOfTheDay: React.Dispatch<React.SetStateAction<Record<number, { teamPlayerIds: number[], summary: string }>>>;
}

const InfoCard: React.FC<{icon: React.ReactNode, title: string, children: React.ReactNode, className?: string}> = ({icon, title, children, className}) => (
    <div className={`bg-gray-700/50 p-4 rounded-lg flex flex-col ${className}`}>
        <h4 className="text-sm font-bold text-yellow-400 mb-2 flex items-center gap-2">
            {icon}
            {title}
        </h4>
        <div className="text-gray-300 text-sm flex-grow">{children}</div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({
    appData, leagueConfig, userState, onLoginClick, onLogout, onDeleteLeague, onSwitchLeague, onAnnouncementsSave, onScheduleSave,
    onToggleDayLock,
    gameResults, setGameResults, allMatchups, setAllMatchups, allAttendance, setAllAttendance,
    teamOfTheDay, setTeamOfTheDay
}) => {
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [selectedCourt, setSelectedCourt] = useState<string | null>(null);
  const [coachingTip, setCoachingTip] = useState<CoachingTip | null>(null);
  const [isLoadingCoachingTip, setIsLoadingCoachingTip] = useState<boolean>(false);
  const [coachingTipError, setCoachingTipError] = useState<string>('');
  const [isSwapMode, setIsSwapMode] = useState(false);
  const [playerToSwap, setPlayerToSwap] = useState<{ player: Player; gameIndex: number } | null>(null);
  const [printableContent, setPrintableContent] = useState<React.ReactNode | null>(null);
  const [isGeneratingTeam, setIsGeneratingTeam] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const realCurrentLeagueDay = useMemo(() => getActiveDay(new Date(), leagueConfig), [leagueConfig]);
  const isDayLocked = !!leagueConfig.lockedDays?.[currentDay];
  const courtKeys = useMemo(() => getAllCourtNames(leagueConfig), [leagueConfig]);

  useEffect(() => {
    // Set the initial current day based on the schedule for all users.
    setCurrentDay(realCurrentLeagueDay);
  }, [realCurrentLeagueDay]);

  useEffect(() => {
    // Set the initial court view for the public dashboard
    if (courtKeys && courtKeys.length > 0) {
        setSelectedCourt(courtKeys[0]);
    } else {
        setSelectedCourt(null);
    }
}, [courtKeys, currentDay]);

  // -- REFACTORED STATS CALCULATION --
  // Calculate stats for generating matchups (up to day before current)
  const { sortedPlayers: playersForGenerator } = useLeagueStats(
    leagueConfig,
    gameResults,
    allMatchups,
    allAttendance,
    currentDay - 1
  );

  // Calculate stats for display (up to current day)
  const { sortedPlayers: sortedDisplayPlayers } = useLeagueStats(
    leagueConfig,
    gameResults,
    allMatchups,
    allAttendance,
    currentDay
  );

  
  const dayHasResults = useMemo(() => {
    const dayResults = gameResults[currentDay];
    if (!dayResults) return false;
    // Check if any game result has a score entered
    return Object.values(dayResults).some((courtResults: CourtResults) =>
        courtResults.some(result => result !== 'unplayed' && (result.teamAScore !== null || result.teamBScore !== null))
    );
  }, [gameResults, currentDay]);

  // Effect to generate matchups for the current day if they don't exist.
  useEffect(() => {
    if ((allMatchups[currentDay] && Object.keys(allMatchups[currentDay]).length > 0) || leagueConfig.players.length === 0) {
      return; // Matchups already exist or no players
    }
    
    const newDayMatchups = generateDailyMatchups(currentDay, playersForGenerator, leagueConfig);

    if (Object.keys(newDayMatchups).length > 0) {
      setAllMatchups(prev => ({
        ...prev,
        [currentDay]: newDayMatchups,
      }));
    }
  }, [currentDay, allMatchups, leagueConfig, setAllMatchups, playersForGenerator]);
  
  
  useEffect(() => {
    setCoachingTip(null);
    setCoachingTipError('');
  }, [currentDay]);

  const handleGameResultChange = useCallback((day: number, court: string, gameIndex: number, result: GameResult) => {
    if (leagueConfig.lockedDays?.[day]) {
      alert("This day is locked. Please ask a Super Admin to unlock it before making changes.");
      return;
    }
    setGameResults(prev => {
        const newResults: AllDailyResults = JSON.parse(JSON.stringify(prev));
        if (!newResults[day]) newResults[day] = {};
        if (!newResults[day][court]) {
            newResults[day][court] = Array(leagueConfig.gamesPerDay).fill('unplayed') as CourtResults;
        }
        newResults[day][court][gameIndex] = result;
        return newResults;
    });
  }, [setGameResults, leagueConfig.gamesPerDay, leagueConfig.lockedDays]);

  const handleAttendanceChange = useCallback((day: number, playerId: number, gameIndex: number, isPresent: boolean) => {
      if (leagueConfig.lockedDays?.[day]) {
        alert("This day is locked and attendance cannot be changed.");
        return;
      }
      setAllAttendance(prev => {
          const newAttendance: AllDailyAttendance = JSON.parse(JSON.stringify(prev));
          if (!newAttendance[day]) newAttendance[day] = {};
          if (!newAttendance[day][playerId]) newAttendance[day][playerId] = Array(leagueConfig.gamesPerDay).fill(true);
          newAttendance[day][playerId]![gameIndex] = isPresent;
          return newAttendance;
      });
  }, [setAllAttendance, leagueConfig.gamesPerDay, leagueConfig.lockedDays]);

  const handlePlayerMoveInTeam = useCallback((day: number, court: string, gameIndex: number, playerId: number, fromTeam: 'teamA' | 'teamB') => {
    if (leagueConfig.lockedDays?.[day]) {
        alert("This day is locked and players cannot be moved.");
        return;
      }
    setAllMatchups(prev => {
        const newAllMatchups: AllDailyMatchups = JSON.parse(JSON.stringify(prev));
        const matchup = newAllMatchups[day]?.[court]?.[gameIndex];
        if (!matchup) return prev;
        const toTeam = fromTeam === 'teamA' ? 'teamB' : 'teamA';
        const playerIndex = matchup[fromTeam].findIndex((p: Player) => p.id === playerId);
        if (playerIndex === -1) return prev;
        const [player] = matchup[fromTeam].splice(playerIndex, 1);
        matchup[toTeam].push(player);
        return newAllMatchups;
    });
  }, [setAllMatchups, leagueConfig.lockedDays]);

    const handlePlayerSwapInGame = useCallback((day: number, gameIndex: number, p1: Player, p2: Player) => {
        if (leagueConfig.lockedDays?.[day]) {
            alert("This day is locked and players cannot be swapped.");
            return;
        }
        setAllMatchups(prev => {
            const newAllMatchups: AllDailyMatchups = JSON.parse(JSON.stringify(prev));
            const dayMatchups = newAllMatchups[day];
            if (!dayMatchups) return prev;

            let p1Location: { court: string, team: 'teamA' | 'teamB', playerIndex: number } | null = null;
            let p2Location: { court: string, team: 'teamA' | 'teamB', playerIndex: number } | null = null;
            
            // Find players in the specified game index across all courts
            for (const court of Object.keys(dayMatchups)) {
                const game = dayMatchups[court]?.[gameIndex];
                if (!game) continue;

                let p1Idx = game.teamA.findIndex(p => p.id === p1.id);
                if (p1Idx !== -1 && !p1Location) {
                    p1Location = { court, team: 'teamA', playerIndex: p1Idx };
                } else {
                    p1Idx = game.teamB.findIndex(p => p.id === p1.id);
                    if (p1Idx !== -1 && !p1Location) {
                        p1Location = { court, team: 'teamB', playerIndex: p1Idx };
                    }
                }

                let p2Idx = game.teamA.findIndex(p => p.id === p2.id);
                if (p2Idx !== -1 && !p2Location) {
                    p2Location = { court, team: 'teamA', playerIndex: p2Idx };
                } else {
                    p2Idx = game.teamB.findIndex(p => p.id === p2.id);
                    if (p2Idx !== -1 && !p2Location) {
                        p2Location = { court, team: 'teamB', playerIndex: p2Idx };
                    }
                }
            }
            
            // If both found, perform the swap
            if (p1Location && p2Location) {
                const p1Full = dayMatchups[p1Location.court][gameIndex][p1Location.team][p1Location.playerIndex];
                const p2Full = dayMatchups[p2Location.court][gameIndex][p2Location.team][p2Location.playerIndex];

                dayMatchups[p1Location.court][gameIndex][p1Location.team][p1Location.playerIndex] = p2Full;
                dayMatchups[p2Location.court][gameIndex][p2Location.team][p2Location.playerIndex] = p1Full;
            } else {
                console.error("Could not find both players to swap in game", gameIndex);
                return prev; // Return original state if swap failed
            }
            
            return newAllMatchups;
        });
    }, [setAllMatchups, leagueConfig.lockedDays]);

    const toggleSwapMode = useCallback(() => {
        if (isDayLocked) return;
        setIsSwapMode(prev => !prev);
        setPlayerToSwap(null); // Reset on toggle
    }, [isDayLocked]);

    const handlePlayerSelectForSwap = useCallback((player: Player, gameIndex: number) => {
        if (!isSwapMode || isDayLocked) return;

        if (!playerToSwap) {
            setPlayerToSwap({ player, gameIndex });
        } else {
            // Can't swap with self
            if (playerToSwap.player.id === player.id) {
                setPlayerToSwap(null);
                return;
            }
            // Can only swap within the same game index
            if (playerToSwap.gameIndex !== gameIndex) {
                 alert(`You can only swap players within the same game. Please select a player from Game ${playerToSwap.gameIndex + 1}.`);
                return;
            }

            handlePlayerSwapInGame(currentDay, gameIndex, playerToSwap.player, player);
            // Reset after swap
            setIsSwapMode(false);
            setPlayerToSwap(null);
        }
    }, [isSwapMode, isDayLocked, playerToSwap, handlePlayerSwapInGame, currentDay]);

  const handleGenerateCoachingTip = useCallback(async () => {
    setIsLoadingCoachingTip(true);
    setCoachingTip(null);
    setCoachingTipError('');
    try {
      const tip = await generateCoachingTip();
      if (tip) {
        setCoachingTip(tip);
      } else {
        setCoachingTipError("Sorry, we couldn't generate a coaching tip at this time. Please try again later.");
      }
    } catch (error) {
      console.error("Failed to generate coaching tip:", error);
      setCoachingTipError("An unexpected error occurred while generating the tip.");
    } finally {
      setIsLoadingCoachingTip(false);
    }
  }, []);
  
  const formatScheduledDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return ` - ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}, ${date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`;
    } catch(e) {
        return '';
    }
  };

  const handlePrintCourt = (courtTitle: string, day: number) => {
    const matchups = allMatchups[day]?.[courtTitle];
    if (!matchups) return;

    const printableComponent = (
        <div className="print-container">
            <div className="print-header">
                <h1>{leagueConfig.title} - Day {day}</h1>
                <h2>{courtTitle} - Matchups</h2>
            </div>
            <div className="print-games-grid">
                {matchups.map((matchup, index) => (
                    <div key={index} className="print-game-card">
                        <h3>Game {index + 1}</h3>
                        <div className="print-teams-container">
                             <div>
                                <h4>Team A</h4>
                                <ul className="print-team-list">
                                    {matchup.teamA.map(p => <li key={p.id}>{p.name}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h4>Team B</h4>
                                <ul className="print-team-list">
                                    {matchup.teamB.map(p => <li key={p.id}>{p.name}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
    setPrintableContent(printableComponent);
  };

  const handleGenerateTeamOfTheDay = useCallback(async () => {
        setIsGeneratingTeam(true);
        setGenerationError(null);
        try {
            // Need the full player stats for the day
            const stats = initializePlayerStats(leagueConfig.players);
            processDayResults(stats, currentDay, gameResults[currentDay], allMatchups[currentDay], allAttendance[currentDay]);
            const playerStatsForDay = Object.values(stats).map(p => ({
                id: p.id,
                name: p.name,
                dailyPoints: p.dailyPoints[currentDay] || 0,
            }));

            const response = await fetch('/api/generateTeamOfTheDay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    day: currentDay,
                    leagueConfig,
                    dailyResults: { [currentDay]: gameResults[currentDay] },
                    dailyMatchups: { [currentDay]: allMatchups[currentDay] },
                    playerStats: playerStatsForDay
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate from API.');
            }

            const data = await response.json();
            setTeamOfTheDay(prev => ({
                ...prev,
                [currentDay]: data
            }));

        } catch (error) {
            console.error("Team of the day generation failed:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            setGenerationError(errorMessage);
        } finally {
            setIsGeneratingTeam(false);
        }
    }, [currentDay, leagueConfig, gameResults, allMatchups, allAttendance, setTeamOfTheDay]);

  useEffect(() => {
    if (printableContent) {
      const timer = setTimeout(() => {
        window.print();
        setPrintableContent(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [printableContent]);

  return (
    <div className="flex items-start justify-center min-h-screen bg-gray-900 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-5xl mx-auto">
        <Header 
          title={leagueConfig.title} 
          userState={userState} 
          onLoginClick={onLoginClick} 
          onLogout={onLogout}
          onDeleteLeague={onDeleteLeague}
          onSwitchLeague={onSwitchLeague}
        />
        
        <div className="text-center">
            <h2 className="text-3xl font-bold text-white tracking-tight">
                Standings
                <span className="text-yellow-400">
                   : Day {currentDay}{formatScheduledDate(leagueConfig.daySchedules?.[currentDay])}
                </span>
            </h2>
             {realCurrentLeagueDay > currentDay && !dayHasResults && (
                <p className="mt-2 text-sm text-blue-300 bg-blue-900/30 inline-block px-3 py-1 rounded-full">
                   Results for Day {currentDay} have not been updated yet. Rankings shown are cumulative up to Day {currentDay - 1}.
                </p>
            )}
             {realCurrentLeagueDay === currentDay && !dayHasResults && (
                <p className="mt-2 text-sm text-blue-300 bg-blue-900/30 inline-block px-3 py-1 rounded-full">
                   Scores for today are being updated live. Rankings shown are cumulative up to the end of yesterday.
                </p>
            )}
            <DaySelector 
                currentDay={currentDay}
                totalDays={leagueConfig.totalDays}
                daySchedules={leagueConfig.daySchedules}
                lockedDays={leagueConfig.lockedDays}
                onDayChange={setCurrentDay}
                userRole={userState.role}
                realCurrentLeagueDay={realCurrentLeagueDay}
            />
        </div>
        
        <Leaderboard players={sortedDisplayPlayers.slice(0, 3)} />

        {/* Public View: Show Standings, Public Games, Etc. */}
        {userState.role === 'NONE' ? (
          <>
            <div className="my-8 p-6 bg-gray-800/50 rounded-2xl shadow-2xl border border-gray-700">
                <h2 className="text-2xl font-bold text-center text-yellow-400 mb-6">Daily Game Results</h2>

                {courtKeys.length > 0 ? (
                    <>
                        <div className="flex flex-wrap justify-center gap-2 mb-6">
                            {courtKeys.map(courtKey => (
                                <button
                                    key={courtKey}
                                    onClick={() => setSelectedCourt(courtKey)}
                                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
                                        selectedCourt === courtKey
                                            ? 'bg-yellow-500 text-gray-900'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                >
                                    {courtKey}
                                </button>
                            ))}
                        </div>

                        {selectedCourt && allMatchups[currentDay]?.[selectedCourt] ? (
                            <PublicGamesDisplay
                                matchups={allMatchups[currentDay]?.[selectedCourt]}
                                results={gameResults[currentDay]?.[selectedCourt]}
                            />
                        ) : (
                            <p className="text-center text-gray-500 py-8">Matchups for this court are not yet available.</p>
                        )}
                    </>
                ) : (
                    <p className="text-center text-gray-500 py-8">Matchups for this day's games are not yet available.</p>
                )}
            </div>

            {leagueConfig.leagueType === 'standard' ? (
                <FullPlayerRankings players={sortedDisplayPlayers} />
            ) : (
                 <TeamOfTheDay
                    day={currentDay}
                    players={leagueConfig.players}
                    teamData={teamOfTheDay[currentDay]}
                    userRole={userState.role}
                    onGenerate={handleGenerateTeamOfTheDay}
                    isLoading={isGeneratingTeam}
                    error={generationError}
                />
            )}
            <Announcements text={leagueConfig.announcements} userRole={userState.role} onSave={onAnnouncementsSave} />
            {Object.keys(leagueConfig.daySchedules || {}).length > 0 && <LeagueSchedule leagueConfig={leagueConfig} />}
            <LinksAndShare leagueTitle={leagueConfig.title} />
          </>
        ) : (
          /* Admin/Referee View */
          <>
            <div className="my-8 p-4 bg-gray-800/50 rounded-2xl border border-gray-700 flex flex-col sm:flex-row justify-center items-center gap-4 text-center">
                <p className="text-lg text-white font-semibold">
                    {userState.role === 'SUPER_ADMIN' ? 'Admin Mode Activated' : 'Referee Mode Activated'}
                </p>
                <div className="flex gap-2">
                    {userState.role === 'SUPER_ADMIN' && (
                        <button onClick={() => setShowAdminPanel(!showAdminPanel)} className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg bg-gray-700 hover:bg-gray-600">
                            <IconSettings className="w-5 h-5" /> {showAdminPanel ? 'Hide' : 'Show'} Admin Panel
                        </button>
                    )}
                    {isDayLocked && (
                        <div className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg bg-red-900/50 text-red-300">
                            <IconLock className="w-5 h-5"/> Day {currentDay} is Locked
                        </div>
                    )}
                </div>
            </div>

            {showAdminPanel && userState.role === 'SUPER_ADMIN' && (
                <AdminPanel 
                    appData={appData}
                    leagueConfig={leagueConfig} 
                    onScheduleSave={onScheduleSave}
                />
            )}

            <ScoreEntryDashboard 
              currentDay={currentDay}
              courtKeys={courtKeys}
              matchupsForDay={allMatchups[currentDay]}
              resultsForDay={gameResults[currentDay]}
              attendanceForDay={allAttendance[currentDay]}
              gamesPerDay={leagueConfig.gamesPerDay}
              onGameResultChange={(court, gameIndex, result) => handleGameResultChange(currentDay, court, gameIndex, result)}
              onAttendanceChange={(playerId, gameIndex, isPresent) => handleAttendanceChange(currentDay, playerId, gameIndex, isPresent)}
              onPlayerMove={(court, gameIndex, playerId, fromTeam) => handlePlayerMoveInTeam(currentDay, court, gameIndex, playerId, fromTeam)}
              onToggleDayLock={onToggleDayLock}
              onPrintCourt={handlePrintCourt}
              isDayLocked={isDayLocked}
              userState={userState}
              isSwapMode={isSwapMode}
              playerToSwap={playerToSwap}
              toggleSwapMode={toggleSwapMode}
              onPlayerSelectForSwap={handlePlayerSelectForSwap}
            />

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <InfoCard icon={<IconLightbulb className="w-5 h-5"/>} title="Coach's Playbook">
                    {coachingTip ? (
                        <div className="space-y-3">
                            <div>
                                <h5 className="font-bold text-white">{coachingTip.skillTip.title}</h5>
                                <p className="text-gray-400">{coachingTip.skillTip.content}</p>
                            </div>
                            <div>
                                <h5 className="font-bold text-white flex items-center gap-1.5"><IconMessage className="w-4 h-4"/> Communication Tip</h5>
                                <p className="text-gray-400">{coachingTip.communicationTip}</p>
                            </div>
                        </div>
                    ) : coachingTipError ? (
                        <p className="text-red-400">{coachingTipError}</p>
                    ) : (
                        <p className="text-gray-500">Click to generate a new tip.</p>
                    )}
                     <button onClick={handleGenerateCoachingTip} disabled={isLoadingCoachingTip} className="mt-3 w-full text-xs font-bold bg-yellow-500/80 text-black py-1 px-2 rounded hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-wait">
                        {isLoadingCoachingTip ? 'Generating...' : 'New Tip'}
                    </button>
                </InfoCard>

                 <InfoCard icon={<IconQuote className="w-5 h-5"/>} title="Quote of the Day" className="justify-between">
                    {coachingTip ? (
                        <div>
                            <blockquote className="italic">"{coachingTip.quote.text}"</blockquote>
                            <cite className="block text-right not-italic text-gray-400 mt-2">&mdash; {coachingTip.quote.author}</cite>
                        </div>
                    ) : (
                         <p className="text-gray-500 m-auto text-center">Generate a tip to see the quote.</p>
                    )}
                 </InfoCard>
                 <InfoCard icon={<IconVideo className="w-5 h-5"/>} title="Featured Video">
                    <p className="text-gray-400">Video content and tutorials coming soon to enhance the learning experience.</p>
                 </InfoCard>
            </div>
          </>
        )}
      </div>
      {printableContent && <div className="printable">{printableContent}</div>}
    </div>
  );
};

export default Dashboard;

