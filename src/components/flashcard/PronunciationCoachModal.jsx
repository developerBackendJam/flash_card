import React, { useState, useEffect, useRef } from 'react';
import { playPronunciation } from '../../utils/audioHelper';
import {
  calculatePronunciationScore,
  getPronunciationLevel,
  evaluatePronunciationWithAI,
} from '../../services/pronunciationService';

export default function PronunciationCoachModal({ isOpen, onClose, card }) {
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [score, setScore] = useState(null);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [errorNotice, setErrorNotice] = useState(null);

  // Lưu URL file âm thanh giọng nói thực tế của người dùng
  const [userAudioUrl, setUserAudioUrl] = useState(null);
  const [isPlayingUserAudio, setIsPlayingUserAudio] = useState(false);

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const userAudioPlayerRef = useRef(null);

  const targetWord = card?.front ?? card?.word ?? '';
  const ipa = card?.pronunciation ?? card?.ipa ?? '';
  const partOfSpeech = card?.part_of_speech ?? card?.partOfSpeech ?? 'Từ vựng';

  // Khởi tạo SpeechRecognition nếu trình duyệt hỗ trợ
  const isSpeechSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Reset state khi mở modal với card mới
  useEffect(() => {
    if (isOpen) {
      setSpokenText('');
      setScore(null);
      setAiFeedback(null);
      setErrorNotice(null);
      setIsListening(false);
      setIsAnalyzing(false);
      setUserAudioUrl(null);
      setIsPlayingUserAudio(false);
    }
  }, [isOpen, card]);

  // Hủy mic & audio khi đóng modal
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch {}
      }
      if (userAudioPlayerRef.current) {
        try {
          userAudioPlayerRef.current.pause();
        } catch {}
      }
    };
  }, []);

  // Bắt đầu thu âm giọng nói người dùng bằng MediaRecorder
  const startMediaRecording = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          if (audioChunksRef.current.length > 0) {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            setUserAudioUrl(audioUrl);
          }
          // Giải phóng micro sau khi thu xong
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
      }
    } catch (err) {
      console.warn('Không thể thu âm file audio người dùng:', err);
    }
  };

  // Dừng thu âm MediaRecorder
  const stopMediaRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
  };

  // Phát lại chính xác giọng nói của người dùng vừa đọc
  const handlePlayUserVoice = () => {
    if (!userAudioUrl) return;

    if (userAudioPlayerRef.current) {
      userAudioPlayerRef.current.pause();
      userAudioPlayerRef.current.currentTime = 0;
    }

    const audio = new Audio(userAudioUrl);
    userAudioPlayerRef.current = audio;
    setIsPlayingUserAudio(true);

    audio.onended = () => {
      setIsPlayingUserAudio(false);
    };

    audio.onerror = () => {
      setIsPlayingUserAudio(false);
    };

    audio.play().catch((err) => {
      console.warn('Lỗi khi phát lại giọng người dùng:', err);
      setIsPlayingUserAudio(false);
    });
  };

  const startListening = () => {
    if (!isSpeechSupported) {
      setErrorNotice('Trình duyệt chưa hỗ trợ nhận dạng giọng nói trực tiếp. Hãy dùng Google Chrome hoặc Microsoft Edge.');
      return;
    }

    // Dừng phát âm cũ nếu đang phát
    if (userAudioPlayerRef.current) {
      userAudioPlayerRef.current.pause();
    }
    setIsPlayingUserAudio(false);

    setErrorNotice(null);
    setSpokenText('');
    setScore(null);
    setAiFeedback(null);
    setUserAudioUrl(null);
    setIsListening(true);

    // Kích hoạt thu âm file âm thanh người dùng song song
    startMediaRecording();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = async (event) => {
      stopMediaRecording();

      const result = event.results[0][0];
      const transcript = result.transcript || '';
      const confidence = result.confidence || 0.85;

      setSpokenText(transcript);
      setIsListening(false);
      setIsAnalyzing(true);

      // 1. Tính toán điểm số phần trăm (%)
      const calculatedScore = calculatePronunciationScore(targetWord, transcript, confidence);
      setScore(calculatedScore);

      // 2. Gửi lên Cloudflare Worker AI để phân tích khẩu hình và chỉ rõ lỗi sai
      const feedbackData = await evaluatePronunciationWithAI({
        targetWord,
        spokenText: transcript,
        ipa,
        score: calculatedScore,
      });

      setAiFeedback(feedbackData);
      setIsAnalyzing(false);
    };

    recognition.onerror = (event) => {
      console.warn('Lỗi ghi âm giọng nói:', event.error);
      stopMediaRecording();
      setIsListening(false);
      setIsAnalyzing(false);

      if (event.error === 'not-allowed') {
        setErrorNotice('Vui lòng cho phép quyền truy cập Micro trên trình duyệt để luyện nói.');
      } else if (event.error === 'no-speech') {
        setErrorNotice('Chưa thu được giọng nói. Bạn hãy bấm Micro và đọc to, rõ ràng hơn nhé.');
      } else {
        setErrorNotice(`Lỗi micro: ${event.error}. Vui lòng thử lại.`);
      }
    };

    recognition.onend = () => {
      stopMediaRecording();
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error('Không thể kích hoạt SpeechRecognition:', e);
      stopMediaRecording();
      setIsListening(false);
    }
  };

  const stopListening = () => {
    stopMediaRecording();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  };

  if (!isOpen || !card) return null;

  const levelInfo = score !== null ? getPronunciationLevel(score) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] animate-scale-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-[#5a1238] via-[#6d1844] to-[#882156] text-white p-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-xl shadow-inner">
              🎙️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight text-white">
                  AI Pronunciation Coach
                </h3>
                <span className="text-[10px] bg-amber-400 text-stone-950 font-bold px-2 py-0.2 rounded-full uppercase tracking-wider">
                  Chấm Điểm
                </span>
              </div>
              <p className="text-[11px] text-[#f5ebe0]/80">
                Luyện nói, nghe lại giọng bạn và nhận chỉ dẫn sửa lỗi từ AI
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors focus:outline-none cursor-pointer"
            title="Đóng"
            type="button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Nội dung chính */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-stone-800">
          {/* Card từ vựng mục tiêu */}
          <div className="bg-[#faf5f0] border border-stone-200/90 rounded-2xl p-4 sm:p-5 text-center relative shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6d1844] bg-[#fdf0e6] border border-[#e8c4aa] px-2.5 py-0.5 rounded-full inline-block mb-1">
              {partOfSpeech}
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-stone-900">
              {targetWord}
            </h2>
            {ipa && (
              <p className="text-sm font-mono font-medium text-stone-500 mt-0.5">
                {ipa}
              </p>
            )}

            <button
              onClick={() => playPronunciation(targetWord)}
              type="button"
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 text-xs font-semibold shadow-xs hover:border-[#6d1844] hover:text-[#6d1844] transition-all cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-[#6d1844]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6 9H4a1 1 0 00-1 1v4a1 1 0 001 1h2l4 4V5L6 9z" />
              </svg>
              <span>Nghe giọng mẫu bản xứ</span>
            </button>
          </div>

          {/* Khu vực Ghi âm & Nút Micro */}
          <div className="flex flex-col items-center justify-center py-2 space-y-3">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isAnalyzing}
              type="button"
              className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl cursor-pointer focus:outline-none ${
                isListening
                  ? 'bg-rose-600 text-white ring-8 ring-rose-200 animate-pulse scale-110'
                  : 'bg-gradient-to-tr from-[#6d1844] to-[#882156] hover:from-[#5a1238] hover:to-[#6d1844] text-white hover:scale-105 active:scale-95 ring-4 ring-[#f5ebe0]'
              }`}
              title={isListening ? 'Bấm để dừng' : 'Bấm để bắt đầu đọc'}
            >
              {isListening ? (
                <div className="flex flex-col items-center justify-center">
                  {/* Hiệu ứng sóng âm thanh động mềm mại (không có ô vuông) */}
                  <div className="flex items-center gap-1 h-6">
                    <span className="w-1 bg-white rounded-full animate-bounce h-3" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 bg-white rounded-full animate-bounce h-5" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 bg-white rounded-full animate-bounce h-3.5" style={{ animationDelay: '300ms' }} />
                    <span className="w-1 bg-white rounded-full animate-bounce h-6" style={{ animationDelay: '75ms' }} />
                    <span className="w-1 bg-white rounded-full animate-bounce h-3" style={{ animationDelay: '225ms' }} />
                  </div>
                  <span className="text-[10px] font-bold text-white mt-1 uppercase tracking-wide">Dừng</span>
                </div>
              ) : (
                <svg className="w-8 h-8 text-[#f5ebe0]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>

            <div className="text-center">
              {isListening ? (
                <p className="text-xs font-bold text-rose-600 animate-pulse">
                  🎙️ Đang lắng nghe & ghi âm... Hãy đọc to: "{targetWord}"
                </p>
              ) : isAnalyzing ? (
                <p className="text-xs font-bold text-[#6d1844] flex items-center gap-1.5 justify-center">
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  <span>AI đang phân tích khẩu hình & âm sắc...</span>
                </p>
              ) : (
                <p className="text-xs text-stone-500 font-medium">
                  Nhấn nút Micro và đọc to từ <span className="font-bold text-stone-800">"{targetWord}"</span>
                </p>
              )}
            </div>
          </div>

          {/* Thông báo lỗi nếu có */}
          {errorNotice && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center font-medium">
              {errorNotice}
            </div>
          )}

          {/* KẾT QUẢ ĐÁNH GIÁ PHÁT ÂM (Hiển thị khi đã chấm điểm) */}
          {score !== null && levelInfo && (
            <div className={`p-5 rounded-3xl border-2 ${levelInfo.bgColor} ${levelInfo.borderColor} space-y-4 animate-scale-up shadow-sm`}>
              {/* Điểm số & Badge Cấp độ màu sắc */}
              <div className="flex items-center justify-between border-b border-stone-200/70 pb-3">
                <div className="flex items-center gap-3">
                  {/* Vòng tròn điểm số với màu chuẩn */}
                  <div
                    className={`w-14 h-14 rounded-2xl bg-white border-2 ${levelInfo.borderColor} flex flex-col items-center justify-center shadow-xs ring-4 ${levelInfo.ringColor}`}
                  >
                    <span className={`text-xl font-black ${levelInfo.textColor}`}>
                      {score}%
                    </span>
                    <span className="text-[9px] font-bold text-stone-400 -mt-1 uppercase">Điểm</span>
                  </div>

                  <div>
                    <span className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full border ${levelInfo.badgeColor} inline-block`}>
                      {levelInfo.badge} - {levelInfo.label}
                    </span>
                    <p className="text-[11px] text-stone-500 mt-1">
                      {levelInfo.summary}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bảng quy định thang màu chuẩn (Color Legend) */}
              <div className="bg-white/80 rounded-xl p-2.5 border border-stone-200/80 flex items-center justify-between text-[10px] font-semibold">
                <span className="text-stone-400 uppercase tracking-wider text-[9px]">Quy chuẩn màu:</span>
                <span className="text-rose-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span> &lt; 60% Đỏ
                </span>
                <span className="text-amber-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span> 60-79% Vàng
                </span>
                <span className="text-emerald-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> ≥ 80% Xanh
                </span>
              </div>

              {/* So sánh âm thanh máy nghe được & Nút nghe lại giọng của chính bạn */}
              <div className="p-3.5 rounded-2xl bg-white border border-stone-200 text-xs space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-stone-400 font-semibold text-[11px]">Từ máy nghe được:</span>
                  <span className="font-mono font-bold text-stone-900 bg-stone-100 px-2.5 py-0.5 rounded">
                    "{spokenText || 'chưa rõ'}"
                  </span>
                </div>

                {userAudioUrl && (
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] text-stone-500 font-medium">
                      Bản ghi âm giọng bạn:
                    </span>
                    <button
                      onClick={handlePlayUserVoice}
                      type="button"
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs ${
                        isPlayingUserAudio
                          ? 'bg-[#6d1844] text-white animate-pulse'
                          : 'bg-[#faf5f0] hover:bg-[#fdf0e6] text-[#6d1844] border border-[#e8c4aa]'
                      }`}
                      title="Bấm để nghe lại đúng giọng bạn vừa đọc"
                    >
                      {isPlayingUserAudio ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                          <span>Đang phát giọng bạn...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round"
                              d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6 9H4a1 1 0 00-1 1v4a1 1 0 001 1h2l4 4V5L6 9z" />
                          </svg>
                          <span>Nghe lại giọng bạn</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Nhận xét chi tiết & Mẹo sửa lỗi từ AI Coach */}
              {aiFeedback && (
                <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs space-y-2.5 text-xs">
                  <div>
                    <span className="font-extrabold text-[#6d1844] flex items-center gap-1 text-[11px] uppercase tracking-wide">
                      <span>💡</span> Chỉ rõ lỗi phát âm:
                    </span>
                    <p className="text-stone-700 mt-1 leading-relaxed font-medium">
                      {aiFeedback.feedback}
                    </p>
                  </div>

                  {aiFeedback.tip && (
                    <div className="border-t border-stone-100 pt-2">
                      <span className="font-extrabold text-amber-800 flex items-center gap-1 text-[11px] uppercase tracking-wide">
                        <span>👄</span> Mẹo khẩu hình & đặt lưỡi cho từ "{targetWord}":
                      </span>
                      <p className="text-stone-600 mt-0.5 leading-relaxed">
                        {aiFeedback.tip}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
          {/* NÚT NGHE LẠI GIỌNG NÓI CỦA NGƯỜI DÙNG */}
          <button
            onClick={handlePlayUserVoice}
            disabled={!userAudioUrl || isPlayingUserAudio}
            type="button"
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer ${
              userAudioUrl
                ? isPlayingUserAudio
                  ? 'bg-[#6d1844] text-white border-[#6d1844] animate-pulse shadow-md'
                  : 'bg-white hover:bg-stone-50 border-stone-300 text-stone-800 hover:border-[#6d1844] hover:text-[#6d1844]'
                : 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed opacity-60'
            }`}
            title={userAudioUrl ? 'Phát lại chính xác giọng nói bạn vừa đọc' : 'Chưa có bản ghi âm'}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6 9H4a1 1 0 00-1 1v4a1 1 0 001 1h2l4 4V5L6 9z" />
            </svg>
            <span>{isPlayingUserAudio ? 'Đang phát giọng bạn...' : 'Nghe lại giọng bạn'}</span>
          </button>

          {/* Nút Đọc lại */}
          <button
            onClick={startListening}
            disabled={isListening || isAnalyzing}
            type="button"
            className="px-5 py-2.5 rounded-xl bg-[#6d1844] hover:bg-[#5a1238] text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5 ml-auto"
          >
            <span>🎙️ Đọc lại</span>
          </button>
        </div>
      </div>
    </div>
  );
}
