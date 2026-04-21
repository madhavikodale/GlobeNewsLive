'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, Plus, X, Trash2, AlertTriangle } from 'lucide-react';
import { Signal } from '@/types';

const STORAGE_KEY = 'globenews-custom-alerts';

interface CustomAlert {
  id: string;
  keyword: string;
  enabled: boolean;
  createdAt: number;
}

export function useCustomAlerts() {
  const [alerts, setAlerts] = useState<CustomAlert[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load alerts on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setAlerts(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load custom alerts:', e);
    }
    setIsLoaded(true);
  }, []);

  const saveAlerts = useCallback((newAlerts: CustomAlert[]) => {
    setAlerts(newAlerts);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newAlerts));
      } catch (e) {
        console.error('Failed to save custom alerts:', e);
      }
    }
  }, []);

  const addAlert = useCallback((keyword: string) => {
    const newAlert: CustomAlert = {
      id: Date.now().toString(),
      keyword: keyword.toLowerCase().trim(),
      enabled: true,
      createdAt: Date.now()
    };
    saveAlerts([...alerts, newAlert]);
  }, [alerts, saveAlerts]);

  const removeAlert = useCallback((id: string) => {
    saveAlerts(alerts.filter(a => a.id !== id));
  }, [alerts, saveAlerts]);

  const toggleAlert = useCallback((id: string) => {
    saveAlerts(alerts.map(a => 
      a.id === id ? { ...a, enabled: !a.enabled } : a
    ));
  }, [alerts, saveAlerts]);

  const checkMatches = useCallback((signal: Signal): string[] => {
    const text = `${signal.title} ${signal.summary || ''}`.toLowerCase();
    return alerts
      .filter(a => a.enabled)
      .filter(a => text.includes(a.keyword))
      .map(a => a.keyword);
  }, [alerts]);

  return {
    alerts,
    addAlert,
    removeAlert,
    toggleAlert,
    checkMatches,
    enabledCount: alerts.filter(a => a.enabled).length,
    isLoaded
  };
}

interface CustomAlertsPanelProps {
  alerts: CustomAlert[];
  onAdd: (keyword: string) => void;
  onRemove: (id: string) => void;
  onToggle: (id: string) => void;
}

export default function CustomAlertsPanel({ alerts, onAdd, onRemove, onToggle }: CustomAlertsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');

  const handleAdd = () => {
    if (newKeyword.trim()) {
      onAdd(newKeyword);
      setNewKeyword('');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-mono transition-colors ${
          alerts.some(a => a.enabled) 
            ? 'text-accent-orange bg-accent-orange/10 hover:bg-accent-orange/20' 
            : 'text-text-dim hover:text-white hover:bg-white/5'
        }`}
        title="Custom keyword alerts"
      >
        <AlertTriangle className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">
          {alerts.filter(a => a.enabled).length > 0 
            ? `${alerts.filter(a => a.enabled).length} Alerts` 
            : 'Custom Alerts'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-72 bg-elevated border border-border-default rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-accent-orange" />
              <span className="text-[11px] font-bold text-white">Custom Keyword Alerts</span>
            </div>
            <p className="text-[9px] text-text-dim mt-1">
              Get notified when signals match your keywords
            </p>
          </div>

          {/* Add new alert */}
          <div className="px-3 py-2 border-b border-border-subtle">
            <div className="flex gap-2">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="Enter keyword..."
                className="flex-1 bg-black/20 border border-border-subtle rounded px-2 py-1 text-[11px] text-white placeholder:text-text-dim outline-none focus:border-accent-orange"
              />
              <button
                onClick={handleAdd}
                disabled={!newKeyword.trim()}
                className="p-1.5 bg-accent-orange/20 text-accent-orange rounded hover:bg-accent-orange/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Alert list */}
          <div className="max-h-48 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="px-4 py-6 text-center text-[11px] text-text-dim">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No custom alerts</p>
                <p className="text-[9px] mt-1">Add keywords to monitor</p>
              </div>
            ) : (
              alerts.map(alert => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between px-3 py-2 border-b border-border-subtle last:border-b-0 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggle(alert.id)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        alert.enabled ? 'bg-accent-orange' : 'bg-text-dim/30'
                      }`}
                    />
                    <span className={`text-[11px] ${alert.enabled ? 'text-white' : 'text-text-dim line-through'}`}>
                      {alert.keyword}
                    </span>
                  </div>
                  <button
                    onClick={() => onRemove(alert.id)}
                    className="p-1 text-text-dim hover:text-accent-red transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Example keywords */}
          {alerts.length === 0 && (
            <div className="px-3 py-2 bg-black/20 border-t border-border-subtle">
              <span className="text-[9px] text-text-dim">Popular keywords:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {['nuclear', 'Hamas', 'Hezbollah', 'oil', 'sanctions'].map(keyword => (
                  <button
                    key={keyword}
                    onClick={() => onAdd(keyword)}
                    className="text-[9px] px-2 py-0.5 bg-white/5 rounded text-text-dim hover:text-white hover:bg-white/10 transition-colors"
                  >
                    + {keyword}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
