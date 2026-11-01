import React from 'react';
import {
  Clock,
  Mic,
  Sliders,
  Volume2,
  Users,
  Compass,
  Zap,
  Play,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { calculateTargetWordCount, formatDuration } from '../utils/commuteLogic';

export interface CommuteConfig {
  commuteMinutes: number;
  format: 'solo' | 'duo' | 'executive' | 'storyteller';
  tone: 'energizing' | 'calm' | 'analytical';
  preferredVoice: string;
  commuteContext: string;
}

interface CommuteSettingsProps {
  config: CommuteConfig;
  onChangeConfig: (updated: Partial<CommuteConfig>) => void;
  selectedArticlesCount: number;
  onGenerate: () => void;
  isGenerating: boolean;
  generationStep: string;
}

export const CommuteSettings: React.FC<CommuteSettingsProps> = ({
  config,
  onChangeConfig,
  selectedArticlesCount,
  onGenerate,
  isGenerating,
  generationStep,
}) => {
  const durationPresets = [3, 5, 10, 15, 20];
  const targetWords = calculateTargetWordCount(config.commuteMinutes, config.format);

  return (
    <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            Commute Personalization
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tailor the audio pace, duration, and vocal style for your commute.
          </p>
        </div>
      </div>

      {/* 1. Commute Duration */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400" />
            Commute Duration
          </label>
          <span className="text-xs font-bold text-amber-300 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            {config.commuteMinutes} Minutes (~{targetWords} words)
          </span>
        </div>

        {/* Quick Presets */}
        <div className="grid grid-cols-5 gap-2 mb-3">
          {durationPresets.map((mins) => (
            <button
              key={mins}
              type="button"
              onClick={() => onChangeConfig({ commuteMinutes: mins })}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                config.commuteMinutes === mins
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 ring-1 ring-amber-300'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>

        {/* Fine-tune Slider */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-500 font-medium">1m</span>
          <input
            type="range"
            min={1}
            max={35}
            step={1}
            value={config.commuteMinutes}
            onChange={(e) =>
              onChangeConfig({ commuteMinutes: parseInt(e.target.value, 10) })
            }
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <span className="text-[11px] text-slate-500 font-medium">35m</span>
        </div>
      </div>

      {/* 2. Briefing Format */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2.5 flex items-center gap-1.5">
          <Mic className="w-4 h-4 text-amber-400" />
          Briefing Format
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Solo Anchor */}
          <button
            type="button"
            onClick={() => onChangeConfig({ format: 'solo' })}
            className={`p-3 rounded-xl text-left border transition-all ${
              config.format === 'solo'
                ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/30'
                : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                Solo News Anchor
              </span>
              <span className="text-[10px] text-amber-400/80 font-mono">145 WPM</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-normal">
              Crisp radio-style broadcast with seamless topic transitions.
            </p>
          </button>

          {/* Co-Hosts Duo */}
          <button
            type="button"
            onClick={() => onChangeConfig({ format: 'duo' })}
            className={`p-3 rounded-xl text-left border transition-all ${
              config.format === 'duo'
                ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/30'
                : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                Commute Duo (Alex & Sam)
              </span>
              <span className="text-[10px] text-cyan-400/80 font-mono">Podcast</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-normal">
              Conversational co-host banter, dynamic reactions & chemistry.
            </p>
          </button>

          {/* Executive Brief */}
          <button
            type="button"
            onClick={() => onChangeConfig({ format: 'executive' })}
            className={`p-3 rounded-xl text-left border transition-all ${
              config.format === 'executive'
                ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/30'
                : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-rose-400" />
                Executive Brief
              </span>
              <span className="text-[10px] text-rose-400/80 font-mono">High Pace</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-normal">
              Bottom-line upfront, market impact, key stats, zero fluff.
            </p>
          </button>

          {/* Storyteller */}
          <button
            type="button"
            onClick={() => onChangeConfig({ format: 'storyteller' })}
            className={`p-3 rounded-xl text-left border transition-all ${
              config.format === 'storyteller'
                ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/30'
                : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
                Storyteller & Context
              </span>
              <span className="text-[10px] text-indigo-400/80 font-mono">Narrative</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-normal">
              Explores background history, human perspective, and implications.
            </p>
          </button>
        </div>
      </div>

      {/* 3. Tone & Voice Persona */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Tone */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
            Atmosphere & Tone
          </label>
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
            {(['energizing', 'calm', 'analytical'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onChangeConfig({ tone: t })}
                className={`flex-1 py-1.5 rounded-lg font-medium capitalize transition-all ${
                  config.tone === t
                    ? 'bg-slate-800 text-amber-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Gemini Voice Persona */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
            Gemini Voice Persona
          </label>
          <select
            value={config.preferredVoice}
            onChange={(e) => onChangeConfig({ preferredVoice: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-200 focus:outline-none focus:border-amber-400"
          >
            <option value="Kore">Kore (Balanced, studio-grade anchor)</option>
            <option value="Puck">Puck (Lively, dynamic, upbeat)</option>
            <option value="Fenrir">Fenrir (Authoritative, rich resonance)</option>
            <option value="Zephyr">Zephyr (Smooth, crisp clarity)</option>
            <option value="Charon">Charon (Measured, deep narrative)</option>
          </select>
        </div>
      </div>

      {/* 4. Commute Context Note */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
          Commute Context Greeting (Optional)
        </label>
        <input
          type="text"
          placeholder="e.g., Morning commute into Downtown, Red Line Subway ride, Rain drive"
          value={config.commuteContext}
          onChange={(e) => onChangeConfig({ commuteContext: e.target.value })}
          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
        />
      </div>

      {/* 5. Generation CTA Button */}
      <div className="pt-2">
        <button
          onClick={onGenerate}
          disabled={isGenerating || selectedArticlesCount === 0}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-xl transition-all active:scale-[0.99] ${
            isGenerating || selectedArticlesCount === 0
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-amber-500/25 ring-1 ring-white/20'
          }`}
          aria-label="Generate Commute Audio Briefing"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
              <span>{generationStep || 'Synthesizing Audio Briefing...'}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-slate-950 fill-slate-950" />
              <span>
                Generate {config.commuteMinutes}-Min Commute Briefing (
                {selectedArticlesCount} Stories)
              </span>
            </>
          )}
        </button>

        {selectedArticlesCount === 0 && (
          <p className="text-center text-xs text-rose-400 mt-2">
            Please select at least 1 article from the list above.
          </p>
        )}
      </div>
    </div>
  );
};
