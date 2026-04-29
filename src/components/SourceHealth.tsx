'use client';

import { useEffect, useState } from 'react';

interface FeedStatus {
  name: string;
  url: string;
  region: string;
  tier: number;
  status: 'online' | 'offline' | 'slow';
  lastCheck: Date;
  responseTime?: number;
}

interface SourceHealthProps {
  refreshInterval?: number;
}

export default function SourceHealth({ refreshInterval = 60000 }: SourceHealthProps) {
  const [feeds, setFeeds] = useState<FeedStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  // List of feeds to monitor (subset of main feeds)
  const monitoredFeeds = [
    { name: 'Reuters', url: 'https://feeds.reuters.com/reuters/worldNews', region: 'Global', tier: 1 },
    { name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', region: 'UK', tier: 1 },
    { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', region: 'Qatar', tier: 1 },
    { name: 'Defense One', url: 'https://www.defenseone.com/rss/', region: 'US', tier: 2 },
    { name: 'UN News', url: 'https://news.un.org/feed/subscribe/en/news/all/rss.xml', region: 'UN', tier: 1 },
    { name: 'Times of Israel', url: 'https://www.timesofisrael.com/feed/', region: 'Israel', tier: 1 },
    { name: 'Tehran Times', url: 'https://www.tehrantimes.com/rss', region: 'Iran', tier: 2 },
    { name: 'The Drive', url: 'https://www.twz.com/feed', region: 'US', tier: 2 },
  ];

  const checkFeedHealth = async (feed: typeof monitoredFeeds[0]): Promise<FeedStatus> => {
    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(feed.url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; GlobeNews-HealthCheck/1.0)'
        }
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      return {
        ...feed,
        status: response.ok ? (responseTime > 5000 ? 'slow' : 'online') : 'offline',
        lastCheck: new Date(),
        responseTime
      };
    } catch {
      return {
        ...feed,
        status: 'offline',
        lastCheck: new Date()
      };
    }
  };

  useEffect(() => {
    const checkAllFeeds = async () => {
      setLoading(true);
      const results = await Promise.all(monitoredFeeds.map(checkFeedHealth));
      setFeeds(results);
      setLoading(false);
    };

    checkAllFeeds();
    const interval = setInterval(checkAllFeeds, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const onlineCount = feeds.filter(f => f.status === 'online').length;
  const slowCount = feeds.filter(f => f.status === 'slow').length;
  const offlineCount = feeds.filter(f => f.status === 'offline').length;
  const totalCount = feeds.length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return '🟢';
      case 'slow': return '🟡';
      case 'offline': return '🔴';
      default: return '⚪';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-accent-green';
      case 'slow': return 'text-accent-gold';
      case 'offline': return 'text-accent-red';
      default: return 'text-text-dim';
    }
  };

  return (
    <div className="bg-elevated rounded-lg border border-border-subtle overflow-hidden">
      {/* Header */}
      <div 
        className="px-3 py-2 border-b border-border-subtle flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs">📡</span>
          <span className="font-mono text-xs font-bold tracking-wider text-white">SOURCE HEALTH</span>
        </div>
        <div className="flex items-center gap-3">
          {loading ? (
            <span className="text-[10px] text-text-dim animate-pulse">Checking...</span>
          ) : (
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span className="text-accent-green">{onlineCount} ONLINE</span>
              {slowCount > 0 && <span className="text-accent-gold">{slowCount} SLOW</span>}
              {offlineCount > 0 && <span className="text-accent-red">{offlineCount} DOWN</span>}
            </div>
          )}
          <span className="text-xs transition-transform duration-200" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            ▼
          </span>
        </div>
      </div>

      {/* Summary Bar */}
      {!loading && (
        <div className="px-3 py-1.5 bg-black/20 flex items-center gap-1">
          {feeds.map((feed, idx) => (
            <div
              key={feed.name}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                feed.status === 'online' ? 'bg-accent-green' :
                feed.status === 'slow' ? 'bg-accent-gold' :
                'bg-accent-red'
              }`}
              title={`${feed.name}: ${feed.status}${feed.responseTime ? ` (${feed.responseTime}ms)` : ''}`}
            />
          ))}
        </div>
      )}

      {/* Expanded Details */}
      {expanded && (
        <div className="max-h-48 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="w-6 h-6 border-2 border-accent-green/30 border-t-accent-green rounded-full animate-spin mx-auto mb-2" />
              <span className="text-[10px] text-text-dim font-mono">Checking feed status...</span>
            </div>
          ) : (
            <div className="divide-y divide-border-subtle">
              {feeds.map(feed => (
                <div key={feed.name} className="px-3 py-2 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{getStatusIcon(feed.status)}</span>
                    <div>
                      <div className="text-[11px] font-medium text-white">{feed.name}</div>
                      <div className="text-[9px] text-text-dim">{feed.region} • Tier {feed.tier}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-[10px] font-mono font-bold ${getStatusColor(feed.status)}`}>
                      {feed.status.toUpperCase()}
                    </div>
                    {feed.responseTime && (
                      <div className="text-[9px] text-text-dim">{feed.responseTime}ms</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Last updated */}
          <div className="px-3 py-1.5 bg-black/20 border-t border-border-subtle">
            <div className="text-[9px] text-text-dim font-mono text-center">
              Last checked: {feeds[0]?.lastCheck.toLocaleTimeString() || 'Never'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
