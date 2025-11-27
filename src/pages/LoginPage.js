import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 페이지 이동 훅
import { Container, Box, TextField, Button, Typography, Paper, Avatar } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  
  // 입력된 값을 저장하는 상태(State)
  const [formData, setFormData] = useState({
    id: '',
    password: ''
  });

  // 입력창에 글자를 칠 때마다 상태를 업데이트하는 함수
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 로그인 버튼 클릭 시 실행되는 함수
  const handleSubmit = (e) => {
    e.preventDefault(); // 화면 새로고침 방지
    console.log('로그인 시도:', formData);
    // 여기에 나중에 백엔드로 로그인 요청을 보내는 코드
    

    // 백엔드 없이 테스트용
    onLogin();

    navigate('/');
  };

  

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%', // 부모 박스 너비에 맞춤
      }}
    >
      <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
        <LockOutlinedIcon />
      </Avatar>
      
      <Typography component="h1" variant="h5">
        로그인
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="id"
          label="아이디"
          name="id"
          autoFocus
          value={formData.id}
          onChange={handleChange}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="비밀번호"
          type="password"
          id="password"
          value={formData.password}
          onChange={handleChange}
        />
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1.1rem' }}
        >
          로그인
        </Button>

        <Button 
          fullWidth
          variant="text"
          onClick={() => navigate('/register')}
        >
          계정이 없으신가요? 회원가입
        </Button>
      </Box>
    </Box>
  );
}

export default LoginPage;