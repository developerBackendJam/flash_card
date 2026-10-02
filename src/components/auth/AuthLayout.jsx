import React from 'react';
import HeroSection from './HeroSection';

/**
 * Common Layout for Authentication pages (Login, Register)
 * Responsive strategy:
 *  - Mobile (<lg): single column, form only (hero hidden), natural scroll
 *  - Desktop (≥lg): 2-column split with HeroSection, locked to viewport
 */
export default function AuthLayout({
  title,
  subtitle,
  children,
  purpose = 'auth-container',
}) {
  return (
    <div
      className="bg-[#f5f5f5] font-sans antialiased text-gray-900 selection:bg-[#6d1844] selection:text-white
                 min-h-screen lg:h-screen flex items-center justify-center
                 p-0 sm:p-3 lg:p-4
                 overflow-y-auto lg:overflow-hidden"
    >
      <main
        className="w-full max-w-[1240px]
                   h-auto lg:h-[min(670px,94vh)]
                   bg-white shadow-2xl
                   rounded-none sm:rounded-2xl
                   overflow-hidden
                   grid grid-cols-1 lg:grid-cols-2"
      >
        {/* Left hero illustration — hidden on mobile */}
        <div className="hidden lg:block">
          <HeroSection />
        </div>

        {/* Right content section */}
        <section
          className="bg-white flex flex-col
                     p-5 sm:p-7 md:p-8 lg:p-8 xl:p-10
                     w-full h-full
                     overflow-y-auto no-scrollbar"
          data-purpose={purpose}
        >
          <div className="w-full max-w-[360px] mx-auto my-auto">
            {/* Brand icon */}
            <div className="mb-3 flex items-center">
              <img
                src="/logo.png"
                alt="LexiCard Logo"
                className="w-10 h-10 object-contain rounded-xl shadow-sm"
              />
            </div>

            {/* Title & Subtitle */}
            <div className="mb-4 sm:mb-5 text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                {title}
              </h2>
              {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
            </div>

            {/* Form Slot */}
            {children}
          </div>
        </section>
      </main>
    </div>
  );
}
