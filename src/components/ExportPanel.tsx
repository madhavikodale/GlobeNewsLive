'use client';

import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { useState } from 'react';
import { Signal } from '@/types';

interface ExportPanelProps {
  signals: Signal[];
}

export default function ExportPanel({ signals }: ExportPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const exportToCSV = () => {
    setExporting(true);
    
    // CSV Headers
    const headers = ['Timestamp', 'Title', 'Severity', 'Category', 'Source', 'Region', 'Summary', 'URL'];
    
    // CSV Rows
    const rows = signals.map(signal => [
      signal.timestamp,
      `"${signal.title.replace(/"/g, '""')}"`,
      signal.severity,
      signal.category,
      signal.source,
      (signal as any).region || 'unknown',
      `"${(signal.summary || '').replace(/"/g, '""')}"`,
      signal.sourceUrl || ''
    ]);
    
    // Combine
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `globenews-signals-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setExporting(false);
    setIsOpen(false);
  };

  const exportToJSON = () => {
    setExporting(true);
    
    const data = {
      exportedAt: new Date().toISOString(),
      totalSignals: signals.length,
      signals: signals
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `globenews-signals-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setExporting(false);
    setIsOpen(false);
  };

  const copyToClipboard = () => {
    const text = signals.slice(0, 20).map(s => 
      `[${s.severity}] ${s.title} - ${s.source} (${s.timeAgo})`
    ).join('\n');
    
    navigator.clipboard.writeText(text).then(() => {
      alert('Top 20 signals copied to clipboard!');
      setIsOpen(false);
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-mono text-text-dim hover:text-white hover:bg-white/5 transition-colors"
        title="Export data"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Export</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-elevated border border-border-default rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-border-subtle">
            <span className="text-[10px] font-mono text-text-dim">EXPORT {signals.length} SIGNALS</span>
          </div>
          
          <button
            onClick={exportToCSV}
            disabled={exporting}
            className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-white hover:bg-white/5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-accent-green" />
            <span>Export as CSV</span>
          </button>
          
          <button
            onClick={exportToJSON}
            disabled={exporting}
            className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-white hover:bg-white/5 transition-colors"
          >
            <FileText className="w-4 h-4 text-accent-blue" />
            <span>Export as JSON</span>
          </button>
          
          <button
            onClick={copyToClipboard}
            className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-white hover:bg-white/5 transition-colors border-t border-border-subtle"
          >
            <span className="text-accent-gold">📋</span>
            <span>Copy Top 20</span>
          </button>
        </div>
      )}
    </div>
  );
}
