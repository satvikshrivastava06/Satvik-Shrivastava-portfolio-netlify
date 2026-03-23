"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

interface PlaneMorphProps {
  s4Count: number;
}

export const PlaneMorph: React.FC<PlaneMorphProps> = ({ s4Count }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Generate Image Paths for seq4
  const allImagePaths = useMemo(() => {
    const paths: string[] = [];
    for (let i = 1; i <= s4Count; i++) {
       paths.push(`/seq4/ezgif-frame-${String(i).padStart(3, '0')}.png`);
    }
    return paths;
  }, [s4Count]);

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
        if (loadedCount === s4Count) {
          setImages(loadedImages);
          setIsLoaded(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === s4Count) {
          setImages(loadedImages);
          setIsLoaded(true);
        }
      };
    });
  }, [allImagePaths, s4Count]);

  // 3. Scroll Mapping Logic
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Map 0-0.45 scroll progress to 0-159 index.
  // We compress the canvas animation to the first 45% of the 500vh sticky range.
  const currentIndex = useTransform(scrollYProgress, [0, 0.45, 1], [0, s4Count - 1, s4Count - 1]);

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
        let drawWidth, drawHeight, offsetX, offsetY;

        // "Zoom out a little" -> Using contain logic
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
        canvasRef.current.width = window.innerWidth * window.devicePixelRatio;
        canvasRef.current.height = window.innerHeight * window.devicePixelRatio;
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Framer Motion cross-fades for the 3 PNG frames
  // The PNG morph sequence starts AS the canvas animation completes (progress > 0.6)
  // We use faster overlapping ranges (0.05 transition window) for a snappier feel
  // Each schematic is held for about 0.1 scroll progress
  const image1Opacity = useTransform(scrollYProgress, [0, 0.58, 0.63, 0.73, 0.78], [0, 0, 1, 1, 0]);
  const image2Opacity = useTransform(scrollYProgress, [0, 0.73, 0.78, 0.88, 0.93], [0, 0, 1, 1, 0]);
  const image3Opacity = useTransform(scrollYProgress, [0, 0.88, 0.93, 1], [0, 0, 1, 1]);

  // Canvas opacity: Fade out once aircraft is settled (0.6 to 0.65)
  // Aircraft plays until 0.6, then fades as Image 1 begins its fade-in at 0.58
  const canvasOpacity = useTransform(scrollYProgress, [0, 0.6, 0.65, 1], [1, 1, 0, 0]);

  return (
    <div ref={containerRef} className="relative h-[600vh] bg-transparent">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center text-stone-500 font-mono text-sm tracking-widest uppercase">
            <div className="flex flex-col items-center gap-4">
              <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
              Loading Schematics...
            </div>
          </div>
        )}
        
        <motion.canvas
          ref={canvasRef}
          style={{ opacity: isLoaded ? canvasOpacity : 0 }}
          className="absolute inset-0 h-full w-full object-contain pointer-events-none"
        />

        {/* Morph PNG Sequence Overlays - Only shown once loaded */}
        {isLoaded && (
          <>
            <motion.img
              src="/seq5/image 1.png"
              style={{ opacity: image1Opacity }}
              className="absolute inset-0 h-full w-full object-contain pointer-events-none"
            />
            <motion.img
              src="/seq5/image 2.png"
              style={{ opacity: image2Opacity }}
              className="absolute inset-0 h-full w-full object-contain pointer-events-none"
            />
            <motion.img
              src="/seq5/image 3.png"
              style={{ opacity: image3Opacity }}
              className="absolute inset-0 h-full w-full object-contain pointer-events-none"
            />
          </>
        )}
      </div>
    </div>
  );
};
