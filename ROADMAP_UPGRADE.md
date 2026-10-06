# 🗺️ Lộ Trình Nâng Cấp & Định Hướng Phát Triển LexiCard (Product Roadmap)

> **Tài liệu định hướng tính năng tương lai cho dự án LexiCard**  
> *Được biên soạn để lưu lại các ý tưởng, kiến trúc kỹ thuật và thứ tự ưu tiên nâng cấp trang web.*

---

## 🎯 1. Tầm Nhìn Sản Phẩm
Biến **LexiCard** từ một ứng dụng flashcard thông thường thành một **Hệ sinh thái học từ vựng tiếng Anh thông minh được hỗ trợ toàn diện bởi AI (AI-Powered Learning Platform)**: học nhanh hơn, nhớ lâu hơn thông qua khoa học ghi nhớ và tràn đầy hứng khởi với cơ chế game hóa (Gamification).

---

## 🚀 2. Chi Tiết 4 Trụ Cột Nâng Cấp Đột Phá

### 🌟 Trụ Cột 1: AI Siêu Năng Lực (AI Superpowers)
*Tận dụng Cloudflare Worker AI (Llama 3.3 70B FP8) đã tích hợp sẵn.*

1. **🪄 AI Deck Generator (Tự động tạo bộ Flashcard theo yêu cầu)**:
   - **Mô tả**: Người dùng nhập chủ đề bất kỳ (VD: *"15 từ vựng tiếng Anh chuyên ngành Logistics"*, *"Từ vựng IELTS 7.5 về Môi trường"* hoặc dán 1 đoạn văn tiếng Anh).
   - **Xử lý AI**: AI tự động trích xuất / sinh ra danh sách từ vựng gồm: Từ tiếng Anh, phiên âm IPA, loại từ, nghĩa tiếng Việt, câu ví dụ song ngữ, từ đồng nghĩa.
   - **Lưu trữ**: Tự động tạo Deck mới trong tài khoản Supabase của người dùng.

2. **🎙️ AI Pronunciation Coach (Luyện nói & Chấm điểm phát âm)** *(✅ Đã hoàn thành)*:
   - **Mô tả**: Mỗi flashcard có nút Micro 🎙️ để người dùng bấm và đọc to từ vựng.
   - **Xử lý**: Sử dụng Web Speech API đối chiếu giọng nói, phân tích độ tương đồng Levenshtein kết hợp Cloudflare Worker AI (Llama 3.3 70B) để chỉ rõ lỗi sai (âm đầu, âm đuôi, nguyên âm) và hướng dẫn khẩu hình.
   - **Quy định màu sắc theo thang điểm %**:
     - 🔴 **Màu Đỏ (< 60%)**: *Cần Luyện Tập Thêm* — Phát âm chưa chuẩn hoặc nhầm từ.
     - 🟡 **Màu Vàng (60% - 79%)**: *Tạm Ổn / Khá Tốt* — Người bản xứ có thể hiểu nhưng cần chú ý âm đuôi hoặc trọng âm.
     - 🟢 **Màu Xanh (≥ 80%)**: *Xuất Sắc / Chuẩn Bản Xứ* — Tròn vành rõ chữ, chuẩn âm tiết và ngữ điệu.

---

### 🧠 Trụ Cột 2: Khoa Học Ghi Nhớ & Lưu Tiến Độ (Learning Science)

3. **💾 Lưu trạng thái học vĩnh viễn vào Supabase (Progress Persistence)**:
   - **Vấn đề hiện tại**: Hai nút *"Cần ôn lại"* và *"Đã thuộc từ này"* chỉ lưu tạm trong RAM phiên duyệt web.
   - **Giải pháp**: Tạo bảng `user_card_progress` trong Supabase:
     ```sql
     create table public.user_card_progress (
       id uuid primary key default gen_random_uuid(),
       user_id uuid references auth.users(id),
       card_id uuid references public.flashcards(id),
       status text check (status in ('learned', 'review', 'new')),
       review_count int default 0,
       last_reviewed_at timestamptz default now()
     );
     ```
   - **Lợi ích**: Đăng nhập trên bất kỳ điện thoại hay máy tính nào cũng đồng bộ dữ liệu chuẩn xác 100%.

4. **⏰ Spaced Repetition System (Thuật toán lặp lại ngắt quãng kiểu Anki / Leitner)**:
   - Phân loại từ vựng thành các cấp độ ghi nhớ (Hộp 1 → Hộp 5).
   - Từ khó / "Cần ôn lại" được tự động nhắc học lại sau **1 ngày**, **3 ngày**, **7 ngày**, **14 ngày**.
   - Giúp người học ghi nhớ từ vựng vào trí nhớ dài hạn (Long-term Memory) mà không tốn công ôn tập tràn lan.

---

### 🎮 Trụ Cột 3: Game Hóa & Đấu Trường Sôi Động (Gamification)

5. **🔊 Hiệu ứng âm thanh chân thực (Sound Effects - SFX)**:
   - Tiếng *woosh* nhẹ khi lật thẻ flashcard.
   - Tiếng *ding* trong trẻo khi chọn đúng trong Đấu Trường.
   - Tiếng *combo bùng nổ* khi đạt chuỗi đúng x3, x5, x10.
   - Tiếng nhạc ăn mừng hân hoan khi hoàn thành 30 câu hỏi.
   - *Có nút gạt Bật/Tắt âm thanh trong Header để người dùng chủ động điều chỉnh.*

6. **🎖️ Hệ thống Huy Hiệu & Cúp Danh Dự (Badges & Achievements)**:
   - **Tân Binh Cần Cù**: Học xong 10 thẻ đầu tiên.
   - **Chiến Binh Bất Bại**: Đạt chuỗi Streak 7 ngày liên tiếp.
   - **Thần Tốc Đấu Trường**: Trả lời đúng câu hỏi dưới 3 giây.
   - **Vua Từ Vựng**: Đạt Top 3 trên Bảng Vinh Danh Toàn Quốc.

---

### 📊 Trụ Cột 4: Bảng Điều Khiển & Thống Kê Học Tập (Personal Dashboard)

7. **Trang Dashboard Cá Nhân (`/dashboard`)**:
   - Biểu đồ tròn tiến độ: Số từ Đã thuộc / Cần ôn lại / Chưa học trên tổng số 300 từ.
   - Lịch chuyên cần dạng Heatmap (giống GitHub) ghi nhận số phút và số từ đã học mỗi ngày.
   - Lịch sử thi đấu Đấu trường: Điểm số cao nhất, thời gian kỷ lục qua từng tuần.

---

## 📋 3. Kế Hoạch Triển Khai Đề Xuất (Phased Execution)

| Giai đoạn | Mục tiêu | Độ ưu tiên | Tính khả thi |
|-----------|----------|------------|--------------|
| **Phase 1** | Lưu trạng thái `Learned` / `Review` vào Supabase + Thêm hiệu ứng âm thanh SFX cho Đấu Trường | 🔴 Cao nhất (Nền tảng cốt lõi) | Rất nhanh (1 - 2 ngày) |
| **Phase 2** | AI Deck Generator (Tự tạo bộ flashcard bất kỳ bằng AI) | 🟡 Cao (Tính năng WOW) | Nhanh (Tận dụng Worker hiện có) |
| **Phase 3** | Dashboard thống kê tiến độ học tập + Lịch ôn tập Spaced Repetition | 🟢 Trung bình (Tăng retention) | Vừa phải |
| **Phase 4** | Luyện phát âm Micro + AI Pronunciation Coach | 🔵 Nâng cao (Tương tác giọng nói) | Vừa phải |

---

## 📌 Ghi Chú Khi Cần Triển Khai Tiếp
Mỗi khi bắt đầu triển khai bất kỳ tính năng nào trong danh sách trên:
1. Đọc lại file này để nắm rõ mục tiêu và bảng dữ liệu liên quan.
2. Cập nhật tiến độ đã hoàn thành vào mục Kế Hoạch Triển Khai.
3. Đồng bộ vào file bản đồ [`PROJECT_OVERVIEW.md`](file:///c:/flahcard-ai/flash_card/PROJECT_OVERVIEW.md).
