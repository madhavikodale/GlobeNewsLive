'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Crown, Sparkles, TrendingUp, Globe, Shield, 
  Clock, Zap, Lock, ChevronRight, Bookmark,
  Share2, ExternalLink, Bell, Filter
} from 'lucide-react';
import { Signal } from '@/types';
import { getSeverityColor, getThreatLevelFromSignals } from '@/lib/classify';

interface PremiumSignal extends Signal {
  isExclusive?: boolean;
  analysis?: string;
  keyTakeaways?: string[];
  relatedSignals?: string[];
  confidenceScore?: number;
}

const PREMIUM_CATEGORIES = [
  { id: 'breaking', name: 'Breaking', icon: Zap, color: '#ff4444' },
  { id: 'exclusive', name: 'Exclusive', icon: Lock, color: '#ffd700' },
  { id: 'analysis', name: 'Deep Analysis', icon: Sparkles, color: '#00ccff' },
  { id: 'threats', name: 'Threat Intel', icon: Shield, color: '#ff6600' },
  { id: 'markets', name: 'Markets', icon: TrendingUp, color: '#00ff88' },
  { id: 'geopolitics', name: 'Geopolitics', icon: Globe, color: '#aa66ff' },
];

const MOCK_PREMIUM_SIGNALS: PremiumSignal[] = [
  {
    id: 'premium-1',
    title: 'EXCLUSIVE: Satellite imagery confirms military buildup near Strait of Hormuz',
    summary: 'High-resolution commercial satellite imagery shows increased naval activity and coastal defense positioning. Multiple Iranian fast-attack craft repositioned overnight. US 5th Fleet maintains elevated readiness posture.',
    severity: 'CRITICAL',
    category: 'conflict' as any,
    source: 'GlobeNews Intelligence',
    timestamp: new Date(),
    timeAgo: '12 min ago',
    isExclusive: true,
    analysis: 'This represents a significant escalation pattern consistent with pre-conflict posturing. Historical analysis of similar movements (2019, 2021) preceded actual engagements within 48-72 hours.',
    keyTakeaways: [
      'Naval positioning suggests preparation for potential blockade',
      'Coastal defense activation indicates defensive posture',
      'Commercial shipping routes showing early diversion patterns',
      'Oil futures spiking in Asian markets'
    ],
    confidenceScore: 94,
  },
  {
    id: 'premium-2',
    title: 'BREAKING: US CENTCOM issues DEFCON adjustment advisory',
    summary: 'U.S. Central Command has internally elevated readiness levels across forward-deployed assets. Cyber defense teams activated at elevated status.',
    severity: 'HIGH',
    category: 'military' as any,
    source: 'Defense Sources',
    timestamp: new Date(Date.now() - 30 * 60000),
    timeAgo: '30 min ago',
    isExclusive: true,
    analysis: 'DEFCON adjustments, while internal, signal command-level concern. This typically precedes public posture changes by 6-12 hours.',
    keyTakeaways: [
      'Cyber teams at elevated readiness suggest threat vector diversification',
      'Forward assets repositioning without public announcement',
      'Allied nations being notified through secure channels'
    ],
    confidenceScore: 88,
  },
  {
    id: 'premium-3',
    title: 'DEEP ANALYSIS: Global shipping chokepoints under asymmetric threat assessment',
    summary: 'Comprehensive threat analysis identifies three critical maritime passages facing elevated risk profiles in current geopolitical climate.',
    severity: 'MEDIUM',
    category: 'economic' as any,
    source: 'GlobeNews Analytics',
    timestamp: new Date(Date.now() - 2 * 3600000),
    timeAgo: '2 hours ago',
    analysis: 'Our proprietary risk model flags Strait of Hormuz (97% risk), Suez Canal (72% risk), and Malacca Strait (61% risk) based on current threat indicators.',
    keyTakeaways: [
      'Insurance premiums rising across all flagged routes',
      'Alternative route planning accelerating among major shippers',
      'Energy markets pricing in extended disruption scenarios'
    ],
    confidenceScore: 91,
  },
];

export default function ProNewsShowcase() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedSignal, setSelectedSignal] = useState<PremiumSignal | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const filteredSignals = activeCategory === 'all' 
    ? MOCK_PREMIUM_SIGNALS 
    : MOCK_PREMIUM_SIGNALS.filter(s => s.category === activeCategory);

  return (
    <div className="min-h-screen bg-void">
      {/* Pro Header */}
      <header className="sticky top-0 z-50 bg-void/95 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-white flex items-center gap-2">
                  GlobeNews
                  <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded text-[10px] text-black font-bold">
                    PRO
                  </span>
                </h1>
                <p className="text-[10px] text-text-dim">Intelligence-grade news analysis</p>
              </div>
            </div>

            {/* Center Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {['Feed', 'Analysis', 'Alerts', 'Briefings'].map((item) => (
                <button
                  key={item}
                  className={`px-4 py-2 rounded-lg text-[12px] font-medium transition-colors ${
                    item === 'Feed' 
                      ? 'text-white bg-white/10' 
                      : 'text-text-dim hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item}
                </button>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg text-text-dim hover:text-white hover:bg-white/5">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg text-text-dim hover:text-white hover:bg-white/5">
                <Bookmark className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-green to-accent-blue flex items-center justify-center">
                <span className="text-xs font-bold text-white">MK</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Category Filter Bar */}
      <div className="sticky top-[73px] z-40 bg-void/90 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveCategory('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-medium whitespace-nowrap transition-all ${
                activeCategory === 'all'
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-text-dim hover:bg-white/10 hover:text-white'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              All Premium
            </button>
            {PREMIUM_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'text-white ring-1 ring-white/30'
                    : 'bg-white/5 text-text-dim hover:bg-white/10 hover:text-white'
                }`}
                style={activeCategory === cat.id ? { backgroundColor: `${cat.color}20`, borderColor: cat.color } : {}}
              >
                <cat.icon className="w-3.5 h-3.5" style={{ color: cat.color }} />
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feed Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Pro Banner */}
            {!isSubscribed && (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 border border-yellow-500/20 p-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-500/20 to-transparent rounded-full blur-3xl" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-400 text-[10px] font-bold tracking-wider uppercase">Premium Access</span>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">
                    Unlock Intelligence-Grade Analysis
                  </h2>
                  <p className="text-sm text-text-dim mb-4 max-w-lg">
                    Get exclusive signals, deep analysis, and predictive intelligence trusted by professionals worldwide.
                  </p>
                  <button 
                    onClick={() => setShowUpgradeModal(true)}
                    className="px-6 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg text-black font-bold text-sm hover:opacity-90 transition-opacity"
                  >
                    Upgrade to Pro
                  </button>
                </div>
              </div>
            )}

            {/* Signals Feed */}
            {filteredSignals.map((signal, index) => (
              <article 
                key={signal.id}
                onClick={() => setSelectedSignal(signal)}
                className="group bg-elevated rounded-2xl border border-white/5 overflow-hidden hover:border-white/10 transition-all cursor-pointer"
              >
                {/* Signal Header */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {signal.isExclusive && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded text-[9px] font-bold text-yellow-400 border border-yellow-500/30">
                          <Lock className="w-3 h-3" />
                          EXCLUSIVE
                        </span>
                      )}
                      <span 
                        className="px-2 py-0.5 rounded text-[9px] font-bold"
                        style={{ 
                          backgroundColor: `${getSeverityColor(signal.severity)}20`,
                          color: getSeverityColor(signal.severity)
                        }}
                      >
                        {signal.severity}
                      </span>
                      <span className="text-[10px] text-text-dim">{signal.timeAgo}</span>
                    </div>
                    <button className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/5 transition-all">
                      <Bookmark className="w-4 h-4 text-text-dim" />
                    </button>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-accent-green transition-colors">
                    {signal.title}
                  </h3>
                  <p className="text-sm text-text-dim line-clamp-3 mb-4">
                    {signal.summary}
                  </p>

                  {/* Key Stats */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-accent-green to-accent-blue rounded-full"
                          style={{ width: `${signal.confidenceScore}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-text-dim">{signal.confidenceScore}% confidence</span>
                  </div>
                  </div>

                  {/* Key Takeaways Preview */}
                  {signal.keyTakeaways && (
                    <div className="space-y-2">
                      {signal.keyTakeaways.slice(0, 2).map((takeaway, i) => (
                        <div key={i} className="flex items-start gap-2 text-[11px] text-text-dim">
                          <span className="text-accent-green mt-0.5">→</span>
                          <span>{takeaway}</span>
                        </div>
                      ))}
                      {signal.keyTakeaways.length > 2 && (
                        <span className="text-[10px] text-accent-purple">
                          +{signal.keyTakeaways.length - 2} more insights
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Signal Footer */}
                <div className="px-5 py-3 bg-white/5 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-text-dim">{signal.source}</span>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] text-text-dim hover:text-white hover:bg-white/5 transition-colors">
                      <Share2 className="w-3.5 h-3.5" />
                      Share
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent-purple/20 text-accent-purple text-[10px] hover:bg-accent-purple/30 transition-colors">
                      Read Analysis
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Trending Threats */}
            <div className="bg-elevated rounded-2xl border border-white/5 p-5">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent-red" />
                Trending Threats
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'Iran-Israel Conflict', trend: '+240%', risk: 'Critical' },
                  { name: 'Strait of Hormuz', trend: '+180%', risk: 'High' },
                  { name: 'Global Oil Markets', trend: '+95%', risk: 'High' },
                  { name: 'Cyber Operations', trend: '+67%', risk: 'Medium' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div>
                      <div className="text-sm text-white">{item.name}</div>
                      <div className="text-[10px] text-accent-red">{item.trend} mentions</div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${
                      item.risk === 'Critical' ? 'bg-accent-red/20 text-accent-red' :
                      item.risk === 'High' ? 'bg-accent-orange/20 text-accent-orange' :
                      'bg-accent-yellow/20 text-accent-yellow'
                    }`}>
                      {item.risk}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro Features */}
            <div className="bg-elevated rounded-2xl border border-white/5 p-5">
              <h3 className="font-bold text-white mb-4">Pro Features</h3>
              <div className="space-y-3">
                {[
                  { icon: Zap, text: 'Exclusive breaking signals', color: 'text-yellow-400' },
                  { icon: Sparkles, text: 'AI-powered analysis', color: 'text-accent-blue' },
                  { icon: Shield, text: 'Threat intelligence', color: 'text-accent-green' },
                  { icon: Clock, text: 'Real-time alerts', color: 'text-accent-orange' },
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-text-dim">
                    <feature.icon className={`w-4 h-4 ${feature.color}`} />
                    {feature.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Brief */}
            <div className="bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 rounded-2xl border border-accent-purple/20 p-5">
              <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent-purple" />
                Daily Brief
              </h3>
              <p className="text-xs text-text-dim mb-3">
                Get your personalized intelligence briefing every morning.
              </p>
              <button className="w-full py-2 bg-accent-purple/20 text-accent-purple rounded-lg text-xs font-bold hover:bg-accent-purple/30 transition-colors">
                Subscribe to Brief
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Signal Detail Modal */}
      {selectedSignal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-elevated rounded-2xl border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {selectedSignal.isExclusive && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded text-[9px] font-bold text-yellow-400">
                      <Lock className="w-3 h-3" />
                      EXCLUSIVE
                    </span>
                  )}
                  <span className="text-[10px] text-text-dim">{selectedSignal.timeAgo}</span>
                </div>
                <button 
                  onClick={() => setSelectedSignal(null)}
                  className="p-2 rounded-lg hover:bg-white/5 text-text-dim hover:text-white"
                >
                  <span className="text-xl">×</span>
                </button>
              </div>

              <h2 className="text-2xl font-bold text-white mb-4">{selectedSignal.title}</h2>
              
              <div className="prose prose-invert max-w-none">
                <p className="text-text-dim mb-6">{selectedSignal.summary}</p>
                
                {selectedSignal.analysis && (
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-accent-blue" />
                      Intelligence Analysis
                    </h3>
                    <p className="text-sm text-text-dim bg-white/5 rounded-lg p-4">
                      {selectedSignal.analysis}
                    </p>
                  </div>
                )}

                {selectedSignal.keyTakeaways && (
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-white mb-3">Key Takeaways</h3>
                    <ul className="space-y-2">
                      {selectedSignal.keyTakeaways.map((takeaway, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-text-dim">
                          <span className="text-accent-green mt-0.5">→</span>
                          {takeaway}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <span className="text-xs text-text-dim">Source: {selectedSignal.source}</span>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 rounded-lg text-sm text-text-dim hover:text-white hover:bg-white/5">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-accent-purple/20 text-accent-purple text-sm font-bold hover:bg-accent-purple/30">
                    Save to Brief
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-elevated rounded-3xl border border-yellow-500/20 max-w-md w-full p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-500/20 to-transparent rounded-full blur-3xl" />
            
            <button 
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5 text-text-dim"
            >
              <span className="text-xl">×</span>
            </button>

            <div className="relative text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <Crown className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">Upgrade to Pro</h2>
              <p className="text-sm text-text-dim mb-6">
                Get intelligence-grade analysis and exclusive signals
              </p>

              <div className="space-y-3 mb-6 text-left">
                {[
                  'Exclusive breaking signals (12hr early access)',
                  'AI-powered threat analysis',
                  'Daily intelligence briefings',
                  'Advanced filtering and alerts',
                  'Export to PDF/CSV'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-text-dim">
                    <span className="text-accent-green">✓</span>
                    {feature}
                  </div>
                ))}
              </div>

              <div className="flex items-baseline justify-center gap-1 mb-6">
                <span className="text-4xl font-bold text-white">$29</span>
                <span className="text-text-dim">/month</span>
              </div>

              <button className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl text-black font-bold hover:opacity-90 transition-opacity">
                Start Pro Trial
              </button>
              <p className="text-[10px] text-text-dim mt-3">7-day free trial • Cancel anytime</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
