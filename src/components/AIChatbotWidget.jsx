import React, { useState, useEffect, useRef } from 'react';

const STORAGE_KEY = 'lexibot_chat_history';

function getInitialMessages(userName) {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Bỏ qua lỗi đọc localStorage nếu có
  }

  return [
    {
      id: 1,
      sender: 'ai',
      text: `Xin chào ${userName}! Mình là LexiBot 👋 Mình sẵn sàng trò chuyện và giải đáp về MỌI chủ đề cùng bạn (đời sống, tâm sự, công nghệ, học tập, ngoại ngữ...). Bạn muốn chia sẻ hay hỏi gì hôm nay?`,
      time: 'Vừa xong',
    },
  ];
}

export default function AIChatbotWidget({ currentCard, userName = 'Alex' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => getInitialMessages(userName));
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Lưu lịch sử hội thoại vào localStorage mỗi khi có tin nhắn mới
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Không thể lưu lịch sử chat:', e);
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Xóa / Làm mới lịch sử trò chuyện
  const handleClearHistory = () => {
    const resetMsg = [
      {
        id: Date.now(),
        sender: 'ai',
        text: `Đã làm mới cuộc hội thoại! Bạn muốn trò chuyện về chủ đề gì tiếp theo?`,
        time: 'Vừa xong',
      },
    ];
    setMessages(resetMsg);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputValue).trim();

    if (!text) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      time: 'Vừa xong',
    };

    // Cập nhật giao diện với tin nhắn mới của người dùng
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    if (!textToSend) {
      setInputValue('');
    }

    setIsTyping(true);

    // Thu thập tối đa 10 tin nhắn gần nhất để AI nhớ ngữ cảnh cuộc trò chuyện
    const conversationHistory = updatedMessages
      .filter((m) => m.sender === 'user' || m.sender === 'ai')
      .slice(-10)
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

    // URL Worker: ưu tiên VITE_WORKER_URL trong .env, fallback 8788 hoặc 8787
    const workerUrl = import.meta.env.VITE_WORKER_URL ?? 'http://127.0.0.1:8788';

    try {
      const response = await fetch(`${workerUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          // Gửi toàn bộ lịch sử hội thoại để AI ghi nhớ ngữ cảnh
          history: conversationHistory,
          // Chỉ gửi thông tin card để tham khảo khi người dùng chủ động hỏi
          card: currentCard ?? null,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error ?? `HTTP ${response.status}`);
      }

      const data = await response.json();

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: data.reply ?? 'Mình không nhận được phản hồi từ AI.',
        time: 'Vừa xong',
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error('AI error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: `Xin lỗi, mình không thể kết nối với AI lúc này. (${error.message})`,
          time: 'Vừa xong',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div
      className="fixed right-3 sm:right-6 bottom-3 sm:bottom-5 z-40 flex flex-col items-end"
      data-purpose="ai-chat-assistant"
      id="lexibotWidget"
    >
      {/* Chat Popup Window */}
      {isOpen && (
        <div
          className="mb-3 w-[calc(100vw-1.5rem)] sm:w-[380px] bg-white rounded-2xl shadow-2xl shadow-burgundy-950/25 border border-burgundy-100 overflow-hidden flex flex-col transition-all duration-300 ease-out"
          id="chatWindow"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-burgundy-900 to-burgundy-800 text-white p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner">
                  <svg className="w-5 h-5 text-[#f5ebe0]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-burgundy-900 rounded-full"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm tracking-tight text-white">LexiBot AI</h3>
                  <span className="text-[10px] bg-white/20 text-[#f5ebe0] px-1.5 py-0.5 rounded font-medium">Trợ lý</span>
                </div>
                <p className="text-[11px] text-[#f5ebe0]/80 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span> Nhớ ngữ cảnh hội thoại
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors focus:outline-none"
                id="clearChatBtn"
                title="Làm mới cuộc trò chuyện"
                type="button"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors focus:outline-none"
                id="closeChatBtn"
                title="Đóng hộp thoại"
                type="button"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="p-4 max-h-[350px] min-h-[280px] overflow-y-auto space-y-3.5 bg-[#faf5f0]/50 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {msg.sender === 'ai' ? (
                  <div className="w-7 h-7 rounded-lg bg-burgundy-900 text-white flex-shrink-0 flex items-center justify-center text-[10px] font-bold shadow-sm">
                    LB
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-burgundy-100 text-burgundy-900 border border-burgundy-300 flex-shrink-0 flex items-center justify-center text-[10px] font-bold shadow-sm">
                    {userName[0] || 'U'}
                  </div>
                )}

                <div className={`flex flex-col gap-1 max-w-[82%] ${msg.sender === 'user' ? 'items-end' : ''}`}>
                  <div
                    className={`p-3 rounded-2xl shadow-sm leading-relaxed whitespace-pre-line ${msg.sender === 'user'
                      ? 'bg-burgundy-900 text-white rounded-tr-sm'
                      : 'bg-white text-stone-800 rounded-tl-sm border border-stone-200/80'
                      }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-stone-400 px-1">{msg.time}</span>
                </div>
              </div>
            ))}

            {/* Quick Prompt Suggestions - Đa dạng chủ đề */}
            {messages.length <= 2 && (
              <div className="flex items-start gap-2.5 pt-1">
                <div className="w-7 h-7 rounded-lg bg-burgundy-900 text-white flex-shrink-0 flex items-center justify-center text-[10px] font-bold shadow-sm opacity-90">
                  LB
                </div>
                <div className="flex flex-col gap-1.5 max-w-[85%]">
                  <div className="bg-white p-3 rounded-2xl rounded-tl-sm border border-stone-200/80 shadow-sm text-stone-800 leading-relaxed space-y-2">
                    <p className="font-semibold text-burgundy-950">Gợi ý chủ đề trò chuyện:</p>
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => handleSendMessage('Chào LexiBot! Kể cho mình nghe một câu chuyện hoặc kiến thức thú vị hôm nay')}
                        className="text-left px-2.5 py-1.5 rounded-lg bg-burgundy-50 hover:bg-burgundy-100 text-burgundy-900 font-medium transition-colors border border-burgundy-100 text-[11px] flex items-center justify-between"
                        type="button"
                      >
                        <span>🌟 Kể một điều thú vị</span>
                        <span>→</span>
                      </button>
                      <button
                        onClick={() => handleSendMessage('Cho mình lời khuyên về cách duy trì kỷ luật và năng suất học tập')}
                        className="text-left px-2.5 py-1.5 rounded-lg bg-burgundy-50 hover:bg-burgundy-100 text-burgundy-900 font-medium transition-colors border border-burgundy-100 text-[11px] flex items-center justify-between"
                        type="button"
                      >
                        <span>🎯 Mẹo tăng năng suất học tập</span>
                        <span>→</span>
                      </button>
                      <button
                        onClick={() => handleSendMessage('Chúng ta có thể luyện nói tiếng Anh giao tiếp tự do được không?')}
                        className="text-left px-2.5 py-1.5 rounded-lg bg-burgundy-50 hover:bg-burgundy-100 text-burgundy-900 font-medium transition-colors border border-burgundy-100 text-[11px] flex items-center justify-between"
                        type="button"
                      >
                        <span>💬 Luyện giao tiếp tiếng Anh</span>
                        <span>→</span>
                      </button>
                      {currentCard && (
                        <button
                          onClick={() => handleSendMessage(`Đặt 3 câu ví dụ giao tiếp với từ "${currentCard?.front ?? currentCard?.word ?? ''}"`)}
                          className="text-left px-2.5 py-1.5 rounded-lg bg-burgundy-50 hover:bg-burgundy-100 text-burgundy-900 font-medium transition-colors border border-burgundy-100 text-[11px] flex items-center justify-between"
                          type="button"
                        >
                          <span>📖 Đặt câu với từ "${currentCard?.front ?? currentCard?.word ?? ''}"</span>
                          <span>→</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Typing indicator — hiển thị khi AI đang soạn phản hồi */}
            {isTyping && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-burgundy-900 text-white flex-shrink-0 flex items-center justify-center text-[10px] font-bold shadow-sm">
                  LB
                </div>
                <div className="bg-white rounded-2xl rounded-tl-sm border border-stone-200/80 shadow-sm px-4 py-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6d1844] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6d1844] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6d1844] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Area */}
          <div className="p-3 bg-white border-t border-stone-200">
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <div className="relative flex-1">
                <input
                  className="w-full text-xs py-2 px-3 pr-8 rounded-xl border border-stone-300 focus:outline-none focus:border-burgundy-900 focus:ring-1 focus:ring-burgundy-900 bg-stone-50/50 text-stone-800 placeholder-stone-400 disabled:opacity-60"
                  placeholder={isTyping ? 'LexiBot đang soạn phản hồi...' : 'Trò chuyện về bất kỳ điều gì bạn muốn...'}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isTyping}
                />
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-burgundy-700 transition-colors"
                  title="Gợi ý câu hỏi"
                  type="button"
                  onClick={() => setInputValue('Hôm nay bạn có thể chia sẻ điều gì hay không?')}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              <button
                className="w-9 h-9 rounded-xl bg-burgundy-900 hover:bg-burgundy-800 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-burgundy-950/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Gửi tin nhắn"
                type="submit"
                disabled={isTyping}
              >
                {isTyping ? (
                  <svg className="w-4 h-4 text-[#f5ebe0] animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-[#f5ebe0]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Chat Floating Trigger Button & Tooltip */}
      <div className="flex items-center gap-2.5">
        {/* Helper Tooltip Badge */}
        {!isOpen && (
          <div className="hidden sm:flex items-center gap-1.5 bg-white text-burgundy-950 font-bold text-xs py-1.5 px-3 rounded-full border border-burgundy-200/80 shadow-md shadow-stone-200/80 animate-bounce">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Trò chuyện cùng AI</span>
          </div>
        )}

        {/* Main Round Burgundy Trigger Button */}
        <button
          aria-label="Mở trợ lý ảo AI"
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-burgundy-900 to-burgundy-700 hover:from-burgundy-950 hover:to-burgundy-800 text-white flex items-center justify-center shadow-xl shadow-burgundy-950/30 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-burgundy-300/50 group cursor-pointer"
          id="openChatBtn"
          type="button"
        >
          {/* Notification Badge */}
          <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 flex h-3.5 w-3.5 sm:h-4 sm:w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-burgundy-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 bg-emerald-500 border-2 border-white"></span>
          </span>

          {/* AI Sparkle / Bot Icon */}
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-white/30 flex items-center justify-center bg-black/30 group-hover:scale-105 transition-transform duration-300 shadow-inner">
            <img
              alt="AI Assistant Avatar"
              className="w-full h-full object-cover object-center"
              src="https://tse2.mm.bing.net/th/id/OIP.sgDa5rHku5isdNgrXdGIpQAAAA?r=0&w=350&h=350&rs=1&pid=ImgDetMain&o=7&rm=3"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = `
                  <svg class="w-6 h-6 text-[#f5ebe0]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" stroke-linecap="round" stroke-linejoin="round"></path>
                  </svg>
                `;
              }}
            />
          </div>
        </button>
      </div>
    </div>
  );
}
