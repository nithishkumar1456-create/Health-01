import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Article } from '../types';
import { BookOpen, FileText, ChevronRight, Activity } from 'lucide-react';

export default function HealthJournal() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, [selectedTag]);

  const fetchArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getArticles({
        tag: selectedTag || undefined
      });
      setArticles(res);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve blog articles.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {!selectedArticle ? (
        <>
          {/* Journal Header */}
          <div className="bg-white rounded-2xl p-6 shadow-level-2 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-sans text-xl font-extrabold text-brand-dark tracking-tight flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-primary" />
                Medical Health Journal
              </h2>
              <p className="font-sans text-xs text-brand-secondary mt-0.5">
                Peer-reviewed wellness columns and medical updates written by our verified specialists.
              </p>
            </div>
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="bg-brand-light-blue text-brand-primary hover:bg-brand-primary hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold font-sans flex items-center gap-1 cursor-pointer transition-all shrink-0"
              >
                <span>Tag: {selectedTag}</span>
                <span className="text-sm font-light">×</span>
              </button>
            )}
          </div>

          {/* Tag filters carousel */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {['All Articles', 'Cardiology', 'Dermatology', 'Pediatrics', 'Technology', 'Summer Care', 'Self-Care'].map((tag) => {
              const isAll = tag === 'All Articles';
              const isSelected = isAll ? !selectedTag : selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(isAll ? null : tag)}
                  className={`px-4 py-2 rounded-xl font-sans text-xs font-bold whitespace-nowrap cursor-pointer transition-all border ${
                    isSelected 
                      ? 'bg-brand-primary border-brand-primary text-white shadow-sm'
                      : 'bg-white border-gray-100 text-brand-secondary hover:bg-brand-bg hover:text-brand-dark'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-xs flex gap-2 items-start shadow-sm">
              <Activity className="w-4 h-4 shrink-0 text-red-600 animate-pulse mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">Notice:</span> {error}
              </div>
            </div>
          )}

          {/* Articles Grid */}
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="font-sans text-xs text-brand-secondary">Retrieving columns...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center flex flex-col items-center justify-center gap-3">
              <div className="p-4 bg-brand-bg rounded-full text-brand-secondary">
                <FileText className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div>
                <h4 className="font-sans font-bold text-sm text-brand-dark">No Articles Published</h4>
                <p className="font-sans text-xs text-brand-muted mt-1 max-w-sm mx-auto">
                  There are no health articles matching the tag filter "{selectedTag || 'all'}" currently.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map((art) => (
                <article 
                  key={art.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-level-2 border border-gray-100 flex flex-col justify-between"
                >
                  {art.cover_image_url && (
                    <div className="h-44 w-full overflow-hidden bg-brand-bg relative">
                      <img 
                        src={art.cover_image_url} 
                        alt={art.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                        {art.tags.map(t => (
                          <span key={t} className="bg-brand-dark/75 text-white px-2 py-0.5 rounded-full text-[10px] font-bold font-sans backdrop-blur-sm">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-5 flex-grow flex flex-col justify-between gap-4">
                    <div className="flex flex-col gap-2">
                      <span className="font-sans text-[10px] text-brand-muted uppercase tracking-wider font-bold">
                        By Dr. {art.author.first_name} {art.author.last_name}
                      </span>
                      <h3 className="font-sans font-extrabold text-base text-brand-dark leading-tight hover:text-brand-primary transition-colors">
                        {art.title}
                      </h3>
                      <p className="font-sans text-xs text-brand-secondary line-clamp-3">
                        {art.summary}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-50 pt-3 text-[11px] text-brand-muted font-sans">
                      <span>{new Date(art.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <button
                        onClick={async () => {
                          try {
                            const full = await api.getArticleBySlug(art.slug);
                            setSelectedArticle(full);
                          } catch (err: any) {
                            setError('Could not fetch full article content.');
                          }
                        }}
                        className="text-brand-primary font-bold hover:underline flex items-center gap-1 cursor-pointer border-none bg-transparent outline-none p-0"
                      >
                        Read Full Column
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Selected Article Reader Panel */
        <div className="flex flex-col gap-4">
          <button
            onClick={() => setSelectedArticle(null)}
            className="flex items-center gap-1.5 font-sans font-bold text-xs text-brand-secondary hover:text-brand-primary transition-colors cursor-pointer self-start border-none bg-transparent outline-none p-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to health journal articles
          </button>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-level-2">
            {selectedArticle.cover_image_url && (
              <div className="h-64 w-full bg-brand-bg">
                <img 
                  src={selectedArticle.cover_image_url} 
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <div className="p-6 md:p-8 max-w-3xl mx-auto flex flex-col gap-5">
              <div className="flex gap-1.5 flex-wrap">
                {selectedArticle.tags.map(t => (
                  <span key={t} className="bg-brand-light-blue text-brand-primary px-2.5 py-0.5 rounded-full text-[11px] font-bold font-sans">
                    {t}
                  </span>
                ))}
              </div>

              <h1 className="font-sans text-2xl md:text-3xl font-extrabold text-brand-dark tracking-tight leading-tight">
                {selectedArticle.title}
              </h1>

              <div className="flex items-center gap-3 border-y border-gray-100 py-3">
                <div className="w-10 h-10 rounded-full bg-brand-light-blue text-brand-primary font-sans font-bold flex items-center justify-center">
                  {selectedArticle.author.first_name[0]}{selectedArticle.author.last_name[0]}
                </div>
                <div>
                  <p className="font-sans text-xs font-bold text-brand-dark">
                    Written by Dr. {selectedArticle.author.first_name} {selectedArticle.author.last_name}
                  </p>
                  <p className="font-sans text-[10px] text-brand-muted">
                    Published on {new Date(selectedArticle.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <p className="font-sans text-sm font-bold text-brand-secondary leading-relaxed bg-brand-bg/40 p-4 rounded-xl border-l-4 border-brand-primary">
                {selectedArticle.summary}
              </p>

              <div className="font-sans text-sm text-brand-secondary leading-relaxed space-y-4 whitespace-pre-line prose max-w-none pt-2">
                {selectedArticle.content}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline ArrowLeft icon to avoid extra imports issues
function ArrowLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      className={props.className}
      style={{ width: '1em', height: '1em' }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  );
}
