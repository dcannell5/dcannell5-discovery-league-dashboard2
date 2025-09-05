import React, { useState } from 'react';
import { IconVolleyball } from './Icon';

interface LoginScreenProps {
  onLogin: (code: string) => void;
  error?: string;
  onClose: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, error, onClose }) => {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(code.trim().toUpperCase());
  };

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="w-full max-w-md mx-auto p-8 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 text-center"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center items-center gap-3 mb-4">
          <IconVolleyball className="w-10 h-10 text-yellow-400" />
          <h1 className="text-3xl font-bold text-white">
            League Access
          </h1>
        </div>
        <p className="text-gray-400 mb-8">Please enter your access code to continue.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="access-code" className="sr-only">Access Code</label>
            <input
              type="text"
              id="access-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g., PLYR-1-JANE"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-lg tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-yellow-400"
              autoFocus
            />
          </div>
          
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          
          <button
            type="submit"
            className="w-full py-3 px-4 bg-yellow-500 text-gray-900 font-bold rounded-lg hover:bg-yellow-400 transition-all duration-300 disabled:bg-gray-600"
            disabled={!code}
          >
            Enter
          </button>
        </form>

        <details className="text-left text-xs text-gray-400 mt-6 bg-gray-900/50 p-3 rounded-lg">
            <summary className="cursor-pointer font-semibold hover:text-white">Access Level Information</summary>
            <div className="mt-2 space-y-2">
                <p><strong className="text-gray-300">Players/Parents:</strong> Use the personal code provided by your league admin to view and edit your profile information.</p>
                <p><strong className="text-gray-300">Referees:</strong> Use the daily code to enter scores for the current day's games. Cannot edit a score once submitted.</p>
                <p><strong className="text-gray-300">Super Admin:</strong> Has full control to edit scores, manage settings, and view access codes. Uses a permanent code.</p>
            </div>
        </details>
      </div>
    </div>
  );
};

export default LoginScreen;