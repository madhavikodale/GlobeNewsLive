'use client';

import { useMemo } from 'react';

interface Signal {
  title: string;
  summary?: string;
  severity: string;
}

interface SentimentResult {
  score: number; // -1 to 1
  label: 'negative' | 'neutral' | 'positive';
  confidence: number;
  factors: string[];
}

// Keywords for sentiment analysis
const NEGATIVE_KEYWORDS = [
  'attack', 'strike', 'war', 'conflict', 'killed', 'death', 'casualty', 'casualties',
  'bomb', 'missile', 'drone', 'retaliation', 'escalation', 'threat', 'sanctions',
  'crisis', 'emergency', 'violation', 'aggression', 'hostile', 'invasion',
  'destroyed', 'damage', 'collapse', 'fail', 'failed', 'violence', 'clash',
  'protest', 'unrest', 'instability', 'tension', 'tensions', 'confrontation'
];

const POSITIVE_KEYWORDS = [
  'peace', 'agreement', 'deal', 'cooperation', 'success', 'progress', 'improve',
  'resolve', 'solution', 'diplomatic', 'negotiation', 'talks', 'ceasefire',
  'truce', 'release', 'rescue', 'aid', 'support', 'help', 'recover',
  'stable', 'calm', 'reduce', 'easing', 'ease', 'dialogue'
];

const INTENSITY_MODIFIERS = {
  strong: ['massive', 'major', 'severe', 'critical', 'significant', 'heavy', 'large-scale'],
  weak: ['minor', 'small', 'limited', 'brief', 'localized']
};

export function useSentimentAnalysis(signals: Signal[]): {
  overallSentiment: SentimentResult;
  sentimentByCategory: Record<string, SentimentResult>;
  trendingNegative: boolean;
} {
  return useMemo(() => {
    if (!signals.length) {
      return {
        overallSentiment: { score: 0, label: 'neutral', confidence: 0, factors: [] },
        sentimentByCategory: {},
        trendingNegative: false
      };
    }

    // Analyze each signal
    const analyzedSignals = signals.map(signal => analyzeSignal(signal));
    
    // Calculate overall sentiment
    const avgScore = analyzedSignals.reduce((sum, s) => sum + s.score, 0) / analyzedSignals.length;
    
    // Count by severity
    const criticalCount = signals.filter(s => s.severity === 'CRITICAL').length;
    const highCount = signals.filter(s => s.severity === 'HIGH').length;
    
    // Weight by severity
    const severityWeight = Math.min((criticalCount * 0.3 + highCount * 0.1), 0.5);
    const weightedScore = Math.max(-1, Math.min(1, avgScore - severityWeight));
    
    // Determine label
    let label: 'negative' | 'neutral' | 'positive';
    if (weightedScore < -0.3) label = 'negative';
    else if (weightedScore > 0.3) label = 'positive';
    else label = 'neutral';
    
    // Calculate confidence
    const confidence = Math.abs(weightedScore) * 0.5 + 0.5;
    
    // Get top factors
    const allFactors = analyzedSignals.flatMap(s => s.factors);
    const factorCounts = allFactors.reduce((acc, factor) => {
      acc[factor] = (acc[factor] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topFactors = Object.entries(factorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([factor]) => factor);

    // Check if trending negative (last 10 signals vs previous)
    const recent = analyzedSignals.slice(0, 10);
    const older = analyzedSignals.slice(10, 20);
    const recentAvg = recent.reduce((sum, s) => sum + s.score, 0) / (recent.length || 1);
    const olderAvg = older.reduce((sum, s) => sum + s.score, 0) / (older.length || 1);
    const trendingNegative = recentAvg < olderAvg - 0.1;

    // Analyze by category
    const byCategory: Record<string, { scores: number[]; factors: string[] }> = {};
    signals.forEach((signal, i) => {
      const category = (signal as any).category || 'general';
      if (!byCategory[category]) {
        byCategory[category] = { scores: [], factors: [] };
      }
      byCategory[category].scores.push(analyzedSignals[i].score);
      byCategory[category].factors.push(...analyzedSignals[i].factors);
    });

    const sentimentByCategory: Record<string, SentimentResult> = {};
    Object.entries(byCategory).forEach(([category, data]) => {
      const catAvg = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
      sentimentByCategory[category] = {
        score: catAvg,
        label: catAvg < -0.3 ? 'negative' : catAvg > 0.3 ? 'positive' : 'neutral',
        confidence: Math.abs(catAvg) * 0.5 + 0.5,
        factors: [...new Set(data.factors)].slice(0, 2)
      };
    });

    return {
      overallSentiment: {
        score: weightedScore,
        label,
        confidence,
        factors: topFactors
      },
      sentimentByCategory,
      trendingNegative
    };
  }, [signals]);
}

function analyzeSignal(signal: Signal): SentimentResult {
  const text = `${signal.title} ${signal.summary || ''}`.toLowerCase();
  
  let score = 0;
  const factors: string[] = [];
  
  // Check negative keywords
  NEGATIVE_KEYWORDS.forEach(keyword => {
    if (text.includes(keyword)) {
      score -= 0.15;
      if (!factors.includes(keyword)) factors.push(keyword);
    }
  });
  
  // Check positive keywords
  POSITIVE_KEYWORDS.forEach(keyword => {
    if (text.includes(keyword)) {
      score += 0.15;
      if (!factors.includes(keyword)) factors.push(keyword);
    }
  });
  
  // Apply intensity modifiers
  INTENSITY_MODIFIERS.strong.forEach(modifier => {
    if (text.includes(modifier)) {
      score *= 1.3;
      if (!factors.includes('intense')) factors.push('intense');
    }
  });
  
  INTENSITY_MODIFIERS.weak.forEach(modifier => {
    if (text.includes(modifier)) {
      score *= 0.7;
      if (!factors.includes('limited')) factors.push('limited');
    }
  });
  
  // Weight by severity
  if (signal.severity === 'CRITICAL') score *= 1.5;
  if (signal.severity === 'HIGH') score *= 1.3;
  
  // Clamp score
  score = Math.max(-1, Math.min(1, score));
  
  return {
    score,
    label: score < -0.3 ? 'negative' : score > 0.3 ? 'positive' : 'neutral',
    confidence: Math.abs(score) * 0.5 + 0.5,
    factors: factors.slice(0, 3)
  };
}