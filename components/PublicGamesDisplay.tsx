
import React from 'react';
import type { CourtResults, GameMatchup, Player } from '../types';

interface GameCardProps {
    gameIndex: number;
    matchup: GameMatchup;
    result?: CourtResults[number];
}

const TeamList: React.FC<{ team: Player[], title: string }> = ({ team, title }) => (
    <div>
        <h4 className="font-semibold text-white mb-2 text-center">{title}</h4>
        <ul className="text-sm space-y-1 text-gray-300">
            {team.map(player => (
                <li key={player.id} className="truncate p-1 rounded-md bg-gray-900/50">
                    {player.name}
                </li>
            ))}
        </ul>
    </div>
);


const GameCard: React.FC<GameCardProps> = ({ gameIndex, matchup, result }) => {
    const scores = result === 'unplayed' || !result ? { teamAScore: null, teamBScore: null } : result;
    const isComplete = scores.teamAScore !== null && scores.teamBScore !== null;
    
    let teamAOutcomeStyle = 'text-gray-300';
    let teamBOutcomeStyle = 'text-gray-300';
    if (isComplete) {
        if (scores.teamAScore! > scores.teamBScore!) {
            teamAOutcomeStyle = 'text-green-400';
            teamBOutcomeStyle = 'text-red-400';
        } else if (scores.teamBScore! > scores.teamAScore!) {
            teamBOutcomeStyle = 'text-green-400';
            teamAOutcomeStyle = 'text-red-400';
        }
    }

    return (
        <div className="bg-gray-700/50 p-4 rounded-lg flex flex-col gap-4">
            <h3 className="text-center font-bold text-lg text-white border-b border-gray-600 pb-2">
                Game {gameIndex + 1}
            </h3>
            <div className="flex justify-center items-center gap-4">
                 <div className="text-center">
                    <p className={`text-4xl font-bold ${teamAOutcomeStyle}`}>{scores.teamAScore ?? '-'}</p>
                </div>
                <span className="text-gray-400 font-bold text-xl">-</span>
                 <div className="text-center">
                    <p className={`text-4xl font-bold ${teamBOutcomeStyle}`}>{scores.teamBScore ?? '-'}</p>
                </div>
            </div>
             <div className="grid grid-cols-2 gap-3 items-start">
                <TeamList team={matchup.teamA} title="Team A" />
                <TeamList team={matchup.teamB} title="Team B" />
            </div>
        </div>
    );
};

interface PublicGamesDisplayProps {
    matchups?: GameMatchup[];
    results?: CourtResults;
}

const PublicGamesDisplay: React.FC<PublicGamesDisplayProps> = ({ matchups, results }) => {
    if (!matchups || matchups.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchups.slice(0, 6).map((matchup, index) => (
                <GameCard 
                    key={index}
                    gameIndex={index}
                    matchup={matchup}
                    result={results?.[index]}
                />
            ))}
        </div>
    );
};

export default PublicGamesDisplay;
