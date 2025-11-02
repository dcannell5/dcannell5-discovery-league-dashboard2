

import React from 'react';
import type { ProjectLogEntry } from '../types';
import { logoUrl } from '../assets/logo';
import { IconBook } from './Icon';

interface BlogPageProps {
  logs: ProjectLogEntry[];
  onBack: () => void;
}

const BlogPage: React.FC<BlogPageProps> = ({ logs, onBack }) => {
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans antialiased p-4 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-12 relative">
                    <div className="absolute top-0 left-0">
                        <button onClick={onBack} className="text-sm font-semibold text-gray-300 hover:text-yellow-400 transition-colors">&larr; Back to Main Site</button>
                    </div>
                    <img src={logoUrl} alt="Canadian Elite Academy Logo" className="w-24 h-24 mx-auto mb-4 rounded-full shadow-lg bg-gray-800 p-2" />
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-yellow-500 mb-4">
                        Canadian Elite Academy Build
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Follow along as we build the world's leading academy app. This is a public journal of our process, ideas, and the evolution of this project with our AI development partner.
                    </p>
                </header>

                <main className="space-y-12">
                    {sortedLogs.length > 0 ? sortedLogs.map((log) => (
                        <article key={log.id} className="bg-gray-800/50 p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-700">
                            <header>
                                <p className="text-sm text-yellow-400 mb-1">
                                    {new Date(log.date).toLocaleDateString(undefined, {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                                <h2 className="text-3xl font-bold text-white">
                                    {log.title}
                                </h2>
                            </header>
                            <div className="prose prose-invert max-w-none mt-6 text-gray-300 whitespace-pre-wrap leading-relaxed">
                                {log.content}
                            </div>
                        </article>
                    )) : (
                         <div className="text-center py-20 bg-gray-800/50 rounded-2xl">
                            <IconBook className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                            <h2 className="text-2xl font-bold text-white">No Posts Yet</h2>
                            <p className="text-gray-400 mt-2">The build blog is ready. Check back soon for the first entry!</p>
                        </div>
                    )}
                </main>

                 <footer className="text-center mt-16 text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} Canadian Elite Academy. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
};

export default BlogPage;