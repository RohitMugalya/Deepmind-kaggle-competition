import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, RefreshCw, AlertCircle } from 'lucide-react';

interface PreviewPlayerProps {
  previewCode: string;
}

export const PreviewPlayer: React.FC<PreviewPlayerProps> = ({ previewCode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [time, setTime] = useState(0);

  // Function to safely execute user code
  const renderFrame = (t: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    try {
      // Create a function from the string body
      // We pass ctx, width, height, t as arguments
      const userFunc = new Function('ctx', 'width', 'height', 't', previewCode);
      
      // Clear before drawing (user code should do this, but safe fallback)
      // We rely on user code to clear mostly, but a full clear here ensures no artifacts if user code is bad
      // However, some effects might want trails, so let's clear by default but maybe allow override?
      // For safety, clear every frame for this specific 'motion canvas' preview style.
      ctx.clearRect(0, 0, width, height);
      
      // Default styles
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      
      // Execute
      userFunc(ctx, width, height, t);
      setError(null);
    } catch (err: any) {
      console.error("Preview render error:", err);
      setError(err.message || "Runtime Error");
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      setIsPlaying(false);
    }
  };

  // Animation Loop
  const tick = (timestamp: number) => {
    // Convert to seconds
    const t = timestamp / 1000;
    setTime(t);
    renderFrame(t);
    
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(tick);
    }
  };

  useEffect(() => {
    // Handle resize
    const resize = () => {
      if (containerRef.current && canvasRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        // Set actual resolution to match display size for sharpness
        const dpr = window.devicePixelRatio || 1;
        canvasRef.current.width = clientWidth * dpr;
        canvasRef.current.height = clientHeight * dpr;
        
        // Scale context to match dpr
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) ctx.scale(dpr, dpr);

        // We effectively work with CSS pixels in the drawing code now
        // But wait, if we scale the ctx, the 'width' and 'height' passed to user func should be logical pixels
      }
    };
    
    window.addEventListener('resize', resize);
    resize();

    return () => window.removeEventListener('resize', resize);
  }, []);

  // Effect to start/stop animation when code or playing state changes
  useEffect(() => {
    if (isPlaying && !error) {
        // Start loop
        animationRef.current = requestAnimationFrame(tick);
    } else {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
    }

    return () => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, previewCode, error]);


  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setError(null);
    setIsPlaying(true);
    // Restart animation loop logic implies just resuming, 
    // but the 't' comes from performance.now usually in requestAnimationFrame.
    // To strictly 'reset' time to 0, we'd need an offset logic, 
    // but for simple previews, continuous time is often fine. 
    // If we want t=0, we can re-mount or subtract start time.
    // For now, simple resume.
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 rounded-lg border border-gray-800 overflow-hidden">
        {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-2">
            <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Live Preview (Canvas API)</span>
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
            title="Reset/Retry"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div ref={containerRef} className="flex-1 relative bg-gray-950 flex items-center justify-center overflow-hidden">
        {/* Grid Background for context */}
        <div 
            className="absolute inset-0 opacity-10 pointer-events-none" 
            style={{
                backgroundImage: `linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
            }} 
        />
        
        <canvas
            ref={canvasRef}
            className="w-full h-full block"
            style={{ width: '100%', height: '100%' }}
        />
        
        {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6">
                <div className="text-red-400 font-mono text-sm border border-red-900 bg-red-950/50 p-4 rounded max-w-lg">
                    <h3 className="font-bold mb-2">Runtime Error</h3>
                    <p>{error}</p>
                </div>
            </div>
        )}
      </div>
      
      <div className="px-3 py-1 bg-gray-900 border-t border-gray-800 text-[10px] text-gray-500 font-mono flex justify-between">
          <span>{Math.round(time * 100) / 100}s</span>
          <span>{containerRef.current ? `${containerRef.current.clientWidth}x${containerRef.current.clientHeight}` : '0x0'}</span>
      </div>
    </div>
  );
};