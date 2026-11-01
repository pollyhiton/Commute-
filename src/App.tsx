import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ArticleManager } from './components/ArticleManager';
import { CommuteSettings, CommuteConfig } from './components/CommuteSettings';
import { AudioPlayer } from './components/AudioPlayer';
import { CarModeModal } from './components/CarModeModal';
import { TranscriptView } from './components/TranscriptView';
import { LibraryModal } from './components/LibraryModal';
import { SAMPLE_PRESET_PACKS, ArticleItem } from './data/sampleArticles';
import { BriefingScript, calculateChapterTimestamps } from './utils/commuteLogic';
import { Headphones, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  // Articles state
  const [articles, setArticles] = useState<ArticleItem[]>(() => {
    return SAMPLE_PRESET_PACKS[0].articles;
  });

  // Commute config
  const [config, setConfig] = useState<CommuteConfig>({
    commuteMinutes: 10,
    format: 'duo',
    tone: 'energizing',
    preferredVoice: 'Kore',
    commuteContext: 'Morning Commute',
  });

  // Briefing state
  const [activeBriefing, setActiveBriefing] = useState<BriefingScript | null>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  // UI Modals
  const [isCarModeOpen, setIsCarModeOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  // Generation status
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Saved briefings in localStorage
  const [savedBriefings, setSavedBriefings] = useState<BriefingScript[]>(() => {
    try {
      const stored = localStorage.getItem('commutecast_briefings');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('commutecast_briefings', JSON.stringify(savedBriefings));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [savedBriefings]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Article management handlers
  const handleToggleArticle = (id: string) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, included: !a.included } : a))
    );
  };

  const handleDeleteArticle = (id: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
    showToast('Article removed from queue');
  };

  const handleAddArticle = (
    newArt: Omit<ArticleItem, 'id' | 'readTime' | 'included'>
  ) => {
    const item: ArticleItem = {
      ...newArt,
      id: `art-custom-${Date.now()}`,
      readTime: '3 min read',
      included: true,
    };
    setArticles((prev) => [item, ...prev]);
    showToast('Article added to queue');
  };

  const handleLoadPreset = (packId: string) => {
    const pack = SAMPLE_PRESET_PACKS.find((p) => p.id === packId);
    if (pack) {
      setArticles(pack.articles);
      showToast(`Loaded "${pack.name}" preset`);
    }
  };

  const handleSelectAll = () => {
    setArticles((prev) => prev.map((a) => ({ ...a, included: true })));
  };

  const handleDeselectAll = () => {
    setArticles((prev) => prev.map((a) => ({ ...a, included: false })));
  };

  const handleClearAll = () => {
    setArticles([]);
    showToast('All articles cleared');
  };

  // Generate Audio Briefing Handler
  const handleGenerateBriefing = async () => {
    const selectedArticles = articles.filter((a) => a.included);
    if (selectedArticles.length === 0) return;

    setIsGenerating(true);
    setGenerationStep('Distilling articles with Gemini...');

    try {
      // Step 1: Request structured briefing script
      const res = await fetch('/api/generate-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articles: selectedArticles,
          commuteMinutes: config.commuteMinutes,
          format: config.format,
          tone: config.tone,
          preferredVoice: config.preferredVoice,
          commuteContext: config.commuteContext || 'Commute Briefing',
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to generate briefing: ${res.statusText}`);
      }

      const briefingData: BriefingScript = await res.json();

      // Step 2: Request studio audio synthesis
      setGenerationStep('Synthesizing studio broadcast audio...');
      try {
        const audioRes = await fetch('/api/synthesize-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `${briefingData.intro.text} ${briefingData.chapters[0]?.text || ''}`,
            voice: config.preferredVoice,
            format: config.format,
          }),
        });

        if (audioRes.ok) {
          const audioJson = await audioRes.json();
          if (audioJson.audioDataUrl) {
            briefingData.audioUrl = audioJson.audioDataUrl;
          }
        }
      } catch (audioErr) {
        console.warn('Audio synthesis endpoint warning:', audioErr);
      }

      setActiveBriefing(briefingData);
      setActiveChapterIndex(0);

      // Save to library history
      setSavedBriefings((prev) => [
        briefingData,
        ...prev.filter((b) => b.id !== briefingData.id).slice(0, 19),
      ]);

      showToast('Commute briefing ready for playback!');
    } catch (err: any) {
      console.error('Generation error:', err);
      showToast(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  // Check ?autostart=1 support on first mount to auto-generate sample briefing if requested
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1' && !activeBriefing) {
      // Auto-create initial briefing
      handleGenerateBriefing();
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        onOpenCarMode={() => setIsCarModeOpen(true)}
        onOpenHistory={() => setIsLibraryOpen(true)}
        savedBriefingsCount={savedBriefings.length}
        hasActiveBriefing={activeBriefing !== null}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Active Audio Player Section (if briefing exists) */}
        {activeBriefing ? (
          <section className="space-y-6">
            <AudioPlayer
              briefing={activeBriefing}
              onOpenCarMode={() => setIsCarModeOpen(true)}
              onSelectChapter={(idx) => setActiveChapterIndex(idx)}
              activeChapterIndex={activeChapterIndex}
            />

            <TranscriptView
              briefing={activeBriefing}
              activeChapterIndex={activeChapterIndex}
              onSelectChapter={(idx) => setActiveChapterIndex(idx)}
            />
          </section>
        ) : (
          /* Hero introduction when no active briefing */
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 sm:p-10 text-center shadow-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4">
              <Headphones className="w-3.5 h-3.5" />
              <span>Your Daily Commute, Summarized in Audio</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight max-w-3xl mx-auto leading-tight">
              Turn Any News Articles into a{' '}
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                Personalized Commute Podcast
              </span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Curate your reading queue, set your travel time, and let CommuteCast engineer a studio-grade morning briefing with co-hosts, chapters, and key takeaways for the road.
            </p>
          </div>
        )}

        {/* Configuration & Article Intake Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Article Curation (7 cols) */}
          <div className="lg:col-span-7">
            <ArticleManager
              articles={articles}
              onToggleArticle={handleToggleArticle}
              onDeleteArticle={handleDeleteArticle}
              onAddArticle={handleAddArticle}
              onLoadPreset={handleLoadPreset}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              onClearAll={handleClearAll}
            />
          </div>

          {/* Right Column: Commute Personalization Settings (5 cols) */}
          <div className="lg:col-span-5">
            <CommuteSettings
              config={config}
              onChangeConfig={(patch) =>
                setConfig((prev) => ({ ...prev, ...patch }))
              }
              selectedArticlesCount={articles.filter((a) => a.included).length}
              onGenerate={handleGenerateBriefing}
              isGenerating={isGenerating}
              generationStep={generationStep}
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>CommuteCast • Studio-grade personalized audio briefings for morning commuters, drivers, and transit travelers.</p>
      </footer>

      {/* Car & Commute Mode Modal */}
      {activeBriefing && (
        <CarModeModal
          isOpen={isCarModeOpen}
          onClose={() => setIsCarModeOpen(false)}
          briefing={activeBriefing}
          activeChapterIndex={activeChapterIndex}
          onSelectChapter={(idx) => setActiveChapterIndex(idx)}
        />
      )}

      {/* Library History Modal */}
      <LibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        savedBriefings={savedBriefings}
        onSelectBriefing={(b) => {
          setActiveBriefing(b);
          setActiveChapterIndex(0);
        }}
        onDeleteBriefing={(id) => {
          setSavedBriefings((prev) => prev.filter((b) => b.id !== id));
          showToast('Briefing removed from library');
        }}
        onClearAll={() => {
          setSavedBriefings([]);
          showToast('Library history cleared');
        }}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold shadow-2xl animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
