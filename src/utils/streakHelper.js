/**
 * Tính toán chuỗi ngày học liên tiếp (streak) của người dùng
 * Lưu trữ theo từng user ID và tự động cập nhật theo ngày
 *
 * @param {string} userId - ID của người dùng từ Supabase Auth
 * @returns {number} Số ngày học liên tiếp hiện tại
 */
export function getUserStreak(userId) {
  if (!userId) return 1;

  try {
    const storageKey = `lexicard_streak_${userId}`;
    const today = new Date().toISOString().slice(0, 10);
    const rawData = localStorage.getItem(storageKey);

    if (!rawData) {
      // Người dùng mới đăng nhập lần đầu -> bắt đầu với chuỗi 1 ngày
      const initialData = { streak: 1, lastActiveDate: today };
      localStorage.setItem(storageKey, JSON.stringify(initialData));
      return 1;
    }

    const data = JSON.parse(rawData);
    if (!data.lastActiveDate || typeof data.streak !== 'number') {
      const resetData = { streak: 1, lastActiveDate: today };
      localStorage.setItem(storageKey, JSON.stringify(resetData));
      return 1;
    }

    // Nếu đã truy cập trong cùng ngày hôm nay
    if (data.lastActiveDate === today) {
      return data.streak;
    }

    // Tính khoảng cách số ngày giữa hôm nay và lần đăng nhập trước
    const lastDate = new Date(data.lastActiveDate);
    const currentDate = new Date(today);
    const diffTime = currentDate.getTime() - lastDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Đăng nhập liên tiếp ngày tiếp theo -> tăng thêm 1
      const updated = { streak: data.streak + 1, lastActiveDate: today };
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated.streak;
    } else if (diffDays > 1) {
      // Cách hơn 1 ngày (bị đứt chuỗi) -> reset về 1
      const reset = { streak: 1, lastActiveDate: today };
      localStorage.setItem(storageKey, JSON.stringify(reset));
      return 1;
    }

    return data.streak || 1;
  } catch {
    return 1;
  }
}
