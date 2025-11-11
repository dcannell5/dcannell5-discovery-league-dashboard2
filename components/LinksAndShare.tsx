import React from 'react';
import { IconLink, IconShare, IconEnvelope } from './Icon';

interface LinksAndShareProps {
  leagueTitle: string;
}

const externalLinks = [
    { name: "Canadian Volleyball Elite Academy", url: "https://canadianeliteacademy.corsizio.com/" },
    { name: "League News & Blog", url: "https://cev5.blogspot.com/" },
    { name: "Academy Photo Gallery", url: "https://sites.google.com/view/cea-gallery/home" },
];

const LinksAndShare: React.FC<LinksAndShareProps> = ({ leagueTitle }) => {
  const shareUrl = window.location.origin;
  const shareText = `Check out the ${leagueTitle}! A great development league for athletes.`;

  const emailBody = `${shareText}\n\nView the league here: ${shareUrl}`;

  return (
    <div className="my-8 p-6 bg-gray-800/50 rounded-2xl shadow-2xl border border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
            <IconLink className="w-5 h-5"/>
            More Resources
        </h3>
        <div className="space-y-2">
            {externalLinks.map(link => (
                 <a 
                    key={link.name} 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block bg-gray-700/50 p-3 rounded-lg hover:bg-gray-700 hover:text-yellow-300 transition-colors font-semibold"
                >
                    {link.name} &rarr;
                </a>
            ))}
        </div>
      </div>
       <div>
        <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
            <IconShare className="w-5 h-5"/>
            Share the League
        </h3>
        <p className="text-sm text-gray-400 mb-4">
            Help spread the word to friends and your support community!
        </p>
        <div className="flex gap-4">
             <a 
                href={`mailto:?subject=${encodeURIComponent(leagueTitle)}&body=${encodeURIComponent(emailBody)}`}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-700/50 p-3 rounded-lg hover:bg-gray-700 hover:text-yellow-300 transition-colors font-semibold"
            >
                <IconEnvelope className="w-5 h-5"/>
                Email
            </a>
            <button 
                onClick={() => navigator.clipboard.writeText(shareUrl)}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-700/50 p-3 rounded-lg hover:bg-gray-700 hover:text-yellow-300 transition-colors font-semibold"
            >
                <IconLink className="w-5 h-5"/>
                Copy Link
            </button>
        </div>
      </div>
    </div>
  );
};

export default LinksAndShare;