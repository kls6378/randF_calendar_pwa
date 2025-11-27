import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, IconButton, Avatar, Stack } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function MyProfileEditPage() {
  const navigate = useNavigate();
  
  const [nickname, setNickname] = useState('멋쟁이 사자');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      alert("닉네임을 입력해주세요.");
      return;
    }
    console.log('정보 수정 요청:', { nickname });
    alert('정보가 수정되었습니다.');
    navigate(-1); 
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