
import React, { useState, useEffect, useCallback } from 'react';
import type { ProjectLogEntry, SaveStatus } from '../types';
import { IconLayoutDashboard, IconUsersGroup, IconBriefcase, IconShieldCheck, IconShieldExclamation, IconRefresh, IconLogout, IconUserCheck, IconUsers, IconCloud, IconCloudCheck, IconCloudOff, IconEdit } from './Icon';
import ProjectJournalPanel from './ProjectJournalPanel';
import { logoUrl } from '../assets/logo';
import HelpIcon from './HelpIcon';

interface SuperAdminDashboardProps {
  onLogout: () => void;
  onNavigateToLeagues: () => void;
  projectLogs: ProjectLogEntry[];
  onSaveProjectLog: (post: Omit<ProjectLogEntry, 'id' | 'date'>) => void;
  saveStatus: SaveStatus;
  saveError: string | null;
  onRetrySave: () => void;
}

type SystemStatus = {
    kvDatabase: 'OK' | 'ERROR' | 'CHECKING';
    blobStorage: 'OK' | 'ERROR' | 'CHECKING';
    aiService: 'OK' | 'ERROR' | 'CHECKING';
};

const StatusIndicator: React.FC<{ status: 'OK' | 'ERROR' | 'CHECKING', label: string, helpText: string }> = ({ status, label, helpText }) => {
    const isOk = status === 'OK';
    const isChecking = status === 'CHECKING';
    
    const bgColor = isOk ? 'bg-green-500/20' : isChecking ? 'bg-gray-500/20' : 'bg-red-500/20';
    const textColor = isOk ? 'text-green-400' : isChecking ? 'text-gray-400' : 'text-red-400';
    const ringColor = isOk ? 'ring-green-500/30' : isChecking ? 'ring-gray-500/30' : 'ring-red-500/30';
    const icon = isOk ? <IconShieldCheck className="w-5 h-5"/> : <IconShieldExclamation className="w-5 h-5"/>;

    return (
        <div className={`flex items-center gap-3 p-3 rounded-lg ring-1 ${ringColor} ${bgColor}`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${textColor} ${bgColor}`}>
                {isChecking ? <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div> : icon}
            </div>
            <div>
                <div className={`font-bold ${textColor} flex items-center`}>
                    {label}
                    <HelpIcon text={helpText} />
                </div>
                <span className="text-xs text-gray-500">{status}</span>
            </div>
        </div>
    );
};

const SaveStateIndicator: React.FC<{ status: SaveStatus; errorMessage: string | null; onRetry: () => void; }> = ({ status, errorMessage, onRetry }) => {
    const statusConfig = {
      unsaved: { icon: <IconEdit className="w-5 h-5" />, text: 'Unsaved changes', color: 'text-yellow-400' },
      saving: { icon: <IconCloud className="w-5 h-5 animate-pulse" />, text: 'Saving to database...', color: 'text-blue-400' },
      saved: { icon: <IconCloudCheck className="w-5 h-5" />, text: 'All changes saved to database', color: 'text-green-400' },
      error: { icon: <IconCloudOff className="w-5 h-5" />, text: 'Error saving data', color: 'text-red-400' },
    };

    if (status === 'idle' || status === 'readonly') return null;

    const config = statusConfig[status];
    const displayMessage = status === 'saving' && errorMessage ? errorMessage : config.text;

    return (
        <div className="bg-gray-700/50 p-3 rounded-lg h-full flex flex-col justify-center">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                     <div className={`flex-shrink-0 ${config.color}`}>{config.icon}</div>
                     <div>
                        <div className={`font-bold ${config.color}`}>Data Sync Status</div>
                        <span className="text-xs text-gray-400">{displayMessage}</span>
                     </div>
                </div>
                {status === 'error' && onRetry && (
                    <button onClick={onRetry} className="text-xs font-bold bg-gray-600 px-2.5 py-1 rounded-full hover:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400">
                      Retry Save
                    </button>
                )}
            </div>
            {status === 'error' && errorMessage && (
                <div className="mt-2 p-2 bg-red-900/50 text-red-300 text-xs rounded-md font-mono overflow-x-auto">
                  {errorMessage}
                </div>
            )}
        </div>
    );
};

const NavCard: React.FC<{ icon: React.ReactNode, title: string, description: string, onClick?: () => void, disabled?: boolean }> = ({ icon, title, description, onClick, disabled }) => {
    const baseClasses = "bg-gray-800/60 p-6 rounded-xl border border-gray-700 flex flex-col items-center text-center transform transition-all duration-300";
    const interactiveClasses = "hover:border-yellow-400 hover:-translate-y-1 hover:shadow-xl hover:shadow-yellow-400/10 cursor-pointer";
    const disabledClasses = "opacity-50 cursor-not-allowed";
    
    const cardContent = (
         <>
            <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mb-4 text-yellow-400">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-400 flex-grow">{description}</p>
        </>
    );

    if (disabled) {
        return <div className={`${baseClasses} ${disabledClasses}`}>{cardContent}</div>
    }

    return (
        <button onClick={onClick} className={`${baseClasses} ${interactiveClasses}`}>
            {cardContent}
        </button>
    );
};


const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ onLogout, onNavigateToLeagues, projectLogs, onSaveProjectLog, saveStatus, saveError, onRetrySave }) => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({ kvDatabase: 'CHECKING', blobStorage: 'CHECKING', aiService: 'CHECKING' });

  const checkHealth = useCallback(async () => {
    setSystemStatus({ kvDatabase: 'CHECKING', blobStorage: 'CHECKING', aiService: 'CHECKING' });
    try {
        const response = await fetch('/api/system-health');
        if (response.ok) {
            const data = await response.json();
            setSystemStatus(data);
        } else {
            setSystemStatus({ kvDatabase: 'ERROR', blobStorage: 'ERROR', aiService: 'ERROR' });
        }
    } catch (error) {
        console.error("Failed to fetch system health:", error);
        setSystemStatus({ kvDatabase: 'ERROR', blobStorage: 'ERROR', aiService: 'ERROR' });
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-5xl mx-auto">
        <header className="text-center mb-12 relative">
             <div className="absolute top-0 right-0 flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm bg-gray-700/50 px-3 py-1.5 rounded-lg">
                    <IconUserCheck className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300 font-semibold">Super Admin</span>
                </div>
                <button onClick={onLogout} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors" aria-label="Logout">
                    <IconLogout className="w-4 h-4"/>
                    Logout
                </button>
             </div>
             <img src={logoUrl} alt="Canadian Elite Academy Logo" className="w-24 h-24 mx-auto mb-4 rounded-full shadow-lg bg-gray-800 p-2" />
             <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-yellow-500 mb-4">
                Admin Tower
            </h1>
            <p className="text-gray-400">Central control panel for the Canadian Elite Academy.</p>
        </header>

        <div className="mb-8 p-6 bg-gray-800/50 rounded-2xl shadow-2xl border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 text-center">System Health & Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                    <StatusIndicator 
                        status={systemStatus.kvDatabase} 
                        label="KV Database" 
                        helpText="Tests read/write access to the Vercel KV store (elite-academy-kv) where all league data is stored."
                    />
                    <StatusIndicator 
                        status={systemStatus.blobStorage} 
                        label="Blob Storage"
                        helpText="Tests upload/delete access to the Vercel Blob store (discovery-league-dashboard-blob) for player profile images."
                    />
                     <StatusIndicator 
                        status={systemStatus.aiService} 
                        label="AI Service"
                        helpText="Checks if the Gemini API key is configured on the server, required for features like coaching tips."
                    />
                </div>
                <div className="flex flex-col gap-4">
                    <SaveStateIndicator status={saveStatus} errorMessage={saveError} onRetry={onRetrySave} />
                    <button 
                        onClick={checkHealth}
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold p-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-auto"
                    >
                        <IconRefresh className="w-5 h-5"/> Re-run Checks
                    </button>
                </div>
            </div>
        </div>

        <div className="mb-12">
            <h2 className="text-2xl font-bold text-center text-yellow-400 mb-6">Management Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <NavCard 
                    icon={<IconLayoutDashboard className="w-8 h-8" />}
                    title="League Management"
                    description="Create, view, and manage all league events and their data."
                    onClick={onNavigateToLeagues}
                />
                <NavCard 
                    icon={<IconUsersGroup className="w-8 h-8" />}
                    title="Player Management"
                    description="Manage player access codes, PINs, and profile details for any league."
                    onClick={onNavigateToLeagues}
                />
                 <NavCard 
                    icon={<IconUsers className="w-8 h-8" />}
                    title="Coach Profiles"
                    description="Manage coach information and assignments. (Coming Soon)"
                    disabled
                />
                <NavCard 
                    icon={<IconBriefcase className="w-8 h-8" />}
                    title="Resource Bank"
                    description="A central repository for documents, drills, and resources. (Coming Soon)"
                    disabled
                />
            </div>
        </div>

        <ProjectJournalPanel
          logs={projectLogs}
          onSaveLog={onSaveProjectLog}
        />

      </div>
    </div>
  );
};

export default SuperAdminDashboard;