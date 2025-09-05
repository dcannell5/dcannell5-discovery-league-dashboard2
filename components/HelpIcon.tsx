import React from 'react';
import { IconHelp } from './Icon';

interface HelpIconProps {
  text: string;
  className?: string;
}

const HelpIcon: React.FC<HelpIconProps> = ({ text, className }) => {
  return (
    <span className="inline-block ml-1.5" title={text}>
      <IconHelp className={`w-4 h-4 text-gray-500 cursor-help ${className}`} />
    </span>
  );
};

export default HelpIcon;
