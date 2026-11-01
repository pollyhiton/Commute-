import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  CheckSquare,
  Square,
  FileText,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu,
  TrendingUp,
  Sun,
  X,
} from 'lucide-react';
import { ArticleItem, SAMPLE_PRESET_PACKS } from '../data/sampleArticles';

interface ArticleManagerProps {
  articles: ArticleItem[];
  onToggleArticle: (id: string) => void;
  onDeleteArticle: (id: string) => void;
  onAddArticle: (article: Omit<ArticleItem, 'id' | 'readTime' | 'included'>) => void;
  onLoadPreset: (packId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onClearAll: () => void;
}

export const ArticleManager: React.FC<ArticleManagerProps> = ({
  articles,
  onToggleArticle,
  onDeleteArticle,
  onAddArticle,
  onLoadPreset,
  onSelectAll,
  onDeselectAll,
  onClearAll,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(null);

  // New Article Form state
  const [newTitle, setNewTitle] = useState('');
  const [newSource, setNewSource] = useState('');
  const [newCategory, setNewCategory] = useState('Technology');
  const [newContent, setNewContent] = useState('');

  const selectedCount = articles.filter((a) => a.included).length;

  const handleCreateArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    onAddArticle({
      title: newTitle.trim(),
      source: newSource.trim() || 'Custom Upload',
      category: newCategory,
      content: newContent.trim(),
    });

    setNewTitle('');
    setNewSource('');
    setNewContent('');
    setIsAddModalOpen(false);
  };

  const getPackIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu':
        return <Cpu className="w-4 h-4 text-cyan-400" />;
      case 'TrendingUp':
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'Sun':
        return <Sun className="w-4 h-4 text-amber-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
      {/* Header & Preset Packs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              Source News Articles
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              {selectedCount} of {articles.length} active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Select articles to synthesize into your commute audio briefing.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95"
            aria-label="Add New Article"
          >
            <Plus className="w-4 h-4" />
            <span>Add Article</span>
          </button>
        </div>
      </div>

      {/* Preset Packs Fast Selector */}
      <div className="mt-4 pt-1">
        <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Quick Preset Packs:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
          {SAMPLE_PRESET_PACKS.map((pack) => (
            <button
              key={pack.id}
              onClick={() => onLoadPreset(pack.id)}
              className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 text-left transition-all group"
            >
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 group-hover:scale-105 transition-transform">
                {getPackIcon(pack.icon)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-200 group-hover:text-amber-300 truncate">
                  {pack.name}
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-1">
                  {pack.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Action Controls */}
      <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-800/80 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={onSelectAll}
            className="flex items-center gap-1 text-slate-400 hover:text-amber-300 transition-colors"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Select All</span>
          </button>
          <span className="text-slate-700">•</span>
          <button
            onClick={onDeselectAll}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Square className="w-3.5 h-3.5" />
            <span>Deselect All</span>
          </button>
        </div>

        {articles.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
          >
            Clear Articles
          </button>
        )}
      </div>

      {/* Articles List */}
      <div className="mt-3 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {articles.length === 0 ? (
          <div className="py-10 text-center border-2 border-dashed border-slate-800 rounded-xl">
            <p className="text-sm text-slate-400">No articles added yet.</p>
            <p className="text-xs text-slate-500 mt-1">
              Click a preset pack above or "Add Article" to get started.
            </p>
          </div>
        ) : (
          articles.map((article) => {
            const isExpanded = expandedArticleId === article.id;
            const wordCount = article.content.split(/\s+/).filter(Boolean).length;

            return (
              <div
                key={article.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  article.included
                    ? 'bg-slate-800/70 border-slate-700 hover:border-slate-600'
                    : 'bg-slate-900/40 border-slate-800/80 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Inclusion Checkbox */}
                  <button
                    onClick={() => onToggleArticle(article.id)}
                    className="mt-0.5 text-amber-400 hover:text-amber-300 focus:outline-none"
                    aria-label={article.included ? 'Exclude article' : 'Include article'}
                  >
                    {article.included ? (
                      <CheckSquare className="w-5 h-5 text-amber-400" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-600" />
                    )}
                  </button>

                  {/* Main Article Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="font-medium text-slate-400">{article.source}</span>
                      <span className="text-slate-600">•</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-900 text-indigo-300 font-medium text-[11px] border border-slate-800">
                        {article.category}
                      </span>
                      <span className="text-slate-500 text-[11px]">~{wordCount} words</span>
                    </div>

                    <h3
                      onClick={() => onToggleArticle(article.id)}
                      className={`text-sm font-semibold mt-1 cursor-pointer transition-colors ${
                        article.included ? 'text-white hover:text-amber-200' : 'text-slate-400 line-through'
                      }`}
                    >
                      {article.title}
                    </h3>

                    {/* Excerpt or Expanded View */}
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {article.content}
                    </p>

                    {isExpanded && (
                      <div className="mt-3 p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                        {article.content}
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <button
                        onClick={() =>
                          setExpandedArticleId(isExpanded ? null : article.id)
                        }
                        className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5" />
                            <span>Show Less</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5" />
                            <span>Read Full Text</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => onDeleteArticle(article.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    aria-label={`Delete ${article.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Article Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                Add News Article
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateArticle} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Next-Gen High Speed Rail Lines Open Across East Corridor"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Source / Outlet
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Bloomberg, The Verge, Reuters"
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Business">Business</option>
                    <option value="Economy">Economy</option>
                    <option value="Science">Science</option>
                    <option value="Health">Health</option>
                    <option value="World News">World News</option>
                    <option value="Lifestyle">Lifestyle</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Article Text / Body *
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Paste the article text, report summary, or paragraphs here..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                >
                  Add to Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
