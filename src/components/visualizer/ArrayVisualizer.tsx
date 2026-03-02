import { useRef, useEffect, useCallback } from 'react';
import type { ArrayElement } from './types';

interface ArrayVisualizerProps {
  elements: ArrayElement[];
  currentIndex: number;
  targetValue: number | null;
}

const COLORS = {
  default: '#6b7280',
  comparing: '#f59e0b',
  found: '#22c55e',
  'not-found': '#ef4444',
};

export default function ArrayVisualizer({ elements, currentIndex, targetValue }: ArrayVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || elements.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = 24;
    const gap = 8;
    const boxWidth = Math.min(60, (width - padding * 2 - gap * (elements.length + 1)) / elements.length);
    const boxHeight = 50;
    const maxValue = Math.max(...elements.map(e => e.value), 1);

    ctx.clearRect(0, 0, width, height);

    elements.forEach((element, index) => {
      const x = padding + gap + index * (boxWidth + gap);
      const y = height - 60 - boxHeight;

      let color = COLORS[element.state];
      
      if (element.state === 'default' && index <= currentIndex) {
        color = COLORS['comparing'];
      }
      
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x, y, boxWidth, boxHeight, 6);
      ctx.fill();
      
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#f9fafb';
      ctx.font = 'bold 16px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(element.value.toString(), x + boxWidth / 2, y + boxHeight / 2);

      ctx.fillStyle = '#9ca3af';
      ctx.font = '11px Inter, system-ui, sans-serif';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(`[${index}]`, x + boxWidth / 2, height - 18);
    });

    if (targetValue !== null) {
      ctx.fillStyle = '#f3f4f6';
      ctx.font = 'bold 14px Inter, system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Procurando: ${targetValue}`, 16, 20);
    }
  }, [elements, currentIndex, targetValue]);

  useEffect(() => {
    draw();

    const resizeObserver = new ResizeObserver(() => {
      draw();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [draw]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-72 bg-secondary/30 rounded-lg border border-border"
    >
      <canvas 
        ref={canvasRef}
        className="w-full h-full"
      />
    </div>
  );
}
