import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, IconButton, Avatar, Stack } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSnackbar } from '../contexts/SnackbarContext';

function MyProfileEditPage() {
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  
  const [nickname, setNickname] = useState(localStorage.getItem('nickname') || '');
  const [isSubmitting, setIsSubmitting] = useState(false); // 중복 클릭 방지용

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 유효성 검사
    if (!nickname.trim()) {
      showSnackbar("닉네임을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      
      // 서버에 닉네임 수정 요청 (PATCH)
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // 토큰 필수!
        },
        body: JSON.stringify({ nickname: nickname })
      });

      if (response.ok) {
        // 성공 시 로컬 스토리지 정보도 갱신
        // 이걸 해야 마이페이지로 돌아갔을 때 바뀐 이름이 바로 보임
        localStorage.setItem('nickname', nickname);
        
        showSnackbar('정보가 수정되었습니다.');
        navigate(-1); // 뒤로 가기
      } else {
        showSnackbar('정보 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error("수정 요청 에러:", error);
      showSnackbar('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 'sm', mx: 'auto' }}>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" fontWeight="bold">내 정보 수정</Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <Avatar 
                sx={{ width: 100, height: 100, bgcolor: 'primary.main', fontSize: '2.5rem', boxShadow: 2 }}
            >
                {nickname[0]}
            </Avatar>
          </Box>

          <TextField
            label="닉네임"
            required
            fullWidth
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            helperText="다른 사용자에게 보여질 이름입니다."
          />

          <Button 
            type="submit" 
            variant="contained" 
            size="large"
            disabled={isSubmitting}
            sx={{ height: 50, fontSize: '1.1rem', borderRadius: 2, width: '100%' }}
          >
            저장하기
          </Button>

        </Stack>
      </Box>
    </Box>
  );
}

export default MyProfileEditPage;