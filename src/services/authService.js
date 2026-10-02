import { supabase } from '../lib/supabase.js';

/**
 * Đăng nhập bằng email và mật khẩu qua Supabase Auth
 */
export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Lỗi khi đăng nhập:', error);
    throw error;
  }

  return data;
}

/**
 * Đăng ký tài khoản mới qua Supabase Auth
 */
export async function signUpWithEmail(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    console.error('Lỗi khi đăng ký:', error);
    throw error;
  }

  return data;
}

/**
 * Đăng nhập / Đăng ký qua Google OAuth
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });

  if (error) {
    console.error('Lỗi khi đăng nhập bằng Google:', error);
    throw error;
  }

  return data;
}

/**
 * Đăng xuất người dùng hiện tại
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Lỗi khi đăng xuất:', error);
    throw error;
  }
}

/**
 * Lấy thông tin user hiện tại
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    return null;
  }
  return user;
}
