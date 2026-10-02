import React, { useState, useRef, useEffect } from 'react';

/**
 * CategoryNav component
 * Horizontally scrollable topic categories with active state indicators and all-categories dropdown
 */
export default function CategoryNav({ categories = [], activeCategoryId, onSelectCategory }) {
  const trackRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const scroll = (dir) => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
    }
  };

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalTopics = categories.length;

  return (
    <nav
      className="sticky top-0 bg-white border-b border-stone-200 z-40 flex-shrink-0"
      data-purpose="category-navigation"
    >
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center h-11 sm:h-12 gap-1 sm:gap-2">

          {/* Left scroll arrow — only on sm+ */}
          <button
            type="button"
            onClick={() => scroll('left')}
            aria-label="Cuộn sang trái"
            className="flex-shrink-0 hidden sm:flex w-7 h-7 items-center justify-center
                       rounded-full border border-stone-200 text-stone-400
                       hover:text-[#6d1844] hover:border-[#6d1844] transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Scrollable pill track — touch-friendly on mobile */}
          <div
            ref={trackRef}
            className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar flex-1 scroll-smooth py-0.5"
          >
            {categories.map((cat) => {
              const isActive = cat.id === activeCategoryId;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat.id)}
                  className={`
                    flex-shrink-0 px-3 sm:px-3.5 py-1 sm:py-1.5
                    rounded-full text-[11px] sm:text-xs font-semibold
                    whitespace-nowrap transition-all duration-200 focus:outline-none cursor-pointer
                    ${isActive
                      ? 'bg-[#6d1844] text-white shadow-sm'
                      : 'text-stone-600 hover:text-[#6d1844] hover:bg-[#fdf0e6]'
                    }
                  `}
                >
                  {cat.name}
                </button>
              );
            })}
            {totalTopics === 0 && (
              <span className="text-xs text-stone-400 italic px-2">Đang tải danh sách chủ đề...</span>
            )}
          </div>

          {/* Right scroll arrow */}
          <button
            type="button"
            onClick={() => scroll('right')}
            aria-label="Cuộn sang phải"
            className="flex-shrink-0 hidden sm:flex w-7 h-7 items-center justify-center
                       rounded-full border border-stone-200 text-stone-400
                       hover:text-[#6d1844] hover:border-[#6d1844] transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Dropdown xem toàn bộ danh sách chủ đề — hiển thị đúng số lượng thật thay vì hardcode 15 */}
          <div className="relative flex-shrink-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-label="Xem tất cả chủ đề"
              aria-expanded={dropdownOpen}
              className={`
                hidden md:inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold
                border border-dashed px-2.5 sm:px-3 py-1 rounded-full transition-colors whitespace-nowrap cursor-pointer select-none
                ${dropdownOpen
                  ? 'bg-[#6d1844] text-white border-[#6d1844]'
                  : 'text-[#6d1844] border-[#c0719a] bg-[#fdf0e6] hover:bg-[#f8dce8]'
                }
              `}
            >
              <span>{totalTopics > 0 ? `${totalTopics} Chủ đề` : 'Chủ đề'}</span>
              <svg
                className={`w-3 h-3 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Menu Dropdown danh sách chủ đề */}
            {dropdownOpen && totalTopics > 0 && (
              <div
                className="absolute right-0 top-full mt-2 w-64 max-h-80 overflow-y-auto bg-white border border-stone-200
                           rounded-2xl shadow-xl py-1.5 z-50 animate-fade-in"
              >
                <div className="px-3.5 py-2 border-b border-stone-100 flex items-center justify-between">
                  <span className="text-[11px] uppercase font-bold text-stone-500 tracking-wider">
                    Tất cả chủ đề ({totalTopics})
                  </span>
                  <span className="text-[10px] text-stone-400 font-medium">Chọn nhanh</span>
                </div>
                <div className="py-1">
                  {categories.map((cat, idx) => {
                    const isActive = cat.id === activeCategoryId;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          onSelectCategory(cat.id);
                          setDropdownOpen(false);
                        }}
                        className={`
                          w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between
                          transition-colors cursor-pointer
                          ${isActive
                            ? 'bg-[#fdf0e6] text-[#6d1844] font-bold'
                            : 'text-stone-700 hover:bg-stone-50 hover:text-[#6d1844]'
                          }
                        `}
                      >
                        <span className="truncate pr-2 flex items-center gap-2">
                          <span className="text-[10px] text-stone-400 w-4 font-mono">{idx + 1}.</span>
                          <span className="truncate">{cat.name}</span>
                        </span>
                        {isActive && (
                          <svg className="w-3.5 h-3.5 text-[#6d1844] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path clipRule="evenodd" fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
