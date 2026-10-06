import React, { useState, useEffect } from 'react';
import { getLeaderboard } from '../../services/quizService';

export default function LeaderboardModal({ isOpen, onClose, currentResult = null }) {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setLeaderboard(getLeaderboard());
    }
  }, [isOpen, currentResult]);

  if (!isOpen) return null;

  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];
  const others = leaderboard.slice(3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#5a1238] via-[#6d1844] to-[#882156] text-white p-5 sm:p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl shadow-inner">
                🏆
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  Bảng Vinh Danh
                  <span className="text-[11px] font-semibold bg-amber-400 text-stone-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Toàn Quốc
                  </span>
                </h2>
                <p className="text-xs text-[#f5ebe0]/80 mt-0.5">
                  Top cao thủ đấu trường 30 câu hỏi từ vựng
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors focus:outline-none"
              title="Đóng"
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Top 3 Podium (Bục vinh danh) */}
          {leaderboard.length >= 3 && (
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-6 pt-3 items-end text-center">
              {/* Top 2 */}
              <div className="flex flex-col items-center bg-white/10 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-white/15">
                <div className="relative">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-300 text-slate-800 font-bold flex items-center justify-center text-sm shadow-md ring-2 ring-slate-200">
                    🥈
                  </div>
                  <span className="absolute -bottom-1 -right-1 bg-slate-200 text-slate-900 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                    #2
                  </span>
                </div>
                <span className="text-xs font-bold text-white mt-2 truncate max-w-[90px]">
                  {top2?.name}
                </span>
                <span className="text-xs font-black text-amber-300 mt-0.5">
                  {top2?.score.toLocaleString()}đ
                </span>
                <span className="text-[10px] text-stone-300">
                  {top2?.accuracy}% đúng
                </span>
              </div>

              {/* Top 1 - Champion */}
              <div className="flex flex-col items-center bg-gradient-to-b from-amber-400/25 to-amber-500/10 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 border border-amber-300/40 relative -mt-3 shadow-lg">
                <div className="absolute -top-3 text-lg animate-bounce">👑</div>
                <div className="relative mt-1">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-amber-950 font-bold flex items-center justify-center text-lg shadow-lg ring-3 ring-amber-300">
                    🥇
                  </div>
                  <span className="absolute -bottom-1 -right-1 bg-amber-400 text-stone-950 text-[10px] font-black px-1.5 py-0.2 rounded-full shadow">
                    #1
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-extrabold text-white mt-2 truncate max-w-[100px]">
                  {top1?.name}
                </span>
                <span className="text-sm font-black text-yellow-300 mt-0.5">
                  {top1?.score.toLocaleString()}đ
                </span>
                <span className="text-[10px] text-amber-200 font-medium">
                  {top1?.accuracy}% đúng ({top1?.timeSpent}s)
                </span>
              </div>

              {/* Top 3 */}
              <div className="flex flex-col items-center bg-white/10 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-white/15">
                <div className="relative">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-700 text-amber-100 font-bold flex items-center justify-center text-sm shadow-md ring-2 ring-amber-600">
                    🥉
                  </div>
                  <span className="absolute -bottom-1 -right-1 bg-amber-700 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                    #3
                  </span>
                </div>
                <span className="text-xs font-bold text-white mt-2 truncate max-w-[90px]">
                  {top3?.name}
                </span>
                <span className="text-xs font-black text-amber-300 mt-0.5">
                  {top3?.score.toLocaleString()}đ
                </span>
                <span className="text-[10px] text-stone-300">
                  {top3?.accuracy}% đúng
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable List for #4 onwards */}
        <div className="p-4 sm:p-5 overflow-y-auto max-h-[340px] space-y-2 bg-stone-50/60 text-xs">
          {others.length > 0 ? (
            others.map((item, index) => {
              const rank = index + 4;
              const isCurrentUser = currentResult && item.id === currentResult.id;

              return (
                <div
                  key={item.id || index}
                  className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                    isCurrentUser
                      ? 'bg-amber-50 border-2 border-amber-400 shadow-sm'
                      : 'bg-white border border-stone-200/80 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 text-center font-extrabold text-stone-400 text-xs">
                      #{rank}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-300 flex items-center justify-center text-xs font-bold text-stone-700 flex-shrink-0">
                      {item.name?.[0] || 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-stone-800 text-xs truncate max-w-[150px] sm:max-w-[200px]">
                        {item.name}
                        {isCurrentUser && (
                          <span className="ml-1.5 text-[10px] bg-[#6d1844] text-white px-1.5 py-0.2 rounded font-semibold">
                            Bạn
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-stone-400">
                        {item.date} • {item.accuracy}% đúng ({item.timeSpent}s)
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="font-black text-sm text-[#6d1844]">
                      {item.score.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-stone-400 block font-medium">điểm</span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-stone-400 py-6">Chưa có thêm người chơi khác.</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-white border-t border-stone-200 flex items-center justify-between gap-3">
          <span className="text-xs text-stone-500 font-medium hidden sm:inline">
            💡 Mỗi lượt thi 30 câu hỏi tối đa 3,000 điểm.
          </span>
          <button
            onClick={onClose}
            type="button"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#6d1844] hover:bg-[#5a1238] text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ml-auto"
          >
            Đã hiểu & Tiếp tục
          </button>
        </div>
      </div>
    </div>
  );
}
