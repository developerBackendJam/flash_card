import React from 'react';
import AuthLayout from '../components/auth/AuthLayout';
import LoginForm from '../components/auth/LoginForm';

export default function Login() {
  return (
    <AuthLayout
      title="Login to your Account"
      subtitle="See what is going on with your business"
      purpose="login-form-container"
    >
      <LoginForm />
    </AuthLayout>
  );
}
