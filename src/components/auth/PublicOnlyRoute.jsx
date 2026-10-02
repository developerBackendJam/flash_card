import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

/**
 * Route Guard: Dành cho trang /login và /register.
 * Nếu người dùng đã đăng nhập rồi -> Tự động chuyển hướng thẳng vào /study.
 */
export default function PublicOnlyRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setIsAuthenticated(!!session);
          setLoading(false);
        }
      } catch (err) {
        console.error('Lỗi kiểm tra session:', err);
        if (mounted) {
          setIsAuthenticated(false);
          setLoading(false);
        }
      }
    }

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setIsAuthenticated(!!session);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 rounded-full border-3 border-[#6d1844]/20 border-t-[#6d1844] animate-spin mb-3" />
        <p className="text-stone-600 font-semibold text-xs tracking-wide">Đang tải...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/study" replace />;
  }

  return children;
}
