import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from '../../services/authService';
import LeaderboardModal from '../arena/LeaderboardModal';

export default function Header({ user }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    setDropdownOpen(false);
    try {
      await signOut();
    } catch (e) {
      console.error('Lỗi khi đăng xuất:', e);
    }
    navigate('/login');
  };

  const handleBlur = (e) => {
    if (!dropdownRef.current?.contains(e.relatedTarget)) {
      setDropdownOpen(false);
    }
  };

  return (
    <>
      <header
        className="bg-white border-b border-stone-200 flex-shrink-0 z-50"
        data-purpose="top-navigation"
      >
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">

          {/* ── Logo ───────────────────────────────────── */}
          <Link
            to="/"
            className="flex items-center gap-2.5 flex-shrink-0 focus:outline-none min-w-0"
            aria-label="LexiCard home"
          >
            <img
              src="/logo.png"
              alt="LexiCard Logo"
              className="w-9 h-9 object-contain rounded-lg flex-shrink-0 shadow-sm"
            />
            <div className="flex flex-col leading-none min-w-0">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-stone-900 whitespace-nowrap">
                Lexi<span className="text-[#6d1844]">Card</span>
              </span>
              <span className="hidden sm:block text-[9px] uppercase tracking-widest font-semibold text-stone-400">
                Flashcard Master
              </span>
            </div>
          </Link>

          {/* ── Center / Right Actions ───────────────── */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">

            {/* Nút Cuộc thi Đấu Trường 30 Câu */}
            <Link
              to="/arena"
              className="flex items-center gap-1.5 bg-gradient-to-r from-[#6d1844] to-[#882156] hover:from-[#5a1238] hover:to-[#6d1844]
                         text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm hover:shadow transition-all
                         active:scale-95 whitespace-nowrap cursor-pointer"
              title="Tham gia Đấu Trường Trắc Nghiệm 30 Câu"
            >
              <span className="text-sm">🏆</span>
              <span className="hidden sm:inline">Đấu Trường</span>
              <span className="sm:hidden">Đấu Trường</span>
            </Link>

            {/* Nút Bảng Xếp Hạng */}
            <button
              onClick={() => setLeaderboardOpen(true)}
              type="button"
              className="flex items-center gap-1 bg-amber-50 hover:bg-amber-100 border border-amber-200
                         text-amber-900 text-xs font-bold px-2.5 py-1.5 rounded-full transition-colors cursor-pointer"
              title="Xem Bảng Vinh Danh Toàn Quốc"
            >
              <span>🏅</span>
              <span className="hidden md:inline">BXH</span>
            </button>

            {/* Streak pill — hidden on very small screens */}
            <div
              className="hidden md:flex items-center gap-1.5 bg-[#fdf0e6] border border-[#e8c4aa]
                         px-3 py-1 rounded-full text-xs font-semibold text-[#6d1844] whitespace-nowrap"
              title="Chuỗi học liên tiếp"
            >
              <svg className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path clipRule="evenodd" fillRule="evenodd"
                  d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.527.82-1.173 2.015-1.583 3.027a19.78 19.78 0 01-1.393 2.653c-.352.56-.63 1.053-.82 1.44a5.534 5.534 0 00-.457 1.458c-.147.886.07 1.77.6 2.477.53.707 1.34 1.144 2.222 1.196.262.015.527-.008.783-.07a5.58 5.58 0 001.32-.51c.365-.213.7-.478 1.002-.787.234-.24.423-.52.56-.826.16-.36.23-.75.21-1.143a4.015 4.015 0 00-.77-2.193c-.453-.667-.93-1.397-1.37-2.18-.328-.583-.623-1.222-.823-1.89a9.66 9.66 0 01-.19-.785 1 1 0 00-.769-.877z" />
              </svg>
              <span>{user?.streak ?? 1} Ngày</span>
            </div>

            {/* User dropdown or Login button */}
            {user ? (
              <div className="relative" ref={dropdownRef} onBlur={handleBlur}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-1.5 sm:gap-2 focus:outline-none cursor-pointer"
                  aria-label="Tài khoản"
                  aria-expanded={dropdownOpen}
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-[#6d1844] text-white text-xs font-bold
                                flex items-center justify-center flex-shrink-0
                                ring-2 ring-[#e8c4aa]">
                    {user?.initials ?? 'U'}
                  </div>
                  {/* Name + email — hidden below sm */}
                  <div className="hidden sm:flex flex-col text-left leading-none min-w-0">
                    <span className="text-xs font-bold text-stone-800 truncate max-w-[120px]">
                      {user?.name ?? user?.email ?? 'Người dùng'}
                    </span>
                    <span className="text-[10px] text-stone-500 truncate max-w-[120px]">
                      {user?.email ?? ''}
                    </span>
                  </div>
                  {/* Caret */}
                  <svg
                    className={`hidden sm:block w-3.5 h-3.5 text-stone-400 transition-transform duration-200 flex-shrink-0
                              ${dropdownOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                  >
                    <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-44 sm:w-48 bg-white border border-stone-200
                                rounded-xl shadow-lg py-1 z-50 animate-fade-in">
                    <div className="px-3 py-2 border-b border-stone-100">
                      <p className="text-xs font-bold text-stone-800 truncate">
                        {user?.name ?? 'Người dùng'}
                      </p>
                      <p className="text-[10px] text-stone-500 truncate">
                        {user?.email ?? ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold
                               text-stone-600 hover:bg-stone-50 hover:text-[#6d1844] transition-colors text-left cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#6d1844] text-white hover:bg-[#5a1238] transition-colors shadow-sm"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Modal Bảng Vinh Danh khi bấm từ Header */}
      <LeaderboardModal
        isOpen={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
      />
    </>
  );
}
