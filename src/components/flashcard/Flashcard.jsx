import React from 'react';
import { playPronunciation } from '../../utils/audioHelper';

/**
 * Flashcard — Responsive across 375px → 1440px
 *
 * Layout:
 *  - Responsive min-height for mobile to prevent card collapse
 *  - Front/Back use absolute inset-0 (CSS) to match dynamic height
 */
export default function Flashcard({ card, isFlipped, onToggleFlip }) {
  if (!card) return null;

  // Mapping dữ liệu từ Database Supabase (hỗ trợ cả schema Supabase và mock fallback)
  const word = card.front ?? card.word ?? '';
  const ipa = card.pronunciation ?? card.ipa ?? '';
  const partOfSpeech = card.part_of_speech ?? card.partOfSpeech ?? 'Từ vựng';
  const meaning = card.meaning ?? '';
  const exampleEn = card.example_sentence ?? card.exampleEn ?? '';
  const exampleVi = card.example_translation ?? card.exampleVi ?? '';

  // Xử lý synonyms: hỗ trợ Array, chuỗi JSON, hoặc Postgres Array {a,b,c}
  let synonymsList = [];
  if (Array.isArray(card.synonyms)) {
    synonymsList = card.synonyms;
  } else if (typeof card.synonyms === 'string') {
    try {
      if (card.synonyms.startsWith('[')) {
        synonymsList = JSON.parse(card.synonyms);
      } else if (card.synonyms.startsWith('{') && card.synonyms.endsWith('}')) {
        synonymsList = card.synonyms
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim().replace(/^"|"$/g, ''))
          .filter(Boolean);
      } else {
        synonymsList = card.synonyms
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
    } catch {
      synonymsList = [];
    }
  }

  const handleSpeak = (e) => {
    e.stopPropagation();
    playPronunciation(word);
  };

  const highlightWord = (sentence, w) => {
    if (!sentence || !w) return sentence;
    const parts = sentence.split(new RegExp(`(${w})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === w.toLowerCase()
        ? <strong key={i} className="text-[#6d1844] not-italic font-bold">{part}</strong>
        : part
    );
  };

  return (
    <div
      className="w-full h-[360px] sm:h-[400px] md:h-[430px] lg:h-full min-h-[340px] max-w-xl mx-auto perspective-1000 cursor-pointer select-none relative"
      onClick={onToggleFlip}
      title="Click để lật thẻ"
      data-purpose="flashcard-container"
    >
      <div className={`flashcard-inner h-full ${isFlipped ? 'is-flipped' : ''}`}>

        {/* ─── FRONT ─────────────────────────────────────── */}
        <div className="flashcard-front bg-white border border-stone-200/90 shadow-md sm:shadow-lg rounded-2xl
                        px-5 py-5 sm:px-7 sm:py-6
                        hover:shadow-xl transition-shadow duration-300">

          {/* Tag + speaker */}
          <div className="flex items-center justify-between w-full gap-2">
            <span className="inline-flex items-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wider
                             px-2.5 py-1 rounded-full
                             bg-[#fdf0e6] text-[#6d1844] border border-[#e8c4aa] leading-none shadow-xs">
              {partOfSpeech}
            </span>
            <button
              type="button"
              onClick={handleSpeak}
              aria-label="Phát âm từ"
              className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center rounded-full
                         bg-[#faf5f0] text-stone-600 border border-stone-200
                         hover:text-[#6d1844] hover:border-[#6d1844] hover:bg-[#fdf0e6]
                         active:scale-90 transition-all shadow-xs cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6 9H4a1 1 0 00-1 1v4a1 1 0 001 1h2l4 4V5L6 9z" />
              </svg>
            </button>
          </div>

          {/* Large word + IPA — responsive font sizes */}
          <div className="flex-1 flex flex-col items-center justify-center text-center px-2 py-3 sm:py-4">
            <h2
              className="font-extrabold text-stone-900 tracking-tight capitalize mb-2 sm:mb-3
                         text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl
                         leading-none"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {word}
            </h2>
            {ipa && (
              <p className="text-xs sm:text-sm text-stone-500 font-mono tracking-wide
                            bg-stone-100 px-3 py-1 rounded-lg border border-stone-200/60">
                {ipa}
              </p>
            )}
          </div>

          {/* Flip hint */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] text-stone-400 font-medium">
            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse text-[#6d1844]/60"
              fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">Nhấn vào Flashcard để lật xem nghĩa</span>
            <span className="sm:hidden">Nhấn để lật thẻ</span>
          </div>
        </div>

        {/* ─── BACK ──────────────────────────────────────── */}
        <div className="flashcard-back bg-gradient-to-b from-white to-[#fdf9f6]
                        border-2 border-[#e8c4aa] shadow-md rounded-2xl
                        px-5 py-4 sm:px-7 sm:py-5 text-left
                        hover:shadow-lg transition-shadow duration-300">

          {/* Header */}
          <div className="flex items-center justify-between w-full gap-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider
                             text-[#6d1844] bg-[#fdf0e6] px-2 py-0.5 sm:px-2.5 sm:py-1
                             rounded-full border border-[#e8c4aa] leading-none">
              Nghĩa & Ví dụ
            </span>
            <span className="text-[10px] text-stone-400 font-medium flex-shrink-0">EN – VI</span>
          </div>

          {/* Content — vertically centered */}
          <div className="flex-1 flex flex-col justify-center gap-2.5 sm:gap-3 py-2 sm:py-3">

            {/* Meaning */}
            <div>
              <p className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-0.5">
                Định nghĩa
              </p>
              <p className="text-lg sm:text-xl md:text-2xl font-extrabold text-stone-900 leading-snug">
                {meaning}
              </p>
            </div>

            {/* Example */}
            {exampleEn && (
              <div className="bg-white rounded-xl border border-stone-200 px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm">
                <p className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-[#6d1844] mb-1">
                  Ví dụ
                </p>
                <p className="text-xs sm:text-sm italic text-stone-700 leading-relaxed"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  "{highlightWord(exampleEn, word)}"
                </p>
                {exampleVi && (
                  <p className="text-[10px] sm:text-[11px] text-stone-500 mt-1 not-italic leading-snug">
                    ({exampleVi})
                  </p>
                )}
              </div>
            )}

            {/* Synonyms */}
            {synonymsList.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Đồng nghĩa:
                </span>
                {synonymsList.map((s, i) => (
                  <span key={i}
                    className="text-[10px] sm:text-[11px] bg-stone-100 text-stone-700
                               px-1.5 sm:px-2 py-0.5 rounded-full font-medium border border-stone-200">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-[10px] text-stone-400 border-t border-stone-100 pt-2">
            <span>Nhấn lại để xem mặt trước</span>
            <span className="font-semibold text-[#6d1844]">LexiCard</span>
          </div>
        </div>

      </div>
    </div>
  );
}
