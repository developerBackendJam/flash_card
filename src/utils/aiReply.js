/**
 * Mock AI response generator
 * Tách logic ra khỏi component để dễ test & thay bằng API call thật sau này
 *
 * @param {string} text   - User message text
 * @param {object} card   - Current flashcard object
 * @returns {string}      - AI reply string
 */
export function generateAIReply(text, card) {
  const lower = text.toLowerCase();
  const word = card?.front ?? card?.word ?? 'từ này';
  const ipa = card?.pronunciation ?? card?.ipa ?? '?';
  const partOfSpeech = card?.part_of_speech ?? card?.partOfSpeech ?? 'từ vựng';
  const meaning = card?.meaning ?? '';
  const exampleEn = card?.example_sentence ?? card?.exampleEn ?? 'This is a great example.';

  let synonyms = 'tương đương';
  if (Array.isArray(card?.synonyms)) {
    synonyms = card.synonyms.join(', ');
  } else if (typeof card?.synonyms === 'string') {
    synonyms = card.synonyms;
  }

  if (lower.includes('ví dụ') || lower.includes('câu')) {
    return (
      `Dưới đây là 3 câu ví dụ giao tiếp với "${word}":\n` +
      `1. "${exampleEn}"\n` +
      `2. "Everyone admired how ${word} the project turned out."\n` +
      `3. "Could you explain this in a more ${word} and simple way?"`
    );
  }

  if (lower.includes('phân biệt') || lower.includes('khác')) {
    return (
      `Về sắc thái của "${word}":\n` +
      `• "${word}": dùng chỉ phẩm chất sâu sắc, hài hòa tự nhiên.\n` +
      `• Các từ đồng nghĩa (${synonyms}): thường mang sắc thái cường điệu hoặc nhấn mạnh khía cạnh cụ thể hơn.`
    );
  }

  if (lower.includes('phát âm') || lower.includes('chuẩn')) {
    return (
      `Hướng dẫn phát âm "${word}":\n` +
      `Phiên âm IPA là ${ipa}.\n` +
      `Hãy chú ý trọng âm chính và bật rõ các phụ âm cuối. ` +
      `Bạn có thể nhấn vào biểu tượng loa trên thẻ để nghe mẫu phát âm trực tiếp nhé!`
    );
  }

  return (
    `Về câu hỏi của bạn cho từ "${word}": ` +
    `"${word}" thuộc loại ${partOfSpeech}. ` +
    `Nghĩa chính là: "${meaning}". ` +
    `Bạn có muốn luyện thêm bài tập đặt câu không?`
  );
}
