"use client";

import { motion, useScroll, useTransform } from "framer-motion";

const specData = [
  { label: "Range", value: "9,260 KM", detail: "Ultra-long-range precision" },
  { label: "Speed", value: "480 KTS", detail: "Mach 0.85 High-Speed Cruise" },
  { label: "Capacity", value: "19 PAX", detail: "Bespoke Cabin Configurations" },
];

export const Specs = ({ containerRef }: { containerRef: React.RefObject<HTMLDivElement> }) => {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"],
  });

  // Fade in the cards towards the end of the Morph sequence
  const opacity = useTransform(scrollYProgress, [0.7, 0.8], [0, 1]);
  const yOffset = useTransform(scrollYProgress, [0.7, 0.9], [40, 0]);

  return (
    <motion.div
      style={{ opacity, y: yOffset }}
      className="absolute bottom-20 left-0 right-0 flex flex-col md:flex-row justify-center gap-6 px-8 z-20 pointer-events-none"
    >
      {specData.map((spec, i) => (
        <div
          key={i}
          className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 min-w-[280px] shadow-2xl"
        >
          <p className="text-white/50 text-xs tracking-[0.2em] uppercase mb-2">
            {spec.label}
          </p>
          <p className="text-white text-3xl font-light mb-1">{spec.value}</p>
          <p className="text-white/70 text-sm tracking-wide">{spec.detail}</p>
        </div>
      ))}
    </motion.div>
  );
};
