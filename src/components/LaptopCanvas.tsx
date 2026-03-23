"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

interface LaptopCanvasProps {
  frameCount: number;
}

export const LaptopCanvas: React.FC<LaptopCanvasProps> = ({ frameCount }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Generate Image Paths
  const allImagePaths = useMemo(() => {
    const paths: string[] = [];
    for (let i = 1; i <= frameCount; i++) {
       paths.push(`/laptop%20opening/ezgif-frame-${String(i).padStart(3, '0')}.png`);
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
  // We use the full container minus sticky window (500vh scroll distance for a 600vh container)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Map 0-0.8 scroll progress to 0-124 index.
  // We compress the canvas animation to the first 80% of the 500vh sticky range.
  // This allows the final frame to hold for the remaining 20% before unpinning.
  const currentIndex = useTransform(scrollYProgress, [0, 0.8, 1], [0, frameCount - 1, frameCount - 1]);

  // 4. Render Loop
  useEffect(() => {
    const render = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx || images.length === 0) return;

      // Enhance sharpness
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const frameIndex = Math.floor(currentIndex.get());
      const img = images[frameIndex];

      if (img) {
        const canvasAspect = canvas.width / canvas.height;
        const imgAspect = img.width / img.height;
        let drawWidth, drawHeight, offsetX, offsetY;

        // "Maintain image proportions to 100%" -> Using contain logic
        if (canvasAspect > imgAspect) {
          drawHeight = canvas.height;
          drawWidth = canvas.height * imgAspect;
          offsetX = (canvas.width - drawWidth) / 2;
          offsetY = 0;
        } else {
          drawWidth = canvas.width;
          drawHeight = canvas.width / imgAspect;
          offsetX = 0;
          offsetY = (canvas.height - drawHeight) / 2;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      }
      requestAnimationFrame(render);
    };

    const animationFrame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrame);
  }, [images, currentIndex]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        // High DPI scaling (Sharper resolution)
        const dpr = window.devicePixelRatio || 1;
        canvasRef.current.width = window.innerWidth * dpr;
        canvasRef.current.height = window.innerHeight * dpr;
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div ref={containerRef} className="relative h-[600vh] bg-transparent">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center pointer-events-none">
        
        {/* Apple Intelligence Style Glowing Text */}
        <div className={`absolute top-[20%] md:top-[25%] w-full text-center z-10 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-semibold tracking-tight text-white relative inline-block">
            Strong coding skills.
            
            {/* The Blur Glow */}
            <span 
              className="absolute inset-0 select-none blur-[16px] md:blur-[24px]"
              style={{
                backgroundImage: 'linear-gradient(90deg, #00E4FF 0%, #8A2BE2 35%, #FF007F 65%, #FF8C00 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent'
              }}
              aria-hidden="true"
            >
              Strong coding skills.
            </span>
            {/* Intense inner glow for core brightness */}
            <span 
              className="absolute inset-0 select-none blur-[8px] opacity-80"
              style={{
                backgroundImage: 'linear-gradient(90deg, #00E4FF 0%, #8A2BE2 35%, #FF007F 65%, #FF8C00 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent'
              }}
              aria-hidden="true"
            >
              Strong coding skills.
            </span>
          </h2>
        </div>

        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center text-stone-500 font-mono text-sm tracking-widest uppercase pointer-events-none">
            <div className="flex flex-col items-center gap-4">
              <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
              Loading Computing Array...
            </div>
          </div>
        )}
        
        <motion.canvas
          ref={canvasRef}
          style={{ 
            opacity: isLoaded ? 1 : 0,
            width: '100vw',
            height: '100vh'
          }}
          className="absolute inset-0 z-0 pointer-events-none"
        />
      </div>
    </div>
  );
};
