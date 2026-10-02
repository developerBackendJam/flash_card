import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

/**
 * Route Guard: Bắt buộc người dùng phải đăng nhập mới được truy cập.
 * Nếu chưa đăng nhập -> Tự động chuyển hướng sang /login.
 */
export default function ProtectedRoute({ children }) {
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
        console.error('Lỗi kiểm tra phiên đăng nhập:', err);
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
        <p className="text-stone-600 font-semibold text-xs tracking-wide">Đang xác thực tài khoản...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
