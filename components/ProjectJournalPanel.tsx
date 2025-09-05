
import React, { useState } from 'react';
import type { ProjectLogEntry } from '../types';
import { IconBook, IconChevronDown } from './Icon';

interface ProjectJournalPanelProps {
  logs: ProjectLogEntry[];
  onSaveLog: (post: Omit<ProjectLogEntry, 'id' | 'date'>) => void;
}

const ProjectJournalPanel: React.FC<ProjectJournalPanelProps> = ({ logs, onSaveLog }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newLogTitle, setNewLogTitle] = useState('');
  const [newLogContent, setNewLogContent] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  const handleSave = () => {
    if (newLogContent.trim() && newLogTitle.trim()) {
      onSaveLog({
          title: newLogTitle.trim(),
          content: newLogContent.trim(),
          isPublished
      });
      setNewLogTitle('');
      setNewLogContent('');
      setIsPublished(true);
    }
  };

  const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="bg-gray-800/50 rounded-2xl shadow-2xl border border-gray-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-6 text-lg font-bold text-yellow-400 hover:text-yellow-300 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-3">
          <IconBook className="w-6 h-6" /> Project Journal (Build Blog)
        </span>
        <IconChevronDown className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="px-6 pb-6 border-t border-gray-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
            <div>
              <h4 className="font-semibold text-white mb-2">New Blog Post</h4>
              <p className="text-sm text-gray-400 mb-4">Write and publish posts for the public "Build Blog". Entries are automatically timestamped.</p>
              <div className="space-y-4">
                <input
                    type="text"
                    value={newLogTitle}
                    onChange={(e) => setNewLogTitle(e.target.value)}
                    placeholder="Post Title"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <textarea
                    value={newLogContent}
                    onChange={(e) => setNewLogContent(e.target.value)}
                    rows={8}
                    placeholder="Write blog content here..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                 <div className="flex items-center justify-between">
                    <label htmlFor="isPublished" className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                        <input
                            type="checkbox"
                            id="isPublished"
                            checked={isPublished}
                            onChange={(e) => setIsPublished(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                        />
                        Publish to public blog
                    </label>
                    <button
                        onClick={handleSave}
                        disabled={!newLogContent.trim() || !newLogTitle.trim()}
                        className="py-2 px-4 bg-yellow-500 text-gray-900 font-bold rounded-lg hover:bg-yellow-400 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        Save Post
                    </button>
                 </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Post History</h4>
              <div className="space-y-4 max-h-[400px] overflow-y-auto bg-gray-900/50 p-4 rounded-lg border border-gray-600">
                {sortedLogs.length > 0 ? (
                  sortedLogs.map((log) => (
                    <div key={log.id} className="bg-gray-800/70 p-3 rounded-md text-sm">
                      <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-white">{log.title}</p>
                            <p className="text-yellow-400 text-xs mb-1">
                                {new Date(log.date).toLocaleString()}
                            </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${log.isPublished ? 'bg-green-500/20 text-green-400' : 'bg-gray-600 text-gray-300'}`}>
                            {log.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <p className="text-gray-200 whitespace-pre-wrap mt-2">{log.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No log entries yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectJournalPanel;