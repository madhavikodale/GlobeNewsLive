'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Grid3X3, Plus, Layout, Maximize2, Minimize2, Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface Stream {
  id: string;
  name: string;
  url: string;
  type: 'youtube' | 'hls' | 'iframe';
  region: string;
}

interface StreamLayout {
  id: string;
  streamId: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface CustomVideoWallProps {
  isOpen: boolean;
  onClose: () => void;
}

// Verified YouTube live news streams - these are official 24/7 live streams
// Format: https://www.youtube.com/embed/VIDEO_ID?autoplay=1&mute=1
const AVAILABLE_STREAMS: Stream[] = [
  { id: 'sky_news', name: 'Sky News', url: 'https://www.youtube.com/embed/YDvsBbKfLPA?autoplay=1&mute=1', type: 'iframe', region: 'UK' },
  { id: 'aljazeera', name: 'Al Jazeera', url: 'https://www.youtube.com/embed/gCNeDWCI0vo?autoplay=1&mute=1', type: 'iframe', region: 'Middle East' },
  { id: 'france24', name: 'France 24', url: 'https://www.youtube.com/embed/Ap-UM1O9RBU?autoplay=1&mute=1', type: 'iframe', region: 'Europe' },
  { id: 'dw_news', name: 'DW News', url: 'https://www.youtube.com/embed/tZT4RTxUtOs?autoplay=1&mute=1', type: 'iframe', region: 'Germany' },
  { id: 'abc_news', name: 'ABC News', url: 'https://www.youtube.com/embed/w_Ma8oQLmSM?autoplay=1&mute=1', type: 'iframe', region: 'USA' },
  { id: 'trt_world', name: 'TRT World', url: 'https://www.youtube.com/embed/y9PqUejTCyc?autoplay=1&mute=1', type: 'iframe', region: 'Turkey' },
  { id: 'cgtn', name: 'CGTN', url: 'https://www.youtube.com/embed/QGXWTRiL3bI?autoplay=1&mute=1', type: 'iframe', region: 'China' },
  { id: 'wion', name: 'WION', url: 'https://www.youtube.com/embed/dTq6cMdIFrA?autoplay=1&mute=1', type: 'iframe', region: 'India' },
  { id: 'ndtv', name: 'NDTV', url: 'https://www.youtube.com/embed/e9cE7T1-jUI?autoplay=1&mute=1', type: 'iframe', region: 'India' },
  { id: 'reuters', name: 'Reuters', url: 'https://www.youtube.com/embed/cF-sEy_hshU?autoplay=1&mute=1', type: 'iframe', region: 'Global' },
];

const STORAGE_KEY = 'globenews-video-wall';

export default function CustomVideoWall({ isOpen, onClose }: CustomVideoWallProps) {
  const [layouts, setLayouts] = useState<StreamLayout[]>([]);
  const [activeStreams, setActiveStreams] = useState<string[]>([]);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [muted, setMuted] = useState(true);
  const [gridSize, setGridSize] = useState<2 | 3 | 4>(2);

  // Load saved layouts
  useEffect(() => {
    if (!isOpen) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setLayouts(data.layouts || []);
        setActiveStreams(data.activeStreams || []);
      }
    } catch {}
  }, [isOpen]);

  // Save layouts
  const saveLayouts = useCallback((newLayouts: StreamLayout[], newStreams: string[]) => {
    setLayouts(newLayouts);
    setActiveStreams(newStreams);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      layouts: newLayouts,
      activeStreams: newStreams
    }));
  }, []);

  const addStream = (streamId: string) => {
    if (activeStreams.includes(streamId)) return;
    
    const stream = AVAILABLE_STREAMS.find(s => s.id === streamId);
    if (!stream) return;

    // Calculate position based on grid
    const index = activeStreams.length;
    const cols = gridSize;
    const x = index % cols;
    const y = Math.floor(index / cols);

    const newLayout: StreamLayout = {
      id: Date.now().toString(),
      streamId,
      x,
      y,
      w: 1,
      h: 1
    };

    saveLayouts([...layouts, newLayout], [...activeStreams, streamId]);
    setShowAddPanel(false);
  };

  const removeStream = (layoutId: string) => {
    const layout = layouts.find(l => l.id === layoutId);
    if (!layout) return;

    const newLayouts = layouts.filter(l => l.id !== layoutId);
    const newStreams = activeStreams.filter(s => s !== layout.streamId);
    
    // Recalculate positions
    const recalculated = newLayouts.map((l, index) => ({
      ...l,
      x: index % gridSize,
      y: Math.floor(index / gridSize)
    }));

    saveLayouts(recalculated, newStreams);
  };

  const clearAll = () => {
    saveLayouts([], []);
  };

  const getGridCols = () => {
    switch (gridSize) {
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-4';
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[100] bg-void ${isFullscreen ? '' : 'p-4'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-elevated border-b border-border-default">
        <div className="flex items-center gap-3">
          <span className="text-lg">📺</span>
          <span className="font-mono text-sm font-bold text-white">CUSTOM VIDEO WALL</span>
          <span className="text-[10px] text-text-dim font-mono">
            {activeStreams.length} streams
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Grid size selector */}
          <div className="flex items-center gap-1 bg-black/20 rounded p-1">
            {[2, 3, 4].map(size => (
              <button
                key={size}
                onClick={() => setGridSize(size as 2 | 3 | 4)}
                className={`px-2 py-1 rounded text-[10px] font-mono ${
                  gridSize === size ? 'bg-accent-purple text-white' : 'text-text-dim hover:text-white'
                }`}
              >
                {size}×{size}
              </button>
            ))}
          </div>

          {/* Mute toggle */}
          <button
            onClick={() => setMuted(!muted)}
            className={`p-2 rounded ${muted ? 'text-text-dim' : 'text-accent-green'}`}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Add stream */}
          <button
            onClick={() => setShowAddPanel(!showAddPanel)}
            className="flex items-center gap-1 px-3 py-1.5 rounded bg-accent-purple/20 text-accent-purple text-[10px] font-mono hover:bg-accent-purple/30"
          >
            <Plus className="w-3.5 h-3.5" />
            ADD
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded text-text-dim hover:text-white"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Clear all */}
          {activeStreams.length > 0 && (
            <button
              onClick={clearAll}
              className="px-3 py-1.5 rounded bg-accent-red/20 text-accent-red text-[10px] font-mono hover:bg-accent-red/30"
            >
              CLEAR
            </button>
          )}

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 rounded text-text-dim hover:text-white hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Add Stream Panel */}
      {showAddPanel && (
        <div className="absolute top-14 right-4 w-80 bg-elevated border border-border-default rounded-lg shadow-xl z-10 p-3 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold text-white">AVAILABLE STREAMS</span>
            <button onClick={() => setShowAddPanel(false)} className="text-text-dim hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-1">
            {AVAILABLE_STREAMS.map(stream => {
              const isAdded = activeStreams.includes(stream.id);
              return (
                <button
                  key={stream.id}
                  onClick={() => !isAdded && addStream(stream.id)}
                  disabled={isAdded}
                  className={`flex items-center justify-between px-3 py-2 rounded text-left text-[10px] transition-colors ${
                    isAdded 
                      ? 'bg-white/5 text-text-dim cursor-not-allowed' 
                      : 'hover:bg-white/5 text-white'
                  }`}
                >
                  <div>
                    <div className="font-medium">{stream.name}</div>
                    <div className="text-[9px] text-text-dim">{stream.region}</div>
                  </div>
                  {isAdded ? (
                    <span className="text-[9px] text-accent-green">ADDED</span>
                  ) : (
                    <Plus className="w-4 h-4 text-accent-purple" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Video Grid */}
      <div className={`flex-1 overflow-auto p-4 ${isFullscreen ? 'h-[calc(100vh-60px)]' : 'h-[calc(100vh-140px)]'}`}>
        {activeStreams.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-text-dim">
            <Grid3X3 className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-sm font-mono mb-2">NO STREAMS CONFIGURED</p>
            <p className="text-[10px] mb-4">Add streams to build your custom video wall</p>
            <button
              onClick={() => setShowAddPanel(true)}
              className="flex items-center gap-2 px-4 py-2 rounded bg-accent-purple/20 text-accent-purple text-[11px] font-mono hover:bg-accent-purple/30"
            >
              <Plus className="w-4 h-4" />
              ADD STREAMS
            </button>
          </div>
        ) : (
          <div className={`grid ${getGridCols()} gap-2 auto-rows-fr`}>
            {layouts.map(layout => {
              const stream = AVAILABLE_STREAMS.find(s => s.id === layout.streamId);
              if (!stream) return null;

              return (
                <div 
                  key={layout.id}
                  className="relative bg-black rounded-lg overflow-hidden border border-border-subtle group"
                  style={{ aspectRatio: '16/9' }}
                >
                  {/* Remove button */}
                  <button
                    onClick={() => removeStream(layout.id)}
                    className="absolute top-2 right-2 z-10 p-1.5 rounded bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent-red"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Stream label */}
                  <div className="absolute top-2 left-2 z-10 px-2 py-1 rounded bg-black/60 text-[9px] font-mono text-white">
                    {stream.name}
                  </div>

                  {/* Video iframe */}
                  <iframe
                    src={stream.url}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Empty slots hint */}
      {activeStreams.length > 0 && activeStreams.length < gridSize * gridSize && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-elevated/80 rounded-full text-[10px] text-text-dim">
          {gridSize * gridSize - activeStreams.length} slots remaining
        </div>
      )}
    </div>
  );
}
