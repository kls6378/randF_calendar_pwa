import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Avatar } from '@mui/material';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';

function RegisterPage() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    id: '',
    password: '',
    confirmPassword: '',
    nickname: ''
  });

  const [isPasswordMismatch, setIsPasswordMismatch] = useState(false);
  
  // ID 중복 체크 관련 상태
  const [idMessage, setIdMessage] = useState(''); // 결과 메시지
  const [isIdAvailable, setIsIdAvailable] = useState(false); // 사용 가능 여부
  const [isChecking, setIsChecking] = useState(false); // 로딩 상태 (선택사항)

  // ID 실시간 중복 체크 (Debounce 적용)
  useEffect(() => {
    const checkId = async () => {
      if (!formData.id) {
        setIdMessage('');
        setIsIdAvailable(false);
        return;
      }

      // TODO: 실제 백엔드 API 호출로 교체해야 함
      // 예: const response = await axios.get(`/api/check-id?id=${formData.id}`);
      
      setIsChecking(true); // 로딩 시작

      // (임시) 0.5초 뒤에 가짜 응답 받기
      setTimeout(() => {
        const mockTakenIds = ['admin', 'test', 'user']; // 이미 있는 아이디들 (가정)
        
        if (mockTakenIds.includes(formData.id)) {
          setIdMessage('이미 사용 중인 아이디입니다.');
          setIsIdAvailable(false);
        } else {
          setIdMessage('사용 가능한 아이디입니다.');
          setIsIdAvailable(true);
        }
        setIsChecking(false); // 로딩 끝
      }, 500);
    };

    // 0.5초 동안 입력이 없으면 체크 실행 (Debounce)
    const timer = setTimeout(checkId, 500);
    
    // 0.5초 전에 다시 입력하면 타이머 취소 (이전 요청 취소)
    return () => clearTimeout(timer);

  }, [formData.id]);


  // 비밀번호 실시간 체크 (기존 코드)
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

    // 안전장치: ID 중복이거나 비번 틀리면 막음
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
    
    alert('회원가입이 완료되었습니다! 로그인해주세요.');
    navigate('/login');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
        <PersonAddOutlinedIcon />
      </Avatar>
      
      <Typography component="h1" variant="h5">
        회원가입
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
        
        {/* 아이디 (중복 체크 기능 추가) */}
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
          // 에러 상태 표시: 입력했는데 사용 불가하거나 로딩중이 아닐 때
          error={formData.id.length > 0 && !isIdAvailable && !isChecking}
          // 메시지 표시 (초록색/빨간색 구분)
          helperText={
            isChecking ? "확인 중..." : (
              <span style={{ color: isIdAvailable ? '#2e7d32' : '#d32f2f' }}>
                {idMessage}
              </span>
            )
          }
        />

        {/* 비밀번호 */}
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

        {/* 비밀번호 확인 */}
        <TextField
          margin="normal"
          required
          fullWidth
          name="confirmPassword"
          label="비밀번호 확인"
          type="password"
          id="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={isPasswordMismatch}
          helperText={isPasswordMismatch ? "비밀번호가 일치하지 않습니다." : ""}
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
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          // 아이디 중복이거나 비번 틀리면 버튼 비활성화
          disabled={!isIdAvailable || isPasswordMismatch}
          sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1.1rem' }}
        >
          가입하기
        </Button>

        <Button
          fullWidth
          variant="text"
          onClick={() => navigate('/login')}
        >
          이미 계정이 있으신가요? 로그인
        </Button>
      </Box>
    </Box>
  );
}

export default RegisterPage;