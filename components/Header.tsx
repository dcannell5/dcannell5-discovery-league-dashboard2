
import React from 'react';
import { IconVolleyball, IconUserCheck, IconLogout, IconLogin, IconTrash, IconSwitch } from './Icon';
import type { UserState } from '../types';

interface HeaderProps {
    title: string;
    userState: UserState;
    onLoginClick: () => void;
    onLogout: () => void;
    onDeleteLeague?: () => void;
    onSwitchLeague?: () => void;
}

const roleTextMap: Record<UserState['role'], string> = {
    SUPER_ADMIN: 'Super Admin',
    REFEREE: 'Referee',
    NONE: ''
};

const Header: React.FC<HeaderProps> = ({ title, userState, onLoginClick, onLogout, onDeleteLeague, onSwitchLeague }) => {
  return (
    <header className="mb-8 relative pt-14 md:pt-4">
       <div className="absolute top-0 right-0 flex items-center gap-4">
            {userState.role !== 'NONE' ? (
                <>
                    <div className="flex items-center gap-2 text-sm bg-gray-700/50 px-3 py-1.5 rounded-lg">
                        <IconUserCheck className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300 font-semibold">
                            {roleTextMap[userState.role]}
                        </span>
                    </div>
                     {userState.role === 'SUPER_ADMIN' && onDeleteLeague && onSwitchLeague && (
                        <>
                         <button onClick={onSwitchLeague} className="flex items-center gap-2 text-sm text-gray-400 hover:text-yellow-400 transition-colors" aria-label="Switch League">
                            <IconSwitch className="w-4 h-4"/>
                         </button>
                         <button onClick={onDeleteLeague} className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors" aria-label="Delete League">
                            <IconTrash className="w-4 h-4"/>
                         </button>
                        </>
                     )}
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
      <div className="flex justify-center items-center gap-4 mb-4">
        <IconVolleyball className="w-12 h-12 text-yellow-400" />
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-yellow-500">
          {title}
        </h1>
      </div>
      <p className="max-w-3xl mx-auto text-lg text-gray-400">
        A transformative journey of athletic development focused on leadership, teamwork, and skill growth through discovery learning.
      </p>
    </header>
  );
};

export default Header;
