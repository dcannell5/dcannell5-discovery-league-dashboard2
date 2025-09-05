import React, { useState, useRef, useEffect } from 'react';
import type { AiMessage } from '../types';
import { IconLightbulb } from './Icon';

interface AiHelperProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: AiMessage[];
  onSendQuery: (query: string) => void;
}

const AiHelper: React.FC<AiHelperProps> = ({ isOpen, onClose, conversation, onSendQuery }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [conversation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendQuery(input.trim());
      setInput('');
    }
  };
  
  const welcomeMessage: AiMessage = {
      id: 'system-welcome',
      role: 'system',
      content: "Hello! I'm your League AI Assistant. How can I help you today? You can ask me about player stats, schedules, or even ask me to summarize a day's events."
  };
  
  const conversationToRender = conversation.length === 0 ? [welcomeMessage] : conversation;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed bottom-4 right-4 md:bottom-24 md:right-8 w-[calc(100%-2rem)] max-w-lg h-[70vh] max-h-[600px] bg-gray-800/80 backdrop-blur-lg border border-gray-600 rounded-2xl shadow-2xl flex flex-col"
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <IconLightbulb className="w-6 h-6 text-yellow-400" />
            <h2 className="text-lg font-bold text-white">League AI Assistant</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </header>

        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {conversationToRender.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                     <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center mr-3 shrink-0">
                         <IconLightbulb className="w-5 h-5 text-yellow-400" />
                     </div>
                )}
                <div className={`max-w-xs md:max-w-md p-3 rounded-xl ${
                    msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 
                    msg.role === 'assistant' ? 'bg-gray-700 text-gray-200 rounded-bl-none' :
                    'bg-transparent text-gray-300 italic text-center w-full'
                }`}>
                    {msg.isThinking ? (
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-0"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></span>
                        </div>
                    ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                </div>
            </div>
          ))}
           <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-700">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about players, scores, schedules..."
              className="flex-1 px-4 py-2 bg-gray-900 border-2 border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              autoFocus
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="px-4 py-2 font-bold bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-400 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AiHelper;