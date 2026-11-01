import React from 'react';
import { Radio, Car, History, Sparkles } from 'lucide-react';

interface NavbarProps {
  onOpenCarMode: () => void;
  onOpenHistory: () => void;
  savedBriefingsCount: number;
  hasActiveBriefing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCarMode,
  onOpenHistory,
  savedBriefingsCount,
  hasActiveBriefing,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-1 ring-white/20">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-amber-200 via-orange-100 to-white bg-clip-text text-transparent">
                CommuteCast
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Audio Briefing
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Personalized News Radio for your daily commute
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {hasActiveBriefing && (
            <button
              onClick={onOpenCarMode}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-950/40 border border-emerald-400/30 transition-all active:scale-95"
              title="Launch Distraction-Free Car & Commute Mode"
              aria-label="Open Car & Commute Mode"
            >
              <Car className="w-4 h-4 text-emerald-200" />
              <span className="hidden xs:inline">Car Mode</span>
            </button>
          )}

          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium border border-slate-700 transition-all active:scale-95"
            aria-label="Saved Briefings Library"
          >
            <History className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Library</span>
            {savedBriefingsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[11px] font-bold">
                {savedBriefingsCount}
              </span>
            )}
          </button>

          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Studio Voice Ready</span>
          </div>
        </div>
      </div>
    </header>
  );
};
