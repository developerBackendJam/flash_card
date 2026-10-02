import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/layout/Header';
import CategoryNav from '../components/flashcard/CategoryNav';
import Progress from '../components/flashcard/Progress';
import Flashcard from '../components/flashcard/Flashcard';
import FlashcardActions from '../components/flashcard/FlashcardActions';
import Footer from '../components/layout/Footer';
import AIChatbotWidget from '../components/AIChatbotWidget';
import { getDecks } from '../services/deckService';
import { getFlashcardsByDeck } from '../services/flashcardService';
import { supabase } from '../lib/supabase';
import { getUserStreak } from '../utils/streakHelper';

export default function StudyPage() {
  const [decks, setDecks] = useState([]);
  const [selectedDeckId, setSelectedDeckId] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [statusMap, setStatusMap] = useState({});

  const [isLoadingDecks, setIsLoadingDecks] = useState(true);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  /* ── 1. Quản lý Authentication ─────────────────────── */
  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const fullName = user.user_metadata?.full_name;
          const email = user.email;
          const displayName = fullName || email?.split('@')[0] || 'Người dùng';
          const initials = (fullName || email || 'ND')
            .split(' ')
            .map((w) => w[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();

          setCurrentUser({
            id: user.id,
            name: displayName,
            email: email,
            initials: initials || 'ND',
            streak: getUserStreak(user.id),
          });
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Lỗi khi lấy thông tin người dùng:', err);
      }
    }

    loadUser();

    // Lắng nghe thay đổi trạng thái đăng nhập/đăng xuất
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user;
        const fullName = u.user_metadata?.full_name;
        const email = u.email;
        const displayName = fullName || email?.split('@')[0] || 'Người dùng';
        const initials = (fullName || email || 'ND')
          .split(' ')
          .map((w) => w[0])
          .join('')
          .substring(0, 2)
          .toUpperCase();

        setCurrentUser({
          id: u.id,
          name: displayName,
          email: email,
          initials: initials || 'ND',
          streak: getUserStreak(u.id),
        });
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  /* ── 2. Tải danh sách decks từ Supabase ───────────── */
  const fetchDecksList = useCallback(async () => {
    setIsLoadingDecks(true);
    setErrorMessage(null);
    try {
      const data = await getDecks();
      setDecks(data || []);
      if (data && data.length > 0) {
        // Tự động chọn deck đầu tiên nếu chưa có deck nào được chọn
        setSelectedDeckId((prev) => prev ?? data[0].id);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách decks:', err);
      setErrorMessage(
        err.message?.includes('permission denied')
          ? 'Chưa có quyền truy cập dữ liệu hoặc cần đăng nhập để xem danh sách chủ đề.'
          : 'Không thể tải danh sách chủ đề.'
      );
    } finally {
      setIsLoadingDecks(false);
    }
  }, []);

  useEffect(() => {
    fetchDecksList();
  }, [fetchDecksList]);

  /* ── 3. Tải flashcards theo selectedDeckId ────────── */
  const fetchFlashcardsList = useCallback(async (deckId) => {
    if (!deckId) {
      setFlashcards([]);
      return;
    }

    setIsLoadingCards(true);
    setErrorMessage(null);
    try {
      const data = await getFlashcardsByDeck(deckId);
      setFlashcards(data || []);
      // Reset currentCardIndex về 0 và lật thẻ về mặt trước khi đổi deck
      setCurrentCardIndex(0);
      setIsFlipped(false);
    } catch (err) {
      console.error('Lỗi khi tải flashcards:', err);
      setErrorMessage('Không thể tải dữ liệu từ vựng.');
    } finally {
      setIsLoadingCards(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDeckId) {
      fetchFlashcardsList(selectedDeckId);
    }
  }, [selectedDeckId, fetchFlashcardsList]);

  /* ── 4. Flashcard & Navigation ─────────────────────── */
  const total = flashcards.length;
  // Không truy cập flashcards[0] khi array rỗng
  const currentCard = total > 0 ? flashcards[currentCardIndex] : null;

  const cardStatus = currentCard
    ? (statusMap[currentCard.id] ?? {
        learned: currentCard.learned ?? false,
        review: currentCard.review ?? false,
      })
    : { learned: false, review: false };

  const goNext = useCallback(() => {
    if (currentCardIndex < total - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentCardIndex((i) => i + 1), 40);
    }
  }, [currentCardIndex, total]);

  const goPrev = useCallback(() => {
    if (currentCardIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentCardIndex((i) => i - 1), 40);
    }
  }, [currentCardIndex]);

  const flipCard = useCallback(() => {
    if (total > 0) {
      setIsFlipped((f) => !f);
    }
  }, [total]);

  const handleSelectDeck = (deckId) => {
    if (deckId !== selectedDeckId) {
      setSelectedDeckId(deckId);
      setCurrentCardIndex(0);
      setIsFlipped(false);
    }
  };

  const handleMarkReview = () => {
    if (!currentCard) return;
    setStatusMap((prev) => ({
      ...prev,
      [currentCard.id]: { review: !cardStatus.review, learned: false },
    }));
  };

  const handleMarkLearned = () => {
    if (!currentCard) return;
    setStatusMap((prev) => ({
      ...prev,
      [currentCard.id]: { learned: !cardStatus.learned, review: false },
    }));
  };

  /* ── 5. Keyboard shortcuts ─────────────────────────── */
  useEffect(() => {
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        flipCard();
      }
      if (e.code === 'ArrowRight') {
        e.preventDefault();
        goNext();
      }
      if (e.code === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flipCard, goNext, goPrev]);

  const prevWord =
    currentCardIndex > 0 && total > 0
      ? (flashcards[currentCardIndex - 1]?.front ?? flashcards[currentCardIndex - 1]?.word)
      : null;

  const nextWord =
    currentCardIndex < total - 1 && total > 0
      ? (flashcards[currentCardIndex + 1]?.front ?? flashcards[currentCardIndex + 1]?.word)
      : null;

  return (
    <div
      className="
        bg-[#faf8f5] font-sans antialiased text-stone-800
        flex flex-col
        min-h-screen lg:h-screen
        overflow-y-auto lg:overflow-hidden
      "
    >
      {/* ── Header: flex-shrink-0, 56px ─────────────────── */}
      <Header user={currentUser} />

      {/* ── Category nav: sticky, 48px ──────────────────── */}
      <CategoryNav
        categories={decks}
        activeCategoryId={selectedDeckId}
        onSelectCategory={handleSelectDeck}
      />

      {/* ── Main study area ──────────────────────────────── */}
      <main
        className="
          flex-1 min-h-0
          flex flex-col items-center
          px-4 sm:px-6
          py-4 sm:py-5
          overflow-hidden
          w-full max-w-2xl mx-auto
        "
        data-purpose="study-area"
      >
        {/* Progress — hiển thị 1 / 30 hoặc 0 / 0 dựa trên số flashcard thật */}
        <Progress
          current={total > 0 ? currentCardIndex + 1 : 0}
          total={total}
        />

        {/* Flashcard Area — flex-1 fills remaining vertical space */}
        <div className="w-full flex-1 min-h-0 mt-3 flex items-center justify-center">
          {isLoadingCards || isLoadingDecks ? (
            /* Loading State */
            <div className="w-full h-full flex flex-col items-center justify-center bg-white border border-stone-200 shadow-md rounded-2xl p-6 text-center">
              <svg className="w-8 h-8 text-[#6d1844] animate-spin mb-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              <p className="text-stone-600 font-medium text-sm">Đang tải dữ liệu từ vựng...</p>
            </div>
          ) : errorMessage ? (
            /* Error State */
            <div className="w-full h-full flex flex-col items-center justify-center bg-white border border-red-200 shadow-md rounded-2xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-stone-800 font-bold text-base mb-1">Không thể tải dữ liệu từ vựng.</p>
              <p className="text-stone-500 text-xs mb-4 max-w-sm">{errorMessage}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    fetchDecksList();
                    if (selectedDeckId) fetchFlashcardsList(selectedDeckId);
                  }}
                  className="px-4 py-2 bg-[#6d1844] text-white text-xs font-bold rounded-xl hover:bg-[#5a1238] transition-colors cursor-pointer"
                >
                  Thử lại
                </button>
                {!currentUser && (
                  <a
                    href="/login"
                    className="px-4 py-2 bg-stone-100 text-stone-700 text-xs font-bold rounded-xl hover:bg-stone-200 transition-colors"
                  >
                    Đăng nhập
                  </a>
                )}
              </div>
            </div>
          ) : total === 0 ? (
            /* Empty State: Chủ đề này chưa có từ vựng */
            <div className="w-full h-full flex flex-col items-center justify-center bg-white border border-stone-200 shadow-md rounded-2xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#fdf0e6] text-[#6d1844] flex items-center justify-center mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-stone-800 font-bold text-base mb-1">Chủ đề này chưa có từ vựng.</p>
              <p className="text-stone-500 text-xs">Vui lòng chọn một chủ đề khác ở thanh danh mục phía trên.</p>
            </div>
          ) : (
            /* Flashcard chính */
            <Flashcard
              card={currentCard}
              isFlipped={isFlipped}
              onToggleFlip={flipCard}
            />
          )}
        </div>

        {/* Flashcard Actions: evaluation status + navigation */}
        <FlashcardActions
          onMarkReview={handleMarkReview}
          onMarkLearned={handleMarkLearned}
          status={cardStatus}
          onPrev={goPrev}
          onNext={goNext}
          onToggleFlip={flipCard}
          hasPrev={currentCardIndex > 0 && total > 0}
          hasNext={currentCardIndex < total - 1 && total > 0}
          prevWord={prevWord}
          nextWord={nextWord}
        />
      </main>

      {/* ── Footer ───────────────────────────────────────── */}
      <Footer />

      {/* ── Floating AI Chatbot Widget ───────────────────── */}
      <AIChatbotWidget
        currentCard={currentCard}
        userName={currentUser?.name ?? 'Bạn'}
      />
    </div>
  );
}
