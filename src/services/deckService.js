import { supabase } from '../lib/supabase.js';

/**
 * Lấy danh sách toàn bộ decks từ bảng public.decks
 * @returns {Promise<Array>} Danh sách các deck
 */
export async function getDecks() {
  const { data, error } = await supabase
    .from('decks')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Lỗi khi truy vấn public.decks:', error);
    throw error;
  }

  return data || [];
}
