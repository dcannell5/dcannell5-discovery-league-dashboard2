import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Player, AllDailyResults, GameResult, UserState, AllDailyMatchups, PlayerWithStats, AllDailyAttendance, LeagueConfig, CourtResults, CoachingTip, AdminFeedback, PlayerFeedback, AppData, LoginCounts } from '../types';
import { generateCoachingTip } from '../services/geminiService';
import { generateDailyMatchups, getAllCourtNames } from '../utils/leagueLogic';
import { sortPlayersWithTieBreaking } from '../utils/rankingLogic';
import { getActiveDay } from '../utils/auth';
import { useLeagueStats } from '../utils/hooks';
import { initializePlayerStats, processDayResults } from '../utils/statsLogic';
import Header from './Header';
import Leaderboard from './Leaderboard';
import DaySelector from './DaySelector';
import DailyGroups from './DailyGroups';
import PlayerTable from './PlayerTable';
import ScoreEntryDashboard from './ScoreEntryDashboard';
import Announcements from './Announcements';
import AdminPanel from './AdminPanel';
import LinksAndShare from './LinksAndShare';
import PlayerAttendancePanel from './PlayerAttendancePanel';
import { IconTrophy, IconLightbulb, IconQuote, IconVideo, IconLock, IconMessage, IconSettings } from './Icon';
import PlayerCard from './PlayerCard';
import TeamOfTheDay from './TeamOfTheDay';

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
    onViewProfile: (playerId: number) => void;
    onSaveRefereeNote: (playerId: number, note: string, day: number) => void;
    onSaveAdminFeedback: (feedbackText: string) => void;
    onSetPlayerDailyAttendance: (day: number, playerId: number, isPresent: boolean) => void;
    onToggleDayLock: (day: number) => void;
    gameResults: AllDailyResults;
    setGameResults: React.Dispatch<React.SetStateAction<AllDailyResults>>;
    allMatchups: AllDailyMatchups;
    setAllMatchups: React.Dispatch<React.SetStateAction<AllDailyMatchups>>;
    allAttendance: AllDailyAttendance;
    setAllAttendance: React.Dispatch<React.SetStateAction<AllDailyAttendance>>;
    allAdminFeedback: AdminFeedback[];
    allPlayerFeedback: PlayerFeedback[];
    allPlayerPINs: Record<number, string>;
    onResetPlayerPIN: (playerId: number) => void;
    loginCounters: Record<number, LoginCounts>;
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
    appData, leagueConfig, userState, onLoginClick, onLogout, onDeleteLeague, onSwitchLeague, onAnnouncementsSave, onScheduleSave, onViewProfile, onSaveRefereeNote,
    onSaveAdminFeedback,
    onSetPlayerDailyAttendance,
    onToggleDayLock,
    gameResults, setGameResults, allMatchups, setAllMatchups, allAttendance, setAllAttendance,
    allAdminFeedback, allPlayerFeedback, allPlayerPINs, onResetPlayerPIN, loginCounters,
    teamOfTheDay, setTeamOfTheDay
}) => {
  const [currentDay, setCurrentDay] = useState<number>(1);
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

  useEffect(() => {
    // Set the initial current day based on the schedule for all users.
    setCurrentDay(realCurrentLeagueDay);
  }, [realCurrentLeagueDay]);

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
  
  // Memoize the calculation of court groups based on the final display stats
  const { dailyCourtGroups, courtKeys } = useMemo(() => {
    const courtKeys = getAllCourtNames(leagueConfig);
    const dailyCourtGroups: Record<string, PlayerWithStats[]> = {};
    const { playersPerTeam, leagueType } = leagueConfig;
    const playersPerCourt = playersPerTeam * 2;

    // For standard leagues on Day 2+, we display groups based on the current day's final rankings
    // to match the overall player table. This reflects the projected court tiers for the *next* day.
    if (leagueType === 'standard' && currentDay > 1) {
        courtKeys.forEach((courtName, i) => {
            const startIndex = i * playersPerCourt;
            const endIndex = startIndex + playersPerCourt;
            
            const courtPlayers = sortedDisplayPlayers.slice(startIndex, endIndex);
            dailyCourtGroups[courtName] = courtPlayers; // Already sorted
        });
    } else {
        // For Day 1 of standard leagues or for any day of a custom tournament, players are mixed.
        // In this case, we show the actual players who were grouped onto each court for that day.
        const matchupsForCurrentDay = allMatchups[currentDay];
        if (matchupsForCurrentDay && Object.keys(matchupsForCurrentDay).length > 0) {
            courtKeys.forEach(courtKey => {
                const playersMap = new Map<number, Player>();
                // Use all games to gather all unique players on the court for the day
                matchupsForCurrentDay[courtKey]?.forEach(game => {
                    [...game.teamA, ...game.teamB].forEach(p => {
                        if(!playersMap.has(p.id)) playersMap.set(p.id, p);
                    });
                });
            
                const courtPlayersWithStats = Array.from(playersMap.keys())
                    .map(id => sortedDisplayPlayers.find(p => p.id === id)) // get up-to-date stats
                    .filter(Boolean) as PlayerWithStats[];

                dailyCourtGroups[courtKey] = sortPlayersWithTieBreaking(courtPlayersWithStats);
            });
        }
    }

    return { 
        dailyCourtGroups,
        courtKeys
    };
  }, [sortedDisplayPlayers, currentDay, allMatchups, leagueConfig]);
  
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
            setTeamOfTheDay(prev => ({ ...prev, [currentDay]: data }));

        } catch (error) {
            const message = error instanceof Error ? error.message : 'An unknown error occurred.';
            console.error("Failed to generate team of the day:", message);
            setGenerationError(message);
        } finally {
            setIsGeneratingTeam(false);
        }
    }, [currentDay, leagueConfig, gameResults, allMatchups, allAttendance, setTeamOfTheDay]);

  useEffect(() => {
    const handleAfterPrint = () => {
      setPrintableContent(null);
    };

    window.addEventListener('afterprint', handleAfterPrint);
    
    if (printableContent) {
        window.print();
    }

    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [printableContent]);

  const isClickable = userState.role !== 'NONE';
  const showDiscoveryView = leagueConfig.leagueType === 'custom' || (leagueConfig.leagueType === 'standard' && currentDay === 1);
  const isPlayerOrParent = userState.role === 'PLAYER' || userState.role === 'PARENT';

  if (userState.role === 'SUPER_ADMIN' && showAdminPanel) {
    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            <main className="container mx-auto p-4 md:p-8">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-yellow-500">
                        Admin Panel
                    </h1>
                    <button
                        onClick={() => setShowAdminPanel(false)}
                        className="text-sm font-semibold text-gray-300 hover:text-yellow-400 transition-colors"
                    >
                        &larr; Back to Dashboard
                    </button>
                </header>
                <AdminPanel
                    appData={appData}
                    leagueConfig={leagueConfig}
                    onScheduleSave={onScheduleSave}
                    allPlayerPINs={allPlayerPINs}
                    onResetPlayerPIN={onResetPlayerPIN}
                    allAdminFeedback={allAdminFeedback}
                    allPlayerFeedback={allPlayerFeedback}
                    loginCounters={loginCounters}
                />
            </main>
        </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <main className="container mx-auto p-4 md:p-8">
          <Header 
              title={leagueConfig.title} 
              userState={userState} 
              onLoginClick={onLoginClick} 
              onLogout={onLogout} 
              onDeleteLeague={onDeleteLeague}
              onSwitchLeague={onSwitchLeague}
              onViewProfile={onViewProfile} 
          />
          
          <Announcements 
              text={leagueConfig.announcements}
              userRole={userState.role}
              onSave={onAnnouncementsSave}
          />

          {userState.role === 'SUPER_ADMIN' && (
            <div className="my-8 p-6 bg-gray-800/50 rounded-2xl shadow-xl border border-gray-700 text-center">
                <button
                    onClick={() => setShowAdminPanel(true)}
                    className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
                >
                    <IconSettings className="w-5 h-5" />
                    Open League Admin Panel
                </button>
                <p className="text-xs text-gray-500 mt-3">Manage schedules, access codes, and view feedback.</p>
            </div>
           )}

          {userState.role === 'NONE' && <LinksAndShare leagueTitle={leagueConfig.title} />}
          {isPlayerOrParent && (
            <PlayerAttendancePanel 
              leagueConfig={leagueConfig}
              userState={userState}
              allAttendance={allAttendance}
              onSetPlayerDailyAttendance={onSetPlayerDailyAttendance}
              realCurrentLeagueDay={realCurrentLeagueDay}
            />
          )}

          <div className="my-8 p-6 bg-gray-800/50 rounded-2xl shadow-2xl border border-gray-700">
              <h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center justify-center">
                  <IconTrophy className="w-6 h-6 mr-3"/>
                  Standings: Day {currentDay}
                  <span className="text-lg text-gray-400 ml-2 font-normal">{formatScheduledDate(leagueConfig.daySchedules?.[currentDay])}</span>
              </h2>
              <DaySelector
                  currentDay={currentDay}
                  totalDays={leagueConfig.totalDays}
                  daySchedules={leagueConfig.daySchedules}
                  lockedDays={leagueConfig.lockedDays}
                  onDayChange={setCurrentDay}
                  userRole={userState.role}
                  realCurrentLeagueDay={realCurrentLeagueDay}
              />
              <Leaderboard players={sortedDisplayPlayers.slice(0, 3)} />
          </div>

          {isDayLocked && (
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
              onSaveRefereeNote={onSaveRefereeNote}
              onSaveAdminFeedback={onSaveAdminFeedback}
              onToggleDayLock={onToggleDayLock}
              onPrintCourt={handlePrintCourt}
              isDayLocked={isDayLocked}
              userState={userState}
              isSwapMode={isSwapMode}
              playerToSwap={playerToSwap}
              toggleSwapMode={toggleSwapMode}
              onPlayerSelectForSwap={handlePlayerSelectForSwap}
          />

          <div className="my-8 p-6 bg-gray-800/50 rounded-2xl shadow-2xl border border-gray-700">
            <h2 className="text-2xl font-bold text-center text-yellow-400 mb-4">Coach's Playbook</h2>
              {userState.role !== 'NONE' && (
                <div className="text-center mb-6">
                    <button 
                      onClick={handleGenerateCoachingTip}
                      disabled={isLoadingCoachingTip}
                      className="px-4 py-2 bg-yellow-500 text-gray-900 font-bold rounded-lg hover:bg-yellow-400 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center mx-auto"
                    >
                      {isLoadingCoachingTip ? 'Generating...' : "Get New Tips"}
                    </button>
                </div>
              )}
            
              {isLoadingCoachingTip && <div className="text-center text-gray-400">Generating new tips...</div>}
              {coachingTipError && <div className="p-4 bg-red-900/50 rounded-lg text-red-300 text-center">{coachingTipError}</div>}

              { coachingTip &&
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoCard icon={<IconLightbulb className="w-4 h-4"/>} title={coachingTip.skillTip.title}>
                          <p className="whitespace-pre-wrap">{coachingTip.skillTip.content}</p>
                      </InfoCard>
                      <InfoCard icon={<IconMessage className="w-4 h-4"/>} title="Teamwork Tip">
                          <p>{coachingTip.communicationTip}</p>
                      </InfoCard>
                      <InfoCard icon={<IconQuote className="w-4 h-4"/>} title="Quote of the Day" className="md:col-span-2">
                          <blockquote className="italic">
                              "{coachingTip.quote.text}"
                              <footer className="not-italic text-right mt-2 text-gray-400">— {coachingTip.quote.author}</footer>
                          </blockquote>
                      </InfoCard>
                  </div>
                </div>
              }
              { !coachingTip && !isLoadingCoachingTip && !coachingTipError && (
                   <p className="text-center text-gray-500 py-8">
                    {userState.role !== 'NONE' ? "Click the button to get your playbook tips!" : "The daily coach's playbook will appear here once generated by a league member."}
                  </p>
              )}
               <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-700/50 p-4 rounded-lg flex items-start gap-3">
                        <IconLock className="w-8 h-8 text-yellow-400 mt-1 shrink-0"/>
                        <div>
                            <h4 className="font-bold text-yellow-400">Did You Know?</h4>
                            <p className="text-gray-300">You can set a custom 4-6 digit PIN for easier login. Visit your profile page to set it up!</p>
                        </div>
                    </div>
                    <a href="https://www.youtube.com/@darrencannell/videos" target="_blank" rel="noopener noreferrer" className="bg-gray-700/50 p-4 rounded-lg flex items-start gap-3 hover:bg-gray-700 transition-colors">
                        <IconVideo className="w-8 h-8 text-red-500 mt-1 shrink-0"/>
                        <div>
                            <h4 className="font-bold text-yellow-400">Video Resources</h4>
                            <p className="text-gray-300">Follow the official league YouTube channel for daily tips and subscribe to stay updated. <span className="underline">Watch now &rarr;</span></p>
                        </div>
                    </a>
                </div>
          </div>

          {showDiscoveryView ? (
              <div className="my-8 p-6 bg-gray-800/50 rounded-2xl shadow-2xl border border-gray-700">
                  <h2 className="text-2xl font-bold text-center text-yellow-400 mb-4">
                      {leagueConfig.leagueType === 'standard' ? 'Day 1 Discovery Round' : 'All Players'}
                  </h2>
                  <p className="text-center text-gray-400 max-w-2xl mx-auto mb-8">For this event format, all players are mixed and will play with different teammates to promote discovery and varied competition.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {sortedDisplayPlayers.map(player => (
                          <PlayerCard 
                              key={player.id} 
                              player={player} 
                              onClick={onViewProfile}
                              isClickable={isClickable}
                          />
                      ))}
                  </div>
              </div>
          ) : (
               <div>
                   <h2 className="text-3xl font-bold text-yellow-400 mt-12 mb-4 text-center">Ranked Court Tiers</h2>
                   <p className="text-center text-gray-400 max-w-2xl mx-auto -mt-2 mb-8">Based on the current overall rankings, these are the projected court tiers for the next day of play.</p>
                  <DailyGroups 
                      dailyCourtGroups={dailyCourtGroups}
                      courtOrder={courtKeys}
                      onPlayerClick={onViewProfile} 
                      userState={userState}
                  />
              </div>
          )}

          <div className="mt-12">
            <PlayerTable players={sortedDisplayPlayers} onPlayerClick={onViewProfile} userState={userState} />
          </div>
        </main>
      </div>
      {printableContent && (
        <div className="printable">
          {printableContent}
        </div>
      )}
    </>
  );
};

export default Dashboard;