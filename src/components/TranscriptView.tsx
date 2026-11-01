import React, { useState } from 'react';
import {
  FileText,
  ListChecks,
  CheckCircle2,
  Volume2,
  Clock,
  Sparkles,
  User,
  Users,
} from 'lucide-react';
import { BriefingScript, BriefingChapter, formatDuration } from '../utils/commuteLogic';

interface TranscriptViewProps {
  briefing: BriefingScript;
  activeChapterIndex: number;
  onSelectChapter: (index: number) => void;
}

export const TranscriptView: React.FC<TranscriptViewProps> = ({
  briefing,
  activeChapterIndex,
  onSelectChapter,
}) => {
  const [activeTab, setActiveTab] = useState<'transcript' | 'shownotes'>('transcript');

  return (
    <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
      {/* Tab Switcher */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('transcript')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'transcript'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Spoken Transcript</span>
          </button>

          <button
            onClick={() => setActiveTab('shownotes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'shownotes'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ListChecks className="w-3.5 h-3.5" />
            <span>Executive Takeaways</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-500 hidden sm:inline">
          Tap any chapter to seek audio
        </span>
      </div>

      {/* Tab Content: Spoken Transcript */}
      {activeTab === 'transcript' && (
        <div className="mt-4 space-y-4 max-h-[480px] overflow-y-auto pr-2">
          {/* Intro Box */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Broadcast Opening</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              "{briefing.intro.text}"
            </p>
          </div>

          {/* Chapters */}
          {briefing.chapters.map((ch, idx) => {
            const isActive = idx === activeChapterIndex;
            return (
              <div
                key={ch.id}
                onClick={() => onSelectChapter(idx)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isActive
                    ? 'bg-slate-800/90 border-amber-500/60 ring-1 ring-amber-500/40 shadow-lg'
                    : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/70 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                        isActive
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      Story {idx + 1}
                    </span>
                    <span className="font-semibold text-white">{ch.title}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{formatDuration(ch.startTimeSec)}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line mt-2">
                  {ch.text}
                </p>

                {ch.takeaways && ch.takeaways.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-700/40 flex flex-wrap gap-2">
                    {ch.takeaways.map((t, tIdx) => (
                      <span
                        key={tIdx}
                        className="inline-flex items-center gap-1 text-[11px] text-amber-300/90 bg-amber-500/10 px-2 py-0.5 rounded-md"
                      >
                        <CheckCircle2 className="w-3 h-3 text-amber-400" />
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Outro Box */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Broadcast Sign-Off</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed italic">
              "{briefing.outro.text}"
            </p>
          </div>
        </div>
      )}

      {/* Tab Content: Executive Takeaways */}
      {activeTab === 'shownotes' && (
        <div className="mt-4 space-y-4 max-h-[480px] overflow-y-auto pr-2">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-2">
              Key Commute Highlights ({briefing.chapters.length} Stories)
            </h3>
            <div className="space-y-3">
              {briefing.chapters.map((ch, idx) => (
                <div key={ch.id} className="border-b border-slate-800/80 pb-3 last:border-b-0">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold text-xs">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-200">
                      {ch.title}
                    </span>
                  </div>
                  {ch.takeaways && ch.takeaways.length > 0 ? (
                    <ul className="mt-1.5 space-y-1 pl-4">
                      {ch.takeaways.map((takeaway, tIdx) => (
                        <li
                          key={tIdx}
                          className="text-xs text-slate-300 list-disc leading-relaxed"
                        >
                          {takeaway}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {ch.text.slice(0, 160)}...
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
