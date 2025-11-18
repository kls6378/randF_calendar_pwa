import React from "react";
import logo from "./logo.svg";
import { Routes, Route } from 'react-router-dom';
import "./App.css";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<h1>여기는 메인 캘린더 뷰</h1>} />
        <Route path="/login" element={<h1>로그인 페이지</h1>} />
        <Route path="/register" element={<h1>회원가입 페이지</h1>} />
        <Route path="/mypage" element={<h1>마이페이지</h1>} />
        <Route path="/groups" element={<h1>내 그룹 목록</h1>} />
      </Routes>
    </div>
  );
}

export default App;
