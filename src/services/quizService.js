import { supabase } from '../lib/supabase';
import { mockFlashcards } from '../data/mockData';

const LEADERBOARD_STORAGE_KEY = 'lexicard_quiz_leaderboard';

// Dữ liệu mẫu bảng xếp hạng ban đầu để giao diện sống động và có tính cạnh tranh
const DEFAULT_LEADERBOARD = [
  { id: 'lb-1', name: 'Minh Thư (IELTS 8.0)', score: 2890, accuracy: 97, correctCount: 29, totalQuestions: 30, timeSpent: 145, date: '05/10/2026' },
  { id: 'lb-2', name: 'Trần Tuấn Anh', score: 2750, accuracy: 93, correctCount: 28, totalQuestions: 30, timeSpent: 168, date: '05/10/2026' },
  { id: 'lb-3', name: 'Lê Hoàng Nam', score: 2620, accuracy: 90, correctCount: 27, totalQuestions: 30, timeSpent: 182, date: '04/10/2026' },
  { id: 'lb-4', name: 'Phương Linh', score: 2480, accuracy: 87, correctCount: 26, totalQuestions: 30, timeSpent: 210, date: '04/10/2026' },
  { id: 'lb-5', name: 'Quốc Bảo', score: 2310, accuracy: 83, correctCount: 25, totalQuestions: 30, timeSpent: 225, date: '03/10/2026' },
];

/**
 * Lấy toàn bộ thẻ từ vựng từ Supabase (hoặc mockData dự phòng)
 */
export async function getAllQuizCards() {
  try {
    const { data: cards, error } = await supabase
      .from('flashcards')
      .select('id, front, meaning, pronunciation, part_of_speech, example_sentence, deck_id');

    if (!error && cards && cards.length >= 30) {
      return cards;
    }
  } catch (err) {
    console.warn('Không thể tải từ Supabase, chuyển sang kho từ vựng dự phòng:', err);
  }

  // Dự phòng nếu không kết nối được DB
  const fallbackList = [];
  Object.values(mockFlashcards).forEach((arr) => {
    arr.forEach((c) => {
      fallbackList.push({
        id: c.id,
        front: c.word,
        meaning: c.meaning,
        pronunciation: c.ipa,
        part_of_speech: c.partOfSpeech,
        example_sentence: c.exampleEn,
      });
    });
  });

  return fallbackList;
}

/**
 * Trộn mảng ngẫu nhiên (Fisher-Yates shuffle)
 */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Sinh bộ 30 câu hỏi trắc nghiệm A, B, C, D phủ sóng đa chủ đề
 */
export async function generate30QuizQuestions() {
  const allCards = await getAllQuizCards();

  if (!allCards || allCards.length < 4) {
    throw new Error('Không đủ từ vựng để tạo bài thi (cần ít nhất 4 từ).');
  }

  // Xáo trộn toàn bộ kho từ vựng
  const shuffledCards = shuffleArray(allCards);
  // Lấy tối đa 30 thẻ làm câu hỏi chính
  const targetCards = shuffledCards.slice(0, Math.min(30, shuffledCards.length));

  const questions = targetCards.map((card, index) => {
    const correctMeaning = card.meaning?.trim();

    // Lấy 3 đáp án nhiễu từ các thẻ khác có nghĩa khác
    const otherCards = allCards.filter(
      (c) => c.id !== card.id && c.meaning && c.meaning.trim() !== correctMeaning
    );
    const shuffledOthers = shuffleArray(otherCards);
    const distractors = shuffledOthers.slice(0, 3).map((c) => c.meaning.trim());

    // Nếu không đủ đáp án nhiễu, fallback tạm
    while (distractors.length < 3) {
      distractors.push(`Đáp án phụ ${distractors.length + 1}`);
    }

    // Gộp đáp án đúng + 3 đáp án nhiễu và xáo trộn vị trí
    const optionTexts = shuffleArray([correctMeaning, ...distractors]);

    const optionKeys = ['A', 'B', 'C', 'D'];
    const options = optionTexts.map((text, i) => ({
      key: optionKeys[i],
      text: text,
      isCorrect: text === correctMeaning,
    }));

    const correctOption = options.find((opt) => opt.isCorrect);

    return {
      index: index + 1,
      id: card.id,
      word: card.front,
      ipa: card.pronunciation || '',
      partOfSpeech: card.part_of_speech || '',
      exampleSentence: card.example_sentence || '',
      correctAnswerKey: correctOption ? correctOption.key : 'A',
      correctMeaning: correctMeaning,
      options: options,
    };
  });

  return questions;
}

/**
 * Tính điểm cho 1 câu hỏi
 * @param {boolean} isCorrect - Có đúng hay không
 * @param {number} timeLeft - Số giây còn lại (tối đa 15s)
 * @param {number} streak - Chuỗi đúng liên tiếp hiện tại
 * @returns {{ earnedPoints: number, speedBonus: number, streakBonus: number }}
 */
export function calculateQuestionScore(isCorrect, timeLeft, streak) {
  if (!isCorrect) {
    return { earnedPoints: 0, speedBonus: 0, streakBonus: 0 };
  }

  const basePoints = 50;
  // Trả lời càng nhanh càng nhiều điểm (tối đa 30đ khi còn 15s)
  const speedBonus = Math.max(0, Math.round((timeLeft / 15) * 30));
  // Chuỗi trả lời đúng liên tiếp (+5đ mỗi mốc streak, tối đa 20đ)
  const streakBonus = Math.min(streak * 5, 20);

  const earnedPoints = basePoints + speedBonus + streakBonus;

  return {
    earnedPoints,
    speedBonus,
    streakBonus,
  };
}

/**
 * Lấy danh sách bảng xếp hạng từ localStorage
 */
export function getLeaderboard() {
  try {
    const raw = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a, b) => b.score - a.score || a.timeSpent - b.timeSpent);
      }
    }
  } catch (e) {
    console.warn('Lỗi đọc bảng xếp hạng:', e);
  }

  // Khởi tạo bảng xếp hạng mẫu ban đầu
  try {
    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(DEFAULT_LEADERBOARD));
  } catch {}

  return DEFAULT_LEADERBOARD;
}

/**
 * Lưu kết quả thi vào bảng xếp hạng vinh danh
 */
export function saveLeaderboardEntry({ name, score, accuracy, correctCount, totalQuestions, timeSpent }) {
  const currentList = getLeaderboard();
  const today = new Date();
  const dateFormatted = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

  const newEntry = {
    id: `lb-${Date.now()}`,
    name: name || 'Thí sinh ẩn danh',
    score: score,
    accuracy: Math.round(accuracy),
    correctCount: correctCount,
    totalQuestions: totalQuestions || 30,
    timeSpent: timeSpent,
    date: dateFormatted,
  };

  const updatedList = [...currentList, newEntry].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.timeSpent - b.timeSpent; // Cùng điểm ai nhanh hơn xếp trước
  });

  // Giữ lại top 20 người điểm cao nhất
  const top20 = updatedList.slice(0, 20);

  try {
    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(top20));
  } catch (e) {
    console.error('Không thể lưu kết quả BXH:', e);
  }

  // Tìm thứ hạng của người chơi vừa thi xong
  const playerRank = top20.findIndex((item) => item.id === newEntry.id) + 1;

  return {
    leaderboard: top20,
    playerRank: playerRank > 0 ? playerRank : null,
  };
}
