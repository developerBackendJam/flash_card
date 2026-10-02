import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../ui/Input';
import Button from '../ui/Button';
import GoogleButton from '../ui/GoogleButton';

import { signUpWithEmail, signInWithGoogle } from '../../services/authService';

/**
 * RegisterForm component
 * Manages full name, email, password validation, and Supabase registration submission
 */
export default function RegisterForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Vui lòng nhập họ và tên';
    if (!form.email.trim()) e.email = 'Vui lòng nhập email';
    if (!form.password) e.password = 'Vui lòng nhập mật khẩu';
    if (form.password && form.password.length < 6)
      e.password = 'Mật khẩu tối thiểu 6 ký tự';
    if (!form.confirmPassword)
      e.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword)
      e.confirmPassword = 'Mật khẩu xác nhận không khớp';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const data = await signUpWithEmail(form.email.trim(), form.password, form.fullName.trim());
      if (data?.session) {
        navigate('/');
      } else {
        setSuccessMsg(
          'Đăng ký thành công! Nếu được yêu cầu xác thực email, vui lòng kiểm tra hộp thư của bạn trước khi đăng nhập.'
        );
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('already registered')) {
        setErrors({ email: 'Email này đã được đăng ký tài khoản.' });
      } else if (msg.includes('Password should be')) {
        setErrors({ password: 'Mật khẩu chưa đủ mạnh. Vui lòng thử mật khẩu khác.' });
      } else {
        setErrors({ general: msg || 'Không thể tạo tài khoản. Vui lòng thử lại.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setIsLoading(true);
    setErrors({});
    try {
      await signInWithGoogle();
    } catch {
      setErrors({ general: 'Không thể kết nối với Google. Vui lòng thử lại.' });
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Google */}
      <div className="mb-2.5 sm:mb-3">
        <GoogleButton
          onClick={handleGoogleRegister}
          disabled={isLoading}
          text="Continue with Google"
        />
      </div>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-2.5 sm:my-3">
        <div className="w-full border-t border-gray-200" />
        <span className="absolute px-3 bg-white text-[11px] uppercase tracking-wider text-gray-400 font-medium select-none">
          or Sign up with Email
        </span>
      </div>

      {/* Success / Error Feedback */}
      {successMsg && (
        <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 font-medium">
          {successMsg}
        </div>
      )}
      {errors.general && (
        <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
          {errors.general}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-2.5" noValidate>
        <Input
          label="Full Name"
          id="fullName"
          type="text"
          placeholder="Nguyen Van A"
          value={form.fullName}
          onChange={handleChange('fullName')}
          error={errors.fullName}
          required
        />
        <Input
          label="Email"
          id="email"
          type="email"
          placeholder="mail@abc.com"
          value={form.email}
          onChange={handleChange('email')}
          error={errors.email}
          required
        />
        <Input
          label="Password"
          id="password"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange('password')}
          error={errors.password}
          required
        />
        <Input
          label="Confirm Password"
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={form.confirmPassword}
          onChange={handleChange('confirmPassword')}
          error={errors.confirmPassword}
          required
        />

        <div className="pt-1">
          <Button type="submit" isLoading={isLoading} className="w-full">
            Create Account
          </Button>
        </div>
      </form>

      {/* Login link */}
      <p className="text-center text-xs text-gray-500 mt-4">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-[#6d1844] hover:underline">
          Sign in here
        </Link>
      </p>
    </>
  );
}
