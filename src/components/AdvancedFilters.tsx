'use client';

import { useState, useEffect } from 'react';
import { Filter, X, Check, SlidersHorizontal } from 'lucide-react';
import { Signal } from '@/types';

interface AdvancedFiltersProps {
  signals: Signal[];
  onFilterChange: (filteredSignals: Signal[]) => void;
}

interface FilterState {
  severity: string[];
  category: string[];
  sources: string[];
  timeRange: string;
  keywords: string[];
}

const SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];
const CATEGORIES = ['conflict', 'military', 'economic', 'diplomatic', 'humanitarian', 'cyber', 'nuclear'];
const TIME_RANGES = [
  { label: 'All Time', value: 'all' },
  { label: 'Last Hour', value: '1h' },
  { label: 'Last 6 Hours', value: '6h' },
  { label: 'Last 24 Hours', value: '24h' },
  { label: 'Last 7 Days', value: '7d' }
];

export default function AdvancedFilters({ signals, onFilterChange }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    severity: [],
    category: [],
    sources: [],
    timeRange: 'all',
    keywords: []
  });
  const [keywordInput, setKeywordInput] = useState('');
  
  // Get unique sources from signals
  const uniqueSources = Array.from(new Set(signals.map(s => s.source))).slice(0, 20);

  useEffect(() => {
    applyFilters();
  }, [filters, signals]);

  const applyFilters = () => {
    let filtered = [...signals];

    // Severity filter
    if (filters.severity.length > 0) {
      filtered = filtered.filter(s => filters.severity.includes(s.severity));
    }

    // Category filter
    if (filters.category.length > 0) {
      filtered = filtered.filter(s => filters.category.includes(s.category || ''));
    }

    // Source filter
    if (filters.sources.length > 0) {
      filtered = filtered.filter(s => filters.sources.includes(s.source));
    }

    // Time range filter
    if (filters.timeRange !== 'all') {
      const now = Date.now();
      const ranges: Record<string, number> = {
        '1h': 60 * 60 * 1000,
        '6h': 6 * 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000
      };
      const cutoff = now - ranges[filters.timeRange];
      filtered = filtered.filter(s => new Date(s.timestamp).getTime() > cutoff);
    }

    // Keywords filter
    if (filters.keywords.length > 0) {
      filtered = filtered.filter(s => {
        const text = `${s.title} ${s.summary || ''}`.toLowerCase();
        return filters.keywords.some(kw => text.includes(kw.toLowerCase()));
      });
    }

    onFilterChange(filtered);
  };

  const toggleSeverity = (severity: string) => {
    setFilters(prev => ({
      ...prev,
      severity: prev.severity.includes(severity)
        ? prev.severity.filter(s => s !== severity)
        : [...prev.severity, severity]
    }));
  };

  const toggleCategory = (category: string) => {
    setFilters(prev => ({
      ...prev,
      category: prev.category.includes(category)
        ? prev.category.filter(c => c !== category)
        : [...prev.category, category]
    }));
  };

  const toggleSource = (source: string) => {
    setFilters(prev => ({
      ...prev,
      sources: prev.sources.includes(source)
        ? prev.sources.filter(s => s !== source)
        : [...prev.sources, source]
    }));
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !filters.keywords.includes(keywordInput.trim())) {
      setFilters(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFilters(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const clearFilters = () => {
    setFilters({
      severity: [],
      category: [],
      sources: [],
      timeRange: 'all',
      keywords: []
    });
  };

  const activeFilterCount = filters.severity.length + filters.category.length + 
    filters.sources.length + (filters.timeRange !== 'all' ? 1 : 0) + filters.keywords.length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-mono transition-colors ${
          activeFilterCount > 0 
            ? 'text-accent-purple bg-accent-purple/10 hover:bg-accent-purple/20' 
            : 'text-text-dim hover:text-white hover:bg-white/5'
        }`}
        title="Advanced filters"
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">
          {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : 'Filters'}
        </span>
        {activeFilterCount > 0 && (
          <span className="w-1.5 h-1.5 bg-accent-purple rounded-full ml-1" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-80 bg-elevated border border-border-default rounded-lg shadow-xl z-50 overflow-hidden max-h-[80vh] overflow-y-auto">
          <div className="px-3 py-2 border-b border-border-subtle flex items-center justify-between sticky top-0 bg-elevated">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-accent-purple" />
              <span className="text-[11px] font-bold text-white">Advanced Filters</span>
            </div>
            <div className="flex items-center gap-1">
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-[9px] text-text-dim hover:text-accent-red px-2 py-1"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-text-dim hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-3 space-y-4">
            {/* Time Range */}
            <div>
              <label className="text-[10px] font-bold text-white mb-2 block">Time Range</label>
              <select
                value={filters.timeRange}
                onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
                className="w-full bg-black/20 border border-border-subtle rounded px-2 py-1.5 text-[11px] text-white"
              >
                {TIME_RANGES.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
            </div>

            {/* Severity */}
            <div>
              <label className="text-[10px] font-bold text-white mb-2 block">Severity</label>
              <div className="flex flex-wrap gap-1">
                {SEVERITIES.map(severity => (
                  <button
                    key={severity}
                    onClick={() => toggleSeverity(severity)}
                    className={`px-2 py-1 rounded text-[9px] font-mono transition-colors ${
                      filters.severity.includes(severity)
                        ? 'bg-accent-purple text-white'
                        : 'bg-white/5 text-text-dim hover:text-white'
                    }`}
                  >
                    {filters.severity.includes(severity) && <Check className="w-3 h-3 inline mr-1" />}
                    {severity}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-[10px] font-bold text-white mb-2 block">Category</label>
              <div className="flex flex-wrap gap-1">
                {CATEGORIES.map(category => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`px-2 py-1 rounded text-[9px] font-mono capitalize transition-colors ${
                      filters.category.includes(category)
                        ? 'bg-accent-purple text-white'
                        : 'bg-white/5 text-text-dim hover:text-white'
                    }`}
                  >
                    {filters.category.includes(category) && <Check className="w-3 h-3 inline mr-1" />}
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Keywords */}
            <div>
              <label className="text-[10px] font-bold text-white mb-2 block">Keywords</label>
              <div className="flex gap-1 mb-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                  placeholder="Add keyword..."
                  className="flex-1 bg-black/20 border border-border-subtle rounded px-2 py-1 text-[11px] text-white placeholder:text-text-dim"
                />
                <button
                  onClick={addKeyword}
                  disabled={!keywordInput.trim()}
                  className="px-2 py-1 bg-accent-purple/20 text-accent-purple rounded text-[11px] disabled:opacity-50"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {filters.keywords.map(keyword => (
                  <span key={keyword} className="flex items-center gap-1 px-2 py-0.5 bg-accent-purple/20 text-accent-purple rounded text-[9px]">
                    {keyword}
                    <button onClick={() => removeKeyword(keyword)} className="hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Sources */}
            <div>
              <label className="text-[10px] font-bold text-white mb-2 block">Sources ({uniqueSources.length})</label>
              <div className="max-h-24 overflow-y-auto space-y-1">
                {uniqueSources.map(source => (
                  <button
                    key={source}
                    onClick={() => toggleSource(source)}
                    className={`w-full text-left px-2 py-1 rounded text-[9px] transition-colors ${
                      filters.sources.includes(source)
                        ? 'bg-accent-purple/20 text-accent-purple'
                        : 'text-text-dim hover:text-white'
                    }`}
                  >
                    {filters.sources.includes(source) && <Check className="w-3 h-3 inline mr-1" />}
                    {source}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-3 py-2 bg-black/20 border-t border-border-subtle">
            <p className="text-[9px] text-text-dim text-center">
              Showing {signals.length} signals
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
