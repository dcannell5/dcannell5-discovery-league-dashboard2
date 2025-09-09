

import React, { useState, useEffect, useCallback } from 'react';
import type { ProjectLogEntry, SaveStatus, SystemLog } from '../types';
import { IconLayoutDashboard, IconUsersGroup, IconBriefcase, IconShieldCheck, IconShieldExclamation, IconRefresh, IconLogout, IconUserCheck, IconUsers, IconCloud, IconCloudCheck, IconCloudOff, IconEdit, IconClipboard, IconClipboardCheck, IconChevronDown } from './Icon';
import ProjectJournalPanel from './ProjectJournalPanel';
import { logoUrl } from '../assets/logo';
import HelpIcon from './HelpIcon';

interface SuperAdminDashboardProps {
  onLogout: () => void;
  onNavigateToLeagues: () => void;
  projectLogs: ProjectLogEntry[];
  onSaveProjectLog: (post: Omit<ProjectLogEntry, 'id' | 'date'>) => void;
  systemLogs: SystemLog[];
  addSystemLog: (logData: Omit<SystemLog, 'id' | 'timestamp'>) => void;
  saveStatus: SaveStatus;
  saveError: string | null;
  onRetrySave: () => void;
}

type SystemStatusState = 'OK' | 'ERROR' | 'CHECKING';
type SystemStatus = {
    kvDatabase: SystemStatusState;
    blobStorage: SystemStatusState;
    aiService: SystemStatusState;
};

const StatusIndicator: React.FC<{ status: SystemStatusState, label: string, helpText: string }> = ({ status, label, helpText }) => {
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
      saved: { icon: <IconCloudCheck className="w-5 h-5" />, text: 'All changes saved', color: 'text-green-400' },
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
                        <div className={`font-bold ${config.color} flex items-center`}>
                            Data Sync Status
                            <HelpIcon text="Shows the real-time status of data saving to the central database. Changes are automatically saved after a short delay." />
                        </div>
                        <span className="text-xs text-gray-400">{displayMessage}</span>
                     </div>
                </div>
                {status === 'error' && onRetry && (
                    <button onClick={onRetry} className="text-xs font-bold bg-gray-600 px-2.5 py-1 rounded-full hover:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400">
                      Retry
                    </button>
                )}
            </div>
        </div>
    );
};

const LogEntry: React.FC<{ log: SystemLog }> = ({ log }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (log.details) {
            navigator.clipboard.writeText(log.details);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const statusStyles = {
        Success: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
        Error: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
        Info: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
    };
    const style = statusStyles[log.status];

    return (
        <div className={`p-3 rounded-lg border ${style.border} ${style.bg}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className={`font-bold text-xs px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>{log.status}</span>
                    <span className="text-sm text-white">{log.message}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    {(log.details || log.suggestion) && (
                        <button onClick={() => setIsExpanded(!isExpanded)} className="text-gray-400 hover:text-white">
                            <IconChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                    )}
                </div>
            </div>
            {isExpanded && (log.details || log.suggestion) && (
                <div className="mt-3 pt-3 border-t border-gray-600/50 text-xs space-y-3">
                    {log.suggestion && (
                        <div>
                             <h5 className="font-bold text-yellow-400 mb-1">Suggestion</h5>
                             <p className="text-gray-300">{log.suggestion}</p>
                        </div>
                    )}
                    {log.details && (
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <h5 className="font-bold text-gray-400">Technical Details</h5>
                                <button onClick={handleCopy} className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors">
                                    {copied ? <><IconClipboardCheck className="w-3 h-3 text-green-400"/> Copied</> : <><IconClipboard className="w-3 h-3"/> Copy</>}
                                </button>
                            </div>
                            <pre className="bg-gray-900/50 p-2 rounded-md font-mono text-gray-400 overflow-x-auto">{log.details}</pre>
                        </div>
                    )}
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


const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ onLogout, onNavigateToLeagues, projectLogs, onSaveProjectLog, systemLogs, addSystemLog, saveStatus, saveError, onRetrySave }) => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({ kvDatabase: 'CHECKING', blobStorage: 'CHECKING', aiService: 'CHECKING' });

  const getSuggestion = (service: keyof SystemStatus, details: string): string => {
      const genericSuggestion = "This may be a temporary issue. Try re-running the check in a moment. If the problem persists, check your project's Vercel dashboard and the Vercel status page.";
      if (service === 'kvDatabase') {
          if (details.includes('authentication') || details.includes('Unauthorized')) return "Authentication with Vercel KV failed. Please verify that the KV_REST_API_URL and KV_REST_API_TOKEN environment variables are correctly set in your project's Vercel settings.";
          return `The database at elite-academy-kv might be experiencing issues. ${genericSuggestion}`;
      }
      if (service === 'blobStorage') {
          if (details.includes('configured')) return "The BLOB_READ_WRITE_TOKEN environment variable is missing. Please connect a Vercel Blob store to your project via the Vercel dashboard integrations tab.";
          return `The blob store at discovery-league-dashboard-blob might be experiencing issues. ${genericSuggestion}`;
      }
      if (service === 'aiService') {
          return "The API_KEY environment variable for the Gemini AI service is missing. Please add it to your project's Vercel settings to enable AI features.";
      }
      return genericSuggestion;
  };

  const checkHealth = useCallback(async () => {
    setSystemStatus({ kvDatabase: 'CHECKING', blobStorage: 'CHECKING', aiService: 'CHECKING' });
    try {
        const response = await fetch('/api/system-health');
        const data = await response.json();

        if (response.ok) {
            setSystemStatus({
                kvDatabase: data.kvDatabase.status,
                blobStorage: data.blobStorage.status,
                aiService: data.aiService.status,
            });
            
            Object.entries(data).forEach(([key, value]) => {
                const { status, details } = value as { status: SystemStatusState, details: string };
                const serviceName = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
                 addSystemLog({
                    type: 'Health Check',
                    status: status === 'OK' ? 'Success' : 'Error',
                    message: `${serviceName} check ${status === 'OK' ? 'succeeded' : 'failed'}.`,
                    details: details,
                    suggestion: status === 'ERROR' ? getSuggestion(key as keyof SystemStatus, details) : undefined,
                });
            });
        } else {
            throw new Error(data.error || 'Unknown error');
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Failed to fetch system health:", errorMessage);
        setSystemStatus({ kvDatabase: 'ERROR', blobStorage: 'ERROR', aiService: 'ERROR' });
        addSystemLog({ type: 'Health Check', status: 'Error', message: 'Could not run system health checks.', details: errorMessage, suggestion: "The health check API endpoint might be down or misconfigured. Check the server logs in Vercel for more details." });
    }
  }, [addSystemLog]);

  useEffect(() => {
    checkHealth();
  }, []); // Run only once on mount

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-6xl mx-auto">
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
            <h3 className="text-xl font-bold text-white mb-4 text-center flex items-center justify-center">
                System Diagnostics
                <HelpIcon text="This panel provides a live health check of all critical backend services the application relies on." />
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                     <StatusIndicator 
                        status={systemStatus.kvDatabase} 
                        label="KV Database" 
                        helpText="Performs a live read/write test to the Vercel KV database (elite-academy-kv). An error here means league data cannot be saved or loaded."
                    />
                    <StatusIndicator 
                        status={systemStatus.blobStorage} 
                        label="Blob Storage"
                        helpText="Performs a live upload/delete test to Vercel Blob storage (discovery-league-dashboard-blob). An error here means player profile images cannot be uploaded or displayed."
                    />
                     <StatusIndicator 
                        status={systemStatus.aiService} 
                        label="AI Service"
                        helpText="Checks for the presence of the Gemini API key on the server. An error here means AI-powered features like the Coach's Playbook and AI Assistant will not work."
                    />
                     <SaveStateIndicator status={saveStatus} errorMessage={saveError} onRetry={onRetrySave} />
                     <button 
                        onClick={checkHealth}
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold p-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <IconRefresh className="w-5 h-5"/> Re-run Diagnostics
                    </button>
                </div>
                <div className="lg:col-span-2 bg-gray-900/50 p-4 rounded-lg border border-gray-600">
                    <h4 className="font-semibold text-white mb-3 flex items-center">
                        System Event Log
                        <HelpIcon text="A real-time log of important backend events, such as data loads, saves, and health checks. Expand entries for technical details and suggestions." />
                    </h4>
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                        {systemLogs.length > 0 ? (
                           [...systemLogs].map(log => <LogEntry key={log.id} log={log} />)
                        ) : (
                           <p className="text-center text-sm text-gray-500 py-10">No system events logged yet.</p> 
                        )}
                    </div>
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