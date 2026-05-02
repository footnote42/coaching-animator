"use client";

import React, { useState, useEffect } from 'react';

// ============================================================================
// VARIATION 1: The Backline Move
// ============================================================================
const Variation1 = () => (
  <svg
    aria-hidden="true"
    focusable="false"
    viewBox="0 0 800 500"
    className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
  >
    <defs>
      <marker
        id="arrowhead"
        markerWidth="10"
        markerHeight="7"
        refX="9"
        refY="3.5"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path
          d="M 0 0 L 10 3.5 L 0 7 z"
          fill="#D97706"
          fillOpacity="0.55"
          stroke="none"
        />
      </marker>
    </defs>

    {/* Pitch Context (Structural Elements) */}
    <g id="pitch-lines" stroke="#f5f0e8" strokeOpacity="0.18" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
      {/* Touchline */}
      <path d="M 50,-50 C 70,100 60,300 80,600" />
      {/* 22m Line bleeding off bottom right */}
      <path d="M 650,450 C 700,460 750,470 850,460" />
    </g>

    {/* Attackers (O) */}
    <g id="attack-markers" stroke="#D97706" strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="150" cy="180" rx="15" ry="16" transform="rotate(-10 150 180)" />
      <ellipse cx="250" cy="220" rx="16" ry="15" />
      <ellipse cx="380" cy="260" rx="15" ry="17" transform="rotate(5 380 260)" />
      <ellipse cx="510" cy="300" rx="17" ry="15" transform="rotate(-5 510 300)" />
      <ellipse cx="680" cy="380" rx="16" ry="16" />
      <ellipse cx="450" cy="150" rx="15" ry="15" />
    </g>

    {/* Defenders (X) */}
    <g id="defense-markers" stroke="#D97706" strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 230,120 L 250,140 M 250,120 L 230,140" />
      <path d="M 360,160 L 380,180 M 380,160 L 360,180" />
      <path d="M 490,200 L 510,220 M 510,200 L 490,220" />
      <path d="M 620,260 L 640,280 M 640,260 L 620,280" />
      <path d="M 720,310 L 740,330 M 740,310 L 720,330" />
    </g>

    {/* Passing Lines (Dashed) */}
    <g id="passing-lines" stroke="#D97706" strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="8 8">
      <path d="M 165,185 C 185,195 210,205 235,215" />
      <path d="M 266,225 C 295,235 325,245 364,255" />
      <path d="M 396,265 C 430,275 460,285 494,295" />
      <path d="M 527,305 C 570,320 610,340 664,370" />
    </g>

    {/* Running Lines (Solid with Arrows) */}
    <g id="running-lines" stroke="#D97706" strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" markerEnd="url(#arrowhead)">
      <path d="M 450,165 C 420,200 440,230 470,260 C 500,290 530,310 560,320" />
      <path d="M 255,235 C 270,245 280,250 290,260" />
      <path d="M 385,277 C 400,295 410,310 415,325" />
      <path d="M 690,395 C 710,405 730,410 750,420" />
    </g>
  </svg>
);


// ============================================================================
// VARIATION 2: Placeholder (Paste second generated SVG here)
// ============================================================================
const Variation2 = () => (
  <svg
    aria-hidden="true"
    focusable="false"
    viewBox="0 0 800 500"
    className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
  >
    <defs>
      <marker
        id="arrowhead-small"
        markerWidth="10"
        markerHeight="7"
        refX="9"
        refY="3.5"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path
          d="M 0 0 L 10 3.5 L 0 7 z"
          fill="#D97706"
          fillOpacity="0.55"
          stroke="none"
        />
      </marker>
    </defs>

    {/* Pitch Context (Structural Elements) */}
    <g id="pitch-lines" stroke="#f5f0e8" strokeOpacity="0.18" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
      {/* Try Line (very faded but strong) */}
      <path d="M -50,400 C 200,390 500,410 850,400" strokeWidth="8" strokeOpacity="0.22" />
      {/* 22m Line fragment bleeding */}
      <path d="M 50,20 C 60,100 80,180 70,300" />
      <path d="M -20,150 C 100,160 200,150 300,160" />
    </g>

    {/* Attackers (O) - Tightly Clustered Pods */}
    <g id="attack-markers" stroke="#D97706" strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
      {/* Scrum-Half controlling at base */}
      <ellipse cx="120" cy="180" rx="14" ry="15" />
      
      {/* Pod 1 (Hitting) */}
      <ellipse cx="180" cy="240" rx="16" ry="16" transform="rotate(15 180 240)" />
      <ellipse cx="200" cy="270" rx="15" ry="15" />
      <ellipse cx="225" cy="245" rx="16" ry="17" />

      {/* Pod 2 (Setting up) */}
      <ellipse cx="150" cy="320" rx="15" ry="15" transform="rotate(-10 150 320)" />
      <ellipse cx="185" cy="340" rx="17" ry="15" />
      <ellipse cx="210" cy="315" rx="15" ry="16" />
      
      {/* Support Player */}
      <ellipse cx="300" cy="290" rx="16" ry="16" />
    </g>

    {/* Defenders (X) - Congested defensive wall */}
    <g id="defense-markers" stroke="#D97706" strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
      {/* Dense line opposite pods */}
      <path d="M 170,120 L 190,140 M 190,120 L 170,140" />
      <path d="M 210,140 L 230,160 M 230,140 L 210,160" />
      <path d="M 250,130 L 270,150 M 270,130 L 250,150" />
      <path d="M 290,160 L 310,180 M 310,160 L 290,180" />
      <path d="M 340,180 L 360,200 M 360,180 L 340,200" />
      <path d="M 390,200 L 410,220 M 410,200 L 390,220" />
      {/* Secondary defensive layer */}
      <path d="M 240,80 L 260,100 M 260,80 L 240,100" />
      <path d="M 330,110 L 350,130 M 350,110 L 330,130" />
    </g>

    {/* Passing Lines (Dashed) */}
    <g id="passing-lines" stroke="#D97706" strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="8 8">
      {/* 9 to Pod 1 Ball Carrier */}
      <path d="M 134,188 C 145,195 160,205 180,225" />
      {/* Messy pass within pod 2 */}
      <path d="M 165,325 C 172,330 178,335 185,340" />
    </g>

    {/* Running Lines (Solid with Arrows) */}
    <g id="running-lines" stroke="#D97706" strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" markerEnd="url(#arrowhead-small)">
      {/* Pod 1 carrier powerful burst */}
      <path d="M 190,250 C 200,210 210,190 230,170" />
      {/* Latching player on pod 1 */}
      <path d="M 210,280 C 220,260 230,240 240,230" />
      {/* Pod 2 starting movement */}
      <path d="M 180,350 C 210,360 230,360 250,355" />
      {/* Support runner hitting gap */}
      <path d="M 310,300 C 330,280 350,250 360,220" />
    </g>
  </svg>
);


// ============================================================================
// VARIATION 3: Placeholder (Paste third generated SVG here)
// ============================================================================
const Variation3 = () => (
  <svg
    aria-hidden="true"
    focusable="false"
    viewBox="0 0 800 500"
    className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
  >
    <defs>
      <marker
        id="arrowhead-large"
        markerWidth="12"
        markerHeight="9"
        refX="11"
        refY="4.5"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path
          d="M 0 0 L 12 4.5 L 0 9 z"
          fill="#D97706"
          fillOpacity="0.55"
          stroke="none"
        />
      </marker>
    </defs>

    {/* Pitch Context (Structural Elements) */}
    <g id="pitch-lines" stroke="#f5f0e8" strokeOpacity="0.1" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
      {/* Highly faded, massive lines */}
      <path d="M -100,250 C 200,260 500,240 900,250" strokeWidth="10" />
      <path d="M 400,-100 C 420,100 380,300 400,600" />
    </g>

    {/* Attackers (O) - Massive Scale */}
    <g id="attack-markers" stroke="#D97706" strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
      {/* Dominant attacker O */}
      <ellipse cx="250" cy="200" rx="35" ry="38" transform="rotate(-15 250 200)" />
      {/* Supporting attacker O */}
      <ellipse cx="550" cy="350" rx="38" ry="35" />
    </g>

    {/* Defenders (X) - Massive Scale */}
    <g id="defense-markers" stroke="#D97706" strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
      {/* Blocking defender X */}
      <g transform="translate(180, 280) scale(2.5)">
          <path d="M -10,-10 L 10,10 M 10,-10 L -10,10" />
      </g>
      {/* Deep defender X */}
      <g transform="translate(620, 150) scale(2.5)">
          <path d="M -10,-10 L 10,10 M 10,-10 L -10,10" />
      </g>
    </g>

    {/* Passing Lines (Dashed) - One Huge Arc */}
    <g id="passing-lines" stroke="#D97706" strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="12 12">
      {/* Major connecting arc */}
      <path d="M 285,190 C 350,170 450,180 520,330" />
    </g>

    {/* Running Lines (Solid with Arrows) - Single Bold Move */}
    <g id="running-lines" stroke="#D97706" strokeOpacity="0.55" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" markerEnd="url(#arrowhead-large)">
      {/* Traverses the whole viewBox diagonally */}
      <path d="M 200,450 C 350,420 500,280 650,120" />
    </g>
  </svg>
);
// ============================================================================
// VARIATION 4: Corner Attack
// ============================================================================
const RugbyDiagramCornerAttack = () => {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 800 500"
      className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <defs>
        <marker
          id="arrowhead-amber"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M 0 0 L 10 3.5 L 0 7 z"
            fill="#D97706"
            fillOpacity="0.55"
            stroke="none"
          />
        </marker>
      </defs>

      {/* Pitch Context (Structural Elements) */}
      <g id="pitch-lines" stroke="#f5f0e8" strokeOpacity="0.18" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 150,450 C 350,445 600,455 850,450" />
        <path d="M 150,-50 C 145,150 155,300 150,550" />
        <path d="M 200,400 L 220,400" strokeWidth="4" strokeOpacity="0.12" />
      </g>

      {/* Attackers (O) */}
      <g id="attack-markers" stroke="#D97706" strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="650" cy="100" rx="15" ry="16" transform="rotate(-10 650 100)" />
        <ellipse cx="500" cy="220" rx="16" ry="15" />
        <ellipse cx="250" cy="380" rx="15" ry="17" transform="rotate(5 250 380)" />
      </g>

      {/* Defenders (X) */}
      <g id="defense-markers" stroke="#D97706" strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 400,160 L 420,180 M 420,160 L 400,180" />
        <path d="M 280,290 L 300,310 M 300,290 L 280,310" />
      </g>

      {/* Passing Lines (Dashed) */}
      <g id="passing-lines" stroke="#D97706" strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="8 8">
        <path d="M 626,115 C 550,150 450,220 278,368" />
      </g>

      {/* Running Lines (Solid with Arrows) */}
      <g id="running-lines" stroke="#D97706" strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" markerEnd="url(#arrowhead-amber)">
        <path d="M 235,392 C 210,410 180,430 160,440" />
        <path d="M 480,225 C 440,235 410,240 380,245" />
        <path d="M 640,122 C 610,180 550,280 450,380" />
      </g>
    </svg>
  );
};

// ============================================================================
// VARIATION 5: Scrum Focus
// ============================================================================
const RugbyDiagramScrumFocus = () => {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 800 500"
      className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <defs>
        <marker
          id="arrowhead-amber-small"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M 0 0 L 10 3.5 L 0 7 z"
            fill="#D97706"
            fillOpacity="0.55"
            stroke="none"
          />
        </marker>
      </defs>

      <g id="pitch-lines" stroke="#f5f0e8" strokeOpacity="0.18" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 400,-50 C 395,150 405,300 400,550" />
        <path d="M 350,250 C 400,248 450,252 500,250" strokeWidth="6" />
      </g>

      <g id="attack-markers" stroke="#D97706" strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="280" cy="180" rx="16" ry="15" />
        <ellipse cx="200" cy="250" rx="15" ry="17" transform="rotate(10 200 250)" />
        <ellipse cx="450" cy="150" rx="17" ry="16" transform="rotate(-5 450 150)" />
      </g>

      <g id="defense-markers" stroke="#D97706" strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 330,100 L 350,120 M 350,100 L 330,120" />
        <path d="M 260,280 L 280,300 M 280,280 L 260,300" />
        <path d="M 150,190 L 170,210 M 170,190 L 150,210" />
      </g>

      <g id="passing-lines" stroke="#D97706" strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="8 8">
        <path d="M 215,235 C 230,220 245,200 265,190" />
      </g>

      <g id="running-lines" stroke="#D97706" strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" markerEnd="url(#arrowhead-amber-small)">
        <path d="M 185,260 C 160,270 140,280 120,290" />
        <path d="M 465,160 C 510,190 560,220 600,240" />
        <path d="M 298,185 C 330,200 370,220 400,240" />
      </g>
    </svg>
  );
};

// ============================================================================
// VARIATION 6: Lineout Hook
// ============================================================================
const RugbyDiagramLineoutHook = () => {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 800 500"
      className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <defs>
        <marker
          id="arrowhead-amber-large"
          markerWidth="12"
          markerHeight="9"
          refX="11"
          refY="4.5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M 0 0 L 12 4.5 L 0 9 z"
            fill="#D97706"
            fillOpacity="0.55"
            stroke="none"
          />
        </marker>
      </defs>

      <g id="pitch-lines" stroke="#f5f0e8" strokeOpacity="0.18" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 150,100 C 152,200 148,300 150,400" strokeWidth="8" strokeOpacity="0.22" />
        <path d="M 120,150 L 180,150" />
        <path d="M 120,350 L 180,350" />
      </g>

      <g id="attack-markers" stroke="#D97706" strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="250" cy="250" rx="35" ry="38" transform="rotate(-15 250 250)" />
        <ellipse cx="550" cy="350" rx="30" ry="32" />
      </g>

      <g id="defense-markers" stroke="#D97706" strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <g transform="translate(320, 150) scale(2.5)">
            <path d="M -10,-10 L 10,10 M 10,-10 L -10,10" />
        </g>
      </g>

      <g id="passing-lines" stroke="#D97706" strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="12 12">
        <path d="M 50,480 C 100,400 180,300 240,260" />
        <path d="M 285,240 C 350,220 450,230 520,330" />
      </g>

      <g id="running-lines" stroke="#D97706" strokeOpacity="0.55" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" markerEnd="url(#arrowhead-amber-large)">
        <path d="M 560,320 C 580,260 600,180 500,100" />
      </g>
    </svg>
  );
};

// Register variations here
const variants = [Variation1, Variation2, Variation3, RugbyDiagramCornerAttack, RugbyDiagramScrumFocus, RugbyDiagramLineoutHook];

export default function HeroBackground() {
  const [active, setActive] = useState(0);

  // Automatically cycle through variations every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActive((current) => (current + 1) % variants.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Mobile Fallback: Tactical Ball SVG */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20 md:hidden overflow-hidden pointer-events-none" aria-hidden="true">
        {/* We use standard img to avoid Next.js Image optimization overhead for a simple SVG */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/tactical-ball.svg"
          alt="Tactical Rugby Ball"
          width="250"
          height="250"
          className="object-contain motion-safe:animate-pulse"
        />
      </div>

      {/* Render all variants but transition their opacity for a smooth crossfade */}
      {variants.map((Variant, i) => (
        <div 
          key={i} 
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out motion-reduce:transition-none ${
            active === i ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Variant />
        </div>
      ))}
      
      {/* Dev-only Switcher (Currently hidden, change false to true to use) */}
      {false && process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 right-4 z-50 flex gap-2 pointer-events-auto bg-surface-warm p-2 rounded border border-border shadow-md">
          {variants.map((_, i) => (
            <button 
              key={i} 
              onClick={() => setActive(i)}
              className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
                active === i 
                  ? 'bg-accent-warm text-text-primary' 
                  : 'bg-surface border border-border text-text-primary hover:bg-surface-warm'
              }`}
            >
              Var {i + 1}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
