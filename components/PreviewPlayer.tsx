import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, RefreshCw, AlertCircle } from 'lucide-react';

interface PreviewPlayerProps {
  previewCode: string;
}

export const PreviewPlayer: React.FC<PreviewPlayerProps> = ({ previewCode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [time, setTime] = useState(0);

  // Reset time when code changes
  useEffect(() => {
    startTimeRef.current = performance.now();
    setTime(0);
    setError(null);
    setIsPlaying(true);
  }, [previewCode]);

  const renderFrame = (timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    // Calculate t in seconds
    const t = (timestamp - startTimeRef.current) / 1000;
    setTime(t);

    try {
      // Create a function from the string body
      // We pass ctx, width, height, t as arguments
      const userFunc = new Function('ctx', 'width', 'height', 't', previewCode);
      
      // Safety clear
      ctx.clearRect(0, 0, width, height);
      
      // Default styles
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      
      // Execute
      userFunc(ctx, width, height, t);
    } catch (err: any) {
      console.error("Preview render error:", err);
      setError(err.message || "Runtime Error");
      setIsPlaying(false);
    }
  };

  const tick = (timestamp: number) => {
    if (!isPlaying) return;
    
    renderFrame(timestamp);
    animationRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    // Handle resize
    const resize = () => {
      if (containerRef.current && canvasRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        const dpr = window.devicePixelRatio || 1;
        canvasRef.current.width = clientWidth * dpr;
        canvasRef.current.height = clientHeight * dpr;
        
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) ctx.scale(dpr, dpr);
        
        // Redraw immediately on resize
        if (!isPlaying) {
             renderFrame(performance.now()); 
        }
      }
    };
    
    window.addEventListener('resize', resize);
    resize();

    return () => window.removeEventListener('resize', resize);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isPlaying && !error && previewCode) {
        animationRef.current = requestAnimationFrame(tick);
    }
    return () => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
    };
  }, [isPlaying, previewCode, error]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTogglePlay = () => {
    if (!isPlaying) {
        // Resume logic: adjust start time so we don't jump
        // newStartTime = now - (pausedTime)
        // simpler: just resume. 't' will jump if we use absolute time difference.
        // to handle pause correctly, we need accumulated time.
        // For simplicity, let's just reset start time to (now - currentT)
        startTimeRef.current = performance.now() - (time * 1000);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setError(null);
    startTimeRef.current = performance.now();
    setTime(0);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 rounded-lg border border-gray-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-2">
            <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Live Preview</span>
            {error && (
                <span className="flex items-center text-red-400 text-xs gap-1 ml-2">
                    <AlertCircle size={12} /> Error
                </span>
            )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleTogglePlay}
            className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
           <button
            onClick={handleReset}
            className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition"
            title="Reset"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 relative bg-gray-950 flex items-center justify-center overflow-hidden">
        <div 
            className="absolute inset-0 opacity-10 pointer-events-none" 
            style={{
                backgroundImage: `linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
            }} 
        />
        
        {/* We use width/height 100% via CSS, but canvas actual size is set via JS for DPR */}
        <canvas
            ref={canvasRef}
            className="w-full h-full block"
        />
        
        {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6 z-10">
                <div className="text-red-400 font-mono text-sm border border-red-900 bg-red-950/50 p-4 rounded max-w-lg overflow-auto max-h-full">
                    <h3 className="font-bold mb-2">Runtime Error</h3>
                    <p>{error}</p>
                </div>
            </div>
        )}
        
        {!previewCode && !error && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-gray-700 font-mono text-sm">Waiting for preview code...</p>
            </div>
        )}
      </div>
      
      <div className="px-3 py-1 bg-gray-900 border-t border-gray-800 text-[10px] text-gray-500 font-mono flex justify-between">
          <span>{Math.max(0, time).toFixed(2)}s</span>
          <span>{containerRef.current ? `${Math.round(containerRef.current.clientWidth)}x${Math.round(containerRef.current.clientHeight)}` : '0x0'}</span>
      </div>
    </div>
  );
};