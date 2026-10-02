import React from 'react';

export default function HeroSection() {
  return (
    /*
     * group → cho phép dùng group-hover: trên toàn bộ children
     * Khi hover vào hero section, tất cả elements sẽ animate theo
     */
    <section
      className="group relative bg-[#fdf0e6] flex flex-col justify-between items-center p-4 sm:p-6 lg:p-6 xl:p-8 overflow-hidden select-none w-full h-full min-h-[300px] transition-all duration-500"
      data-purpose="hero-illustration"
    >
      {/* ── Decorative: Big Burgundy Crescent (top-left) ────────── */}
      <div
        aria-hidden="true"
        className="absolute -top-10 -left-10 sm:-top-14 sm:-left-14 w-36 h-36 sm:w-52 sm:h-52
                   rounded-full bg-gradient-to-br from-[#8a1d4b] to-[#5b0f31] opacity-90 shadow-lg
                   pointer-events-none transition-all duration-700 ease-out
                   group-hover:scale-110 group-hover:opacity-100 group-hover:shadow-2xl group-hover:-translate-x-1 group-hover:-translate-y-1"
      />
      {/* Orbit ring around crescent */}
      <div
        aria-hidden="true"
        className="absolute top-4 sm:top-8 -left-4 w-44 sm:w-60 h-24 sm:h-30 orbit-ring pointer-events-none
                   transition-all duration-700 ease-out
                   group-hover:scale-110 group-hover:opacity-70"
      />

      {/* ── Top-right small orb ─────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute top-14 sm:top-20 right-8 sm:right-16 w-6 sm:w-10 h-6 sm:h-10
                   rounded-full bg-gradient-to-br from-[#9c2759] to-[#68143a] opacity-80
                   pointer-events-none hero-orb-pulse transition-all duration-500
                   group-hover:scale-125 group-hover:opacity-100 group-hover:shadow-lg group-hover:shadow-[#9c2759]/40"
      />
      {/* ── Bottom-right medium orb ─────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute bottom-24 sm:bottom-32 right-6 sm:right-10 w-5 sm:w-7 h-5 sm:h-7
                   rounded-full bg-gradient-to-br from-[#9c2759] to-[#68143a] opacity-75
                   pointer-events-none transition-all duration-500 delay-75
                   group-hover:scale-150 group-hover:opacity-100 group-hover:shadow-md group-hover:shadow-[#9c2759]/40 group-hover:translate-x-1"
      />
      {/* ── Bottom-left tiny orb ─────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute bottom-16 sm:bottom-24 left-6 sm:left-10 w-3 sm:w-4 h-3 sm:h-4
                   rounded-full bg-[#851d48] opacity-70
                   pointer-events-none transition-all duration-500 delay-100
                   group-hover:scale-150 group-hover:opacity-100 group-hover:-translate-x-1"
      />

      {/* ── Sparkle "+" signs ────────────────────────────────────── */}
      <span aria-hidden="true"
        className="absolute top-20 sm:top-24 left-14 sm:left-20 text-[#b8537a] text-base sm:text-lg font-bold opacity-60 pointer-events-none
                   transition-all duration-500 ease-out
                   group-hover:opacity-100 group-hover:scale-125 group-hover:rotate-45 group-hover:text-[#6d1844]">+</span>
      <span aria-hidden="true"
        className="absolute top-10 sm:top-14 right-20 sm:right-36 text-[#b8537a] text-xs sm:text-sm font-bold opacity-50 pointer-events-none
                   transition-all duration-500 ease-out delay-75
                   group-hover:opacity-100 group-hover:scale-150 group-hover:rotate-45 group-hover:text-[#6d1844]">+</span>
      <span aria-hidden="true"
        className="absolute bottom-24 sm:bottom-36 left-16 sm:left-24 text-[#b8537a] text-[10px] sm:text-xs font-bold opacity-60 pointer-events-none
                   transition-all duration-500 ease-out delay-100
                   group-hover:opacity-100 group-hover:scale-125 group-hover:rotate-90 group-hover:text-[#6d1844]">+</span>

      {/* ── Soft Center Glow Halo ────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 sm:w-64 lg:w-72 h-48 sm:h-64 lg:h-72
                   bg-[#f8decd] rounded-full opacity-60 pointer-events-none
                   transition-all duration-700 ease-out
                   group-hover:scale-110 group-hover:opacity-80"
      />

      {/* ── Character + Speech Bubbles ───────────────────────────── */}
      <div className="relative z-10 w-full flex-1 flex items-center justify-center py-2 sm:py-4">
        <div className="relative w-full max-w-[260px] sm:max-w-[300px] lg:max-w-[340px] aspect-square flex items-center justify-center">

          {/* Speech Bubble Left — slides out on hover */}
          <div
            className="absolute left-0 sm:left-2 top-16 sm:top-20 z-20 bg-[#6d1844] text-white
                       px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg shadow-md flex items-center space-x-1
                       transition-all duration-500 ease-out
                       group-hover:-translate-x-2 group-hover:shadow-xl group-hover:shadow-[#6d1844]/30 group-hover:scale-110"
            data-purpose="chat-bubble-left"
          >
            {[0, 75, 150, 225, 300, 375].map((delay) => (
              <span
                key={delay}
                className="w-1.5 h-1.5 rounded-full bg-white opacity-90 inline-block hero-dot-bounce"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
            <div
              aria-hidden="true"
              className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[4px] sm:border-t-[5px] border-b-[4px] sm:border-b-[5px] border-l-[6px] border-t-transparent border-b-transparent border-l-[#6d1844]"
            />
          </div>

          {/* Speech Bubble Right — slides out on hover */}
          <div
            className="absolute right-0 sm:right-2 top-20 sm:top-24 z-20 bg-[#6d1844] text-white
                       px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg shadow-md flex items-center space-x-1
                       transition-all duration-500 ease-out delay-75
                       group-hover:translate-x-2 group-hover:shadow-xl group-hover:shadow-[#6d1844]/30 group-hover:scale-110"
            data-purpose="chat-bubble-right"
          >
            {[100, 175, 250, 325, 400, 475].map((delay) => (
              <span
                key={delay}
                className="w-1.5 h-1.5 rounded-full bg-white opacity-90 inline-block hero-dot-bounce"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
            <div
              aria-hidden="true"
              className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[4px] sm:border-t-[5px] border-b-[4px] sm:border-b-[5px] border-r-[6px] border-t-transparent border-b-transparent border-r-[#6d1844]"
            />
          </div>

          {/* SVG Character — floats up on hover */}
          <svg
            aria-label="Stylized learner studying at a laptop"
            className="w-full h-full max-h-[190px] sm:max-h-[230px] lg:max-h-[250px] drop-shadow-sm select-none
                       hero-float transition-all duration-700 ease-out
                       group-hover:-translate-y-3 group-hover:drop-shadow-xl"
            fill="none"
            role="img"
            viewBox="0 0 400 400"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Foliage / Creative Leaves Base */}
            <g id="foliage-base">
              <path d="M125 350 C110 320, 95 285, 115 250 C125 280, 140 310, 145 350 Z" fill="#9e3a2b" />
              <path d="M140 355 C125 315, 120 270, 145 235 C155 270, 160 310, 160 355 Z" fill="#c95a32" />
              <path d="M165 358 C155 310, 165 265, 185 240 C188 280, 182 320, 180 358 Z" fill="#e69642" />
              <path d="M275 350 C290 320, 305 285, 285 250 C275 280, 260 310, 255 350 Z" fill="#9e3a2b" />
              <path d="M260 355 C275 315, 280 270, 255 235 C245 270, 240 310, 240 355 Z" fill="#c95a32" />
              <path d="M235 358 C245 310, 235 265, 215 240 C212 280, 218 320, 220 358 Z" fill="#e69642" />
            </g>
            {/* Character Body */}
            <g id="character-body" stroke="#222222" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5">
              <path d="M192 195 H208 M192 205 H208 M192 215 H208" stroke="#1c1c1c" strokeWidth="3" />
              <rect fill="#f4eedf" height="30" rx="3" stroke="#1c1c1c" strokeWidth="2" width="12" x="194" y="190" />
              <line stroke="#1c1c1c" strokeWidth="4" x1="200" x2="200" y1="220" y2="280" />
              <rect fill="#f4eedf" height="8" rx="2" width="14" x="193" y="222" />
              <rect fill="#f4eedf" height="8" rx="2" width="14" x="193" y="234" />
              <rect fill="#f4eedf" height="8" rx="2" width="14" x="193" y="246" />
              <rect fill="#f4eedf" height="8" rx="2" width="14" x="193" y="258" />
              <path d="M192 225 C165 225, 155 250, 192 255" fill="none" stroke="#1c1c1c" strokeWidth="2.5" />
              <path d="M208 225 C235 225, 245 250, 208 255" fill="none" stroke="#1c1c1c" strokeWidth="2.5" />
              <path d="M192 237 C158 237, 148 265, 192 268" fill="none" stroke="#1c1c1c" strokeWidth="2.5" />
              <path d="M208 237 C242 237, 252 265, 208 268" fill="none" stroke="#1c1c1c" strokeWidth="2.5" />
              <path d="M192 249 C162 249, 155 275, 192 278" fill="none" stroke="#1c1c1c" strokeWidth="2.5" />
              <path d="M208 249 C238 249, 245 275, 208 278" fill="none" stroke="#1c1c1c" strokeWidth="2.5" />
              <path d="M200 215 C175 210, 150 220, 142 245 C132 280, 138 315, 170 330" fill="none" stroke="#1c1c1c" strokeLinecap="round" strokeWidth="3" />
              <path d="M200 215 C225 210, 250 220, 258 245 C268 280, 262 315, 230 330" fill="none" stroke="#1c1c1c" strokeLinecap="round" strokeWidth="3" />
            </g>
            {/* Character Head */}
            <g id="character-head">
              <path d="M152 145 C150 95, 250 95, 248 145 C248 165, 240 178, 234 186 C230 192, 226 200, 215 200 H185 C174 200, 170 192, 166 186 C160 178, 152 165, 152 145 Z" fill="#f4eedf" stroke="#1c1c1c" strokeLinejoin="round" strokeWidth="3" />
              <path d="M170 152 C166 142, 185 138, 187 150 C188 160, 172 162, 170 152 Z" fill="#1c1c1c" />
              <path d="M213 150 C215 138, 234 142, 230 152 C228 162, 212 160, 213 150 Z" fill="#1c1c1c" />
              <path d="M200 162 L196 172 C196 174, 204 174, 204 172 Z" fill="#1c1c1c" />
              <path d="M176 186 Q200 192 224 186" fill="none" stroke="#1c1c1c" strokeLinecap="round" strokeWidth="2.5" />
              <line stroke="#1c1c1c" strokeWidth="2" x1="183" x2="183" y1="184" y2="188" />
              <line stroke="#1c1c1c" strokeWidth="2" x1="190" x2="190" y1="185" y2="189" />
              <line stroke="#1c1c1c" strokeWidth="2" x1="197" x2="197" y1="186" y2="190" />
              <line stroke="#1c1c1c" strokeWidth="2" x1="203" x2="203" y1="186" y2="190" />
              <line stroke="#1c1c1c" strokeWidth="2" x1="210" x2="210" y1="185" y2="189" />
              <line stroke="#1c1c1c" strokeWidth="2" x1="217" x2="217" y1="184" y2="188" />
            </g>
            {/* Laptop */}
            <g id="laptop-device">
              <rect fill="#d9dbdf" height="75" rx="8" stroke="#1c1c1c" strokeWidth="2.5" width="110" x="145" y="275" />
              <ellipse cx="200" cy="308" fill="#ffffff" rx="8" ry="7" stroke="#1c1c1c" strokeWidth="1.5" />
              <circle cx="198" cy="307" fill="#1c1c1c" r="1.5" />
              <circle cx="202" cy="307" fill="#1c1c1c" r="1.5" />
              <path d="M198 315 H202 V318 H198 Z" fill="#ffffff" stroke="#1c1c1c" strokeWidth="1.2" />
              <ellipse cx="148" cy="348" fill="#f4eedf" rx="10" ry="5" stroke="#1c1c1c" strokeWidth="2" />
              <ellipse cx="252" cy="348" fill="#f4eedf" rx="10" ry="5" stroke="#1c1c1c" strokeWidth="2" />
            </g>
          </svg>
        </div>
      </div>

      {/* ── Headline — scales up slightly on hover ───────────────── */}
      <div
        className="relative z-10 text-center max-w-sm mt-1 sm:mt-2 mb-1 sm:mb-2 px-2
                   transition-all duration-500 ease-out
                   group-hover:scale-105 group-hover:-translate-y-1"
        data-purpose="hero-copy"
      >
        <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-[#6d1844] tracking-tight leading-snug
                       transition-colors duration-300 group-hover:text-[#5a1139]">
          Turn your ideas into reality.
        </h1>
        <p className="mt-1 text-xs sm:text-sm font-normal text-[#75264b] opacity-95
                      transition-opacity duration-300 group-hover:opacity-100">
          Start for free and get attractive offers from the community
        </p>
      </div>
    </section>
  );
}
