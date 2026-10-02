import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../ui/Input';
import Button from '../ui/Button';
import GoogleButton from '../ui/GoogleButton';

import { signInWithEmail, signInWithGoogle } from '../../services/authService';

/**
 * LoginForm component
 * Manages email/password credentials, remember-me state, and Supabase auth submission
 */
export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Vui lòng điền đầy đủ email và mật khẩu');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await signInWithEmail(email.trim(), password);
      navigate('/');
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('Invalid login credentials')) {
        setError('Email hoặc mật khẩu không chính xác.');
      } else if (msg.includes('Email not confirmed')) {
        setError('Email chưa được xác nhận. Vui lòng kiểm tra hộp thư của bạn.');
      } else if (msg.includes('Too many requests')) {
        setError('Quá nhiều lượt đăng nhập không thành công. Vui lòng đợi một lát rồi thử lại.');
      } else {
        setError(msg || 'Đăng nhập không thành công. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      setError('Không thể kết nối với Google. Vui lòng thử lại.');
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Google Login */}
      <div className="mb-3 sm:mb-4">
        <GoogleButton onClick={handleGoogleLogin} disabled={isLoading} />
      </div>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-3 sm:my-4">
        <div className="w-full border-t border-gray-200" />
        <span className="absolute px-3 bg-white text-[11px] uppercase tracking-wider text-gray-400 font-medium select-none">
          or Sign in with Email
        </span>
      </div>

      {/* Error Feedback */}
      {error && (
        <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        <Input
          label="Email"
          id="email"
          type="email"
          placeholder="mail@abc.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Remember me + Forgot Password */}
        <div className="flex items-center justify-between pt-0.5 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              id="remember_me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#6d1844] focus:ring-[#6d1844] cursor-pointer"
            />
            <span className="text-gray-700 font-medium">Remember Me</span>
          </label>
          <a
            href="#forgot"
            className="text-xs font-medium text-[#6d1844] hover:underline focus:outline-none"
            onClick={(e) => {
              e.preventDefault();
              alert('Chức năng sẽ được tích hợp ở giai đoạn backend.');
            }}
          >
            Forgot Password?
          </a>
        </div>

        {/* Submit */}
        <div className="pt-1.5">
          <Button type="submit" isLoading={isLoading} className="w-full">
            Login
          </Button>
        </div>
      </form>

      {/* Register link */}
      <p className="text-center text-xs text-gray-500 mt-4">
        Not Registered Yet?{' '}
        <Link to="/register" className="font-bold text-[#6d1844] hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}
