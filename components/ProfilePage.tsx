


import React, { useState, useEffect } from 'react';
import type { Player, PlayerProfile, UserState, RefereeNote } from '../types';
import { getPlayerCode, getParentCode } from '../utils/auth';
import { IconUserCircle, IconEdit, IconMessage, IconLock, IconLightbulb } from './Icon';
import HelpIcon from './HelpIcon';

interface ProfilePageProps {
  player: Player;
  profile: PlayerProfile;
  userState: UserState;
  onSave: (playerId: number, newProfile: PlayerProfile) => void;
  onBack: () => void;
  refereeNotes: RefereeNote[];
  currentPIN?: string;
  onSetPIN: (pin: string) => void;
  onSavePlayerFeedback: (feedbackText: string) => void;
}

const PINModal: React.FC<{
    player: Player;
    currentPIN?: string;
    onClose: () => void;
    onSetPIN: (pin: string) => void;
}> = ({ player, currentPIN, onClose, onSetPIN }) => {
    const [currentCode, setCurrentCode] = useState('');
    const [newPIN, setNewPIN] = useState('');
    const [confirmPIN, setConfirmPIN] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const defaultPlayerCode = getPlayerCode(player);
        const defaultParentCode = getParentCode(player);

        const isCurrentCodeValid = 
            currentCode.toUpperCase() === currentPIN ||
            currentCode.toUpperCase() === defaultPlayerCode ||
            currentCode.toUpperCase() === defaultParentCode;
            
        if (!isCurrentCodeValid) {
            setError('Current code/PIN is incorrect.');
            return;
        }

        if (!/^\d{4,6}$/.test(newPIN)) {
            setError('New PIN must be 4 to 6 digits.');
            return;
        }

        if (newPIN !== confirmPIN) {
            setError('New PINs do not match.');
            return;
        }

        onSetPIN(newPIN);
        onClose();
        alert('PIN updated successfully!');
    };

    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div 
                className="w-full max-w-md mx-auto p-8 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 text-center"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold text-white mb-2">Change Login PIN</h2>
                <p className="text-gray-400 mb-6">Create a private 4-6 digit PIN for easier login.</p>
                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                     <div>
                        <label htmlFor="current-code" className="block text-sm font-medium text-gray-300 mb-1">Current Code or PIN</label>
                        <input
                            type="password"
                            id="current-code"
                            value={currentCode}
                            onChange={e => setCurrentCode(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="new-pin" className="block text-sm font-medium text-gray-300 mb-1">New PIN (4-6 digits)</label>
                        <input
                            type="password"
                            id="new-pin"
                            value={newPIN}
                            onChange={e => setNewPIN(e.target.value)}
                             pattern="\d{4,6}"
                             maxLength={6}
                             title="Must be 4 to 6 digits"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="confirm-pin" className="block text-sm font-medium text-gray-300 mb-1">Confirm New PIN</label>
                        <input
                            type="password"
                            id="confirm-pin"
                            value={confirmPIN}
                            onChange={e => setConfirmPIN(e.target.value)}
                            pattern="\d{4,6}"
                            maxLength={6}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            required
                        />
                    </div>
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    <div className="flex justify-end gap-4 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-bold rounded-lg bg-yellow-500 text-gray-900 hover:bg-yellow-400 transition-colors">Set New PIN</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PlayerFeedbackModal: React.FC<{
    onClose: () => void;
    onSubmit: (feedback: string) => void;
}> = ({ onClose, onSubmit }) => {
    const [feedbackText, setFeedbackText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (feedbackText.trim()) {
            onSubmit(feedbackText.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div 
                className="w-full max-w-lg mx-auto p-8 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-center items-center gap-3 mb-4 text-center">
                    <IconLightbulb className="w-8 h-8 text-yellow-400" />
                    <h2 className="text-2xl font-bold text-white">Share Your Feedback</h2>
                </div>
                <p className="text-gray-400 mb-6 text-center">Have an idea, suggestion, or tip to improve the league? Share it privately with the admin.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        rows={6}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="Type your feedback here..."
                        autoFocus
                    />
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={!feedbackText.trim()} className="px-4 py-2 text-sm font-bold rounded-lg bg-yellow-500 text-gray-900 hover:bg-yellow-400 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                            Submit Feedback
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const ProfilePage: React.FC<ProfilePageProps> = ({ player, profile, userState, onSave, onBack, refereeNotes, currentPIN, onSetPIN, onSavePlayerFeedback }) => {
  const [localProfile, setLocalProfile] = useState<PlayerProfile>(profile);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showPINModal, setShowPINModal] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  useEffect(() => {
    setLocalProfile(profile);
  }, [profile]);

  const canEditProfile = userState.role === 'SUPER_ADMIN' || (userState.role === 'PLAYER' && userState.playerId === player.id);
  const canEditContacts = canEditProfile || (userState.role === 'PARENT' && userState.playerId === player.id);
  const canChangePIN = userState.role === 'PLAYER' || userState.role === 'PARENT';
  const canProvideFeedback = userState.role === 'PLAYER' || userState.role === 'PARENT';


  const handleInputChange = (field: keyof PlayerProfile, value: string) => {
    setLocalProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
        const fileAsDataURL = reader.result as string;
        try {
            const response = await fetch('/api/uploadImage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ file: fileAsDataURL, fileName: file.name })
            });

            if (!response.ok) {
                const errorResult = await response.json();
                throw new Error(errorResult.error || 'Upload failed');
            }

            const { url } = await response.json();
            handleInputChange('imageUrl', url);

        } catch (err: any) {
            setUploadError(err.message || 'Could not upload image.');
        } finally {
            setIsUploading(false);
        }
    };
    reader.onerror = () => {
        setUploadError('Failed to read file.');
        setIsUploading(false);
    }
  };
  
  const handleSave = () => {
      onSave(player.id, localProfile);
      setIsEditing(false);
  }

  const handleCancel = () => {
    setLocalProfile(profile);
    setIsEditing(false);
  }

  const handleFeedbackSubmit = (feedbackText: string) => {
    onSavePlayerFeedback(feedbackText);
    setIsFeedbackModalOpen(false);
    alert("Thank you! Your feedback has been sent to the admin.");
  };

  const renderField = (label: string, field: keyof PlayerProfile, type: 'text' | 'textarea', canEdit: boolean, helpText: string) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center">{label} <HelpIcon text={helpText} /></label>
        {isEditing ? (
            type === 'textarea' ? (
                <textarea
                    value={localProfile[field] || ''}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50"
                    disabled={!canEdit}
                />
            ) : (
                <input
                    type="text"
                    value={localProfile[field] || ''}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50"
                    disabled={!canEdit}
                />
            )
        ) : (
            <p className="p-3 bg-gray-900/50 rounded-lg min-h-[44px] whitespace-pre-wrap">{localProfile[field] || <span className="text-gray-500">Not set</span>}</p>
        )}
    </div>
  );

  return (
    <>
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-8">
      <div className="container mx-auto max-w-4xl">
        <header className="flex justify-between items-center mb-8">
          <button onClick={onBack} className="text-sm font-semibold text-gray-300 hover:text-yellow-400 transition-colors">&larr; Back to Dashboard</button>
           { (canEditProfile || canEditContacts) && !isEditing &&
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-sm font-semibold bg-gray-700/50 px-3 py-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors">
                <IconEdit className="w-4 h-4"/> Edit Profile
            </button>
           }
        </header>

        <div className="bg-gray-800/50 p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 text-center">
            <div className="relative w-40 h-40 mx-auto">
                {localProfile.imageUrl ? (
                    <img src={localProfile.imageUrl} alt={player.name} className="w-40 h-40 rounded-full object-cover border-4 border-gray-600" />
                ) : (
                    <IconUserCircle className="w-40 h-40 text-gray-600" />
                )}
                {isEditing && canEditProfile && (
                     <label htmlFor="image-upload" className="absolute bottom-0 right-0 bg-yellow-500 p-2 rounded-full cursor-pointer hover:bg-yellow-400 transition-colors">
                        <IconEdit className="w-5 h-5 text-gray-900" />
                        <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                )}
            </div>
            {isUploading && <p className="text-sm text-yellow-400 mt-2">Uploading...</p>}
            {uploadError && <p className="text-sm text-red-400 mt-2">{uploadError}</p>}
            <h1 className="text-3xl font-bold mt-4 text-white">{player.name}</h1>
            {player.grade && <p className="text-gray-400">Grade {player.grade}</p>}
          </div>

          <div className="md:col-span-2 space-y-6">
            {renderField('Bio', 'bio', 'textarea', canEditProfile, "Share a bit about your athletic journey. This is visible to other logged-in league members.")}
            {renderField('Private Suggestions', 'suggestions', 'textarea', canEditProfile || canEditContacts, "Share any comments or suggestions privately with the league admin. This is NOT visible to other players.")}

            <div className="border-t border-gray-700 pt-6 space-y-6">
                <h3 className="text-lg font-semibold text-yellow-400 flex items-center">
                    Emergency Contact Info <HelpIcon text="This information is private and only visible to you and the league admin." />
                </h3>
                {renderField('Guardian Name', 'guardianName', 'text', canEditContacts, "Parent or guardian's full name.")}
                {renderField('Guardian Phone', 'guardianPhone', 'text', canEditContacts, "Primary phone number for emergencies.")}
                {renderField('Guardian Email', 'guardianEmail', 'text', canEditContacts, "Primary email for emergencies.")}
            </div>
            
            {isEditing && (
                <div className="flex justify-end gap-4 pt-4">
                    <button onClick={handleCancel} className="px-4 py-2 text-sm font-bold rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-bold rounded-lg bg-yellow-500 text-gray-900 hover:bg-yellow-400 transition-colors">Save Changes</button>
                </div>
            )}
          </div>
        </div>

        {canProvideFeedback && (
          <div className="mt-8 bg-gray-800/50 p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-700">
            <h3 className="text-xl font-bold text-yellow-400 mb-2 flex items-center gap-3">
                <IconLightbulb className="w-6 h-6"/>
                Provide Feedback
            </h3>
            <p className="text-sm text-gray-400 mb-4">
                Your suggestions are valuable for improving the league. All feedback is sent privately to the league administrator.
            </p>
            <button
                onClick={() => setIsFeedbackModalOpen(true)}
                className="px-4 py-2 text-sm font-bold rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition-colors"
            >
                Share Ideas & Suggestions
            </button>
          </div>
        )}

        {canChangePIN && (
          <div className="mt-8 bg-gray-800/50 p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-700">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-yellow-400 flex items-center gap-3">
                      <IconLock className="w-5 h-5"/>
                      Security Settings
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                      {currentPIN ? `Your custom PIN is set.` : `You are using the default login code.`}
                  </p>
                </div>
                <button onClick={() => setShowPINModal(true)} className="px-4 py-2 text-sm font-bold rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
                    Change PIN
                </button>
              </div>
          </div>
        )}

        {userState.role === 'SUPER_ADMIN' && refereeNotes.length > 0 && (
            <div className="mt-8 bg-gray-800/50 p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-700">
                <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-3">
                    <IconMessage className="w-6 h-6"/>
                    Referee Notes (Admin View Only)
                </h3>
                <div className="space-y-4">
                    {refereeNotes.map((note, index) => (
                        <div key={index} className="bg-gray-700/50 p-4 rounded-lg">
                            <p className="text-gray-200">"{note.note}"</p>
                            <p className="text-xs text-gray-400 mt-2 text-right">
                                — Submitted by {note.court} Referee during Day {note.day} on {new Date(note.date).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
    {showPINModal && <PINModal player={player} currentPIN={currentPIN} onClose={() => setShowPINModal(false)} onSetPIN={onSetPIN} />}
    {isFeedbackModalOpen && <PlayerFeedbackModal onClose={() => setIsFeedbackModalOpen(false)} onSubmit={handleFeedbackSubmit} />}
    </>
  );
};

export default ProfilePage;