"use client";

import { useEffect, useState, RefObject } from "react";

/**
 * Returns a normalized 0-1 scroll progress based on an element's visibility in viewport.
 * Note: framer-motion's useScroll is generally preferred in this project,
 * but this is useful for lightweight vanilla react components.
 */
export const useScrollProgress = (ref: RefObject<HTMLElement>) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const elementTop = rect.top;
      const elementHeight = rect.height;
      const windowHeight = window.innerHeight;

      const totalScrollableDistance = elementHeight - windowHeight;
      const currentScrollDistance = -elementTop;

      const currentProgress = Math.max(
        0,
        Math.min(1, currentScrollDistance / totalScrollableDistance)
      );
      
      setProgress(currentProgress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [ref]);

  return progress;
};
