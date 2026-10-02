import React from 'react';

/**
 * FlashcardActions component
 * Groups study card actions: evaluation status buttons and step navigation controls
 */
export default function FlashcardActions({
  onMarkReview,
  onMarkLearned,
  status,
  onPrev,
  onNext,
  onToggleFlip,
  hasPrev,
  hasNext,
  prevWord,
  nextWord,
}) {
  return (
    <div className="w-full flex-shrink-0 flex flex-col items-center">
      {/* ── Evaluation buttons ────────────────────────── */}
      <div
        className="w-full flex items-center gap-2 sm:gap-3 mt-3"
        data-purpose="evaluation-buttons"
      >
        {/* Cần ôn lại */}
        <button
          type="button"
          onClick={onMarkReview}
          className={`
            flex-1 flex items-center justify-center gap-1.5 sm:gap-2
            h-10 sm:h-11 min-w-0 rounded-xl border-2
            text-[11px] sm:text-xs font-bold cursor-pointer
            transition-all duration-200 active:scale-95
            ${status?.review
              ? 'border-amber-400 bg-amber-100 text-amber-800 shadow-sm'
              : 'border-stone-200 bg-white text-stone-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800'
            }
          `}
          data-purpose="mark-review-btn"
        >
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <span className="truncate">Cần ôn lại</span>
        </button>

        {/* Đã thuộc từ này */}
        <button
          type="button"
          onClick={onMarkLearned}
          className={`
            flex-1 flex items-center justify-center gap-1.5 sm:gap-2
            h-10 sm:h-11 min-w-0 rounded-xl border-2
            text-[11px] sm:text-xs font-bold cursor-pointer
            transition-all duration-200 active:scale-95
            ${status?.learned
              ? 'border-emerald-400 bg-emerald-100 text-emerald-800 shadow-sm'
              : 'border-stone-200 bg-white text-stone-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800'
            }
          `}
          data-purpose="mark-learned-btn"
        >
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path clipRule="evenodd" fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
          </svg>
          <span className="truncate">Đã thuộc từ này</span>
        </button>
      </div>

      {/* ── Navigation controls ────────────────────────── */}
      <div className="w-full mt-3" data-purpose="navigation-controls">
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Previous */}
          <button
            type="button"
            id="prevBtn"
            onClick={onPrev}
            disabled={!hasPrev}
            className={`
              flex-1 flex items-center justify-center gap-1 sm:gap-1.5
              h-10 sm:h-11 min-w-0 rounded-xl border-2
              text-[11px] sm:text-xs font-bold
              transition-all duration-200 active:scale-95
              ${!hasPrev
                ? 'border-stone-200 text-stone-300 cursor-not-allowed'
                : 'border-[#6d1844] text-[#6d1844] hover:bg-[#fdf0e6] cursor-pointer'
              }
            `}
          >
            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="truncate">Previous</span>
          </button>

          {/* Flip Card — primary button */}
          <button
            type="button"
            id="flipBtn"
            onClick={onToggleFlip}
            className="
              flex-1 flex items-center justify-center gap-1 sm:gap-1.5
              h-10 sm:h-11 min-w-0 rounded-xl
              bg-[#6d1844] hover:bg-[#5a1238] text-white
              text-[11px] sm:text-xs font-bold
              shadow-sm shadow-[#6d1844]/25
              transition-all duration-200 active:scale-95 cursor-pointer
            "
          >
            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="truncate">Flip Card</span>
          </button>

          {/* Next */}
          <button
            type="button"
            id="nextBtn"
            onClick={onNext}
            disabled={!hasNext}
            className={`
              flex-1 flex items-center justify-center gap-1 sm:gap-1.5
              h-10 sm:h-11 min-w-0 rounded-xl border-2
              text-[11px] sm:text-xs font-bold
              transition-all duration-200 active:scale-95
              ${!hasNext
                ? 'border-stone-200 text-stone-300 cursor-not-allowed'
                : 'border-[#6d1844] text-[#6d1844] hover:bg-[#fdf0e6] cursor-pointer'
              }
            `}
          >
            <span className="truncate">Next</span>
            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* ── Bottom info bar ────────────────────────────── */}
        <div className="flex items-center justify-between mt-2 text-[10px] sm:text-[11px] text-stone-400">
          {/* Prev word */}
          <span className="flex items-center gap-1 min-w-0 max-w-[30%]">
            <svg className="w-2.5 h-2.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="truncate font-medium text-stone-500">
              {prevWord ? prevWord : 'Đầu tiên'}
            </span>
          </span>

          {/* Keyboard tips — hidden on mobile */}
          <div className="hidden sm:flex items-center gap-2 text-[10px]">
            <span className="flex items-center gap-1">
              <kbd className="bg-stone-100 border border-stone-300 px-1 py-0.5 rounded text-[8px] font-mono">←</kbd>
              <kbd className="bg-stone-100 border border-stone-300 px-1 py-0.5 rounded text-[8px] font-mono">→</kbd>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-stone-100 border border-stone-300 px-1.5 py-0.5 rounded text-[8px] font-mono">Space</kbd>
              lật thẻ
            </span>
          </div>

          {/* Next word */}
          <span className="flex items-center gap-1 min-w-0 max-w-[30%] justify-end">
            <span className="truncate font-medium text-stone-500">
              {nextWord ? nextWord : 'Cuối'}
            </span>
            <svg className="w-2.5 h-2.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}
