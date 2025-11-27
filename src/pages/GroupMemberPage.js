import React, { useState, useMemo } from 'react'; // useMemo 추가
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, IconButton, List, ListItem, ListItemAvatar, ListItemText, 
  Avatar, Chip, Divider 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import StarIcon from '@mui/icons-material/Star';

function GroupMemberPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const groupData = location.state?.group || { role: 'member', name: '샘플 그룹' };
  const isLeader = groupData.role === 'leader'; 

  const [members, setMembers] = useState([
    { id: 1, name: '김철수', role: 'member', studentId: '20201234' },
    { id: 2, name: '이영희', role: 'leader', studentId: '20195678' },
    { id: 3, name: '박민수', role: 'member', studentId: '20210000' },
    { id: 4, name: '최지수', role: 'member', studentId: '20229999' },
    { id: 5, name: '강동원', role: 'member', studentId: '20231111' },
  ]);

  // 정렬 로직 (팀장 맨 위 -> 나머지 가나다순)
  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      // 1순위: 팀장이면 앞으로 (-1)
      if (a.role === 'leader') return -1;
      if (b.role === 'leader') return 1;
      // 2순위: 이름 가나다순
      return a.name.localeCompare(b.name);
    });
  }, [members]);

  const handleKick = (memberId, memberName) => {
    if (window.confirm(`'${memberName}' 님을 그룹에서 내보내시겠습니까?`)) {
      setMembers(prev => prev.filter(m => m.id !== memberId));
      alert('내보냈습니다.');
    }
  };

  return (
    <Box sx={{ p: 0, minHeight: '100vh', bgcolor: 'background.paper' }}>
      
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee' }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" fontWeight="bold">
          멤버 ({members.length})
        </Typography>
      </Box>

      <List sx={{ p: 0 }}>
        {sortedMembers.map((member) => (
          <React.Fragment key={member.id}>
            <ListItem 
              sx={{ py: 1.5 }}
              // 강퇴 버튼: (내가 팀장이고) AND (상대방이 팀장이 아닐 때) 보임
              secondaryAction={
                isLeader && member.role !== 'leader' && (
                  <IconButton 
                    edge="end" 
                    aria-label="delete" 
                    onClick={() => handleKick(member.id, member.name)}
                    size="small"
                    color="default"
                  >
                    <PersonRemoveIcon fontSize="small" />
                  </IconButton>
                )
              }
            >
              <ListItemAvatar>
                {/* 팀장도 일반 멤버와 똑같은 기본 스타일 Avatar 사용 */}
                <Avatar sx={{ bgcolor: member.role === 'leader' ? 'primary.main' : 'grey.300' }}>
                    {member.name[0]}
                </Avatar>
              </ListItemAvatar>
              
              <ListItemText 
                primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography fontWeight="bold">{member.name}</Typography>
                        
                        {/* 팀장일 때만 심플한 뱃지 표시 */}
                        {member.role === 'leader' && (
                            <Chip 
                                label="팀장" 
                                size="small" 
                                color="primary" 
                                variant="outlined" // 외곽선 스타일로 깔끔하게
                                sx={{ height: 18, fontSize: '0.65rem', px: 0, borderColor: 'primary.main', color: 'primary.main', fontWeight: 'bold' }} 
                            />
                        )}
                    </Box>
                }
                secondary={member.studentId} 
              />
            </ListItem>
            <Divider component="li" />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
}

export default GroupMemberPage;