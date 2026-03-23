"use client";

import { useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";

export const Navbar = () => {
  const { scrollY } = useScroll();
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const backgroundColor = "transparent";

  const textColor = useTransform(scrollY, [0, 50], ["#000000", "#18181b"]);
  const buttonBg = useTransform(scrollY, [0, 50], ["#000000", "#18181b"]);
  const buttonText = useTransform(scrollY, [0, 50], ["#ffffff", "#ffffff"]);

  return (
    <>
      <motion.nav
        style={{
          backgroundColor,
        }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-16 py-4 md:py-6 transition-colors duration-300"
      >
        <div className="flex items-center">
          <motion.div style={{ color: textColor }}>
            <Link href="/" className="text-lg md:text-xl font-medium tracking-[0.2em] uppercase macbook-glow">
              SATVIK SHRIVASTAVA
            </Link>
          </motion.div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center space-x-8 xl:space-x-12">
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
          <motion.div style={{ color: textColor }} className="opacity-70 hover:opacity-100 transition-opacity truncate max-w-[200px] xl:max-w-none">
            <Link href="mailto:satvikshrivastava06@gmail.com" className="text-sm tracking-normal macbook-glow whitespace-nowrap">
              satvikshrivastava06@gmail.com
            </Link>
          </motion.div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative hidden md:block">
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

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 z-50 relative"
            aria-label="Toggle Menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <motion.span 
                animate={isMenuOpen ? { rotate: 45, y: 9 } : { rotate: 0, y: 0 }}
                className="w-full h-0.5 bg-black origin-left transition-transform"
              />
              <motion.span 
                animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                className="w-full h-0.5 bg-black transition-opacity"
              />
              <motion.span 
                animate={isMenuOpen ? { rotate: -45, y: -9 } : { rotate: 0, y: 0 }}
                className="w-full h-0.5 bg-black origin-left transition-transform"
              />
            </div>
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[45] bg-white/95 backdrop-blur-xl lg:hidden flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="flex flex-col space-y-8">
              <Link 
                href="#skills" 
                onClick={() => setIsMenuOpen(false)}
                className="text-3xl font-medium tracking-widest uppercase macbook-glow"
              >
                Skills
              </Link>
              <Link 
                href="https://www.linkedin.com/in/satvik-shrivastava-853462207/" 
                target="_blank"
                onClick={() => setIsMenuOpen(false)}
                className="text-3xl font-medium tracking-widest uppercase macbook-glow"
              >
                LinkedIn
              </Link>
              <Link 
                href="mailto:satvikshrivastava06@gmail.com" 
                onClick={() => setIsMenuOpen(false)}
                className="text-xl font-light tracking-wide macbook-glow"
              >
                satvikshrivastava06@gmail.com
              </Link>
              <button 
                onClick={() => {
                  setIsContactOpen(!isContactOpen);
                  // Optional: stay open to show numbers or close
                }}
                className="text-3xl font-medium tracking-widest uppercase bg-black text-white px-8 py-4"
              >
                Contact
              </button>
              
              {isContactOpen && (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="pt-4"
                 >
                   <span className="block text-xs uppercase tracking-[0.3em] text-black/40 font-bold mb-1">Phone Number</span>
                   <span className="text-2xl font-medium tracking-widest text-black macbook-glow">8305159065</span>
                 </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
