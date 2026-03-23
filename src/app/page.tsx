"use client";

import { Navbar } from "@/components/Navbar";
import { GlobeFooter } from "@/components/GlobeFooter";
import dynamic from "next/dynamic";

const HeroCanvas = dynamic(() => import("@/components/HeroCanvas").then(mod => mod.HeroCanvas), { ssr: false });
const PlaneMorph = dynamic(() => import("@/components/PlaneMorph").then(mod => mod.PlaneMorph), { ssr: false });
const LaptopCanvas = dynamic(() => import("@/components/LaptopCanvas").then(mod => mod.LaptopCanvas), { ssr: false });
const KeyboardCanvas = dynamic(() => import("@/components/KeyboardCanvas").then(mod => mod.KeyboardCanvas), { ssr: false });

export default function Home() {
  return (
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
      
      {/* Foreground Content - No wrapper to ensure sticky works perfectly */}
      <Navbar />
      <div className="relative z-10 w-full">
        <HeroCanvas s1Count={240} s2Count={240} s3Count={240} />
        {/* Cinematic distance showing only the live clouds */}
        <div className="h-[250vh] w-full bg-transparent pointer-events-none" />
        <PlaneMorph s4Count={160} />
        {/* Cinematic distance showing only the live clouds */}
        <div className="h-[150vh] w-full bg-transparent pointer-events-none" />
        <LaptopCanvas frameCount={125} />
        <KeyboardCanvas frameCount={189} />
        <GlobeFooter />
      </div>
    </main>
  );
}
