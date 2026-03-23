"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { useScroll, useTransform, motion, useSpring } from "framer-motion";

interface KeyboardCanvasProps {
  frameCount: number;
}

export const KeyboardCanvas: React.FC<KeyboardCanvasProps> = ({ frameCount }) => {
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

  // 3. Scroll Mapping Logic
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 25,
    restDelta: 0.001
  });

  const frameIndex = useTransform(smoothProgress, (latest: number) =>
    Math.min(
      frameCount - 1,
      Math.floor(latest * (frameCount + 1)) // Add small buffer to reach last frame faster
    )
  );

  // 4. Render Loop
  useEffect(() => {
    const render = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx || images.length === 0) return;

      // Highest Quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const currentFrame = Math.floor(frameIndex.get());
      const img = images[currentFrame];

      if (img) {
        const canvasAspect = canvas.width / canvas.height;
        const imgAspect = img.width / img.height;
        let drawWidth, drawHeight;

        // "Zoom-out" -> Using contain logic (100% proportion)
        const scaleFactor = 1.15; // Zoom-in a little (reduced slightly)
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
      }
      requestAnimationFrame(render);
    };

    const animationFrame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrame);
  }, [images, frameIndex]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        // High DPI scaling (Sharper resolution, capped for performance)
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
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
      </div>
    </div>
  );
};
