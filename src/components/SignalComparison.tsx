'use client';

import { useState } from 'react';
import { GitCompare, X, Plus, Trash2 } from 'lucide-react';
import { Signal } from '@/types';

interface SignalComparisonProps {
  signals: Signal[];
}

interface ComparisonItem {
  id: string;
  signal: Signal;
}

export default function SignalComparison({ signals }: SignalComparisonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [comparisonList, setComparisonList] = useState<ComparisonItem[]>([]);

  const addToComparison = (signal: Signal) => {
    if (comparisonList.length >= 3) {
      alert('Maximum 3 signals can be compared at once');
      return;
    }
    if (!comparisonList.find(item => item.id === signal.id)) {
      setComparisonList([...comparisonList, { id: signal.id, signal }]);
    }
  };

  const removeFromComparison = (id: string) => {
    setComparisonList(comparisonList.filter(item => item.id !== id));
  };

  const clearComparison = () => {
    setComparisonList([]);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-accent-red';
      case 'HIGH': return 'bg-accent-orange';
      case 'MEDIUM': return 'bg-accent-gold';
      case 'LOW': return 'bg-accent-green';
      default: return 'bg-text-dim';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-mono transition-colors ${
          comparisonList.length > 0 
            ? 'text-accent-blue bg-accent-blue/10 hover:bg-accent-blue/20' 
            : 'text-text-dim hover:text-white hover:bg-white/5'
        }`}
        title="Compare signals"
      >
        <GitCompare className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">
          {comparisonList.length > 0 ? `Compare (${comparisonList.length})` : 'Compare'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-96 bg-elevated border border-border-default rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-accent-blue" />
              <span className="text-[11px] font-bold text-white">Signal Comparison</span>
            </div>
            <div className="flex items-center gap-1">
              {comparisonList.length > 0 && (
                <button
                  onClick={clearComparison}
                  className="p-1 text-text-dim hover:text-accent-red transition-colors"
                  title="Clear all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
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

          {/* Selected signals */}
          <div className="max-h-48 overflow-y-auto">
            {comparisonList.length === 0 ? (
              <div className="px-4 py-6 text-center text-[11px] text-text-dim">
                <GitCompare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No signals selected</p>
                <p className="text-[9px] mt-1">Add signals from the feed to compare</p>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {comparisonList.map((item, index) => (
                  <div key={item.id} className="bg-black/20 rounded p-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-text-dim">#{index + 1}</span>
                        <span className={`w-2 h-2 rounded-full ${getSeverityColor(item.signal.severity)}`} />
                      </div>
                      <button
                        onClick={() => removeFromComparison(item.id)}
                        className="p-0.5 text-text-dim hover:text-accent-red"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-[10px] text-white mt-1 line-clamp-2">{item.signal.title}</div>
                    <div className="text-[8px] text-text-dim mt-1">{item.signal.source} • {item.signal.timeAgo}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comparison table */}
          {comparisonList.length > 1 && (
            <div className="border-t border-border-subtle p-3">
              <div className="text-[10px] font-bold text-white mb-2">Comparison</div>
              <div className="space-y-1 text-[9px]">
                <div className="grid grid-cols-4 gap-1 py-1 border-b border-border-subtle">
                  <span className="text-text-dim">Attribute</span>
                  {comparisonList.map((_, i) => (
                    <span key={i} className="text-accent-blue">Signal #{i + 1}</span>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-1 py-1">
                  <span className="text-text-dim">Severity</span>
                  {comparisonList.map(item => (
                    <span key={item.id} className={getSeverityColor(item.signal.severity).replace('bg-', 'text-')}>
                      {item.signal.severity}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-1 py-1">
                  <span className="text-text-dim">Source</span>
                  {comparisonList.map(item => (
                    <span key={item.id} className="text-white truncate">{item.signal.source}</span>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-1 py-1">
                  <span className="text-text-dim">Category</span>
                  {comparisonList.map(item => (
                    <span key={item.id} className="text-white">{item.signal.category || 'N/A'}</span>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-1 py-1">
                  <span className="text-text-dim">Time</span>
                  {comparisonList.map(item => (
                    <span key={item.id} className="text-white">{item.signal.timeAgo}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          {comparisonList.length < 3 && (
            <div className="px-3 py-2 bg-black/20 border-t border-border-subtle">
              <p className="text-[9px] text-text-dim">
                Click <Plus className="w-3 h-3 inline" /> on any signal to add it here (max 3)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
