"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { useScroll, useTransform } from "framer-motion";

interface HeroCanvasProps {
  s1Count: number; // Number of images in /seq1/
  s2Count: number; // Number of images in /seq2/
  s3Count: number; // Number of images in /seq3/
}

export const HeroCanvas: React.FC<HeroCanvasProps> = ({ s1Count, s2Count, s3Count }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  const totalFrames = s1Count + s2Count + s3Count;

  // 1. Generate Image Paths
  const allImagePaths = useMemo(() => {
    const paths: string[] = [];
    for (let i = 1; i <= s1Count; i++) paths.push(`/seq1/ezgif-frame-${String(i).padStart(3, '0')}.png`);
    for (let i = 1; i <= s2Count; i++) paths.push(`/seq2/ezgif-frame-${String(i).padStart(3, '0')}.png`);
    for (let i = 1; i <= s3Count; i++) paths.push(`/seq3/ezgif-frame-${String(i).padStart(3, '0')}.png`);
    return paths;
  }, [s1Count, s2Count, s3Count]);

  // 2. Preload Images
  useEffect(() => {
    let loadedCount = 0;
    const loadedImages: HTMLImageElement[] = [];

    const updateProgress = () => {
      loadedCount++;
      setProgress(Math.floor((loadedCount / totalFrames) * 100));
      if (loadedCount === totalFrames) {
        setImages(loadedImages);
        setIsLoaded(true);
      }
    };

    allImagePaths.forEach((path, index) => {
      const img = new Image();
      // Set handlers BEFORE src to avoid race conditions with cache
      img.onload = () => {
        loadedImages[index] = img;
        updateProgress();
      };
      img.onerror = () => {
        console.error(`Failed to load image: ${path}`);
        updateProgress();
      };
      img.src = path;
    });
  }, [allImagePaths, totalFrames]);

  // 3. Scroll Mapping Logic
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Map 0-0.8 scroll progress to 0-totalFrames index
  // With 600vh container and 100vh sticky child, the sticky range is 500vh.
  // Animation finishes at 0.8 * 500vh = 400vh.
  // The final 100vh acts as the requested "distance" while remaining pinned.
  const currentIndex = useTransform(scrollYProgress, [0, 0.8, 1], [0, totalFrames - 1, totalFrames - 1]);

  // 4. Render Loop
  useEffect(() => {
    const render = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx || images.length === 0) return;

      const frameIndex = Math.floor(currentIndex.get());
      const img = images[frameIndex];

      if (img) {
        const canvasAspect = canvas.width / canvas.height;
        const imgAspect = img.width / img.height;
        let drawWidth, drawHeight;

        // "Zoom in a little" -> Scale up the contain logic by 1.2x
        const zoomFactor = 1.2;

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
      }
      requestAnimationFrame(render);
    };

    const animationFrame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrame);
  }, [images, currentIndex]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth * window.devicePixelRatio;
        canvasRef.current.height = window.innerHeight * window.devicePixelRatio;
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div ref={containerRef} className="relative h-[600vh] bg-transparent">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center text-stone-500 font-mono text-sm tracking-widest uppercase z-10">
            <div className="flex flex-col items-center gap-4">
              <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
              Preparing Portfolio...
              <div className="text-[10px] opacity-40 font-bold tabular-nums">
                {progress}%
              </div>
            </div>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-1000 z-0 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>
    </div>
  );
};

