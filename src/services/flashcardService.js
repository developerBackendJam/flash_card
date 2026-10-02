import { supabase } from '../lib/supabase.js';

/**
 * Lấy danh sách flashcards theo deck_id từ bảng public.flashcards
 * @param {string|number} deckId - ID của deck được chọn
 * @returns {Promise<Array>} Danh sách các flashcard thuộc deck
 */
export async function getFlashcardsByDeck(deckId) {
  if (!deckId) return [];

  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('deck_id', deckId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error(`Lỗi khi truy vấn public.flashcards cho deckId ${deckId}:`, error);
    throw error;
  }

  return data || [];
}
