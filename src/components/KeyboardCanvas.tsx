"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

interface KeyboardCanvasProps {
  frameCount: number;
  isSoundEnabled: boolean;
}

export const KeyboardCanvas: React.FC<KeyboardCanvasProps> = ({ frameCount, isSoundEnabled }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Generate Image Paths
  const allImagePaths = useMemo(() => {
    const paths: string[] = [];
    for (let i = 1; i <= frameCount; i++) {
       paths.push(`/Keyboard%20opening/ezgif-frame-${String(i).padStart(3, '0')}.png`);
    }
    return paths;
  }, [frameCount]);

  // 2. Preload Images
  useEffect(() => {
    let loadedCount = 0;
    const loadedImages: HTMLImageElement[] = [];

    allImagePaths.forEach((path, index) => {
      const img = new Image();
      img.src = path;
      img.onload = () => {
        loadedCount++;
        loadedImages[index] = img;
        if (loadedCount === frameCount) {
          setImages(loadedImages);
          setIsLoaded(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === frameCount) {
          setImages(loadedImages);
          setIsLoaded(true);
        }
      };
    });
  }, [allImagePaths, frameCount]);

  const audioRef = useRef<HTMLAudioElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Initialize Web Audio API for volume boosting
  useEffect(() => {
    if (!isSoundEnabled) return;

    if (!audioCtxRef.current && audioRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaElementSource(audioRef.current);
      const gain = ctx.createGain();
      gain.gain.value = 1.7; 
      source.connect(gain);
      gain.connect(ctx.destination);
      gainNodeRef.current = gain;
      
      // Pre-warm to combat starting delay
      audioRef.current.play().then(() => audioRef.current?.pause()).catch(() => {});
    }

    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, [isSoundEnabled]);

  // 3. Scroll Mapping Logic
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const scrollTimeout = useRef<NodeJS.Timeout>();

  const frameIndex = useTransform(scrollYProgress, (latest: number) =>
    Math.min(
      frameCount - 1,
      Math.floor(latest * (frameCount + 1)) 
    )
  );

  // Audio Sync Effect -> Mapped absolutely to extracted Frames Per Second (FPS)
  const AUDIO_FPS = 30;

  useEffect(() => {
    const syncAudio = () => {
      const audio = audioRef.current;
      const ctx = audioCtxRef.current;
      const gain = gainNodeRef.current;
      if (!audio || !ctx || !gain) return;
      
      // We use the raw scrollYProgress to determine bounds
      const progress = scrollYProgress.get();
      const inBounds = isSoundEnabled && progress > 0 && progress < 1;

      // Handle Gain/Volume transitions smoothly (Raw-Sync style)
      const targetValue = inBounds ? 1.7 : 0;
      gain.gain.setTargetAtTime(targetValue, ctx.currentTime, 0.015);

      if (!inBounds) {
        clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => {
          if (scrollYProgress.get() <= 0 || scrollYProgress.get() >= 1) {
             audio.pause();
          }
        }, 100);
        return;
      }

      // Sync strictly by frame index
      const idx = frameIndex.get();
      const targetTime = idx / AUDIO_FPS;

      // Unmute and ensure playing
      if (audio.muted) audio.muted = false;
      if (audio.paused) audio.play().catch(() => {});

      // Only seek if scroll drifted from natural playback, preventing stuttering and sync issues
      if (Math.abs(audio.currentTime - targetTime) > 0.1) {
        audio.currentTime = targetTime;
      }
      
      clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        gain.gain.setTargetAtTime(0, ctx.currentTime, 0.015);
      }, 150);
    };

    const unsubscribe = frameIndex.on("change", syncAudio);
    return () => {
      unsubscribe();
      clearTimeout(scrollTimeout.current);
    };
  }, [frameIndex, scrollYProgress, isSoundEnabled]);

  // 4. Render Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastDrawnIndex = -1;

    const render = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx || images.length === 0) return;

      const currentFrame = Math.floor(frameIndex.get());
      
      if (currentFrame !== lastDrawnIndex) {
        // Highest Quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        const img = images[currentFrame];

        if (img) {
          const canvasAspect = canvas.width / canvas.height;
          const imgAspect = img.width / img.height;
          let drawWidth, drawHeight;

          // "Zoom-out" -> Using contain logic (100% proportion)
          const scaleFactor = 1.0; // Zoomed out slightly 
          if (canvasAspect > imgAspect) {
            drawHeight = canvas.height * scaleFactor;
            drawWidth = canvas.height * imgAspect * scaleFactor;
          } else {
            drawWidth = canvas.width * scaleFactor;
            drawHeight = canvas.width / imgAspect * scaleFactor;
          }
          const offsetX = (canvas.width - drawWidth) / 2;
          const offsetY = (canvas.height - drawHeight) / 2;

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
          lastDrawnIndex = currentFrame;
        }
      }
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [images, frameIndex]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        // High DPI scaling (Sharper resolution, upscaled)
        const dpr = Math.max(window.devicePixelRatio || 1, 2);
        canvasRef.current.width = window.innerWidth * dpr;
        canvasRef.current.height = window.innerHeight * dpr;
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div ref={containerRef} className="relative h-[400vh] bg-transparent">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center pointer-events-none">
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center text-stone-500 font-mono text-sm tracking-widest uppercase pointer-events-none">
            <div className="flex flex-col items-center gap-4">
              <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
              Loading Tactile Matrix...
            </div>
          </div>
        )}
        
        <motion.canvas
          ref={canvasRef}
          style={{ 
            opacity: isLoaded ? 1 : 0,
            width: '100vw',
            height: '100vh',
            willChange: 'transform, opacity'
          }}
          className="absolute inset-0 z-0 pointer-events-none"
        />

        {/* Hidden Audio Source */}
        <audio ref={audioRef} src="/Keyboard opening/video.mp4" preload="auto" muted loop />
      </div>
    </div>
  );
};
