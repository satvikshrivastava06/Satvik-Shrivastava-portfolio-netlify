"use client";

import { useState, useEffect } from "react";

export const useImagePreloader = (imageArray: string[]) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [images, setImages] = useState<HTMLImageElement[]>([]);

  useEffect(() => {
    let loadedCount = 0;
    const loadedImages: HTMLImageElement[] = [];

    if (imageArray.length === 0) {
      setIsLoaded(true);
      return;
    }

    imageArray.forEach((src, index) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedCount++;
        loadedImages[index] = img;
        if (loadedCount === imageArray.length) {
          setImages(loadedImages);
          setIsLoaded(true);
        }
      };
      // Important to also handle errors so it doesn't hang forever
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === imageArray.length) {
          setImages(loadedImages);
          setIsLoaded(true);
        }
      };
    });
  }, [imageArray]);

  return { isLoaded, images };
};
