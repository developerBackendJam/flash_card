import React from 'react';
import AuthLayout from '../components/auth/AuthLayout';
import RegisterForm from '../components/auth/RegisterForm';

export default function Register() {
  return (
    <AuthLayout
      title="Create your Account"
      subtitle="Join LexiCard and start mastering vocabulary today"
      purpose="register-form-container"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
