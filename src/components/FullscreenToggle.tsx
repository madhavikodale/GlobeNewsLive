'use client';

import { Maximize2, Minimize2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return { isFullscreen, toggleFullscreen };
}

interface FullscreenToggleProps {
  className?: string;
}

export default function FullscreenToggle({ className = '' }: FullscreenToggleProps) {
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  return (
    <button
      onClick={toggleFullscreen}
      className={`flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-mono text-text-dim hover:text-white hover:bg-white/5 transition-colors ${className}`}
      title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
    >
      {isFullscreen ? (
        <Minimize2 className="w-3.5 h-3.5" />
      ) : (
        <Maximize2 className="w-3.5 h-3.5" />
      )}
      <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
    </button>
  );
}
