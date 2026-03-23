"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";

export const Navbar = () => {
  const { scrollY } = useScroll();
  const [isContactOpen, setIsContactOpen] = useState(false);

  const backgroundColor = "transparent";

  const textColor = useTransform(scrollY, [0, 50], ["#000000", "#18181b"]);
  const buttonBg = useTransform(scrollY, [0, 50], ["#000000", "#18181b"]);
  const buttonText = useTransform(scrollY, [0, 50], ["#ffffff", "#ffffff"]);

  return (
    <motion.nav
      style={{
        backgroundColor,
      }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16 py-6 transition-colors duration-300"
    >
      <div className="flex items-center">
        <motion.div style={{ color: textColor }}>
          <Link href="/" className="text-xl font-medium tracking-[0.2em] uppercase macbook-glow">
            SATVIK SHRIVASTAVA
          </Link>
        </motion.div>
      </div>

      <div className="hidden md:flex items-center space-x-12">
        <motion.div style={{ color: textColor }} className="opacity-70 hover:opacity-100 transition-opacity">
          <Link href="#skills" className="text-sm tracking-widest uppercase macbook-glow">
            Skills
          </Link>
        </motion.div>
        <motion.div style={{ color: textColor }} className="opacity-70 hover:opacity-100 transition-opacity">
          <Link href="https://www.linkedin.com/in/satvik-shrivastava-853462207/" target="_blank" className="text-sm tracking-widest uppercase macbook-glow">
            LinkedIn
          </Link>
        </motion.div>
        <motion.div style={{ color: textColor }} className="opacity-70 hover:opacity-100 transition-opacity">
          <Link href="mailto:satvikshrivastava06@gmail.com" className="text-sm tracking-normal macbook-glow">
            satvikshrivastava06@gmail.com
          </Link>
        </motion.div>
      </div>

      <div className="relative">
        <motion.button 
          style={{ backgroundColor: buttonBg, color: buttonText }}
          onClick={() => setIsContactOpen(!isContactOpen)}
          className="px-6 py-3 text-sm font-medium tracking-widest uppercase hover:opacity-90 transition-opacity"
        >
          Contact
        </motion.button>

        <AnimatePresence>
          {isContactOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-4 bg-white/90 backdrop-blur-md border border-black/10 px-6 py-4 rounded-2xl shadow-2xl min-w-[200px] z-50"
            >
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-widest text-black/40 font-bold">Phone Number</span>
                <span className="text-lg font-medium tracking-wider text-black macbook-glow">8305159065</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};
