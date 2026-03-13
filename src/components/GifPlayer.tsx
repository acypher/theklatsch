
import { useRef, useEffect, useState, useCallback } from "react";
import { Play, Pause } from "lucide-react";

interface GifPlayerProps {
  src: string;
  alt: string;
  className?: string;
  playDuration?: number;
}

type GifState = "idle" | "playing" | "paused" | "forever";

const GifPlayer = ({ src, alt, className = "", playDuration = 20000 }: GifPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<number | null>(null);
  const [state, setState] = useState<GifState>("idle");

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const freezeFrame = useCallback(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }, []);

  // IntersectionObserver: 25% threshold
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setState((prev) => {
            if (prev === "idle") return "playing";
            return prev;
          });
        } else {
          // Scrolled out of view → reset
          clearTimer();
          setState("idle");
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [clearTimer]);

  // Handle state transitions
  useEffect(() => {
    if (state === "playing") {
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        freezeFrame();
        setState("paused");
      }, playDuration);
    }
    return () => {
      if (state === "playing") clearTimer();
    };
  }, [state, playDuration, clearTimer, freezeFrame]);

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (state === "paused") {
      setState("forever");
    } else if (state === "forever") {
      freezeFrame();
      setState("paused");
    }
  }, [state, freezeFrame]);

  const showCanvas = state === "paused";
  const showIcon = state === "paused" || state === "forever";

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`${className} ${showCanvas ? "invisible" : ""}`}
        loading="lazy"
      />
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full object-contain ${showCanvas ? "" : "hidden"}`}
      />
      {showIcon && (
        <button
          onClick={handleToggle}
          className="absolute bottom-2 right-2 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors cursor-pointer"
          aria-label={state === "paused" ? "Play animation" : "Pause animation"}
        >
          {state === "paused" ? <Play size={14} /> : <Pause size={14} />}
        </button>
      )}
    </div>
  );
};

export default GifPlayer;
