import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import StudyPage from './pages/StudyPage';
import QuizArenaPage from './pages/QuizArenaPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicOnlyRoute from './components/auth/PublicOnlyRoute';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Chỉ người dùng đã đăng nhập mới được vào học */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <StudyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/study"
          element={
            <ProtectedRoute>
              <StudyPage />
            </ProtectedRoute>
          }
        />

        {/* Cuộc thi Đấu trường 30 câu hỏi */}
        <Route
          path="/arena"
          element={
            <ProtectedRoute>
              <QuizArenaPage />
            </ProtectedRoute>
          }
        />

        {/* Khách chưa đăng nhập vào đăng nhập / đăng ký (nếu đã đăng nhập rồi thì vào thẳng /study) */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
