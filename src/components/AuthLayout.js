import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';

function AuthLayout() {
  return (
    // 회색 배경 (PC 전체 화면)
    <Box 
      sx={{ 
        bgcolor: (theme) => theme.palette.mode === 'light' ? '#f5f5f5' : '#121212', 
        minHeight: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center' // PC 화면 정중앙에 배치
      }}
    >
      <Container 
        maxWidth="sm" // 메인 앱과 똑같은 너비
        disableGutters 
        sx={{ 
          bgcolor: 'background.paper',
          // 모바일(xs): 화면 꽉 채움 / PC(sm): 높이 자동조절 or 고정
          minHeight: { xs: '100vh', sm: 'auto' }, 
          boxShadow: { sm: 3 }, 
          borderRadius: { sm: 2 },
          // 내부 여백
          p: 3, 
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <Outlet />
      </Container>
    </Box>
  );
}

export default AuthLayout;