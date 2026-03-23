"use client";
import React, { useState } from "react";

import { Navbar } from "@/components/Navbar";
import { GlobeFooter } from "@/components/GlobeFooter";
import dynamic from "next/dynamic";

const HeroCanvas = dynamic(() => import("@/components/HeroCanvas").then(mod => mod.HeroCanvas), { ssr: false });
const PlaneMorph = dynamic(() => import("@/components/PlaneMorph").then(mod => mod.PlaneMorph), { ssr: false });
const LaptopCanvas = dynamic(() => import("@/components/LaptopCanvas").then(mod => mod.LaptopCanvas), { ssr: false });
const KeyboardCanvas = dynamic(() => import("@/components/KeyboardCanvas").then(mod => mod.KeyboardCanvas), { ssr: false });

export default function Home() {
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);

  return (
    <>
      <main className="bg-[#FDFCF5] min-h-screen text-[#18181b] selection:bg-black/10 selection:text-black relative">
        {/* Global Live Moving Clouds Background Layer */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div 
            className="absolute inset-0 w-[400%] md:w-[200%] h-full bg-repeat-x animate-pan-clouds opacity-40"
            style={{ 
              backgroundImage: "url('/clouds.png')",
              backgroundSize: "contain",
            }}
          />
        </div>

        <style jsx global>{`
          @keyframes pan-clouds {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-pan-clouds {
            animation: pan-clouds 120s linear infinite;
          }
        `}</style>
        
        <Navbar />
        
        <div className="relative z-10 w-full">
          <HeroCanvas s1Count={240} s2Count={240} s3Count={240} isSoundEnabled={isSoundEnabled} />
          <div className="h-[60vh] w-full bg-transparent pointer-events-none" />
          <PlaneMorph s4Count={160} isSoundEnabled={isSoundEnabled} />
          <div className="h-[60vh] w-full bg-transparent pointer-events-none" />
          <LaptopCanvas frameCount={125} isSoundEnabled={isSoundEnabled} />
          <KeyboardCanvas frameCount={189} isSoundEnabled={isSoundEnabled} />
          <GlobeFooter />
        </div>
      </main>

      {/* Absolute Top Layer Toggle - Moved Outside Main for Stacking Safety */}
      <div className="fixed bottom-10 right-10 z-[9999] flex flex-col items-end gap-3 group">
        <div className="flex items-center gap-3">
          {!isSoundEnabled && (
            <div className="px-4 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-lg shadow-2xl animate-pulse">
              Experience with Sound
            </div>
          )}
          <span className="text-[10px] text-black/20 font-mono font-bold tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">V1.1</span>
        </div>
        <button 
          onClick={() => setIsSoundEnabled(!isSoundEnabled)}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_25px_60px_rgba(0,0,0,0.4)] border-2 ${
            isSoundEnabled 
            ? 'bg-black text-white border-white/20' 
            : 'bg-white text-black border-black/30'
          } hover:scale-110 active:scale-95`}
          aria-label={isSoundEnabled ? "Mute Sound" : "Enable Sound"}
        >
          {isSoundEnabled ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
          )}
        </button>
      </div>
    </>
  );
}
