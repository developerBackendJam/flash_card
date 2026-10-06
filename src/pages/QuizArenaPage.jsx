import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { playPronunciation } from '../utils/audioHelper';
import {
  generate30QuizQuestions,
  calculateQuestionScore,
  saveLeaderboardEntry,
} from '../services/quizService';
import LeaderboardModal from '../components/arena/LeaderboardModal';

const QUESTION_TIMER_SECONDS = 15;

export default function QuizArenaPage() {
  const navigate = useNavigate();

  // Trạng thái chung: 'idle' (sảnh chờ), 'playing' (đang thi), 'finished' (kết thúc)
  const [gameState, setGameState] = useState('idle');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Điểm số & chỉ số thi đấu
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [earnedFeedback, setEarnedFeedback] = useState(null);

  // Đồng hồ bấm giờ
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIMER_SECONDS);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);

  // Lựa chọn của người dùng trong câu hỏi hiện tại
  const [selectedKey, setSelectedKey] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Thông tin người dùng hiện tại
  const [currentUser, setCurrentUser] = useState(null);
  const [finalRank, setFinalRank] = useState(null);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const timerRef = useRef(null);
  const totalTimerRef = useRef(null);

  // Lấy user đăng nhập hiện tại
  useEffect(() => {
    async function fetchUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Thí sinh';
          setCurrentUser({
            name,
            email: user.email,
          });
        }
      } catch (e) {
        console.warn('Lỗi lấy user:', e);
      }
    }
    fetchUser();
  }, []);

  // Bắt đầu cuộc thi
  const startQuiz = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const generatedQuestions = await generate30QuizQuestions();
      setQuestions(generatedQuestions);
      setCurrentIndex(0);
      setScore(0);
      setCombo(0);
      setMaxCombo(0);
      setCorrectCount(0);
      setTotalTimeSpent(0);
      setTimeLeft(QUESTION_TIMER_SECONDS);
      setSelectedKey(null);
      setIsAnswered(false);
      setGameState('playing');
    } catch (err) {
      console.error('Lỗi khi sinh câu hỏi:', err);
      setErrorMsg('Không thể khởi tạo bài thi. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  // Đồng hồ tổng thời gian làm bài
  useEffect(() => {
    if (gameState === 'playing') {
      totalTimerRef.current = setInterval(() => {
        setTotalTimeSpent((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(totalTimerRef.current);
    }

    return () => clearInterval(totalTimerRef.current);
  }, [gameState]);

  // Xử lý chuyển câu kế tiếp hoặc kết thúc bài thi
  const goToNextQuestion = useCallback(() => {
    clearInterval(timerRef.current);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setTimeLeft(QUESTION_TIMER_SECONDS);
      setSelectedKey(null);
      setIsAnswered(false);
      setEarnedFeedback(null);
    } else {
      // Đã xong 30 câu -> Kết thúc bài thi
      setGameState('finished');
    }
  }, [currentIndex, questions.length]);

  // Xử lý chọn đáp án
  const handleSelectOption = useCallback(
    (key) => {
      if (isAnswered || gameState !== 'playing') return;

      clearInterval(timerRef.current);
      setSelectedKey(key);
      setIsAnswered(true);

      const currentQ = questions[currentIndex];
      const isCorrect = key === currentQ.correctAnswerKey;

      if (isCorrect) {
        const newCombo = combo + 1;
        setCombo(newCombo);
        setMaxCombo((m) => Math.max(m, newCombo));
        setCorrectCount((c) => c + 1);

        const scoreData = calculateQuestionScore(true, timeLeft, newCombo);
        setScore((prev) => prev + scoreData.earnedPoints);
        setEarnedFeedback({
          text: `+${scoreData.earnedPoints}đ`,
          detail: `Tốc độ: +${scoreData.speedBonus}đ | Combo: +${scoreData.streakBonus}đ`,
          isCorrect: true,
        });
      } else {
        setCombo(0);
        setEarnedFeedback({
          text: `Sai rồi!`,
          detail: `Đáp án đúng là: ${currentQ.correctAnswerKey}. ${currentQ.correctMeaning}`,
          isCorrect: false,
        });
      }

      // Tự động chuyển câu sau 1.5s
      setTimeout(() => {
        goToNextQuestion();
      }, 1500);
    },
    [isAnswered, gameState, questions, currentIndex, combo, timeLeft, goToNextQuestion]
  );

  // Đồng hồ đếm ngược từng câu (15s)
  useEffect(() => {
    if (gameState !== 'playing' || isAnswered) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          // Hết giờ -> tự động coi như trả lời sai
          handleSelectOption(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [gameState, isAnswered, handleSelectOption]);

  // Phím tắt bàn phím A, B, C, D và 1, 2, 3, 4
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing' || isAnswered) return;
      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key)) {
        handleSelectOption(key);
      } else if (key === '1') handleSelectOption('A');
      else if (key === '2') handleSelectOption('B');
      else if (key === '3') handleSelectOption('C');
      else if (key === '4') handleSelectOption('D');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, isAnswered, handleSelectOption]);

  // Khi hoàn thành 30 câu -> lưu vào Bảng xếp hạng vinh danh
  useEffect(() => {
    if (gameState === 'finished' && questions.length > 0) {
      const accuracy = Math.round((correctCount / questions.length) * 100);
      const res = saveLeaderboardEntry({
        name: currentUser?.name || 'Thí sinh',
        score: score,
        accuracy: accuracy,
        correctCount: correctCount,
        totalQuestions: questions.length,
        timeSpent: totalTimeSpent,
      });

      setFinalRank(res.playerRank);
    }
  }, [gameState, questions.length, correctCount, score, totalTimeSpent, currentUser]);

  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-[#faf5f0] text-stone-900 flex flex-col font-sans selection:bg-[#6d1844] selection:text-white">
      {/* ── HEADER CUỘC THI ──────────────────────────── */}
      <header className="bg-white border-b border-stone-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-[#6d1844] px-2.5 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
            title="Quay lại học Flashcard"
            type="button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline">Quay lại học</span>
          </button>

          <div className="h-4 w-px bg-stone-200 hidden sm:block"></div>

          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-stone-900">
              Đấu Trường <span className="text-[#6d1844]">LexiCard</span>
            </span>
          </div>
        </div>

        {/* Nút xem BXH */}
        <button
          onClick={() => setIsLeaderboardOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all shadow-xs cursor-pointer"
          type="button"
        >
          <span>🏅</span>
          <span className="hidden sm:inline">Bảng Vinh Danh</span>
          <span className="sm:hidden">BXH</span>
        </button>
      </header>

      {/* ── NỘI DUNG CHÍNH THEO TRẠNG THÁI ───────────── */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col justify-center">

        {/* 1. MÀN HÌNH SẢNH CHỜ (IDLE) */}
        {gameState === 'idle' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-xl text-center space-y-6 animate-fade-in max-w-2xl mx-auto w-full">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#6d1844] to-[#99225e] text-white flex items-center justify-center text-4xl mx-auto shadow-lg shadow-[#6d1844]/25 ring-4 ring-[#f5ebe0]">
              ⚡
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                Cuộc Thi Trắc Nghiệm 30 Câu
              </h1>
              <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                Thử thách phản xạ từ vựng qua 30 câu hỏi đa chủ đề. Trả lời càng nhanh, điểm thưởng và thứ hạng trên Bảng Vinh Danh càng cao!
              </p>
            </div>

            {/* Thể lệ nhanh */}
            <div className="grid grid-cols-3 gap-3 text-left p-4 rounded-2xl bg-[#faf5f0] border border-stone-200/80 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-[#6d1844] block">📝 30 Câu hỏi</span>
                <span className="text-stone-500 text-[11px] block">Bao quát toàn bộ 10 chủ đề</span>
              </div>
              <div className="space-y-1 border-x border-stone-200 px-3">
                <span className="font-bold text-amber-700 block">⏱️ 15s / Câu</span>
                <span className="text-stone-500 text-[11px] block">Càng nhanh càng nhiều điểm</span>
              </div>
              <div className="space-y-1 pl-1">
                <span className="font-bold text-emerald-700 block">🔥 Combo Thưởng</span>
                <span className="text-stone-500 text-[11px] block">Đúng liên tiếp nhân thêm điểm</span>
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200 font-medium">
                {errorMsg}
              </p>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button
                onClick={startQuiz}
                disabled={isLoading}
                type="button"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#6d1844] to-[#882156] hover:from-[#5a1238] hover:to-[#6d1844] text-white font-extrabold text-sm shadow-xl shadow-[#6d1844]/25 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    <span>Đang khởi tạo đề thi...</span>
                  </>
                ) : (
                  <>
                    <span>🚀 BẮT ĐẦU TRANH TÀI NGAY</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsLeaderboardOpen(true)}
                type="button"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>🏆 Xem Bảng Xếp Hạng</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. MÀN HÌNH ĐANG THI (PLAYING) */}
        {gameState === 'playing' && currentQ && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            {/* Thanh thông tin trận đấu (Tiến độ, Timer, Điểm, Combo) */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-sm flex items-center justify-between gap-3">
              {/* Câu hỏi số */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                  Tiến độ bài thi
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl sm:text-2xl font-black text-[#6d1844]">
                    {currentIndex + 1}
                  </span>
                  <span className="text-xs font-bold text-stone-400">/ 30</span>
                </div>
              </div>

              {/* Bộ đếm thời gian tròn */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-sm transition-all border-2 ${
                    timeLeft <= 4
                      ? 'bg-rose-50 border-rose-500 text-rose-600 animate-pulse scale-110'
                      : timeLeft <= 8
                      ? 'bg-amber-50 border-amber-500 text-amber-700'
                      : 'bg-emerald-50 border-emerald-500 text-emerald-700'
                  }`}
                >
                  {timeLeft}s
                </div>
              </div>

              {/* Điểm số & Combo */}
              <div className="text-right space-y-1">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                  Điểm tích lũy
                </span>
                <div className="flex items-center justify-end gap-2">
                  {combo >= 2 && (
                    <span className="text-[10px] font-extrabold bg-gradient-to-r from-orange-500 to-amber-500 text-white px-2 py-0.5 rounded-full animate-bounce shadow-xs">
                      🔥 x{combo}
                    </span>
                  )}
                  <span className="text-xl sm:text-2xl font-black text-stone-900">
                    {score.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Thanh tiến trình chạy */}
            <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#6d1844] via-[#99225e] to-amber-500 transition-all duration-300 rounded-full"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Thẻ Flashcard Từ Vựng Trọng Tâm */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-md text-center space-y-4 relative overflow-hidden">
              {/* Badge loại từ */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                  {currentQ.partOfSpeech || 'Từ vựng'}
                </span>

                {/* Loa phát âm */}
                <button
                  onClick={() => playPronunciation(currentQ.word)}
                  className="w-9 h-9 rounded-full bg-stone-100 hover:bg-[#6d1844] text-stone-600 hover:text-white flex items-center justify-center transition-all cursor-pointer focus:outline-none"
                  title="Phát âm từ vựng"
                  type="button"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {/* Từ tiếng Anh */}
              <div className="py-2">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight text-stone-900">
                  {currentQ.word}
                </h2>
                {currentQ.ipa && (
                  <p className="text-sm sm:text-base font-medium text-stone-400 mt-1 font-mono">
                    {currentQ.ipa}
                  </p>
                )}
              </div>

              <p className="text-xs text-stone-500 font-semibold pt-1 border-t border-stone-100">
                👉 Chọn nghĩa tiếng Việt chính xác nhất:
              </p>
            </div>

            {/* Feedback điểm pop-up sau khi chọn */}
            {earnedFeedback && (
              <div
                className={`p-3 rounded-2xl border text-center transition-all animate-bounce ${
                  earnedFeedback.isCorrect
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-rose-50 border-rose-300 text-rose-800'
                }`}
              >
                <span className="font-extrabold text-sm block">{earnedFeedback.text}</span>
                <span className="text-[11px] text-stone-600 block">{earnedFeedback.detail}</span>
              </div>
            )}

            {/* 4 Lựa chọn A, B, C, D */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {currentQ.options.map((option) => {
                let buttonStyle = 'bg-white border-stone-200 text-stone-800 hover:border-[#6d1844] hover:bg-stone-50';

                if (isAnswered) {
                  if (option.isCorrect) {
                    buttonStyle = 'bg-emerald-500 border-emerald-600 text-white shadow-lg shadow-emerald-500/25 scale-[1.01]';
                  } else if (selectedKey === option.key && !option.isCorrect) {
                    buttonStyle = 'bg-rose-500 border-rose-600 text-white shadow-lg shadow-rose-500/25';
                  } else {
                    buttonStyle = 'bg-stone-100 border-stone-200 text-stone-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={option.key}
                    onClick={() => handleSelectOption(option.key)}
                    disabled={isAnswered}
                    type="button"
                    className={`p-4 sm:p-4.5 rounded-2xl border-2 text-left transition-all duration-200 flex items-center gap-3 shadow-xs cursor-pointer focus:outline-none ${buttonStyle}`}
                  >
                    <span
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-xs flex-shrink-0 transition-colors ${
                        isAnswered && option.isCorrect
                          ? 'bg-white text-emerald-700'
                          : isAnswered && selectedKey === option.key
                          ? 'bg-white text-rose-700'
                          : 'bg-[#faf5f0] text-stone-700 border border-stone-200'
                      }`}
                    >
                      {option.key}
                    </span>
                    <span className="font-bold text-xs sm:text-sm leading-snug flex-1">
                      {option.text}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Dòng hướng dẫn phím tắt */}
            <p className="text-center text-[11px] text-stone-400 font-medium">
              💡 Mẹo: Bạn có thể nhấn phím <kbd className="px-1.5 py-0.5 rounded bg-stone-200 font-mono text-[10px]">A</kbd>, <kbd className="px-1.5 py-0.5 rounded bg-stone-200 font-mono text-[10px]">B</kbd>, <kbd className="px-1.5 py-0.5 rounded bg-stone-200 font-mono text-[10px]">C</kbd>, <kbd className="px-1.5 py-0.5 rounded bg-stone-200 font-mono text-[10px]">D</kbd> trên bàn phím để trả lời nhanh.
            </p>
          </div>
        )}

        {/* 3. MÀN HÌNH HOÀN THÀNH (FINISHED) */}
        {gameState === 'finished' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-2xl text-center space-y-6 animate-scale-up max-w-2xl mx-auto w-full">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-200 text-stone-900 flex items-center justify-center text-4xl mx-auto shadow-lg shadow-amber-400/30 ring-4 ring-amber-100 animate-bounce">
              🏆
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-block">
                Hoàn Thành Xuất Sắc
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
                Chúc Mừng Bạn Đã Về Đích!
              </h1>
              {finalRank && (
                <p className="text-sm font-bold text-[#6d1844]">
                  🎉 Bạn đang nắm giữ vị trí <span className="underline decoration-2">Hạng #{finalRank}</span> trên Bảng Vinh Danh Toàn Quốc!
                </p>
              )}
            </div>

            {/* Bảng thống kê chi tiết */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#faf5f0] border border-stone-200 text-left">
              <div className="space-y-1">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Tổng Điểm</span>
                <span className="text-lg sm:text-xl font-black text-[#6d1844] block">
                  {score.toLocaleString()}
                </span>
                <span className="text-[10px] text-stone-400">/ 3,000 tối đa</span>
              </div>

              <div className="space-y-1 border-l border-stone-200/80 pl-3">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Số Câu Đúng</span>
                <span className="text-lg sm:text-xl font-black text-emerald-700 block">
                  {correctCount} / 30
                </span>
                <span className="text-[10px] text-stone-400">
                  {Math.round((correctCount / 30) * 100)}% chính xác
                </span>
              </div>

              <div className="space-y-1 border-l-0 sm:border-l border-stone-200/80 pl-0 sm:pl-3">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Chuỗi Đúng Max</span>
                <span className="text-lg sm:text-xl font-black text-orange-600 block">
                  🔥 {maxCombo} câu
                </span>
                <span className="text-[10px] text-stone-400">Combo đỉnh cao</span>
              </div>

              <div className="space-y-1 border-l border-stone-200/80 pl-3">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Thời Gian</span>
                <span className="text-lg sm:text-xl font-black text-stone-800 block">
                  {totalTimeSpent}s
                </span>
                <span className="text-[10px] text-stone-400">Tổng tốc độ</span>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button
                onClick={() => setIsLeaderboardOpen(true)}
                type="button"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>🏅 Xem Bảng Xếp Hạng</span>
              </button>

              <button
                onClick={startQuiz}
                type="button"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#6d1844] hover:bg-[#5a1238] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>🔄 Thi Lại Đề Mới</span>
              </button>

              <button
                onClick={() => navigate('/')}
                type="button"
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                <span>← Về Học Từ</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* MODAL BẢNG XẾP HẠNG VINH DANH */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        currentResult={{
          score,
          correctCount,
          timeSpent: totalTimeSpent,
        }}
      />
    </div>
  );
}
