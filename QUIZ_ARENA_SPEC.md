# 🏆 Đấu Trường Trắc Nghiệm Từ Vựng (Flashcard Quiz Arena)

> **Tài liệu kỹ thuật & Hướng dẫn tính năng**  
> *Được cập nhật khi bắt đầu triển khai tính năng Cuộc thi trắc nghiệm Flashcard & Bảng xếp hạng vinh danh.*

---

## 1. 💡 Ý Tưởng & Cơ Chế Hoạt Động (Gameplay & Concept)

### 1.1. Mục tiêu
Biến việc học từ vựng tiếng Anh trở nên hào hứng, mang tính cạnh tranh lành mạnh và kích thích phản xạ bằng hình thức **Đấu trường trắc nghiệm 30 câu hỏi (Quiz Arena)** tổng hợp từ tất cả các chủ đề.

### 1.2. Thể lệ cuộc thi:
- **Số lượng câu hỏi**: 30 câu hỏi bao trùm tất cả các chủ đề (Environment, Business, Tech, Food, Daily Life...).
- **Cấu trúc 1 câu hỏi**:
  - Hiển thị thẻ từ vựng (Từ tiếng Anh, phát âm IPA, loại từ, có nút phát âm Audio).
  - Có 4 đáp án lựa chọn **A, B, C, D** (1 đáp án chính xác là nghĩa tiếng Việt, 3 đáp án nhiễu từ các thẻ khác).
  - Hoặc câu hỏi dạng ngược lại: Cho nghĩa tiếng Việt/ngữ cảnh, chọn từ tiếng Anh tương ứng.
- **Thời gian cho mỗi câu**: 15 giây đếm ngược tạo sự kịch tính.

### 1.3. Hệ thống tính điểm & Phân cấp (Scoring System)
Mỗi câu hỏi có tổng điểm tối đa là **100 điểm** (Tổng 30 câu = **3,000 điểm** tối đa):
1. **Điểm chính xác cơ bản**: +50 điểm khi chọn đúng.
2. **Điểm thưởng tốc độ (Speed Bonus)**: Lên đến +30 điểm (trả lời càng nhanh, điểm thưởng càng cao dựa trên số giây còn lại).
3. **Điểm thưởng chuỗi đúng (Streak Combo)**: +5 đến +20 điểm (khi trả lời đúng liên tiếp nhiều câu hỏi).
4. **Trả lời sai / Hết giờ**: 0 điểm và đứt chuỗi combo.

---

## 2. 📍 Đề Xuất Vị Trí Trò Chơi Trên Giao Diện (UI Placement)

Dựa trên cấu trúc giao diện hiện tại của LexiCard:

### Vị trí đề xuất tối ưu nhất: **Header Navigation (Thanh điều hướng trên cùng)**
- **Tại sao?**
  - Thanh header hiện tại có logo bên trái, chuỗi streak và avatar người dùng bên phải.
  - Khu vực chính giữa hoặc cạnh chuỗi `🔥 2 Ngày Liên Tiếp` có không gian lý tưởng để đặt nút kêu gọi hành động (CTA) cực kỳ nổi bật:
    - Nút gradient vàng kim / burgundy: `🏆 Đấu Trường 30 Câu` kèm hiệu ứng pulse hoặc shine nhẹ.
    - Một nút icon vương miện / huy chương `🏅 Bảng Xếp Hạng` để người dùng mở xem thứ hạng bất kỳ lúc nào.
- **Trải nghiệm người dùng (UX Flow)**:
  - Khi nhấn `🏆 Đấu Trường`, mở ra giao diện làm bài thi tập trung (Focus Arena) toàn màn hình hoặc trang `/arena`, loại bỏ các yếu tố gây xao nhãng để người chơi tập trung tối đa 100%.
  - Sau khi kết thúc 30 câu: hiển thị màn hình vinh danh hoành tráng (Tổng điểm, Tỷ lệ đúng, Thời gian làm bài, Danh hiệu đạt được) và tự động ghi danh vào **Bảng xếp hạng (Leaderboard)**.

---

## 3. 🏅 Bảng Xếp Hạng Vinh Danh (Hall of Fame / Leaderboard)

### 3.1. Các thông tin vinh danh:
- **Top 1, 2, 3**: Nhận cúp Vàng 🥇, Bạc 🥈, Đồng 🥉 với hiệu ứng phát sáng.
- **Thông tin hiển thị**:
  - Hạng (Rank)
  - Tên thí sinh & Avatar
  - Điểm số (Score / 3,000)
  - Độ chính xác (% câu đúng)
  - Thời gian hoàn thành (Ví dụ: 03:45)
  - Ngày thi đấu

### 3.2. Lưu trữ dữ liệu:
- Sử dụng `localStorage` để lưu điểm cá nhân và bảng xếp hạng offline ngay lập tức.
- Đồng bộ với Supabase (nếu có bảng điểm `arena_scores`) hoặc dữ liệu người dùng hiện tại để vinh danh người đăng nhập thực tế.

---

## 4. 🗂️ Cấu Trúc File & Thành Phần Hệ Thống

| File | Vai trò | Trạng thái |
|------|---------|------------|
| [`src/components/layout/Header.jsx`](file:///c:/flahcard-ai/flash_card/src/components/layout/Header.jsx) | Thêm nút CTA `🏆 Đấu Trường` và `🏅 BXH` trên thanh Header | Cần sửa |
| [`src/pages/QuizArenaPage.jsx`](file:///c:/flahcard-ai/flash_card/src/pages/QuizArenaPage.jsx) | Giao diện chính của Cuộc thi 30 câu trắc nghiệm (Timer, Flashcard A-B-C-D, Streak Combo) | Tạo mới |
| [`src/components/arena/LeaderboardModal.jsx`](file:///c:/flahcard-ai/flash_card/src/components/arena/LeaderboardModal.jsx) | Modal / Component Bảng xếp hạng vinh danh Top người chơi xuất sắc nhất | Tạo mới |
| [`src/services/quizService.js`](file:///c:/flahcard-ai/flash_card/src/services/quizService.js) | Logic sinh 30 câu hỏi đa chủ đề từ Supabase / mockData, thuật toán tạo đáp án nhiễu A, B, C, D | Tạo mới |
| [`src/App.jsx`](file:///c:/flahcard-ai/flash_card/src/App.jsx) | Đăng ký route `/arena` và `/leaderboard` | Cần sửa |

---

## 5. 🚀 Tiến Độ Triển Khai & Kiểm Thử
- [x] Lập tài liệu thiết kế `QUIZ_ARENA_SPEC.md`
- [x] Xây dựng `quizService.js` (kết nối 300 từ vựng Supabase / mockData, xáo trộn câu hỏi, tạo 3 đáp án nhiễu A-B-C-D, tính điểm + combo)
- [x] Xây dựng Component `LeaderboardModal.jsx` (bục vinh danh Top 1, 2, 3 và danh sách thứ hạng)
- [x] Xây dựng Trang `QuizArenaPage.jsx` (thẻ flashcard, timer 15s đếm ngược, phát âm từ vựng, phím tắt A-B-C-D / 1-2-3-4, kết thúc vinh danh)
- [x] Gắn nút CTA `🏆 Đấu Trường 30 Câu` & `🏅 BXH` vào `Header.jsx` và cập nhật route `/arena` trong `App.jsx`
- [x] Kiểm thử build thành công `npm run build` (0 lỗi)

---

## 6. 📖 Hướng Dẫn Sử Dụng & Bảo Trì Sau Này

### Cách thức người dùng trải nghiệm:
1. Từ trang chủ / thanh Header, bấm nút **`🏆 Đấu Trường 30 Câu`** (hoặc truy cập đường dẫn `/arena`).
2. Nhấn **"Bắt đầu tranh tài ngay"**: Hệ thống tự động bốc ngẫu nhiên 30 từ vựng từ 10 chủ đề khác nhau trong cơ sở dữ liệu Supabase.
3. Mỗi câu hỏi hiển thị thẻ Flashcard (Từ, IPA, Nút loa phát âm giọng Mỹ).
4. Người chơi chọn đáp án **A, B, C, D** bằng cách bấm chuột hoặc gõ trực tiếp phím `A`, `B`, `C`, `D` (hoặc `1`, `2`, `3`, `4`) trên bàn phím.
5. Khi trả lời đúng:
   - Điểm cơ bản: +50đ.
   - Thưởng tốc độ: Lên tới +30đ nếu trả lời ngay.
   - Thưởng Combo chuỗi đúng: +5đ đến +20đ.
6. Khi hoàn thành: Hệ thống tự động xếp hạng và ghi danh vào **Bảng Vinh Danh (Leaderboard)** lưu tại `localStorage` (`lexicard_quiz_leaderboard`), mở modal xem trực tiếp bục vinh danh Top 1, Top 2, Top 3.

