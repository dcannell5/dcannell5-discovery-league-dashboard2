
import React, { useState, useEffect, useCallback } from 'react';
import type { ProjectLogEntry } from '../types';
import { IconLayoutDashboard, IconUsersGroup, IconBriefcase, IconShieldCheck, IconShieldExclamation, IconRefresh, IconLogout, IconUserCheck, IconUsers } from './Icon';
import ProjectJournalPanel from './ProjectJournalPanel';
import { logoUrl } from '../assets/logo';
import HelpIcon from './HelpIcon';

interface SuperAdminDashboardProps {
  onLogout: () => void;
  onNavigateToLeagues: () => void;
  projectLogs: ProjectLogEntry[];
  onSaveProjectLog: (post: Omit<ProjectLogEntry, 'id' | 'date'>) => void;
}

type SystemStatus = {
    database: 'OK' | 'ERROR' | 'CHECKING';
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


const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ onLogout, onNavigateToLeagues, projectLogs, onSaveProjectLog }) => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({ database: 'CHECKING', aiService: 'CHECKING' });

  const checkHealth = useCallback(async () => {
    setSystemStatus({ database: 'CHECKING', aiService: 'CHECKING' });
    try {
        const response = await fetch('/api/system-health');
        if (response.ok) {
            const data = await response.json();
            setSystemStatus(data);
        } else {
            setSystemStatus({ database: 'ERROR', aiService: 'ERROR' });
        }
    } catch (error) {
        console.error("Failed to fetch system health:", error);
        setSystemStatus({ database: 'ERROR', aiService: 'ERROR' });
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
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center justify-center">System Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatusIndicator 
                    status={systemStatus.database} 
                    label="Database Connection" 
                    helpText="Checks if the app can read and write to the Vercel KV store."
                />
                <StatusIndicator 
                    status={systemStatus.aiService} 
                    label="AI Service"
                    helpText="Checks if the Gemini API key is properly configured on the server."
                />
                <button 
                    onClick={checkHealth}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold p-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <IconRefresh className="w-5 h-5"/> Re-check Status
                </button>
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
                    title="Player Profiles"
                    description="Central database for all player information and history. (Coming Soon)"
                    disabled
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
