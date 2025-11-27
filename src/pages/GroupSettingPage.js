import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, TextField, Button, Typography, IconButton, Stack, Paper, 
  ToggleButton, ToggleButtonGroup, FormLabel, Divider, Snackbar 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

// 빨, 주, 노, 남, 보, 시안
const GROUP_COLORS = ['#d32f2f', '#ed6c02', '#fbc02d', '#1a237e', '#9c27b0', '#00bcd4'];

function GroupSettingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const groupData = location.state?.group || { 
    name: '샘플 그룹', desc: '설명', color: GROUP_COLORS[0], inviteCode: 'TEST-CODE', role: 'member' 
  };

  const isLeader = groupData.role === 'leader';

  const [name, setName] = useState(groupData.name);
  const [desc, setDesc] = useState(groupData.desc);
  const [color, setColor] = useState(groupData.color);
  const [copyAlert, setCopyAlert] = useState(false);

  // --- 핸들러 ---
  const handleCopyCode = () => { navigator.clipboard.writeText(groupData.inviteCode); setCopyAlert(true); };
  const handleSave = () => { 
    if(isLeader) console.log('정보수정:', {name, desc, color}); 
    else console.log('색상변경:', {color});
    alert('설정이 저장되었습니다.'); navigate(-1); 
  };
  const handleDeleteGroup = () => { if(window.confirm('삭제하시겠습니까?')) { alert('삭제됨'); navigate('/groups'); } };
  const handleLeaveGroup = () => { if(window.confirm('나가시겠습니까?')) { alert('나감'); navigate('/groups'); } };

  return (
    <Box sx={{ p: 3, maxWidth: 'sm', mx: 'auto' }}>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" fontWeight="bold">그룹 설정</Typography>
      </Box>

      <Stack spacing={4}>
        
        {/* 초대 코드 (리더만) */}
        {isLeader && (
          <Box>
            <FormLabel component="legend" sx={{ mb: 1, fontWeight: 'bold', fontSize: '0.9rem' }}>초대 코드</FormLabel>
            <Paper elevation={0} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px dashed', borderColor: 'primary.main', bgcolor: 'background.paper' }}>
              <Typography variant="h6" color="primary" fontWeight="bold" sx={{ letterSpacing: 2 }}>{groupData.inviteCode}</Typography>
              <Button size="small" startIcon={<ContentCopyIcon />} onClick={handleCopyCode}>복사</Button>
            </Paper>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>팀원들에게 이 코드를 공유하세요.</Typography>
            <Divider sx={{ mt: 3 }} />
          </Box>
        )}

        {/* 기본 정보 (리더만 수정 가능, 팀원은 아예 안 보임) */}
        {isLeader && (
            <Box>
                <FormLabel component="legend" sx={{ mb: 2, fontWeight: 'bold', fontSize: '0.9rem' }}>
                    기본 정보
                </FormLabel>
                <Stack spacing={2}>
                    <TextField label="그룹 이름" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
                    <TextField label="그룹 설명" multiline rows={3} fullWidth value={desc} onChange={(e) => setDesc(e.target.value)} />
                </Stack>
            </Box>
        )}

        {/* 색상 설정 (모두 보임) */}
        <Box>
          <FormLabel component="legend" sx={{ mb: 1, fontWeight: 'bold', fontSize: '0.9rem' }}>
            내 달력에 표시될 색상
          </FormLabel>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <ToggleButtonGroup
              value={color}
              exclusive
              onChange={(e, newColor) => newColor && setColor(newColor)}
              sx={{ display: 'flex', flexWrap: 'wrap', width: '100%', justifyContent: 'space-between', border: 'none' }}
            >
              {GROUP_COLORS.map((c) => (
                <ToggleButton
                  key={c}
                  value={c}
                  sx={{
                    width: 40, height: 40, borderRadius: '50% !important', border: 'none', bgcolor: c, margin: '4px !important',
                    '&:hover': { bgcolor: c, opacity: 0.8 },
                    '&.Mui-selected': { bgcolor: c, opacity: 1, boxShadow: `0 0 0 3px white, 0 0 0 5px ${c}` }
                  }}
                >
                  {color === c && <CheckIcon sx={{ color: 'white', fontSize: '1.2rem' }} />}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
        </Box>

        {/* 저장 버튼 */}
        <Button 
            variant="contained" 
            size="large" 
            onClick={handleSave}
            sx={{ height: 50, fontSize: '1.1rem', borderRadius: 2 }}
        >
            {isLeader ? '설정 저장' : '색상 변경 저장'}
        </Button>

        <Divider sx={{ my: 2 }} />

        {/* 위험 구역 */}
        <Box>
            <Typography variant="caption" color="error" sx={{ mb: 1, display: 'block', fontWeight: 'bold' }}>
                위험 구역
            </Typography>
            {isLeader ? (
                <Button variant="outlined" color="error" fullWidth startIcon={<DeleteIcon />} onClick={handleDeleteGroup}>
                    그룹 삭제하기
                </Button>
            ) : (
                <Button variant="outlined" color="error" fullWidth startIcon={<ExitToAppIcon />} onClick={handleLeaveGroup}>
                    그룹 나가기
                </Button>
            )}
        </Box>

      </Stack>

      <Snackbar open={copyAlert} autoHideDuration={2000} onClose={() => setCopyAlert(false)} message="초대 코드가 복사되었습니다!" />
    </Box>
  );
}

export default GroupSettingPage;