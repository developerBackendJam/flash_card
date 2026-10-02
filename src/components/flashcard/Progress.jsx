import React from 'react';

/**
 * Progress component
 * Displays current card position and visual progress bar
 */
export default function Progress({ current, total }) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="w-full max-w-md sm:max-w-lg mb-6 flex flex-col items-center gap-2" data-purpose="progress-counter">
      {/* Counter matching wireframe '5 / 20' */}
      <div className="flex items-center justify-between w-full px-2">
        <span className="text-xs uppercase tracking-widest font-bold text-stone-600">Tiến độ bài học</span>
        <div className="text-sm font-extrabold tracking-wider text-burgundy-950 bg-white px-3.5 py-1 rounded-full border border-burgundy-100 shadow-sm">
          <span className="text-burgundy-700">{current}</span> <span className="text-stone-300 mx-0.5">/</span> {total}
        </div>
      </div>

      {/* Linear visual progress bar */}
      <div className="w-full h-2 bg-stone-200/80 rounded-full overflow-hidden p-0.5 border border-white">
        <div
          className="h-full bg-gradient-to-r from-burgundy-700 to-burgundy-900 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
