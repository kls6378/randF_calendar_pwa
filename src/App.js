import React, { useState } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MyPage from "./pages/MyPage";
import MyProfileEditPage from './pages/MyProfileEditPage';

import HomePage from "./pages/HomePage";
import AddEventPage from "./pages/AddEventPage";
import EventDetailPage from "./pages/EventDetailPage";

import GroupListPage from './pages/GroupListPage';
import GroupCreatePage from './pages/GroupCreatePage';
import GroupDetailPage from './pages/GroupDetailPage';
import GroupSettingPage from './pages/GroupSettingPage';
import GroupMemberPage from './pages/GroupMemberPage';


import "./App.css";

import Layout from "./components/Layout";
import AuthLayout from "./components/AuthLayout";

// [보안 구역] 로그인한 사람만 통과 (안 했으면 로그인 페이지로)
const PrivateRoute = ({ isAuth }) => {
  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
};

// [비회원 구역] 로그인 안 한 사람만 통과 (했으면 메인으로)
const PublicRoute = ({ isAuth }) => {
  return isAuth ? <Navigate to="/" replace /> : <Outlet />;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem("token"); // 토큰이 있으면 true, 없으면 false
  });

  // 로그인/로그아웃 함수
  const handleLogin = () => {
    // 토큰은 이미 LoginPage에서 저장했으므로 상태만 업데이트
    setIsLoggedIn(true);
  };

  return (
    <div className="App">
      <Routes>
        <Route element={<AuthLayout />}>
          {/* --- 누구나 접속 가능한 페이지 (Public) --- */}
          <Route element={<PublicRoute isAuth={isLoggedIn} />}>
            <Route
              path="/login"
              element={<LoginPage onLogin={handleLogin} />}
            />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
        </Route>

        {/* --- 로그인해야만 들어갈 수 있는 보안 구역 (Private) --- */}
        <Route element={<PrivateRoute isAuth={isLoggedIn} />}>
          <Route element={<Layout />}>
            {/* 메인 캘린더 */}
            <Route path="/" element={<HomePage />} />

            {/* 마이페이지 */}
            <Route path="/mypage" element={<MyPage />} />

            {/* 그룹 관련 페이지들 */}
            <Route path="/groups" element={<GroupListPage />} />
            <Route path="/groups/:id" element={<GroupDetailPage />} />
            <Route path="/groups/:id/members" element={<GroupMemberPage />} />
          </Route>
          {/* 마이페이지 */}
          <Route path="/mypage/edit" element={<MyProfileEditPage />} />

          {/* 일정 */}
          <Route path="/schedule/add" element={<AddEventPage />} />
          <Route path="/schedule/detail" element={<EventDetailPage />} />

          {/* 그룹 관련 페이지들 */}
          <Route path="/groups/create" element={<GroupCreatePage />} />
          <Route path="/groups/setting" element={<GroupSettingPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
