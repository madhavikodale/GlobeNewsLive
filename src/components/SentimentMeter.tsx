'use client';

import { TrendingDown, TrendingUp, Minus, Activity } from 'lucide-react';
import { useSentimentAnalysis } from '@/hooks/useSentimentAnalysis';
import { Signal } from '@/types';

interface SentimentMeterProps {
  signals: Signal[];
}

export default function SentimentMeter({ signals }: SentimentMeterProps) {
  const { overallSentiment, trendingNegative } = useSentimentAnalysis(signals);
  
  const { score, label, confidence, factors } = overallSentiment;
  
  // Determine colors based on sentiment
  const getColor = () => {
    switch (label) {
      case 'negative': return 'text-accent-red';
      case 'positive': return 'text-accent-green';
      default: return 'text-accent-gold';
    }
  };
  
  const getBgColor = () => {
    switch (label) {
      case 'negative': return 'bg-accent-red';
      case 'positive': return 'bg-accent-green';
      default: return 'bg-accent-gold';
    }
  };
  
  const getIcon = () => {
    if (trendingNegative) return <TrendingDown className="w-4 h-4 text-accent-red" />;
    if (label === 'negative') return <TrendingDown className="w-4 h-4" />;
    if (label === 'positive') return <TrendingUp className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };
  
  // Convert score (-1 to 1) to percentage (0 to 100) for gauge
  const gaugePercent = ((score + 1) / 2) * 100;
  
  return (
    <div className="bg-elevated rounded-lg border border-border-subtle p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-accent-blue" />
          <span className="font-mono text-[11px] font-bold text-white">SENTIMENT METER</span>
        </div>
        <div className="flex items-center gap-1.5">
          {getIcon()}
          <span className={`text-[10px] font-mono font-bold uppercase ${getColor()}`}>
            {label}
          </span>
        </div>
      </div>
      
      {/* Gauge */}
      <div className="relative h-2 bg-black/30 rounded-full overflow-hidden mb-3">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-accent-red via-accent-gold to-accent-green" />
        
        {/* Marker */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_4px_rgba(255,255,255,0.8)] transition-all duration-500"
          style={{ left: `${gaugePercent}%` }}
        />
        
        {/* Center line */}
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/30" />
      </div>
      
      {/* Score display */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] text-text-dim">Negative</span>
        <span className={`text-[14px] font-mono font-bold ${getColor()}`}>
          {score > 0 ? '+' : ''}{score.toFixed(2)}
        </span>
        <span className="text-[9px] text-text-dim">Positive</span>
      </div>
      
      {/* Confidence bar */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[9px] text-text-dim whitespace-nowrap">Confidence</span>
        <div className="flex-1 h-1.5 bg-black/30 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getBgColor()} transition-all duration-300`}
            style={{ width: `${confidence * 100}%` }}
          />
        </div>
        <span className="text-[9px] text-text-dim">{Math.round(confidence * 100)}%</span>
      </div>
      
      {/* Trend indicator */}
      {trendingNegative && (
        <div className="flex items-center gap-1.5 text-[9px] text-accent-red bg-accent-red/10 px-2 py-1 rounded">
          <TrendingDown className="w-3 h-3" />
          <span>Trending more negative</span>
        </div>
      )}
      
      {/* Top factors */}
      {factors.length > 0 && (
        <div className="mt-2 pt-2 border-t border-border-subtle">
          <span className="text-[9px] text-text-dim">Key factors:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {factors.map((factor, i) => (
              <span 
                key={i}
                className="text-[8px] px-1.5 py-0.5 bg-white/5 rounded text-text-dim"
              >
                {factor}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}