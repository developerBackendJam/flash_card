import React, { useState, useEffect, useRef } from 'react';
import { generateAIReply } from '../utils/aiReply';

export default function AIChatbotWidget({ currentCard, userName = 'Alex' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  // Initialize or update context message when current card changes
  useEffect(() => {
    if (!currentCard) return;

    const activeWord = currentCard?.front ?? currentCard?.word ?? '';
    const activeIpa = currentCard?.pronunciation ?? currentCard?.ipa ?? '';

    setMessages([
      {
        id: 1,
        sender: 'ai',
        text: `Xin chào ${userName}! Mình là LexiBot. Bạn đang xem từ "${activeWord}"${activeIpa ? ` (${activeIpa})` : ''}.`,
        time: 'Vừa xong',
      },
    ]);
  }, [currentCard, userName]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      time: 'Vừa xong',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');

    // Generate responsive contextual AI answer
    setTimeout(() => {
      const reply = generateAIReply(text, currentCard);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: reply,
          time: 'Vừa xong',
        },
      ]);
    }, 400);
  };

  return (
    <div
      className="fixed right-6 z-50 flex flex-col items-end"
      data-purpose="ai-chat-assistant"
      id="lexibotWidget"
      style={{ bottom: '4rem' }}
    >
      {/* Chat Popup Window */}
      {isOpen && (
        <div
          className="mb-4 w-[360px] sm:w-[380px] bg-white rounded-2xl shadow-2xl shadow-burgundy-950/25 border border-burgundy-100 overflow-hidden flex flex-col transition-all duration-300 ease-out"
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
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span> Đang trực tuyến
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors focus:outline-none"
              id="closeChatBtn"
              title="Đóng hộp thoại"
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
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

            {/* AI Interactive Prompt Suggestions */}
            <div className="flex items-start gap-2.5 pt-1">
              <div className="w-7 h-7 rounded-lg bg-burgundy-900 text-white flex-shrink-0 flex items-center justify-center text-[10px] font-bold shadow-sm opacity-90">
                LB
              </div>
              <div className="flex flex-col gap-1.5 max-w-[85%]">
                <div className="bg-white p-3 rounded-2xl rounded-tl-sm border border-stone-200/80 shadow-sm text-stone-800 leading-relaxed space-y-2">
                  <p className="font-semibold text-burgundy-950">Bạn muốn mình trợ giúp gì về từ này?</p>
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => handleSendMessage('Đặt 3 câu ví dụ giao tiếp')}
                      className="text-left px-2.5 py-1.5 rounded-lg bg-burgundy-50 hover:bg-burgundy-100 text-burgundy-900 font-medium transition-colors border border-burgundy-100 text-[11px] flex items-center justify-between"
                      type="button"
                    >
                      <span>✨ Đặt 3 câu ví dụ giao tiếp</span>
                      <span>→</span>
                    </button>
                    <button
                      onClick={() => handleSendMessage(`Phân biệt "${currentCard?.front ?? currentCard?.word ?? ''}" với từ đồng nghĩa`)}
                      className="text-left px-2.5 py-1.5 rounded-lg bg-burgundy-50 hover:bg-burgundy-100 text-burgundy-900 font-medium transition-colors border border-burgundy-100 text-[11px] flex items-center justify-between"
                      type="button"
                    >
                      <span>💡 Phân biệt từ đồng nghĩa</span>
                      <span>→</span>
                    </button>
                    <button
                      onClick={() => handleSendMessage('Hướng dẫn phát âm chuẩn Anh - Mỹ')}
                      className="text-left px-2.5 py-1.5 rounded-lg bg-burgundy-50 hover:bg-burgundy-100 text-burgundy-900 font-medium transition-colors border border-burgundy-100 text-[11px] flex items-center justify-between"
                      type="button"
                    >
                      <span>🗣️ Hướng dẫn phát âm chuẩn Anh - Mỹ</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

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
                  className="w-full text-xs py-2 px-3 pr-8 rounded-xl border border-stone-300 focus:outline-none focus:border-burgundy-900 focus:ring-1 focus:ring-burgundy-900 bg-stone-50/50 text-stone-800 placeholder-stone-400"
                  placeholder="Hỏi nghĩa, cách dùng, ví dụ..."
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-burgundy-700 transition-colors"
                  title="Gợi ý câu hỏi"
                  type="button"
                  onClick={() => setInputValue('Đặt câu ví dụ với từ này')}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              <button
                className="w-9 h-9 rounded-xl bg-burgundy-900 hover:bg-burgundy-800 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-burgundy-950/20 active:scale-95 transition-all"
                title="Gửi tin nhắn"
                type="submit"
              >
                <svg className="w-4 h-4 text-[#f5ebe0]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
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
            <span>Hỏi trợ lý AI từ vựng</span>
          </div>
        )}

        {/* Main Round Burgundy Trigger Button */}
        <button
          aria-label="Mở trợ lý ảo AI"
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-burgundy-900 to-burgundy-700 hover:from-burgundy-950 hover:to-burgundy-800 text-white flex items-center justify-center shadow-xl shadow-burgundy-950/30 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-burgundy-300/50 group"
          id="openChatBtn"
          type="button"
        >
          {/* Notification Badge */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-burgundy-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
          </span>

          {/* AI Sparkle / Bot Icon */}
          <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white/30 flex items-center justify-center bg-black/30 group-hover:scale-105 transition-transform duration-300 shadow-inner">
            <img
              alt="AI Assistant Avatar"
              className="w-full h-full object-cover object-center"
              src="https://tse2.mm.bing.net/th/id/OIP.sgDa5rHku5isdNgrXdGIpQAAAA?r=0&w=350&h=350&rs=1&pid=ImgDetMain&o=7&rm=3"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = `
                  <svg class="w-6 h-6 text-[#f5ebe0]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" stroke-linecap="round" stroke-linejoin="round"></path>
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
