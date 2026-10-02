import React from 'react';

export default function Footer() {
  return (
    <footer className="py-4 text-center text-xs text-stone-600 border-t border-stone-200/70 bg-white/50">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© 2025 LexiCard App. Turn your ideas into reality.</p>
        <div className="flex items-center gap-4">
          <a className="hover:text-burgundy-900 transition-colors" href="#help">Trung tâm trợ giúp</a>
          <a className="hover:text-burgundy-900 transition-colors" href="#settings">Cài đặt học tập</a>
          <a className="hover:text-burgundy-900 transition-colors" href="#terms">Điều khoản</a>
        </div>
      </div>
    </footer>
  );
}
