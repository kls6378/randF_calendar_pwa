import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Card, CardContent, CardActionArea, Fab, Chip, Avatar, Stack, 
  Button, Menu, MenuItem, useMediaQuery, useTheme, 
  Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import GroupAddIcon from '@mui/icons-material/GroupAdd';

function GroupListPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 메뉴 앵커
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // 참가 팝업 상태
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  // 그룹 목록 데이터 (우리가 정한 6가지 색상 적용)
  // 팔레트: #d32f2f(빨), #ed6c02(주), #fbc02d(노), #1a237e(남), #9c27b0(보), #00bcd4(시안)
  const [groups] = useState([
    { 
      id: 1, 
      name: '캡스톤 디자인 3조', 
      desc: '졸업작품 프로젝트 진행방', 
      memberCount: 4, 
      color: '#1a237e', // 남색 
      role: 'leader' 
    },
    { 
      id: 2, 
      name: '알고리즘 스터디', 
      desc: '매주 화요일 18시', 
      memberCount: 6, 
      color: '#ed6c02', // 주황 
      role: 'member' 
    },
    { 
      id: 3, 
      name: '농구 동아리', 
      desc: '주말 농구 모임', 
      memberCount: 12, 
      color: '#d32f2f', // 빨강 
      role: 'member' 
    },
    { 
      id: 4, 
      name: '영어 회화 모임', 
      desc: '강남역 토요일 10시', 
      memberCount: 8, 
      color: '#00bcd4', // 시안 
      role: 'member' 
    },
    { 
      id: 5, 
      name: '맛집 탐방대', 
      desc: '월 1회 정기 모임', 
      memberCount: 5, 
      color: '#fbc02d', // 노랑 
      role: 'member' 
    },
  ]);

  // --- 핸들러 ---
  const handleMenuOpen = (event) => { setAnchorEl(event.currentTarget); };
  const handleMenuClose = () => { setAnchorEl(null); };
  const handleCreateGroup = () => { handleMenuClose(); navigate('/groups/create'); };
  
  const handleOpenJoinDialog = () => { handleMenuClose(); setJoinDialogOpen(true); };
  const handleCloseJoinDialog = () => { setJoinDialogOpen(false); setInviteCode(''); };

  const handleSubmitJoin = () => {
    if (!inviteCode.trim()) { alert("초대 코드를 입력해주세요."); return; }
    console.log('그룹 참가 요청:', inviteCode);
    alert(`[${inviteCode}] 코드로 그룹에 참가했습니다!`);
    handleCloseJoinDialog();
  };

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, ml: 1 }}>
        <Typography variant="h6" fontWeight="bold">내 그룹</Typography>
        {!isMobile && (<Button variant="contained" startIcon={<AddIcon />} onClick={handleMenuOpen} sx={{ borderRadius: 2, fontWeight: 'bold' }}>그룹 추가</Button>)}
      </Box>

      <Stack spacing={2}>
        {groups.map((group) => (
          <Card key={group.id} sx={{ borderRadius: 3, boxShadow: 2, width: '100%' }}>
            <CardActionArea onClick={() => navigate(`/groups/${group.id}`, { state: { group } })}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2, '&:last-child': { pb: 2 } }}>
                <Avatar sx={{ bgcolor: group.color, width: 50, height: 50, mr: 2 }}>
                  <GroupIcon />
                </Avatar>
                <Box sx={{ flexGrow: 1, minWidth: 0, textAlign: 'left' }}> 
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="h6" fontWeight="bold" noWrap sx={{ fontSize: '1.05rem' }}>
                      {group.name}
                    </Typography>
                    {group.role === 'leader' && (
                      <Chip label="Leader" size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 'bold' }} />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary" noWrap sx={{ fontSize: '0.85rem' }}>
                    {group.desc}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                    <Chip label={`${group.memberCount}명`} size="small" variant="outlined" sx={{ mr: 1, height: 24, color: 'text.secondary', borderColor: 'divider' }} />
                    <ArrowForwardIosIcon sx={{ fontSize: '1rem', color: 'text.disabled' }} />
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Stack>

      {isMobile && (<Fab color="primary" sx={{ position: 'fixed', bottom: 80, right: 20 }} onClick={handleMenuOpen}><AddIcon /></Fab>)}

      <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <MenuItem onClick={handleCreateGroup} sx={{ py: 1.5, px: 2 }}>
          <CreateNewFolderIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography fontWeight="500">새 그룹 만들기</Typography>
        </MenuItem>
        <MenuItem onClick={handleOpenJoinDialog} sx={{ py: 1.5, px: 2 }}>
          <GroupAddIcon sx={{ mr: 2, color: 'secondary.main' }} />
          <Typography fontWeight="500">초대 코드로 참가</Typography>
        </MenuItem>
      </Menu>

      <Dialog open={joinDialogOpen} onClose={handleCloseJoinDialog} fullWidth maxWidth="xs">
        <DialogTitle fontWeight="bold">그룹 참가</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>전달받은 그룹 초대 코드를 입력해주세요.</DialogContentText>
          <TextField autoFocus margin="dense" id="code" label="초대 코드" type="text" fullWidth variant="outlined" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} placeholder="예: X8Y2-Z9A1" />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseJoinDialog} color="inherit">취소</Button>
          <Button onClick={handleSubmitJoin} variant="contained" disabled={!inviteCode}>참가하기</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}

export default GroupListPage;