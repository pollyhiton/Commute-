import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Gauge,
  Timer,
  Car,
  Download,
  Share2,
  Check,
  Radio,
  Sparkles,
} from 'lucide-react';
import { BriefingScript, BriefingChapter, formatDuration, getCurrentChapterIndex } from '../utils/commuteLogic';

interface AudioPlayerProps {
  briefing: BriefingScript;
  onOpenCarMode: () => void;
  onSelectChapter: (chapterIndex: number) => void;
  activeChapterIndex: number;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  briefing,
  onOpenCarMode,
  onSelectChapter,
  activeChapterIndex,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [durationSec, setDurationSec] = useState(briefing.estimatedDurationSec || 300);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepSecondsLeft, setSleepSecondsLeft] = useState<number | null>(null);
  const [copiedShowNotes, setCopiedShowNotes] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Fallback Web Speech synthesis simulation if no audioUrl
  const useWebSpeech = !briefing.audioUrl && typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Sync duration if briefing changes
  useEffect(() => {
    if (briefing.estimatedDurationSec) {
      setDurationSec(briefing.estimatedDurationSec);
    }
    setCurrentTimeSec(0);
    setIsPlaying(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [briefing.id]);

  // Handle HTML5 Audio element setup
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
        setDurationSec(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTimeSec(audio.currentTime);
      const chIdx = getCurrentChapterIndex(audio.currentTime, briefing.chapters);
      if (chIdx !== activeChapterIndex && chIdx >= 0) {
        onSelectChapter(chIdx);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [briefing.chapters, activeChapterIndex, onSelectChapter]);

  // Handle Play / Pause toggle
  const togglePlay = () => {
    if (briefing.audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => setIsPlaying(true)).catch((e) => {
          console.warn('Audio play error, falling back:', e);
          startWebSpeech();
        });
      }
    } else {
      // Use Web Speech API
      if (isPlaying) {
        window.speechSynthesis.pause();
        setIsPlaying(false);
      } else {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
          setIsPlaying(true);
        } else {
          startWebSpeech();
        }
      }
    }
  };

  const startWebSpeech = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(briefing.fullTranscriptText);
    utterance.rate = playbackRate;

    // Pick a natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Premium') || v.name.includes('Google'))) || voices.find((v) => v.lang.startsWith('en'));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentTimeSec(durationSec);
    };
    utterance.onerror = () => setIsPlaying(false);

    speechSynthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  // Seek time
  const handleSeek = (newSec: number) => {
    const clamped = Math.max(0, Math.min(durationSec, newSec));
    setCurrentTimeSec(clamped);

    if (briefing.audioUrl && audioRef.current) {
      audioRef.current.currentTime = clamped;
    }

    const chIdx = getCurrentChapterIndex(clamped, briefing.chapters);
    if (chIdx !== activeChapterIndex && chIdx >= 0) {
      onSelectChapter(chIdx);
    }
  };

  // Jump to chapter
  const jumpToChapter = (index: number) => {
    if (index >= 0 && index < briefing.chapters.length) {
      const ch = briefing.chapters[index];
      handleSeek(ch.startTimeSec);
      onSelectChapter(index);
    }
  };

  // Playback rate
  const cyclePlaybackRate = () => {
    const rates = [0.8, 1.0, 1.25, 1.5, 2.0];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  // Sleep Timer countdown
  useEffect(() => {
    if (sleepTimerMinutes === null) {
      setSleepSecondsLeft(null);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    setSleepSecondsLeft(sleepTimerMinutes * 60);

    timerIntervalRef.current = setInterval(() => {
      setSleepSecondsLeft((prev) => {
        if (prev === null || prev <= 1) {
          // Pause audio when timer ends
          if (audioRef.current) audioRef.current.pause();
          if ('speechSynthesis' in window) window.speechSynthesis.cancel();
          setIsPlaying(false);
          setSleepTimerMinutes(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [sleepTimerMinutes]);

  // Simulated time update for web speech if no audio element is playing
  useEffect(() => {
    if (!isPlaying || briefing.audioUrl) return;
    const interval = setInterval(() => {
      setCurrentTimeSec((prev) => {
        const next = prev + 1 * playbackRate;
        if (next >= durationSec) {
          setIsPlaying(false);
          return durationSec;
        }
        const chIdx = getCurrentChapterIndex(next, briefing.chapters);
        if (chIdx !== activeChapterIndex && chIdx >= 0) {
          onSelectChapter(chIdx);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, briefing.audioUrl, durationSec, playbackRate, briefing.chapters, activeChapterIndex, onSelectChapter]);

  const currentChapter: BriefingChapter | undefined =
    briefing.chapters[activeChapterIndex] || briefing.chapters[0];

  const handleCopyShowNotes = () => {
    const text = `# ${briefing.title}\n\n${briefing.fullTranscriptText}`;
    navigator.clipboard.writeText(text);
    setCopiedShowNotes(true);
    setTimeout(() => setCopiedShowNotes(false), 2000);
  };

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Hidden audio element if real audio is loaded */}
      {briefing.audioUrl && (
        <audio
          ref={audioRef}
          src={briefing.audioUrl}
          preload="metadata"
          className="hidden"
        />
      )}

      {/* Player Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/20">
              {briefing.format === 'duo' ? 'Podcast Duo' : `${briefing.format} Briefing`}
            </span>
            <span className="text-xs text-slate-400">
              {briefing.targetDurationMinutes} min commute • {briefing.articlesIncluded} stories
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight">
            {briefing.title}
          </h2>
        </div>

        {/* Quick Mode & Download Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCarMode}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 border border-emerald-400/30 transition-all active:scale-95"
            aria-label="Launch Fullscreen Car Mode"
          >
            <Car className="w-4 h-4" />
            <span>Car Mode</span>
          </button>

          {briefing.audioUrl ? (
            <a
              href={briefing.audioUrl}
              download={`${briefing.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.wav`}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Download Audio (.wav) for offline underground commute"
              aria-label="Download Audio file"
            >
              <Download className="w-4 h-4" />
            </a>
          ) : (
            <button
              onClick={handleCopyShowNotes}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Copy Briefing Notes"
              aria-label="Copy Briefing Notes"
            >
              {copiedShowNotes ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Active Chapter Card */}
      <div className="mt-5 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black text-lg shadow-md shrink-0">
            {activeChapterIndex + 1}
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-amber-300 uppercase tracking-wide">
                Chapter {activeChapterIndex + 1} of {briefing.chapters.length}
              </span>
              {currentChapter?.speaker && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">Speaker: {currentChapter.speaker}</span>
                </>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
              {currentChapter?.title || 'Commute Introduction'}
            </h3>
            {currentChapter?.takeaways && currentChapter.takeaways.length > 0 && (
              <p className="text-xs text-slate-300 mt-1 line-clamp-1">
                Takeaway: {currentChapter.takeaways[0]}
              </p>
            )}
          </div>
        </div>

        {/* Audio Visualizer Waves */}
        <div className="flex items-center gap-1 h-7 self-end md:self-center pr-2">
          {[40, 75, 55, 90, 65, 30, 85, 45, 70, 35].map((height, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-300 ${
                isPlaying ? 'bg-amber-400 opacity-90' : 'bg-slate-700 opacity-50'
              }`}
              style={{
                height: isPlaying ? `${Math.max(25, (height * (i % 2 === 0 ? 1 : 0.8)))}%` : '25%',
              }}
            />
          ))}
        </div>
      </div>

      {/* Scrub Bar & Chapter Markers */}
      <div className="mt-6 relative z-10">
        <div className="relative w-full h-3 bg-slate-800 rounded-full cursor-pointer group flex items-center">
          {/* Progress fill */}
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all relative"
            style={{ width: `${Math.min(100, (currentTimeSec / Math.max(1, durationSec)) * 100)}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg ring-2 ring-amber-500 scale-0 group-hover:scale-100 transition-transform" />
          </div>

          {/* Interactive invisible range input overlay */}
          <input
            type="range"
            min={0}
            max={durationSec}
            step={1}
            value={currentTimeSec}
            onChange={(e) => handleSeek(parseFloat(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Seek audio position"
          />

          {/* Chapter Markers along progress bar */}
          {briefing.chapters.map((ch, i) => {
            const pct = (ch.startTimeSec / Math.max(1, durationSec)) * 100;
            return (
              <div
                key={ch.id}
                onClick={(e) => {
                  e.stopPropagation();
                  jumpToChapter(i);
                }}
                className={`absolute top-0 bottom-0 w-1 transition-all ${
                  i === activeChapterIndex ? 'bg-white z-20 h-4 -top-0.5' : 'bg-slate-900/90 hover:bg-amber-300'
                }`}
                style={{ left: `${pct}%` }}
                title={`Jump to: ${ch.title}`}
              />
            );
          })}
        </div>

        {/* Timestamp readouts */}
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono mt-1.5">
          <span>{formatDuration(currentTimeSec)}</span>
          <span className="text-[11px] text-slate-500">
            {formatDuration(Math.max(0, durationSec - currentTimeSec))} remaining
          </span>
          <span>{formatDuration(durationSec)}</span>
        </div>
      </div>

      {/* Main Transport Controls */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
        {/* Left Secondary Controls: Speed & Sleep Timer */}
        <div className="flex items-center gap-2">
          {/* Playback Speed */}
          <button
            onClick={cyclePlaybackRate}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold font-mono border border-slate-700 transition-all active:scale-95"
            title="Cycle Playback Speed"
            aria-label={`Playback speed: ${playbackRate}x`}
          >
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
            <span>{playbackRate}x</span>
          </button>

          {/* Sleep / Commute Timer */}
          <div className="relative group">
            <button
              onClick={() => {
                const options = [null, 5, 10, 15, 20, 30];
                const currentIdx = options.indexOf(sleepTimerMinutes);
                const nextVal = options[(currentIdx + 1) % options.length];
                setSleepTimerMinutes(nextVal);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
                sleepTimerMinutes !== null
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 ring-1 ring-amber-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="Sleep / Commute Stop Timer"
              aria-label="Sleep timer"
            >
              <Timer className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {sleepSecondsLeft !== null
                  ? formatDuration(sleepSecondsLeft)
                  : 'Timer'}
              </span>
            </button>
          </div>
        </div>

        {/* Center: Core Playback cluster */}
        <div className="flex items-center gap-3">
          {/* Prev Chapter */}
          <button
            onClick={() => jumpToChapter(Math.max(0, activeChapterIndex - 1))}
            disabled={activeChapterIndex === 0}
            className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
            title="Previous Story Chapter"
            aria-label="Previous Chapter"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          {/* Rewind 15s */}
          <button
            onClick={() => handleSeek(currentTimeSec - 15)}
            className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center relative"
            title="Rewind 15 seconds"
            aria-label="Rewind 15 seconds"
          >
            <RotateCcw className="w-5 h-5" />
            <span className="absolute text-[8px] font-bold font-mono text-slate-300 top-2.5">15</span>
          </button>

          {/* Big Play / Pause Button */}
          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 hover:from-amber-400 hover:to-orange-400 text-slate-950 flex items-center justify-center shadow-xl shadow-amber-500/30 active:scale-95 transition-all ring-4 ring-amber-500/20"
            aria-label={isPlaying ? 'Pause Audio Briefing' : 'Play Audio Briefing'}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 fill-slate-950" />
            ) : (
              <Play className="w-8 h-8 fill-slate-950 translate-x-0.5" />
            )}
          </button>

          {/* Fast Forward 30s */}
          <button
            onClick={() => handleSeek(currentTimeSec + 30)}
            className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center relative"
            title="Skip forward 30 seconds"
            aria-label="Forward 30 seconds"
          >
            <RotateCw className="w-5 h-5" />
            <span className="absolute text-[8px] font-bold font-mono text-slate-300 top-2.5">30</span>
          </button>

          {/* Next Chapter */}
          <button
            onClick={() => jumpToChapter(Math.min(briefing.chapters.length - 1, activeChapterIndex + 1))}
            disabled={activeChapterIndex >= briefing.chapters.length - 1}
            className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
            title="Next Story Chapter"
            aria-label="Next Chapter"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Right Secondary Controls: Mute toggle & Share */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.muted = !isMuted;
              }
              setIsMuted(!isMuted);
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
            aria-label="Mute toggle"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <button
            onClick={handleCopyShowNotes}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all active:scale-95"
            aria-label="Share show notes"
          >
            {copiedShowNotes ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedShowNotes ? 'Copied' : 'Notes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
