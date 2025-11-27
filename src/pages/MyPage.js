import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Avatar, List, ListItem, ListItemIcon, ListItemText, Switch, Divider, Button } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LogoutIcon from '@mui/icons-material/Logout';
import { useColorMode } from '../theme/ThemeContext';
import { useTheme } from '@mui/material/styles';

function MyPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { toggleColorMode } = useColorMode();
  
  const [nickname] = useState('홍길동'); 

  const handleLogout = () => {
    if(window.confirm('로그아웃 하시겠습니까?')) {
        localStorage.removeItem('isAuth');
        window.location.reload();
    }
  };

  const handleEditProfile = () => {
    navigate('/mypage/edit'); 
  };

  return (
    <Box 
      sx={{ 
        width: '100%', 
        minHeight: '100vh', 
        bgcolor: (theme) => theme.palette.mode === 'light' ? '#f5f5f5' : 'background.default'
      }}
    >
      
      {/* 프로필 영역 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5, bgcolor: 'background.paper', mb: 1 }}>
        <Avatar 
            sx={{ 
                width: 80, height: 80, 
                bgcolor: 'primary.main', 
                fontSize: '2rem', 
                mb: 2,
                boxShadow: 2 
            }}
        >
            {nickname[0]}
        </Avatar>
        
        <Typography variant="h5" fontWeight="bold" gutterBottom>
            {nickname}
        </Typography>

        <Button 
            variant="outlined" 
            size="small" 
            startIcon={<PersonIcon />} 
            onClick={handleEditProfile}
            sx={{ borderRadius: 20, mt: 1, px: 3 }}
        >
            내 정보 수정
        </Button>
      </Box>
      
      {/* 설정 목록 */}
      <Box sx={{ mt: 2, bgcolor: 'background.paper' }}> 
        <Typography variant="subtitle2" sx={{ px: 2, py: 2, color: 'text.secondary', fontWeight: 'bold', bgcolor: (theme) => theme.palette.mode === 'light' ? '#f5f5f5' : 'background.default' }}>
            설정
        </Typography>
        
        <List sx={{ p: 0 }}>
            
            <ListItem sx={{ py: 1.5 }}>
                <ListItemIcon><DarkModeIcon /></ListItemIcon>
                <ListItemText primary="다크 모드" />
                <Switch 
                    edge="end" 
                    onChange={toggleColorMode} 
                    checked={theme.palette.mode === 'dark'} 
                />
            </ListItem>
            
        </List>
      </Box>

      {/* 로그아웃 */}
      <Box sx={{ mt: 2, bgcolor: 'background.paper' }}>
        <List sx={{ p: 0 }}>
            <ListItem button onClick={handleLogout} sx={{ py: 2 }}>
                <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
                <ListItemText 
                    primary="로그아웃" 
                    primaryTypographyProps={{ color: 'error', fontWeight: '500' }} 
                />
            </ListItem>
        </List>
      </Box>

      <Box sx={{ height: 50 }} /> 

    </Box>
  );
}

export default MyPage;