

import React, { useState, useMemo } from 'react';
import type { AppData, LeagueConfig, UpcomingEvent, UserState } from '../types';
import { IconCalendar, IconClipboardCheck, IconEdit, IconLogin, IconLogout, IconPlusCircle, IconTrophy, IconUserCheck, IconBook } from './Icon';
import { useLeagueStats } from '../utils/hooks';
import DataManagementPanel from './DataManagementPanel';
import { logoUrl } from '../assets/logo';

interface LoginPageProps {
  appData: AppData;
  onSelectLeague: (id: string) => void;
  onCreateNew: () => void;
  userState: UserState;
  upcomingEvent: UpcomingEvent;
  onUpdateUpcomingEvent: (event: UpcomingEvent) => void;
  onLoginClick: () => void;
  onLogout: () => void;
  onResetAllData: () => void;
  onLoadPreset: () => void;
  onImport: (data: AppData) => Promise<boolean>;
  onBackToAdminHub?: () => void;
  onViewBlog?: () => void;
}

const roleTextMap: Record<UserState['role'], string> = {
    SUPER_ADMIN: 'Super Admin',
    REFEREE: 'Referee',
    PLAYER: 'Player',
    PARENT: 'Parent',
    NONE: ''
};

const LeagueCard: React.FC<{
    league: LeagueConfig;
    appData: AppData;
    onSelect: (id: string) => void;
}> = ({ league, appData, onSelect }) => {
    
    const lastRecordedDay = useMemo(() => {
        const leagueResults = appData.dailyResults[league.id] || {};
        const recordedDays = Object.keys(leagueResults)
          .map(Number)
          .filter(day => day > 0 && leagueResults[day] && Object.keys(leagueResults[day]).length > 0);
        return recordedDays.length > 0 ? Math.max(...recordedDays) : 0;
    }, [appData.dailyResults, league.id]);

    const { sortedPlayers } = useLeagueStats(
        league,
        appData.dailyResults[league.id] || {},
        appData.allDailyMatchups[league.id] || {},
        appData.allDailyAttendance[league.id] || {},
        lastRecordedDay
    );

    const { top3Players, progress, nextGameDate } = useMemo(() => {
        const findNextGameDate = () => {
            if (!league.daySchedules) return null;
            const now = new Date();
            const futureDays = Object.entries(league.daySchedules)
                .map(([day, dateStr]) => ({ day: parseInt(day), date: new Date(dateStr) }))
                .filter(({ date }) => !isNaN(date.getTime()) && date > now)
                .sort((a, b) => a.date.getTime() - b.date.getTime());
            
            return futureDays.length > 0 ? futureDays[0].date : null;
        };
        const nextGameDateObj = findNextGameDate();

        return {
            top3Players: sortedPlayers.slice(0, 3),
            progress: `${lastRecordedDay > 0 ? lastRecordedDay : 'No'} of ${league.totalDays} Days with Results`,
            nextGameDate: nextGameDateObj ? nextGameDateObj.toLocaleString(undefined, { weekday: 'long', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Season Complete',
        };

    }, [sortedPlayers, lastRecordedDay, league.totalDays, league.daySchedules]);


    return (
        <div className="bg-gray-800/60 p-5 rounded-xl border border-gray-700 space-y-4 flex flex-col justify-between">
            <div>
                <h3 className="font-bold text-2xl text-white truncate">{league.title}</h3>
                <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                        <IconClipboardCheck className="w-5 h-5 text-yellow-400 shrink-0"/>
                        <span>{progress}</span>
                    </div>
                     <div className="flex items-center gap-3 text-sm text-gray-300">
                        <IconCalendar className="w-5 h-5 text-yellow-400 shrink-0"/>
                        <span>Next Game: {nextGameDate}</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-gray-300">
                        <IconTrophy className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5"/>
                        <div>
                            <span className="font-semibold">Top Players:</span>
                            {top3Players.length > 0 ? (
                                <ol className="list-decimal list-inside text-gray-400">
                                    {top3Players.map(p => <li key={p.id}>{p.name} ({p.leaguePoints} pts)</li>)}
                                </ol>
                            ) : <span className="text-gray-500"> No games played yet.</span>}
                        </div>
                    </div>
                </div>
            </div>
            <button
                onClick={() => onSelect(league.id)}
                className="w-full mt-4 py-2 px-4 bg-yellow-500 text-gray-900 font-bold rounded-lg hover:bg-yellow-400 transition-all duration-300"
            >
                View League
            </button>
        </div>
    );
};

const UpcomingEventEditor: React.FC<{
    event: UpcomingEvent,
    onSave: (event: UpcomingEvent) => void,
    onCancel: () => void
}> = ({ event, onSave, onCancel }) => {
    const [editedEvent, setEditedEvent] = useState(event);

    const handleSave = () => {
        onSave(editedEvent);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditedEvent(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-4">
            <input name="title" value={editedEvent.title} onChange={handleChange} placeholder="Title" className="w-full p-2 bg-gray-900 rounded" />
            <textarea name="description" value={editedEvent.description} onChange={handleChange} placeholder="Description" className="w-full p-2 bg-gray-900 rounded" rows={3}></textarea>
            <input name="buttonText" value={editedEvent.buttonText} onChange={handleChange} placeholder="Button Text" className="w-full p-2 bg-gray-900 rounded" />
            <input name="buttonUrl" value={editedEvent.buttonUrl} onChange={handleChange} placeholder="Button URL" className="w-full p-2 bg-gray-900 rounded" />
            <div className="flex justify-end gap-2">
                <button onClick={onCancel} className="px-3 py-1 bg-gray-600 rounded">Cancel</button>
                <button onClick={handleSave} className="px-3 py-1 bg-yellow-500 text-black rounded">Save</button>
            </div>
        </div>
    );
};


const LoginPage: React.FC<LoginPageProps> = ({ appData, onSelectLeague, onCreateNew, userState, upcomingEvent, onUpdateUpcomingEvent, onLoginClick, onLogout, onResetAllData, onLoadPreset, onImport, onBackToAdminHub, onViewBlog }) => {
  const leagueEntries = Object.entries(appData.leagues);
  const [isEditingEvent, setIsEditingEvent] = useState(false);

  const handleSaveEvent = (event: UpcomingEvent) => {
    onUpdateUpcomingEvent(event);
    setIsEditingEvent(false);
  };
  
  return (
    <div className="flex items-start justify-center min-h-screen bg-gray-900 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-5xl mx-auto">
        <header className="text-center mb-12 relative">
            {onViewBlog && (
                <div className="absolute top-0 left-0">
                     <button onClick={onViewBlog} className="flex items-center gap-2 text-sm font-semibold bg-gray-700/50 px-3 py-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors" aria-label="Build Blog">
                        <IconBook className="w-4 h-4"/>
                        Read the Build Blog
                    </button>
                </div>
            )}
            <div className="absolute top-0 right-0 flex items-center gap-4">
                {userState.role !== 'NONE' ? (
                    <>
                        {onBackToAdminHub && (
                             <button onClick={onBackToAdminHub} className="text-sm font-semibold text-gray-300 hover:text-yellow-400 transition-colors">&larr; Back to Admin Tower</button>
                        )}
                        <div className="flex items-center gap-2 text-sm bg-gray-700/50 px-3 py-1.5 rounded-lg">
                            <IconUserCheck className="w-4 h-4 text-green-400" />
                            <span className="text-gray-300 font-semibold">
                                {userState.role === 'REFEREE' ? `Referee (${userState.court})` : roleTextMap[userState.role]}
                            </span>
                        </div>
                        <button onClick={onLogout} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors" aria-label="Logout">
                            <IconLogout className="w-4 h-4"/>
                            Logout
                        </button>
                    </>
                ) : (
                     <button onClick={onLoginClick} className="flex items-center gap-2 text-sm font-semibold bg-gray-700/50 px-3 py-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors" aria-label="Login">
                        <IconLogin className="w-4 h-4"/>
                        Login
                    </button>
                )}
            </div>
            <img src={logoUrl} alt="Canadian Elite Academy Logo" className="w-24 h-24 mx-auto mb-4 rounded-full shadow-lg bg-gray-800 p-2" />
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-yellow-500 mb-4">
              Canadian Elite Academy
            </h1>
            <p className="text-gray-400">The central hub for all league events and information.</p>
        </header>

        <div className="mb-8 p-6 bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 rounded-2xl shadow-2xl border border-yellow-500/50 relative">
             <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-yellow-400">Upcoming Event</h2>
                {userState.role === 'SUPER_ADMIN' && !isEditingEvent && (
                    <button onClick={() => setIsEditingEvent(true)} className="flex items-center gap-2 text-sm text-gray-300 hover:text-yellow-400 transition-colors">
                        <IconEdit className="w-4 h-4" /> Edit
                    </button>
                )}
            </div>
            {isEditingEvent ? (
                <UpcomingEventEditor event={upcomingEvent} onSave={handleSaveEvent} onCancel={() => setIsEditingEvent(false)} />
            ) : (
                <>
                    <h3 className="text-xl font-semibold text-white">{upcomingEvent.title}</h3>
                    <p className="text-gray-300 my-2">{upcomingEvent.description}</p>
                    <a 
                        href={upcomingEvent.buttonUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-block mt-2 px-5 py-2 bg-yellow-500 text-gray-900 font-bold rounded-lg hover:bg-yellow-400 transition-colors"
                    >
                        {upcomingEvent.buttonText}
                    </a>
                </>
            )}
        </div>

        {userState.role === 'SUPER_ADMIN' && (
            <DataManagementPanel 
                appData={appData} 
                onImport={onImport}
                onResetAllData={onResetAllData} 
                onLoadPreset={onLoadPreset}
            />
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leagueEntries.map(([id, league]) => (
                <LeagueCard 
                    key={id}
                    league={{...league, id}}
                    appData={appData}
                    onSelect={onSelectLeague}
                />
            ))}
            {userState.role === 'SUPER_ADMIN' && (
                <button
                    onClick={onCreateNew}
                    className="flex flex-col items-center justify-center p-6 bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-xl text-gray-400 hover:bg-gray-800 hover:border-green-500 hover:text-green-400 transition-all"
                >
                    <IconPlusCircle className="w-12 h-12 mb-2" />
                    <span className="font-bold">Create New Event</span>
                </button>
            )}
        </div>
         {leagueEntries.length === 0 && userState.role !== 'SUPER_ADMIN' && (
            <div className="text-center py-12">
                <p className="text-gray-500">No active leagues at the moment. Check back soon!</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;