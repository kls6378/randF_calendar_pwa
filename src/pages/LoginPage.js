import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  InputAdornment,
  IconButton,
  Alert, // Alert 컴포넌트 추가
  Collapse, // 에러 메시지 애니메이션용
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { motion } from "framer-motion";

function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ id: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  
  // 에러 메시지 상태
  const [errorMsg, setErrorMsg] = useState(""); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // 사용자가 다시 입력하기 시작하면 에러 메시지 지우기
    if (errorMsg) setErrorMsg("");
  };

  // 로그인 api
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(""); // 요청 전 초기화

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("로그인 성공:", data);

        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("nickname", data.nickname);
        localStorage.setItem("userId", formData.id);

        onLogin();
        navigate("/");
      } else {
        // 로그인 실패 시 (비밀번호 틀림 등)
        setErrorMsg("아이디 또는 비밀번호가 일치하지 않습니다.");
      }
    } catch (error) {
      console.error("로그인 요청 에러:", error);
      setErrorMsg("서버 연결에 실패했습니다. 관리자에게 문의하세요.");
    }
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        px: 2,
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 5, mt: 2 }}>
        {/* 로고 영역 */}
        <Box component="img" src="/favicon.ico" alt="Logo" sx={{ width: 48, height: 48, mb: 2 }} />
        <Typography component="h1" variant="h4" fontWeight="900" color="primary.main" sx={{ letterSpacing: -0.5 }}>
          R&F Calendar
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1, fontWeight: 500 }}>
          대학생을 위한 스마트한 일정 관리
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
        
        {/* 에러 메시지 출력 영역 (빨간색 박스) */}
        <Collapse in={!!errorMsg}> 
          {errorMsg && (
            <Alert 
              severity="error" 
              sx={{ mb: 2, borderRadius: 2 }}
            >
              {errorMsg}
            </Alert>
          )}
        </Collapse>

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
          error={!!errorMsg} // 에러 시 테두리 빨갛게
          InputProps={{
            inputProps: { maxLength: 20 },
            startAdornment: (
              <InputAdornment position="start">
                <PersonOutlineIcon color={errorMsg ? "error" : "action"} />
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
          error={!!errorMsg} // 에러 시 테두리 빨갛게
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlinedIcon color={errorMsg ? "error" : "action"} />
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
            borderRadius: 3,
            fontWeight: "bold",
            boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
          }}
        >
          로그인
        </Button>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 2 }}>
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