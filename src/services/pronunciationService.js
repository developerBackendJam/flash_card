/**
 * Tính toán khoảng cách Levenshtein giữa 2 chuỗi
 */
function levenshteinDistance(s1, s2) {
  const m = s1.length;
  const n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * Tính toán độ tương đồng phần trăm (0 - 100%) giữa từ chuẩn và từ người dùng đọc
 */
export function calculatePronunciationScore(targetWord, spokenText, confidence = 1) {
  if (!targetWord || !spokenText) return 0;

  const target = targetWord.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const spoken = spokenText.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

  if (target === spoken) {
    // Trùng khớp hoàn toàn -> từ 92% - 100% dựa theo confidence thu âm
    return Math.min(100, Math.round(92 + (confidence || 0.8) * 8));
  }

  // Nếu một chuỗi chứa chuỗi kia
  if (target.includes(spoken) || spoken.includes(target)) {
    const ratio = Math.min(target.length, spoken.length) / Math.max(target.length, spoken.length);
    return Math.max(65, Math.round(ratio * 85));
  }

  const distance = levenshteinDistance(target, spoken);
  const maxLen = Math.max(target.length, spoken.length);
  const rawSimilarity = Math.max(0, (1 - distance / maxLen) * 100);

  return Math.min(95, Math.round(rawSimilarity));
}

/**
 * Quy định màu sắc và cấp độ đánh giá dựa trên thang điểm %:
 * - 🔴 Đỏ (< 60%): Cần luyện tập thêm
 * - 🟡 Vàng (60% - 79%): Tạm ổn / Khá tốt
 * - 🟢 Xanh (>= 80%): Xuất sắc / Chuẩn bản xứ
 */
export function getPronunciationLevel(score) {
  if (score < 60) {
    return {
      color: 'red',
      level: 'needs_work',
      label: 'Cần Luyện Tập Thêm',
      badge: '🔴 Chưa chuẩn',
      textColor: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-300',
      ringColor: 'ring-rose-400',
      progressColor: 'bg-rose-500',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      summary: 'Máy nhận diện được từ khác hoặc âm chưa đủ rõ ràng.',
    };
  }

  if (score < 80) {
    return {
      color: 'yellow',
      level: 'good',
      label: 'Tạm Ổn / Khá Tốt',
      badge: '🟡 Khá tốt',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-300',
      ringColor: 'ring-amber-400',
      progressColor: 'bg-amber-500',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      summary: 'Người bản xứ có thể hiểu được, nhưng cần lưu ý âm đuôi hoặc trọng âm.',
    };
  }

  return {
    color: 'green',
    level: 'excellent',
    label: 'Xuất Sắc / Chuẩn Bản Xứ',
    badge: '🟢 Chuẩn bản xứ',
    textColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    ringColor: 'ring-emerald-400',
    progressColor: 'bg-emerald-500',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    summary: 'Tuyệt vời! Bạn phát âm rất rõ ràng, tròn vành rõ chữ và chuẩn ngữ điệu.',
  };
}

/**
 * Gửi dữ liệu lên Cloudflare Worker AI để phân tích khẩu hình và chỉ rõ lỗi sai
 */
export async function evaluatePronunciationWithAI({ targetWord, spokenText, ipa, score }) {
  const workerUrl = import.meta.env.VITE_WORKER_URL ?? 'http://127.0.0.1:8788';

  try {
    const res = await fetch(`${workerUrl}/api/pronunciation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        targetWord,
        spokenText,
        ipa,
        score,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        feedback: data.feedback,
        tip: data.tip,
        comparison: data.comparison,
      };
    }
  } catch (err) {
    console.warn('Không thể kết nối AI Pronunciation API, dùng phân tích nội bộ:', err);
  }

  // Phân tích nội bộ dự phòng nếu Worker offline hoặc đang xử lý
  return generateFallbackFeedback(targetWord, spokenText, ipa, score);
}

/**
 * Phân tích nội bộ thông minh bám sát chính xác từ vựng đang học và những gì người dùng vừa đọc
 */
function generateFallbackFeedback(targetWord, spokenText, ipa = '', score = 0) {
  const cleanTarget = (targetWord || '').trim();
  const cleanSpoken = (spokenText || '').trim();
  const lowerTarget = cleanTarget.toLowerCase();
  const lowerSpoken = cleanSpoken.toLowerCase();

  const ipaHint = ipa ? ` (${ipa})` : '';

  if (!cleanSpoken) {
    return {
      feedback: `Chưa thu được âm thanh rõ ràng cho từ "${cleanTarget}". Bạn hãy kiểm tra micro và đọc to hơn nhé.`,
      tip: `Mẹo phát âm từ "${cleanTarget}"${ipaHint}: Hãy bấm nút Loa 🔊 để nghe khẩu hình mẫu và đọc dứt khoát từng âm tiết.`,
      comparison: `Từ chuẩn: "${cleanTarget}"`,
    };
  }

  // Phân tích đuôi từ đặc trưng để tạo mẹo thực tế
  let specificTip = `Mẹo phát âm từ "${cleanTarget}"${ipaHint}: Chú ý giữ khẩu hình tròn và nhấn đúng trọng âm của từ.`;
  if (lowerTarget.endsWith('tion') || lowerTarget.endsWith('sion')) {
    specificTip = `Mẹo cho từ "${cleanTarget}"${ipaHint}: Đuôi "-tion" phát âm là /ʃən/ (chu môi tròn và đẩy luồng hơi nhẹ, không đọc là "sơn" hay "sân").`;
  } else if (lowerTarget.endsWith('ty') || lowerTarget.endsWith('ly')) {
    specificTip = `Mẹo cho từ "${cleanTarget}"${ipaHint}: Đuôi kết thúc nhẹ nhàng, nhấn mạnh trọng âm vào âm tiết đầu hoặc giữa.`;
  } else if (lowerTarget.endsWith('ed')) {
    specificTip = `Mẹo cho từ "${cleanTarget}"${ipaHint}: Chú ý quy tắc phát âm đuôi "-ed" bật rõ âm bật hơi ở cuối.`;
  } else if (lowerTarget.endsWith('ful') || lowerTarget.endsWith('less')) {
    specificTip = `Mẹo cho từ "${cleanTarget}"${ipaHint}: Âm tiết đuôi là âm nhẹ /fəl/, trọng âm rơi vào âm tiết đầu tiên.`;
  }

  // Đọc chuẩn xác (>= 80%)
  if (lowerTarget === lowerSpoken || score >= 80) {
    return {
      feedback: `Tuyệt vời! Bạn đã phát âm chính xác từ "${cleanTarget}" (${score}%). Âm thanh tròn vành, rõ chữ và tự nhiên!`,
      tip: specificTip,
      comparison: `Bạn đã đọc rất chuẩn: "${cleanSpoken}"`,
    };
  }

  // Đọc khá gần (60 - 79%)
  if (score >= 60) {
    return {
      feedback: `Bạn đọc thành "${cleanSpoken}", khá gần với từ "${cleanTarget}". Máy phát hiện có thể bạn bị nuốt âm đuôi hoặc nhấn sai trọng âm một chút.`,
      tip: specificTip,
      comparison: `Từ chuẩn: "${cleanTarget}" | Máy nghe được: "${cleanSpoken}"`,
    };
  }

  // Đọc lệch nhiều (< 60%)
  return {
    feedback: `Bạn đã phát âm thành "${cleanSpoken}" thay vì "${cleanTarget}". Âm thanh bị nhận diện lệch sang một từ hoặc âm tiết khác.`,
    tip: `Mẹo sửa cho từ "${cleanTarget}"${ipaHint}: ${specificTip}`,
    comparison: `Từ chuẩn: "${cleanTarget}" | Bạn đọc: "${cleanSpoken}"`,
  };
}
