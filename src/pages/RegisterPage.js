import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Avatar, Link, InputAdornment, IconButton } from '@mui/material';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined'; // 회원가입 아이콘
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'; // 아이디 아이콘
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'; // 비번 아이콘
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'; // 닉네임 아이콘
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { motion } from 'framer-motion';

function RegisterPage() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    id: '',
    password: '',
    confirmPassword: '',
    nickname: ''
  });

  const [isPasswordMismatch, setIsPasswordMismatch] = useState(false);
  
  // 비밀번호 보이기/숨기기 토글 상태
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ID 중복 체크 관련 상태
  const [idMessage, setIdMessage] = useState(''); 
  const [isIdAvailable, setIsIdAvailable] = useState(false); 
  const [isChecking, setIsChecking] = useState(false); 

  // ID 실시간 중복 체크
  useEffect(() => {
    const checkId = async () => {
      if (!formData.id) {
        setIdMessage('');
        setIsIdAvailable(false);
        return;
      }

      // TODO: 실제 백엔드 API 호출로 교체
      // 예: const response = await fetch(`/api/users/check-id?id=${formData.id}`);
      setIsChecking(true); 

      // (임시) 0.5초 뒤 가짜 응답
      setTimeout(() => {
        const mockTakenIds = ['admin', 'test', 'user'];
        
        if (mockTakenIds.includes(formData.id)) {
          setIdMessage('이미 사용 중인 아이디입니다.');
          setIsIdAvailable(false);
        } else {
          setIdMessage('사용 가능한 아이디입니다.');
          setIsIdAvailable(true);
        }
        setIsChecking(false);
      }, 500);
    };

    // 디바운스: 0.5초 동안 입력이 없으면 체크 실행
    const timer = setTimeout(checkId, 500);
    return () => clearTimeout(timer);

  }, [formData.id]);


  // 비밀번호 실시간 체크
  useEffect(() => {
    if (formData.password && formData.confirmPassword) {
      setIsPasswordMismatch(formData.password !== formData.confirmPassword);
    } else {
      setIsPasswordMismatch(false);
    }
  }, [formData.password, formData.confirmPassword]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.id || !formData.password || !formData.confirmPassword || !formData.nickname) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    if (!isIdAvailable) {
      alert("아이디를 확인해주세요.");
      return;
    }
    if (isPasswordMismatch) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    const { confirmPassword, ...submitData } = formData;
    console.log('회원가입 요청 데이터:', submitData);
    
    // TODO: 백엔드 회원가입 API 호출 (POST /auth/register)
    
    alert('회원가입이 완료되었습니다! 로그인해주세요.');
    navigate('/login');
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }} // 애니메이션 효과
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        px: 2,
        pb: 4
      }}
    >
      {/* 1. 상단 브랜딩 (회원가입 느낌) */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4, mt: 4 }}>
        <Avatar 
          sx={{ 
            m: 1, 
            bgcolor: 'secondary.main', // 회원가입은 보라색 포인트
            width: 56, 
            height: 56,
            boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)' 
          }}
        >
          <PersonAddOutlinedIcon sx={{ fontSize: 28 }} />
        </Avatar>
        <Typography component="h1" variant="h5" fontWeight="bold">
          회원가입
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          R&F Calendar와 함께하세요!
        </Typography>
      </Box>

      {/* 2. 입력 폼 */}
      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
        
        {/* 아이디 */}
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
          error={formData.id.length > 0 && !isIdAvailable && !isChecking}
          helperText={
            isChecking ? "확인 중..." : (
              <span style={{ color: isIdAvailable ? '#2e7d32' : '#d32f2f', fontWeight: 'bold' }}>
                {idMessage}
              </span>
            )
          }
          // 아이콘 추가
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonOutlineIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        {/* 비밀번호 */}
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="비밀번호"
          type={showPassword ? 'text' : 'password'}
          id="password"
          value={formData.password}
          onChange={handleChange}
          error={isPasswordMismatch}
          InputProps={{
            startAdornment: <InputAdornment position="start"><LockOutlinedIcon color="action" /></InputAdornment>,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        {/* 비밀번호 확인 */}
        <TextField
          margin="normal"
          required
          fullWidth
          name="confirmPassword"
          label="비밀번호 확인"
          type={showConfirmPassword ? 'text' : 'password'}
          id="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={isPasswordMismatch}
          helperText={isPasswordMismatch ? "비밀번호가 일치하지 않습니다." : ""}
          InputProps={{
            startAdornment: <InputAdornment position="start"><LockOutlinedIcon color="action" /></InputAdornment>,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        {/* 닉네임 */}
        <TextField
          margin="normal"
          required
          fullWidth
          id="nickname"
          label="닉네임"
          name="nickname"
          value={formData.nickname}
          onChange={handleChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <BadgeOutlinedIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        {/* 가입 버튼 (디자인 통일) */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={!isIdAvailable || isPasswordMismatch} // 유효하지 않으면 클릭 불가
          sx={{ 
            mt: 4, 
            mb: 2, 
            py: 1.8, 
            fontSize: '1.1rem', 
            borderRadius: 3,
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
          }}
        >
          가입하기
        </Button>

        {/* 로그인 링크 (디자인 통일) */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
                이미 계정이 있으신가요?
            </Typography>
            <Link 
                component="button"
                variant="body2" 
                onClick={() => navigate('/login')}
                sx={{ ml: 1, fontWeight: 'bold', textDecoration: 'none' }}
            >
                로그인
            </Link>
        </Box>
      </Box>
    </Box>
  );
}

export default RegisterPage;