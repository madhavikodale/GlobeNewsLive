'use client';

import { useEffect, useState, useCallback } from 'react';
import { Bell, BellOff, Check, X, Settings } from 'lucide-react';

interface PushNotificationManagerProps {
  criticalCount: number;
  signals: Array<{
    id: string;
    title: string;
    severity: string;
    source: string;
    timestamp: Date;
  }>;
}

// Convert VAPID public key from base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationManager({ criticalCount, signals }: PushNotificationManagerProps) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastNotifiedId, setLastNotifiedId] = useState<string | null>(null);

  // Check subscription status on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check if notifications are supported
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setError('Push notifications not supported in this browser');
      return;
    }

    setPermission(Notification.permission);

    // Check existing subscription
    navigator.serviceWorker.ready.then((registration) => {
      registration.pushManager.getSubscription().then((subscription) => {
        setIsSubscribed(!!subscription);
      });
    });
  }, []);

  // Monitor critical signals and trigger notifications
  useEffect(() => {
    if (!isSubscribed || permission !== 'granted') return;

    const criticalSignals = signals.filter(s => s.severity === 'CRITICAL');
    if (criticalSignals.length === 0) return;

    const latestCritical = criticalSignals[0];
    
    // Only notify if this is a new critical alert
    if (latestCritical.id !== lastNotifiedId && document.hidden) {
      setLastNotifiedId(latestCritical.id);
      
      // Show local notification
      navigator.serviceWorker.ready.then((registration) => {
        const options: NotificationOptions & { actions?: Array<{ action: string; title: string }> } = {
          body: latestCritical.title,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          tag: `critical-${latestCritical.id}`,
          requireInteraction: true,
          actions: [
            { action: 'view', title: 'View' },
            { action: 'dismiss', title: 'Dismiss' }
          ],
          data: {
            signalId: latestCritical.id,
            url: '/?alert=' + latestCritical.id
          }
        };
        registration.showNotification('🚨 CRITICAL ALERT', options);
      });
    }
  }, [signals, isSubscribed, permission, lastNotifiedId]);

  const subscribeToPush = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Request notification permission
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Get VAPID public key from server
      const vapidResponse = await fetch('/api/push/vapid-public-key');
      const { publicKey } = await vapidResponse.json();

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource
      });

      // Send subscription to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription');
      }

      setIsSubscribed(true);
      
      // Show success notification
      registration.showNotification('✅ Notifications Enabled', {
        body: 'You will receive alerts for critical events',
        icon: '/icon-192x192.png'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unsubscribeFromPush = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        
        // Notify server to remove subscription
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        });
      }

      setIsSubscribed(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unsubscribe');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const testNotification = useCallback(async () => {
    const registration = await navigator.serviceWorker.ready;
    const options: NotificationOptions & { actions?: Array<{ action: string; title: string }> } = {
      body: 'This is a test notification from GlobeNewsLive',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      requireInteraction: true,
      actions: [
        { action: 'view', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    };
    registration.showNotification('🧪 Test Alert', options);
  }, []);

  // Don't render if notifications not supported
  if (error && error.includes('not supported')) {
    return null;
  }

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-mono transition-all ${
          isSubscribed 
            ? 'bg-accent-green/20 text-accent-green hover:bg-accent-green/30' 
            : 'bg-elevated text-text-dim hover:text-white hover:bg-white/5'
        }`}
        title={isSubscribed ? 'Notifications enabled' : 'Enable notifications'}
      >
        {isSubscribed ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
        <span className="hidden sm:inline">{isSubscribed ? 'ALERTS ON' : 'ALERTS OFF'}</span>
        {criticalCount > 0 && isSubscribed && (
          <span className="bg-accent-red text-white text-[8px] px-1.5 py-0.5 rounded-full">
            {criticalCount}
          </span>
        )}
      </button>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-elevated border border-border-default rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-accent-green" />
              <span className="text-xs font-bold text-white">Alert Settings</span>
            </div>
            <button 
              onClick={() => setShowSettings(false)}
              className="text-text-dim hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-text-dim">Status</span>
              <span className={`text-[11px] font-medium ${
                isSubscribed ? 'text-accent-green' : 'text-text-dim'
              }`}>
                {isSubscribed ? '● Active' : '○ Inactive'}
              </span>
            </div>

            {/* Permission status */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-text-dim">Permission</span>
              <span className={`text-[11px] font-medium capitalize ${
                permission === 'granted' ? 'text-accent-green' :
                permission === 'denied' ? 'text-accent-red' :
                'text-accent-gold'
              }`}>
                {permission}
              </span>
            </div>

            {/* Critical alerts count */}
            {criticalCount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-text-dim">Critical Alerts</span>
                <span className="text-[11px] font-bold text-accent-red">{criticalCount}</span>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="text-[10px] text-accent-red bg-accent-red/10 px-3 py-2 rounded">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2 pt-2 border-t border-border-subtle">
              {!isSubscribed ? (
                <button
                  onClick={subscribeToPush}
                  disabled={isLoading || permission === 'denied'}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent-green text-black text-[11px] font-bold rounded hover:bg-accent-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                  Enable Push Alerts
                </button>
              ) : (
                <button
                  onClick={unsubscribeFromPush}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent-red text-white text-[11px] font-bold rounded hover:bg-accent-red/90 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <BellOff className="w-4 h-4" />
                  )}
                  Disable Alerts
                </button>
              )}

              {isSubscribed && (
                <button
                  onClick={testNotification}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 text-text-dim text-[11px] rounded hover:bg-white/10 hover:text-white transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  Send Test Alert
                </button>
              )}
            </div>

            {/* Info text */}
            <p className="text-[9px] text-text-dim text-center leading-relaxed">
              {isSubscribed 
                ? 'You will receive notifications for CRITICAL alerts even when the app is closed'
                : 'Enable to get instant alerts for breaking critical events'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
