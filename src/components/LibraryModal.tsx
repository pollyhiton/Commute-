import React from 'react';
import {
  History,
  Play,
  Trash2,
  X,
  Clock,
  FileText,
  Calendar,
  Volume2,
} from 'lucide-react';
import { BriefingScript, formatDuration } from '../utils/commuteLogic';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedBriefings: BriefingScript[];
  onSelectBriefing: (briefing: BriefingScript) => void;
  onDeleteBriefing: (id: string) => void;
  onClearAll: () => void;
}

export const LibraryModal: React.FC<LibraryModalProps> = ({
  isOpen,
  onClose,
  savedBriefings,
  onSelectBriefing,
  onDeleteBriefing,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              Saved Commute Briefings ({savedBriefings.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close Library"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of saved briefings */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-3 pr-1">
          {savedBriefings.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <History className="w-10 h-10 mx-auto mb-2 opacity-30 text-amber-400" />
              <p className="text-sm">No saved commute briefings yet.</p>
              <p className="text-xs mt-1">
                Generated briefings are automatically saved here for offline re-listening!
              </p>
            </div>
          ) : (
            savedBriefings.map((b) => (
              <div
                key={b.id}
                className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition-all flex items-center justify-between gap-3 group"
              >
                <div
                  onClick={() => {
                    onSelectBriefing(b);
                    onClose();
                  }}
                  className="flex-1 min-w-0 cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {new Date(b.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span>•</span>
                    <span className="text-amber-400 font-semibold uppercase">
                      {b.format}
                    </span>
                    <span>•</span>
                    <span>{b.articlesIncluded} stories</span>
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                    {b.title}
                  </h4>

                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{formatDuration(b.estimatedDurationSec)}</span>
                    {b.audioUrl && (
                      <span className="text-[10px] text-emerald-400 font-sans font-semibold px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20">
                        WAV Cached
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onSelectBriefing(b);
                      onClose();
                    }}
                    className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold active:scale-95 transition-all shadow-md"
                    title="Play this briefing"
                    aria-label={`Play ${b.title}`}
                  >
                    <Play className="w-4 h-4 fill-slate-950 translate-x-0.2" />
                  </button>

                  <button
                    onClick={() => onDeleteBriefing(b.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Delete briefing"
                    aria-label={`Delete ${b.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {savedBriefings.length > 0 && (
          <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-500">
              Stored locally on this device
            </span>
            <button
              onClick={onClearAll}
              className="text-rose-400 hover:text-rose-300 transition-colors font-medium"
            >
              Clear Library
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
