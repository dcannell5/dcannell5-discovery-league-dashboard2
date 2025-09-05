import React, { useState, useEffect } from 'react';
import type { UserState } from '../types';
import { IconEdit } from './Icon';

interface AnnouncementsProps {
  text: string;
  userRole: UserState['role'];
  onSave: (newText: string) => void;
}

const Announcements: React.FC<AnnouncementsProps> = ({ text, userRole, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);

  useEffect(() => {
    setEditText(text);
  }, [text]);

  const handleSave = () => {
    onSave(editText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(text);
    setIsEditing(false);
  };

  return (
    <div className="my-8 p-6 bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 rounded-2xl shadow-2xl border border-yellow-500/50 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-yellow-400">Announcements</h2>
        {userRole === 'SUPER_ADMIN' && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-yellow-400 transition-colors"
          >
            <IconEdit className="w-4 h-4" />
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <div className="flex justify-end gap-4">
            <button onClick={handleCancel} className="px-4 py-2 text-sm font-bold rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} className="px-4 py-2 text-sm font-bold rounded-lg bg-yellow-500 text-gray-900 hover:bg-yellow-400 transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-200 whitespace-pre-wrap">{text || 'No announcements at this time.'}</p>
      )}
    </div>
  );
};

export default Announcements;