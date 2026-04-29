'use client';

import { useState, useEffect } from 'react';
import { Mail, Plus, X, Bell, Check } from 'lucide-react';

interface EmailAlert {
  id: string;
  email: string;
  keywords: string[];
  severity: string[];
  enabled: boolean;
}

interface EmailNotificationsProps {
  signals: any[];
}

export default function EmailNotifications({ signals }: EmailNotificationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState<EmailAlert[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newKeywords, setNewKeywords] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string[]>(['CRITICAL', 'HIGH']);
  const [isLoaded, setIsLoaded] = useState(false);

  const STORAGE_KEY = 'globenews-email-alerts';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setEmailAlerts(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load email alerts:', e);
    }
    setIsLoaded(true);
  }, []);

  const saveAlerts = (alerts: EmailAlert[]) => {
    setEmailAlerts(alerts);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
    }
  };

  const addEmailAlert = () => {
    if (!newEmail.trim() || !newEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    const newAlert: EmailAlert = {
      id: Date.now().toString(),
      email: newEmail.trim(),
      keywords: newKeywords.split(',').map(k => k.trim()).filter(k => k),
      severity: selectedSeverity,
      enabled: true
    };

    saveAlerts([...emailAlerts, newAlert]);
    setNewEmail('');
    setNewKeywords('');
    
    // Simulate sending a test email
    window.alert(`Email alert configured for ${newAlert.email}!\n\nIn production, this would send notifications when signals match your criteria.`);
  };

  const removeAlert = (id: string) => {
    saveAlerts(emailAlerts.filter(a => a.id !== id));
  };

  const toggleAlert = (id: string) => {
    saveAlerts(emailAlerts.map(a => 
      a.id === id ? { ...a, enabled: !a.enabled } : a
    ));
  };

  const checkMatchingSignals = (alert: EmailAlert) => {
    return signals.filter(s => {
      const text = `${s.title} ${s.summary || ''}`.toLowerCase();
      const matchesKeyword = alert.keywords.length === 0 || 
        alert.keywords.some(kw => text.includes(kw.toLowerCase()));
      const matchesSeverity = alert.severity.includes(s.severity);
      return matchesKeyword && matchesSeverity;
    }).length;
  };

  const SEVERITY_OPTIONS = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-mono transition-colors ${
          emailAlerts.some(a => a.enabled) 
            ? 'text-accent-cyan bg-accent-cyan/10 hover:bg-accent-cyan/20' 
            : 'text-text-dim hover:text-white hover:bg-white/5'
        }`}
        title="Email notifications"
      >
        <Mail className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">
          {emailAlerts.filter(a => a.enabled).length > 0 
            ? `Email (${emailAlerts.filter(a => a.enabled).length})` 
            : 'Email'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-80 bg-elevated border border-border-default rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-accent-cyan" />
              <span className="text-[11px] font-bold text-white">Email Notifications</span>
            </div>
            <p className="text-[9px] text-text-dim mt-1">
              Get email alerts when signals match your criteria
            </p>
          </div>

          {/* Add new alert */}
          <div className="px-3 py-2 border-b border-border-subtle space-y-2">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter your email..."
              className="w-full bg-black/20 border border-border-subtle rounded px-2 py-1.5 text-[11px] text-white placeholder:text-text-dim"
            />
            
            <input
              type="text"
              value={newKeywords}
              onChange={(e) => setNewKeywords(e.target.value)}
              placeholder="Keywords (comma separated)..."
              className="w-full bg-black/20 border border-border-subtle rounded px-2 py-1.5 text-[11px] text-white placeholder:text-text-dim"
            />

            <div>
              <span className="text-[9px] text-text-dim block mb-1">Severity levels:</span>
              <div className="flex flex-wrap gap-1">
                {SEVERITY_OPTIONS.map(sev => (
                  <button
                    key={sev}
                    onClick={() => {
                      setSelectedSeverity(prev => 
                        prev.includes(sev) 
                          ? prev.filter(s => s !== sev)
                          : [...prev, sev]
                      );
                    }}
                    className={`px-2 py-0.5 rounded text-[9px] transition-colors ${
                      selectedSeverity.includes(sev)
                        ? 'bg-accent-cyan text-black'
                        : 'bg-white/5 text-text-dim'
                    }`}
                  >
                    {selectedSeverity.includes(sev) && <Check className="w-3 h-3 inline mr-1" />}
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={addEmailAlert}
              disabled={!newEmail.trim()}
              className="w-full py-1.5 bg-accent-cyan/20 text-accent-cyan rounded text-[11px] font-bold hover:bg-accent-cyan/30 disabled:opacity-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 inline mr-1" />
              Add Email Alert
            </button>
          </div>

          {/* Alert list */}
          <div className="max-h-48 overflow-y-auto">
            {emailAlerts.length === 0 ? (
              <div className="px-4 py-6 text-center text-[11px] text-text-dim">
                <Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No email alerts configured</p>
                <p className="text-[9px] mt-1">Add your email to get notified</p>
              </div>
            ) : (
              emailAlerts.map(alert => {
                const matchingCount = checkMatchingSignals(alert);
                return (
                  <div
                    key={alert.id}
                    className="px-3 py-2 border-b border-border-subtle last:border-b-0 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleAlert(alert.id)}
                            className={`w-3 h-3 rounded-full transition-colors ${
                              alert.enabled ? 'bg-accent-cyan' : 'bg-text-dim/30'
                            }`}
                          />
                          <span className={`text-[11px] truncate ${alert.enabled ? 'text-white' : 'text-text-dim'}`}>
                            {alert.email}
                          </span>
                        </div>
                        
                        {alert.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {alert.keywords.map(kw => (
                              <span key={kw} className="text-[8px] px-1.5 py-0.5 bg-white/5 rounded text-text-dim">
                                {kw}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[8px] text-text-dim">
                            {alert.severity.join(', ')}
                          </span>
                          {matchingCount > 0 && (
                            <span className="text-[8px] text-accent-cyan">
                              {matchingCount} matching now
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => removeAlert(alert.id)}
                        className="p-1 text-text-dim hover:text-accent-red transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Note */}
          <div className="px-3 py-2 bg-black/20 border-t border-border-subtle">
            <p className="text-[8px] text-text-dim">
              Note: Email delivery requires backend configuration. Currently alerts are stored locally only.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
