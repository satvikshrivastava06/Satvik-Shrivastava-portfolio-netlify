"use client";

import React from "react";

export const GlobeFooter = () => {
  return (
    <footer className="relative min-h-[100vh] bg-[#050505] flex flex-col justify-center items-center overflow-hidden py-32 px-6 md:px-12">
      {/* Premium CSS Globe Animation Background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
        <div className="w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,0.1)_0%,_rgba(0,0,0,1)_70%)] blur-md animate-[spin_60s_linear_infinite]" style={{ boxShadow: "inset -40px -40px 100px rgba(0,0,0,0.9)" }} />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center">
        {/* Apple Intelligence Style Glowing Heading */}
        <div className="text-center mb-24 md:mb-32">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-white relative inline-block">
            Technical skills
            
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
              Technical skills
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
              Technical skills
            </span>
          </h2>
        </div>

        {/* Skills Grid */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 text-left">
          
          {/* Column 1: Web Development */}
          <div className="space-y-12">
            <div>
              <h3 className="text-3xl font-medium tracking-tight text-white/90 mb-10 pb-4 border-b border-white/10 uppercase">
                Web Development
              </h3>
              
              <div className="space-y-10">
                <div>
                  <h4 className="text-sm font-semibold tracking-[0.2em] text-[#00E4FF] uppercase mb-3">Frontend</h4>
                  <p className="text-xl md:text-2xl text-white/70 font-light leading-relaxed">Tailwind CSS, HTML+CSS, React, Next.js</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold tracking-[0.2em] text-[#8A2BE2] uppercase mb-3">Backend and Database</h4>
                  <p className="text-xl md:text-2xl text-white/70 font-light leading-relaxed">MongoDB, DuckDB, Node.js, JavaScript</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold tracking-[0.2em] text-[#FF007F] uppercase mb-3">Framework</h4>
                  <p className="text-xl md:text-2xl text-white/70 font-light leading-relaxed">Express.js</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold tracking-[0.2em] text-[#FF8C00] uppercase mb-3">API</h4>
                  <p className="text-xl md:text-2xl text-white/70 font-light leading-relaxed">REST APIs, Postman API</p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Languages & DSA */}
          <div className="space-y-12 lg:pt-0">
            <div>
              <h3 className="text-3xl font-medium tracking-tight text-white/90 mb-10 pb-4 border-b border-white/10 uppercase">
                Core Foundation
              </h3>
              
              <div className="space-y-10">
                <div>
                  <h4 className="text-sm font-semibold tracking-[0.2em] text-[#00E4FF] uppercase mb-3">Programming Languages</h4>
                  <p className="text-xl md:text-2xl text-white/70 font-light leading-relaxed">C/C++, Python</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold tracking-[0.2em] text-[#FF007F] uppercase mb-3">DSA</h4>
                  <p className="text-xl md:text-2xl text-white/70 font-light leading-relaxed">Solid foundation in Data Structures and Algorithms</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};
