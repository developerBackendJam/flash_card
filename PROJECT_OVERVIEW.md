# LexiCard - Tong Quan Du An

> **Cap nhat lan cuoi:** 2026-10-06
> **Ten app:** LexiCard - "Khong gian hoc tu vung Flashcard"
> **Ngon ngu UI:** Tieng Viet (lang="vi")
> **Trang thai:** Dang phat trien - `npm run dev` dang chay

---

## So do tong the

```
c:\flahcard-ai\
+-- flash_card\                  <- Root du an
    +-- index.html               <- Entry point HTML
    +-- package.json             <- Dependencies frontend
    +-- vite.config.js           <- Cau hinh Vite
    +-- tailwind.config.js       <- Design tokens (mau burgundy, font)
    +-- postcss.config.js        <- PostCSS config
    +-- wrangler.jsonc           <- Deploy config (Cloudflare Pages)
    +-- .env                     <- Bien moi truong (Supabase URL, key)
    +-- .oxlintrc.json           <- Cau hinh linter (oxlint)
    +-- public\                  <- Static assets (favicon, logo)
    +-- src\                     <- Source code React
    +-- worker\                  <- Cloudflare Worker (AI backend)
```

---

## Tech Stack

| Lop | Cong nghe | Ghi chu |
|-----|-----------|---------|
| Frontend Framework | React 19 + Vite 8 | SPA, JSX |
| Routing | React Router DOM v7 | BrowserRouter, Routes |
| Styling | TailwindCSS v3 | Custom palette burgundy, cream, brand |
| Font | Plus Jakarta Sans, Playfair Display, Inter | Google Fonts |
| Auth + DB | Supabase | Email/password + Google OAuth |
| AI Backend | Cloudflare Workers AI | Model @cf/openai/gpt-oss-20b |
| Worker Runtime | Wrangler (Cloudflare) | Local port 8787 |
| Icons | lucide-react | Cai nhung icon chinh dung SVG inline |
| Linter | oxlint | Thay cho ESLint |

---

## Chi tiet tung Folder

### 1. public\

Chua static assets duoc serve truc tiep (khong qua Vite bundling):

| File | Vai tro |
|------|---------|
| favicon.png | Icon tab trinh duyet |
| logo.png | Logo hien thi o Header |

---

### 2. src\ - Source code chinh

#### 2.1 src\main.jsx
Entry point cua React app. Render `<App />` vao `#root` voi StrictMode.

#### 2.2 src\App.jsx
Router goc - dinh nghia 4 routes:

| Route | Component | Guard |
|-------|-----------|-------|
| / | StudyPage | ProtectedRoute (can dang nhap) |
| /study | StudyPage | ProtectedRoute |
| /login | Login | PublicOnlyRoute (da dang nhap -> redirect /) |
| /register | Register | PublicOnlyRoute |
| * | Redirect / | - |

#### 2.3 src\constants.js
Single source of truth cho design tokens & cau hinh chung:
- BRAND_COLOR = '#6d1844' - mau chu dao (burgundy dam)
- BRAND_LIGHT = '#fdf0e6' - nen kem nhat
- BRAND_BORDER = '#e8c4aa' - vien mau dao
- DEFAULT_CATEGORY = 'basic' - deck fallback
- APP_NAME = 'LexiCard'

#### 2.4 src\index.css
Global styles: CSS flip animation cho flashcard (.flashcard-inner, .is-flipped, .flashcard-front, .flashcard-back), custom animations (hero-float, hero-dot-bounce, orbit-ring).

---

### 3. src\lib\
Khoi tao cac thu vien third-party duoc dung o nhieu noi.

| File | Vai tro |
|------|---------|
| supabase.js | Tao Supabase client dung VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY tu .env. Export singleton supabase de cac service va component import. |

---

### 4. src\services\
Tang giao tiep voi Supabase - tach rieng khoi component de de test va maintain.

| File | Ham | Chuc nang |
|------|-----|-----------|
| authService.js | signInWithEmail(email, password) | Dang nhap bang email/mat khau |
| | signUpWithEmail(email, password, fullName) | Dang ky tai khoan moi, luu full_name vao user_metadata |
| | signInWithGoogle() | OAuth Google, redirect ve origin sau khi dang nhap |
| | signOut() | Dang xuat user hien tai |
| | getCurrentUser() | Tra ve user object hien tai hoac null |
| deckService.js | getDecks() | Lay toan bo decks tu public.decks, sort theo created_at |
| flashcardService.js | getFlashcardsByDeck(deckId) | Lay flashcards theo deck_id, sort theo created_at |

**Cau truc DB Supabase (suy ra tu code):**

```
public.decks
  - id
  - name
  - created_at

public.flashcards
  - id
  - deck_id             (FK -> decks.id)
  - front               (Tu tieng Anh - mat truoc)
  - pronunciation       (IPA, vi du: /bjuHt.tf.fl/)
  - part_of_speech      (Loai tu)
  - meaning             (Nghia tieng Viet)
  - example_sentence    (Cau vi du tieng Anh)
  - example_translation (Dich cau vi du)
  - synonyms            (Tu dong nghia - Array hoac Postgres array)
  - learned             (boolean)
  - review              (boolean)
  - created_at
```

---

### 5. src\utils\
Cac helper function - pure functions, tach khoi component.

#### audioHelper.js
Phat am tu tieng Anh voi 3 tang fallback:
1. YouDao Dictionary API (dict.youdao.com) - US English MP3
2. Google TTS (translate.google.com) - fallback
3. Web Speech API (SpeechSynthesisUtterance) - offline fallback

Export: `playPronunciation(word: string)`

#### streakHelper.js
Tinh va luu chuoi ngay hoc lien tiep vao localStorage (key: lexicard_streak_<userId>):
- Lan dau dang nhap -> streak = 1
- Dang nhap lien tiep ngay hom sau -> streak + 1
- Bo cach > 1 ngay -> reset ve 1

Export: `getUserStreak(userId: string): number`

#### aiReply.js
Mock AI response generator (dung khi worker khong available):
- Nhan text (cau hoi) va card (flashcard hien tai)
- Nhan dien intent qua keyword: 'vi du', 'cau', 'phan biet', 'khac', 'phat am', 'chuan'
- Tra ve phan hoi tieng Viet tuong ung

Export: `generateAIReply(text: string, card: object): string`

LUU Y: Day la mock fallback - thuc te widget goi http://127.0.0.1:8787/api/chat (Cloudflare Worker)

---

### 6. src\data\
Du lieu tinh dung trong development/testing (khong phai production data).

#### mockData.js
- mockCategories - 12 category mau (basic, daily, family, food, travel,...)
- mockFlashcards - flashcard mau cho cac category basic va daily
- mockUser - user mau (Alex Johnson, streak: 5)
- botResponses - mau phan hoi chatbot cho tu beautiful

Du lieu production den tu Supabase, khong phai file nay.

---

### 7. src\assets\
Assets duoc import vao JS/JSX (Vite xu ly, hash ten file):

| File | Ghi chu |
|------|---------|
| hero.png | Anh hero (hien khong dung - HeroSection dung SVG inline) |
| react.svg | Boilerplate React logo |
| vite.svg | Boilerplate Vite logo |

---

### 8. src\pages\
Page-level components - duoc render boi Router.

#### Login.jsx
Wrapper don gian: render AuthLayout + LoginForm.

#### Register.jsx
Wrapper don gian: render AuthLayout + RegisterForm.

#### StudyPage.jsx - COMPONENT TRUNG TAM (QUAN TRONG NHAT)
Trang hoc chinh, la state hub quan ly toan bo logic ung dung.

**State quan ly:**

| State | Kieu | Mo ta |
|-------|------|-------|
| decks | Array | Danh sach decks tu Supabase |
| selectedDeckId | string/null | ID deck dang chon |
| flashcards | Array | Danh sach cards cua deck hien tai |
| currentCardIndex | number | Vi tri card dang xem |
| isFlipped | boolean | Card dang lat hay khong |
| statusMap | Object | {[cardId]: {learned, review}} - trang thai tung card (in-memory) |
| isLoadingDecks | boolean | Loading state cho decks |
| isLoadingCards | boolean | Loading state cho cards |
| errorMessage | string/null | Thong bao loi |
| currentUser | Object/null | User info tu Supabase |

**Logic chinh:**
1. Auth - lay user tu supabase.auth.getUser(), lang nghe onAuthStateChange
2. Tai decks - getDecks() -> tu dong chon deck dau tien
3. Tai cards - getFlashcardsByDeck(selectedDeckId) khi deck thay doi
4. Navigation - goNext(), goPrev(), flipCard() voi 40ms delay (smooth transition)
5. Mark status - handleMarkReview(), handleMarkLearned() toggle in-memory (chua persist ve DB)
6. Keyboard shortcuts - Space (lat the), <- (prev), -> (next)

**UI States:**
- Loading spinner (dang tai)
- Error state voi nut "Thu lai"
- Empty state (deck chua co tu vung)
- Flashcard chinh

---

### 9. src\components\

#### 9.1 components\layout\

| Component | Chuc nang |
|-----------|-----------|
| Header.jsx | Thanh dieu huong tren cung: Logo LexiCard, streak badge (N Ngay Lien Tiep), dropdown user (avatar, ten, email, nut dang xuat) |
| Footer.jsx | Footer don gian o duoi trang |

Header nhan prop: user = { id, name, email, initials, streak }

#### 9.2 components\auth\

| Component | Chuc nang |
|-----------|-----------|
| AuthLayout.jsx | Layout 2 cot: trai = HeroSection, phai = form auth |
| HeroSection.jsx | Phan minh hoa ben trai trang auth - SVG character + animations (orbs, sparkles, speech bubbles voi hover effects) |
| LoginForm.jsx | Form dang nhap: Google OAuth button + Email/Password form, validate, error handling tieng Viet |
| RegisterForm.jsx | Form dang ky: Full name + Email + Password + Confirm password |
| ProtectedRoute.jsx | HOC: Check user dang nhap -> neu khong -> redirect /login |
| PublicOnlyRoute.jsx | HOC: Neu da dang nhap -> redirect / (tranh vao login khi da auth) |

#### 9.3 components\flashcard\

| Component | Props | Chuc nang |
|-----------|-------|-----------|
| CategoryNav.jsx | categories, activeCategoryId, onSelectCategory | Thanh pill dieu huong danh muc, scroll ngang, dropdown "N Chu de", nut scroll trai/phai |
| Flashcard.jsx | card, isFlipped, onToggleFlip | The flashcard flip 3D CSS: Mat truoc (tu + IPA + nut phat am), Mat sau (nghia + cau vi du + tu dong nghia) |
| FlashcardActions.jsx | status, callbacks, hasPrev, hasNext, prevWord, nextWord | Row nut: [Can on lai] [Da thuoc] + [Previous] [Flip Card] [Next] + keyboard hints |
| Progress.jsx | current, total | Hien thi "1 / 30" |

**Flashcard data mapping (ho tro ca Supabase schema va mock data):**

```
card.front          ?? card.word           -> tu tieng Anh
card.pronunciation  ?? card.ipa            -> IPA
card.part_of_speech ?? card.partOfSpeech   -> loai tu
card.meaning                               -> nghia
card.example_sentence ?? card.exampleEn    -> cau vi du EN
card.example_translation ?? card.exampleVi -> dich cau vi du
card.synonyms -> ho tro Array, JSON string, hoac Postgres {a,b,c} format
```

#### 9.4 components\ui\
Design system atoms - reusable primitive components:

| Component | Chuc nang |
|-----------|-----------|
| Button.jsx | Button voi loading state (isLoading -> spinner), mau burgundy |
| Input.jsx | Input field voi label, styling nhat quan |
| GoogleButton.jsx | Nut "Continue with Google" voi icon Google |

#### 9.5 AIChatbotWidget.jsx - FLOATING AI CHATBOT
Bot AI o goc duoi phai man hinh:

- UI: Button tron burgundy gradient, popup chat window 380px
- Context-aware: Khi card thay doi -> reset hoi thoai, gioi thieu tu moi cho user
- API call: POST http://127.0.0.1:8787/api/chat (Cloudflare Worker local)
- Fallback: Neu worker khong response -> hien thi "Xin loi, minh khong the ket noi voi AI luc nay."
- Quick prompts 3 nut goi y san:
  - "Dat 3 cau vi du giao tiep"
  - "Phan biet tu dong nghia"
  - "Huong dan phat am chuan Anh - My"

---

### 10. worker\ - Cloudflare Worker (AI Backend)

```
worker\
+-- src\
|   +-- index.js       <- Worker handler chinh
+-- test\
|   +-- index.spec.js  <- Unit test voi Vitest
+-- wrangler.jsonc     <- Deploy config (ten worker, AI binding)
+-- package.json       <- Deps worker (wrangler, vitest)
+-- vitest.config.mjs  <- Config test
```

#### worker\src\index.js - API endpoint duy nhat

```
POST /api/chat
Body:     { "message": "cau hoi cua user" }
Response: { "reply": "phan hoi AI bang tieng Viet" }
```

- Xu ly CORS preflight (Access-Control-Allow-Origin: *)
- Goi env.AI.run("@cf/openai/gpt-oss-20b", { messages, max_tokens: 1024 })
- System prompt: "You are a helpful AI assistant. Answer directly and concisely in Vietnamese."

#### worker\wrangler.jsonc
- Worker name: "worker"
- AI binding: env.AI (Cloudflare Workers AI)
- Observability: enabled (logs)
- Local dev default port: 8787

---

## Luong du lieu chinh

```
User mo app
    |
App.jsx (Router)
    |
ProtectedRoute
    +-- Chua dang nhap
    |       |
    |   /login -> AuthLayout -> LoginForm
    |       |
    |   signInWithEmail() hoac signInWithGoogle()
    |       |
    |   Supabase Auth -> navigate('/')
    |
    +-- Da dang nhap
            |
        StudyPage
            |
        supabase.auth.getUser() -> currentUser state
            |
        getDecks() -> decks state -> CategoryNav
            |
        selectedDeckId -> getFlashcardsByDeck() -> flashcards state
            |
        Flashcard component (flip 3D CSS)
            |
        FlashcardActions (Previous / Flip / Next / Mark)
            |
        AIChatbotWidget
            |
        POST /api/chat -> worker\src\index.js -> Cloudflare AI
```

---

## Design System

### Color Palette

| Token | HEX | Dung cho |
|-------|-----|---------|
| #6d1844 (burgundy-900) | Brand primary | Buttons, active states, highlight |
| #5a1238 (burgundy-800) | - | Hover states |
| #fdf0e6 | Cream background | Surfaces, active pill background |
| #e8c4aa | Peach border | Border nhe nhang |
| stone-800 | - | Body text chinh |
| stone-400/500 | - | Text phu, muted |
| emerald-500 | - | Online badge, learned state |
| amber-400 | - | Review state |

### Typography
- Heading/Display: Playfair Display (serif, elegant)
- Body/UI: Plus Jakarta Sans (sans-serif, modern)
- IPA/Code: Inter (monospace)

### Custom Tailwind Extensions (tailwind.config.js)
- colors.burgundy - Scale 50 -> 950
- colors.cream - Scale 50 -> 300
- colors.brand - primary, hover, dark, accent, cream, border

### Custom Animations
- .hero-float - Card noi len xuong nhe nhang (auth page)
- .hero-dot-bounce - Dots trong speech bubble bounce
- .orbit-ring - Vong orbit decorative
- animate-spin - Loading spinner
- animate-ping - Notification badge pulse
- animate-bounce - LexiBot tooltip

---

## Keyboard Shortcuts (StudyPage)

| Phim | Hanh dong |
|------|-----------|
| Space | Lat flashcard |
| Arrow Left | Xem card truoc |
| Arrow Right | Xem card sau |

> Khong hoat dong khi focus vao INPUT hoac TEXTAREA (tranh conflict voi typing)

---

## Scripts NPM

### Frontend (c:\flahcard-ai\flash_card\)

```bash
npm run dev      # Dev server - Vite, port 5173
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # oxlint
```

### Worker (c:\flahcard-ai\flash_card\worker\)

```bash
npm run dev      # Wrangler local server, port 8787
npm run deploy   # Deploy len Cloudflare Workers
npm test         # Vitest unit tests
```

---

## Bien moi truong (.env)

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGci...
```

Worker AI key duoc quan ly boi Cloudflare Account - khong can config them khi dung AI binding.

---

## Tinh nang chua hoan thien / TODO

1. Mark status (Learned/Review) - Hien chi luu in-memory (statusMap), chua persist ve Supabase DB
2. Forgot Password - Nut co trong UI nhung chi alert("se tich hop o giai doan backend")
3. Worker AI - Can chay wrangler dev rieng trong worker\ de chatbot hoat dong khi dev local
4. Mock data (src\data\mockData.js) - Chi dung cho dev/test, khong duoc import o production flow
5. Streak persistence - Chi luu localStorage, mat khi clear storage hoac doi thiet bi

---

## File map - Can doc khi lam viec voi tinh nang nao

| Tinh nang | File chinh |
|-----------|-----------|
| Routing tong the | src\App.jsx |
| Logic hoc flashcard | src\pages\StudyPage.jsx |
| Hien thi the + flip | src\components\flashcard\Flashcard.jsx |
| Dieu huong decks | src\components\flashcard\CategoryNav.jsx |
| Nut Previous/Next/Flip/Mark | src\components\flashcard\FlashcardActions.jsx |
| AI Chatbot | src\components\AIChatbotWidget.jsx |
| AI API backend | worker\src\index.js |
| Supabase client | src\lib\supabase.js |
| Auth logic | src\services\authService.js |
| DB queries | src\services\deckService.js, src\services\flashcardService.js |
| Phat am tu | src\utils\audioHelper.js |
| Chuoi ngay hoc | src\utils\streakHelper.js |
| Design tokens | src\constants.js, tailwind.config.js |
| Form dang nhap | src\components\auth\LoginForm.jsx |
| Form dang ky | src\components\auth\RegisterForm.jsx |
| Route guard | src\components\auth\ProtectedRoute.jsx, PublicOnlyRoute.jsx |
| Cuoc thi Dau truong 30 cau | src\pages\QuizArenaPage.jsx, src\services\quizService.js |
| Bang xep hang vinh danh | src\components\arena\LeaderboardModal.jsx |
| Tai lieu dac ta tinh nang thi | QUIZ_ARENA_SPEC.md |
| Lo trinh nang cap tinh nang | ROADMAP_UPGRADE.md |
| Luyen phat am & Cham diem AI | src\components\flashcard\PronunciationCoachModal.jsx, src\services\pronunciationService.js |
