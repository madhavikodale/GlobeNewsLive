'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface NewsItem {
  id: string;
  title: string;
  category: string;
  severity: string;
  timestamp: string;
  source: string;
}

export default function ProDashboard() {
  const [conflicts, setConflicts] = useState<NewsItem[]>([]);
  const [markets, setMarkets] = useState<NewsItem[]>([]);
  const [disasters, setDisasters] = useState<NewsItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchData() {
    try {
      const [conflictsRes, marketsRes, disastersRes] = await Promise.all([
        fetch('/api/signals?limit=20'),
        fetch('/api/markets?limit=20'),
        fetch('/api/signals?category=disaster&limit=20')
      ]);

      const conflictsData = await conflictsRes.json();
      const marketsData = await marketsRes.json();
      const disastersData = await disastersRes.json();
      
      setConflicts(conflictsData.signals || []);
      setMarkets(marketsData.markets || []);
      setDisasters(disastersData.signals || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch:', error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-blue-400">
              GlobeNews
            </Link>
            <span className="text-gray-500">|</span>
            <span className="text-sm text-gray-400">Pro Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
            <button
              onClick={fetchData}
              className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded transition"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="flex h-screen pt-14">
        {/* Column 1: Conflicts */}
        <div className="w-1/3 border-r border-gray-800 overflow-y-auto">
          <div className="sticky top-0 bg-gray-900 p-4 border-b border-gray-800 z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-red-400 font-bold text-lg flex items-center gap-2">
                🚨 Conflicts
                <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">
                  {conflicts.length}
                </span>
              </h2>
            </div>
          </div>
          <NewsList items={conflicts} type="conflict" />
        </div>

        {/* Column 2: Markets */}
        <div className="w-1/3 border-r border-gray-800 overflow-y-auto">
          <div className="sticky top-0 bg-gray-900 p-4 border-b border-gray-800 z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-green-400 font-bold text-lg flex items-center gap-2">
                📈 Markets
                <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                  {markets.length}
                </span>
              </h2>
            </div>
          </div>
          <NewsList items={markets} type="market" />
        </div>

        {/* Column 3: Disasters */}
        <div className="w-1/3 overflow-y-auto">
          <div className="sticky top-0 bg-gray-900 p-4 border-b border-gray-800 z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-orange-400 font-bold text-lg flex items-center gap-2">
                🌍 Disasters
                <span className="text-xs bg-orange-600 text-white px-2 py-0.5 rounded-full">
                  {disasters.length}
                </span>
              </h2>
            </div>
          </div>
          <NewsList items={disasters} type="disaster" />
        </div>
      </div>
    </div>
  );
}

function NewsList({ items, type }: { items: NewsItem[]; type: string }) {
  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-gray-900 p-3 rounded-lg hover:bg-gray-800 transition cursor-pointer border border-gray-800 hover:border-gray-700"
        >
          <div className="flex items-start gap-2 mb-1">
            <SeverityBadge severity={item.severity} />
            <span className="text-gray-500 text-xs shrink-0">
              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-200 leading-snug">
            {item.title}
          </h3>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-500">{item.source}</span>
            <Link
              href={`/signals/${item.id}`}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              View →
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    CRITICAL: 'bg-red-600',
    HIGH: 'bg-orange-600',
    MEDIUM: 'bg-yellow-600',
    LOW: 'bg-blue-600',
  };

  return (
    <span
      className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${
        colors[severity] || 'bg-gray-600'
      }`}
    >
      {severity}
    </span>
  );
}
