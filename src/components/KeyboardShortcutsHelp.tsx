'use client';

import { useState } from 'react';
import { Keyboard, X } from 'lucide-react';
import { useKeyboardHelp } from '@/hooks/useKeyboardShortcuts';

export default function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const { shortcuts } = useKeyboardHelp();

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-mono text-text-dim hover:text-white hover:bg-white/5 transition-colors"
        title="Keyboard shortcuts"
      >
        <Keyboard className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Shortcuts</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-elevated border border-border-default rounded-lg shadow-2xl w-full max-w-md mx-4 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-accent-green" />
                <span className="font-mono text-xs font-bold text-white">Keyboard Shortcuts</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-text-dim hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Shortcuts list */}
            <div className="p-4">
              <div className="grid gap-2">
                {shortcuts.map((shortcut, i) => (
                  <div 
                    key={i}
                    className="flex items-center justify-between py-2 px-3 bg-white/5 rounded hover:bg-white/10 transition-colors"
                  >
                    <span className="text-[11px] text-text-dim">{shortcut.description}</span>
                    <kbd className="px-2 py-1 bg-black/30 rounded text-[10px] font-mono text-white border border-border-subtle">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-black/20 border-t border-border-subtle">
              <p className="text-[9px] text-text-dim text-center">
                Press <kbd className="px-1 bg-white/10 rounded">Esc</kbd> to close
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}