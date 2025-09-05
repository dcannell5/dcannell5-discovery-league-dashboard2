import React from 'react';
import { IconLightbulb } from './Icon';

interface AiHelperButtonProps {
  onClick: () => void;
}

const AiHelperButton: React.FC<AiHelperButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-30 w-14 h-14 bg-yellow-500 rounded-full shadow-lg flex items-center justify-center text-gray-900 hover:bg-yellow-400 transform transition-all hover:scale-110 focus:outline-none focus:ring-4 focus:ring-yellow-500/50"
      aria-label="Open League AI Assistant"
    >
      <IconLightbulb className="w-7 h-7" />
    </button>
  );
};

export default AiHelperButton;
