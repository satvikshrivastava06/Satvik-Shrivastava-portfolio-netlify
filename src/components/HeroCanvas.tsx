"use client";

import React, { useEffect, useRef, useState } from "react";
import { useScroll, useTransform } from "framer-motion";

interface HeroCanvasProps {
  s1Count: number; // Number of images in /seq1/
  s2Count: number; // Number of images in /seq2/
  s3Count: number; // Number of images in /seq3/
  isSoundEnabled: boolean;
}

export const HeroCanvas: React.FC<HeroCanvasProps> = ({ s1Count, s2Count, s3Count, isSoundEnabled }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);


  // 2. Progressive Preload: unlock after s1, then load s2+s3 in background
  useEffect(() => {
    const allLoaded: HTMLImageElement[] = [];
    let s1Loaded = 0;

    const loadImage = (path: string, index: number, onDone?: () => void) => {
      const img = new Image();
      img.onload = () => {
        allLoaded[index] = img;
        setImages([...allLoaded]);
        if (onDone) onDone();
      };
      img.onerror = () => {
        if (onDone) onDone();
      };
      img.src = path;
    };

    // Phase 1: load s1 images first → unlock the site as soon as they're ready
    const s1Paths: string[] = [];
    for (let i = 1; i <= s1Count; i++)
      s1Paths.push(`/seq1/ezgif-frame-${String(i).padStart(3, '0')}.png`);

    s1Paths.forEach((path, i) => {
      loadImage(path, i, () => {
        s1Loaded++;
        setProgress(Math.floor((s1Loaded / s1Count) * 60)); // 0-60% for s1
        if (s1Loaded === s1Count) {
          setIsLoaded(true); // ← Unlock the page now!

          // Phase 2: silently load s2 + s3 in the background
          let bgLoaded = 0;
          const bgTotal = s2Count + s3Count;
          const loadBg = (path: string, index: number) => {
            loadImage(path, index, () => {
              bgLoaded++;
              setProgress(60 + Math.floor((bgLoaded / bgTotal) * 40)); // 60-100%
            });
          };
          for (let j = 1; j <= s2Count; j++)
            loadBg(`/seq2/ezgif-frame-${String(j).padStart(3, '0')}.png`, s1Count + j - 1);
          for (let j = 1; j <= s3Count; j++)
            loadBg(`/seq3/ezgif-frame-${String(j).padStart(3, '0')}.png`, s1Count + s2Count + j - 1);
        }
      });
    });
  }, [s1Count, s2Count, s3Count]);


  const audio1Ref = useRef<HTMLAudioElement>(null);
  const audio2Ref = useRef<HTMLAudioElement>(null);
  const audio3Ref = useRef<HTMLAudioElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodesRef = useRef<{ [key: string]: GainNode }>({});

  // Initialize Web Audio API for volume boosting
  useEffect(() => {
    if (!isSoundEnabled) return;

    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const setupGain = (audio: HTMLAudioElement, id: string) => {
        const source = ctx.createMediaElementSource(audio);
        const gain = ctx.createGain();
        // Boost volume (1.0 is default, 1.7 is 170%)
        gain.gain.value = 1.7; 
        source.connect(gain);
        gain.connect(ctx.destination);
        gainNodesRef.current[id] = gain;
      };

      if (audio1Ref.current) {
        setupGain(audio1Ref.current, 'a1');
        // Pre-warm to combat starting delay
        audio1Ref.current.play().then(() => audio1Ref.current?.pause()).catch(() => {});
      }
      if (audio2Ref.current) {
        setupGain(audio2Ref.current, 'a2');
        audio2Ref.current.play().then(() => audio2Ref.current?.pause()).catch(() => {});
      }
      if (audio3Ref.current) {
        setupGain(audio3Ref.current, 'a3');
        audio3Ref.current.play().then(() => audio3Ref.current?.pause()).catch(() => {});
      }
    }

    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, [isSoundEnabled]);

  // 3. Scroll Mapping Logic
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Custom segments mapping for faster s2/s3 transitions
  // s1 (0-144) maps 0 to 0.4
  // s2 (144-288) maps 0.4 to 0.55 (Very Fast - seamless)
  // s3 (288-432) maps 0.55 to 0.75 (Fast)
  const currentIndex = useTransform(
    scrollYProgress, 
    [0, 0.4, 0.55, 0.75, 0.8, 1], 
    [0, s1Count, s1Count + s2Count, s1Count + s2Count + s3Count - 1, s1Count + s2Count + s3Count - 1, s1Count + s2Count + s3Count - 1]
  );
  
  const scrollTimeout = useRef<NodeJS.Timeout>();

  // Audio Sync Effect -> Mapped absolutely to extracted Frames Per Second (FPS)
  const AUDIO_FPS = 30;

  useEffect(() => {
    const syncAudio = () => {
      // Use raw currentIndex for zero-lag seeking
      const idx = Math.floor(currentIndex.get());
      const a1 = audio1Ref.current;
      const a2 = audio2Ref.current;
      const a3 = audio3Ref.current;
      const ctx = audioCtxRef.current;

      if (!a1 || !a2 || !a3 || !ctx) return;

      const progress = scrollYProgress.get();
      const inBounds = isSoundEnabled && progress > 0 && progress <= 0.8;

      const updateGain = (id: string, active: boolean) => {
        const gain = gainNodesRef.current[id];
        if (!gain) return;
        const targetValue = active && inBounds ? 1.7 : 0;
        gain.gain.setTargetAtTime(targetValue, ctx.currentTime, 0.015); // Faster ramp
      };

      if (!inBounds) {
        updateGain('a1', false); updateGain('a2', false); updateGain('a3', false);
        return;
      }

      let activeAudio: HTMLAudioElement;
      let targetTime: number;
      let activeId: string;

      if (idx < s1Count) {
        activeAudio = a1; activeId = 'a1';
        targetTime = idx / AUDIO_FPS;
        updateGain('a2', false); updateGain('a3', false);
      } else if (idx < s1Count + s2Count) {
        activeAudio = a2; activeId = 'a2';
        targetTime = (idx - s1Count) / AUDIO_FPS;
        updateGain('a1', false); updateGain('a3', false);
      } else {
        activeAudio = a3; activeId = 'a3';
        targetTime = (idx - (s1Count + s2Count)) / AUDIO_FPS;
        updateGain('a1', false); updateGain('a2', false);
      }

      updateGain(activeId, true);

      if (activeAudio.muted) activeAudio.muted = false;
      if (activeAudio.paused) activeAudio.play().catch(() => {});

      // Only seek if scroll drifted from natural playback, preventing stuttering and sync issues
      if (Math.abs(activeAudio.currentTime - targetTime) > 0.1) {
        activeAudio.currentTime = targetTime;
      }

      clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        updateGain(activeId, false);
      }, 150);
    };

    const unsubscribe = currentIndex.on("change", syncAudio);
    return () => {
      unsubscribe();
      clearTimeout(scrollTimeout.current);
    };
  }, [currentIndex, scrollYProgress, isSoundEnabled, s1Count, s2Count]);

  // 4. Render Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastDrawnIndex = -1;

    const render = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx || images.length === 0) return;

      const frameIndex = Math.floor(currentIndex.get());
      
      if (frameIndex !== lastDrawnIndex) {
        const img = images[frameIndex];

        if (img) {
          const canvasAspect = canvas.width / canvas.height;
          const imgAspect = img.width / img.height;
          let drawWidth, drawHeight;

          // Zoom out slightly from previous 1.2x, while maintaining some coverage
          const zoomFactor = 1.05;

          if (canvasAspect > imgAspect) {
            drawHeight = canvas.height * zoomFactor;
            drawWidth = drawHeight * imgAspect;
          } else {
            drawWidth = canvas.width * zoomFactor;
            drawHeight = drawWidth / imgAspect;
          }
          
          const offsetX = (canvas.width - drawWidth) / 2;
          const offsetY = (canvas.height - drawHeight) / 2;

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
          
          lastDrawnIndex = frameIndex;
        }
      }
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [images, currentIndex]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        // Upscale canvas resolution for better quality
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
    <div ref={containerRef} className="relative h-[450vh] bg-transparent">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center text-stone-500 font-mono text-sm tracking-widest uppercase z-10">
            <div className="flex flex-col items-center gap-4">
              <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
              PREPARING PORTFOLIO...
              <div className="text-[10px] opacity-40 font-bold tabular-nums">
                {progress}%
              </div>
            </div>
          </div>
        )}
        <canvas
          ref={canvasRef}
          style={{ willChange: 'transform, opacity' }}
          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-1000 z-0 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        
        {/* Hidden Audio Sources */}
        <audio ref={audio1Ref} src="/seq1/video.mp4" preload="auto" muted loop />
        <audio ref={audio2Ref} src="/seq2/video.mp4" preload="auto" muted loop />
        <audio ref={audio3Ref} src="/seq3/video.mp4" preload="auto" muted loop />
      </div>
    </div>
  );
};
