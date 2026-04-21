'use client';

import { useEffect, useRef, useState } from 'react';
import { Signal } from '@/types';

interface WaterfallAlertsProps {
  signals: Signal[];
  maxAlerts?: number;
}

interface WaterfallItem {
  id: string;
  title: string;
  severity: string;
  source: string;
  timestamp: number;
  y: number;
  opacity: number;
}

export default function WaterfallAlerts({ signals, maxAlerts = 20 }: WaterfallAlertsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [waterfallData, setWaterfallData] = useState<WaterfallItem[]>([]);
  const animationRef = useRef<number>();
  const lastSignalsRef = useRef<string>('');

  // Severity colors matching the app theme
  const severityColors: Record<string, string> = {
    CRITICAL: '#ff2244',
    HIGH: '#ff6633',
    MEDIUM: '#ffaa00',
    LOW: '#00ccff',
    INFO: '#00ff88'
  };

  // Initialize waterfall data from signals
  useEffect(() => {
    const signalsKey = signals.map(s => s.id).join(',');
    if (signalsKey === lastSignalsRef.current) return;
    lastSignalsRef.current = signalsKey;

    const criticalSignals = signals
      .filter(s => ['CRITICAL', 'HIGH'].includes(s.severity))
      .slice(0, maxAlerts);

    const newItems: WaterfallItem[] = criticalSignals.map((signal, index) => ({
      id: signal.id,
      title: signal.title,
      severity: signal.severity,
      source: signal.source,
      timestamp: Date.now() - index * 2000,
      y: index * 40,
      opacity: 1 - (index * 0.05)
    }));

    setWaterfallData(newItems);
  }, [signals, maxAlerts]);

  // Canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let offset = 0;
    const animate = () => {
      ctx.fillStyle = 'rgba(10, 22, 40, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw waterfall lines
      waterfallData.forEach((item, index) => {
        const color = severityColors[item.severity] || '#00ff88';
        const y = (item.y + offset) % canvas.height;
        const alpha = Math.max(0, item.opacity - (offset / canvas.height) * 0.5);

        // Draw signal line
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width * 0.7, y);
        ctx.strokeStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw glow effect for critical
        if (item.severity === 'CRITICAL' && alpha > 0.3) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width * 0.7, y);
          ctx.strokeStyle = color + '20';
          ctx.lineWidth = 8;
          ctx.stroke();
        }

        // Draw text label
        if (alpha > 0.2) {
          ctx.font = '11px monospace';
          ctx.fillStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
          const timeStr = new Date(item.timestamp).toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          ctx.fillText(`${timeStr} [${item.severity}] ${item.title.substring(0, 40)}...`, 10, y - 5);
        }
      });

      // Draw frequency markers (like spectrum analyzer)
      for (let i = 0; i < canvas.height; i += 50) {
        const y = (i + offset) % canvas.height;
        ctx.beginPath();
        ctx.moveTo(canvas.width - 40, y);
        ctx.lineTo(canvas.width - 35, y);
        ctx.strokeStyle = 'rgba(0, 255, 136, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      offset += 0.5;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [waterfallData]);

  if (waterfallData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0a1628] rounded-lg border border-border-subtle">
        <div className="text-text-dim text-xs font-mono">No critical alerts</div>
      </div>
    );
  }

  return (
    <div className="h-full relative bg-[#0a1628] rounded-lg border border-accent-green/30 overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-[#0a1628] to-transparent p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-accent-green text-xs">📡</span>
            <span className="text-accent-green font-mono text-xs font-bold tracking-wider">ALERT WATERFALL</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono">
            <span className="text-accent-red">● CRITICAL</span>
            <span className="text-accent-orange">● HIGH</span>
            <span className="text-accent-gold">● MEDIUM</span>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ imageRendering: 'crisp-edges' }}
      />

      {/* Overlay stats */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0a1628] to-transparent p-2">
        <div className="flex items-center justify-between text-[10px] font-mono text-text-dim">
          <span>{waterfallData.length} ALERTS</span>
          <span>LIVE</span>
        </div>
      </div>
    </div>
  );
}
