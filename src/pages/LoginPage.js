import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Avatar,
  Link,
  Divider,
  InputAdornment,
  IconButton,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"; // 앱 로고용
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { motion } from "framer-motion"; // 애니메이션 추가

function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ id: "", password: "" });
  const [showPassword, setShowPassword] = useState(false); // 비밀번호 보이기 토글

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("로그인 시도:", formData);

    // 임시 로그인 처리 (토큰 등 저장)
    localStorage.setItem("nickname", "김열정");
    localStorage.setItem("isAuth", "true");

    onLogin();
    navigate("/");
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }} // 아래에서 위로 페이드인
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        px: 2, // 좌우 여백 살짝
      }}
    >
      {/* 브랜딩 영역 (앱 로고 & 소개) */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mb: 5,
          mt: 2,
        }}
      >
        {/* 로고 아이콘 */}
        <Box
          component="img"
          src="/favicon.ico" // public 폴더 내 파일
          alt="R&F Calendar Logo"
          sx={{
            width: 48,
            height: 48,
            mb: 2,
          }}
        />

        {/* 앱 이름 */}
        <Typography
          component="h1"
          variant="h4"
          fontWeight="900"
          color="primary.main"
          sx={{ letterSpacing: -0.5 }}
        >
          R&F Calendar
        </Typography>

        {/* 캐치프레이즈 */}
        <Typography
          variant="subtitle1"
          color="text.secondary"
          sx={{ mt: 1, fontWeight: 500 }}
        >
          대학생을 위한 스마트한 일정 관리
        </Typography>
      </Box>

      {/* 입력 폼 영역 */}
      <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="id"
          label="아이디"
          name="id"
          autoComplete="username"
          autoFocus
          value={formData.id}
          onChange={handleChange}
          // 아이콘 추가 (UX 향상)
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonOutlineIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="비밀번호"
          type={showPassword ? "text" : "password"}
          id="password"
          autoComplete="current-password"
          value={formData.password}
          onChange={handleChange}
          // 비밀번호 보이기/숨기기 버튼 & 아이콘
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlinedIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* 로그인 버튼 */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          sx={{
            mt: 4,
            mb: 2,
            py: 1.8,
            fontSize: "1.1rem",
            borderRadius: 3, // 둥글게
            fontWeight: "bold",
            boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
          }}
        >
          로그인
        </Button>
      </Box>
      {/* 하단 링크 (회원가입 등) */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mt: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          계정이 없으신가요?
        </Typography>
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate("/register")}
          sx={{ ml: 1, fontWeight: "bold", textDecoration: "none" }}
        >
          회원가입
        </Link>
      </Box>
    </Box>
  );
}

export default LoginPage;
