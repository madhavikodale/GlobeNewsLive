'use client';

import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsOptions {
  onSearch?: () => void;
  onViewChange?: (view: string) => void;
  onThemeToggle?: () => void;
  onSoundToggle?: () => void;
  onRefresh?: () => void;
  onEscape?: () => void;
}

export function useKeyboardShortcuts(options: KeyboardShortcutsOptions) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore if user is typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      // Allow Escape even in inputs
      if (e.key === 'Escape' && options.onEscape) {
        options.onEscape();
      }
      return;
    }

    const { onSearch, onViewChange, onThemeToggle, onSoundToggle, onRefresh, onEscape } = options;

    switch (e.key) {
      // Search: / or Cmd/Ctrl + K
      case '/':
        e.preventDefault();
        onSearch?.();
        break;
      
      case 'k':
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault();
          onSearch?.();
        }
        break;

      // Number keys for views
      case '1':
        e.preventDefault();
        onViewChange?.('feed');
        break;
      case '2':
        e.preventDefault();
        onViewChange?.('map');
        break;
      case '3':
        e.preventDefault();
        onViewChange?.('markets');
        break;
      case '4':
        e.preventDefault();
        onViewChange?.('tracking');
        break;
      case '5':
        e.preventDefault();
        onViewChange?.('alerts');
        break;

      // Theme: T
      case 't':
        if (!e.metaKey && !e.ctrlKey) {
          e.preventDefault();
          onThemeToggle?.();
        }
        break;

      // Sound: S
      case 's':
        if (!e.metaKey && !e.ctrlKey) {
          e.preventDefault();
          onSoundToggle?.();
        }
        break;

      // Refresh: R
      case 'r':
        if (!e.metaKey && !e.ctrlKey) {
          e.preventDefault();
          onRefresh?.();
        }
        break;

      // Escape: Close modals/overlays
      case 'Escape':
        onEscape?.();
        break;
    }
  }, [options]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Hook for showing keyboard shortcut help
export function useKeyboardHelp() {
  const shortcuts = [
    { key: '/', description: 'Open search' },
    { key: '⌘K', description: 'Open search' },
    { key: '1-5', description: 'Switch views (Feed, Map, Markets, Track, Alerts)' },
    { key: 'T', description: 'Toggle theme' },
    { key: 'S', description: 'Toggle sound alerts' },
    { key: 'R', description: 'Refresh data' },
    { key: 'Esc', description: 'Close modal/overlay' },
  ];

  return { shortcuts };
}