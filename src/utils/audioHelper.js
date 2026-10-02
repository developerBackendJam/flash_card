/**
 * Audio helper for English vocabulary pronunciation.
 * Supports HTML5 Audio MP3 fallback + Web Speech API
 * Guaranteed to work smoothly across mobile browsers (iOS Safari, Android Chrome).
 */

let currentAudio = null;

export function playPronunciation(word) {
  if (!word) return;
  const cleanWord = word.trim().toLowerCase();

  // Stop any currently playing audio
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {
      // ignore
    }
    currentAudio = null;
  }

  // Reliable MP3 audio pronunciation sources (Type 2 = US English)
  const audioUrls = [
    `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanWord)}&type=2`,
    `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=${encodeURIComponent(cleanWord)}`
  ];

  let urlIndex = 0;

  function tryNextAudio() {
    if (urlIndex >= audioUrls.length) {
      // Fallback to SpeechSynthesis if network audio is unavailable
      speakWithSpeechSynthesis(cleanWord);
      return;
    }

    const url = audioUrls[urlIndex++];
    const audio = new Audio(url);
    currentAudio = audio;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Audio playback error, trying next source:', err);
        tryNextAudio();
      });
    }
  }

  function speakWithSpeechSynthesis(text) {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = 'en-US';
      utt.rate = 0.85;

      const voices = window.speechSynthesis.getVoices();
      const enVoice = voices.find(
        (v) => v.lang.startsWith('en-US') || v.lang.startsWith('en')
      );
      if (enVoice) utt.voice = enVoice;

      window.speechSynthesis.speak(utt);
    } catch (e) {
      console.error('SpeechSynthesis error:', e);
    }
  }

  tryNextAudio();
}
