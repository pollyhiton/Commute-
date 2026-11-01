import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  X,
  Car,
  Volume2,
} from 'lucide-react';
import { BriefingScript, BriefingChapter, formatDuration } from '../utils/commuteLogic';

interface CarModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  briefing: BriefingScript;
  activeChapterIndex: number;
  onSelectChapter: (index: number) => void;
}

export const CarModeModal: React.FC<CarModeModalProps> = ({
  isOpen,
  onClose,
  briefing,
  activeChapterIndex,
  onSelectChapter,
}) => {
  if (!isOpen) return null;

  const currentChapter: BriefingChapter | undefined =
    briefing.chapters[activeChapterIndex] || briefing.chapters[0];

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-6 sm:p-10 select-none animate-in fade-in duration-200">
      {/* Top Bar: Minimal distraction, exit button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Car className="w-8 h-8" />
          </div>
          <div>
            <span className="text-emerald-400 font-bold uppercase tracking-widest text-sm">
              Commute Mode Active
            </span>
            <div className="text-slate-400 text-xs">
              Distraction-free high-visibility interface
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white font-bold text-sm hover:bg-slate-800 active:scale-95 transition-all"
          aria-label="Exit Commute Mode"
        >
          <X className="w-6 h-6" />
          <span>Exit Car Mode</span>
        </button>
      </div>

      {/* Center Story Display */}
      <div className="text-center max-w-3xl mx-auto my-auto space-y-4">
        <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-sm uppercase tracking-wider font-bold">
          Story {activeChapterIndex + 1} of {briefing.chapters.length}
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
          {currentChapter?.title || briefing.title}
        </h1>

        {currentChapter?.takeaways && currentChapter.takeaways.length > 0 && (
          <p className="text-lg sm:text-xl text-slate-300 font-medium max-w-xl mx-auto mt-2">
            "{currentChapter.takeaways[0]}"
          </p>
        )}
      </div>

      {/* Bottom Mega Controls for Safe Driving / Transit Tap */}
      <div className="max-w-4xl mx-auto w-full pb-4">
        {/* Giant Chapter Navigation */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            onClick={() => onSelectChapter(Math.max(0, activeChapterIndex - 1))}
            disabled={activeChapterIndex === 0}
            className="py-5 px-6 rounded-3xl bg-slate-900 border-2 border-slate-700 text-slate-200 font-black text-lg sm:text-xl flex items-center justify-center gap-3 disabled:opacity-20 active:scale-95 transition-all"
            aria-label="Previous Story"
          >
            <SkipBack className="w-7 h-7" />
            <span>Previous Story</span>
          </button>

          <button
            onClick={() =>
              onSelectChapter(
                Math.min(briefing.chapters.length - 1, activeChapterIndex + 1)
              )
            }
            disabled={activeChapterIndex >= briefing.chapters.length - 1}
            className="py-5 px-6 rounded-3xl bg-slate-900 border-2 border-slate-700 text-slate-200 font-black text-lg sm:text-xl flex items-center justify-center gap-3 disabled:opacity-20 active:scale-95 transition-all"
            aria-label="Next Story"
          >
            <span>Next Story</span>
            <SkipForward className="w-7 h-7" />
          </button>
        </div>

        {/* Huge Chapter Jump Strip */}
        <div className="flex gap-2 overflow-x-auto py-2">
          {briefing.chapters.map((ch, idx) => (
            <button
              key={ch.id}
              onClick={() => onSelectChapter(idx)}
              className={`flex-1 min-w-[120px] py-3 px-3 rounded-2xl text-center font-bold text-xs border transition-all ${
                idx === activeChapterIndex
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Story {idx + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
