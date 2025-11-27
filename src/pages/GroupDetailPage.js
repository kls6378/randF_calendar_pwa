import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { 
  Box, Typography, IconButton, Paper, Button, List, ListItem, ListItemText, Divider, Chip, Fab, 
  useMediaQuery, useTheme, ListItemIcon 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import dayjs from 'dayjs';

function GroupDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const group = location.state?.group || { 
    id: id, 
    name: '캡스톤 디자인 3조', 
    desc: '졸업작품 프로젝트 진행방', 
    role: 'leader',
    inviteCode: 'X8Y2-Z9A1',
    color: '#ed6c02'
  };

  const isLeader = group.role === 'leader';

  // 표준 데이터 포맷 적용
  const [groupEvents] = useState([
    { 
      id: 101, 
      category: 'group',
      title: '중간 발표 준비 회의', 
      description: '발표 자료 취합 및 역할 분담',
      start: '2025-11-27T15:00:00', 
      end: '2025-11-27T17:00:00', 
      allDay: false,
      location: '스타벅스 정문점', 
      color: group.color
    },
    { 
      id: 102, 
      category: 'group',
      title: '자료 조사 마감', 
      description: '각자 조사한 자료 노션에 업로드',
      start: '2025-11-29T00:00:00', // 하루 종일이라도 start/end는 있어야 함
      end: '2025-11-29T23:59:59',   
      allDay: true, 
      location: '온라인',
      color: group.color
    }
  ]);

  const handleCreateSchedule = () => {
    navigate('/schedule/add', { state: { groupContext: group } });
  };

  // 날짜/시간 포맷팅 함수
  const formatTime = (event) => {
    const startObj = dayjs(event.start);
    const endObj = dayjs(event.end);

    // 1. 하루 종일 (YYYY.MM.DD ~ YYYY.MM.DD)
    if (event.allDay) {
        return `${startObj.format('YYYY.MM.DD')} ~ ${endObj.format('YYYY.MM.DD')}`;
    }

    // 2. 시간 있음 (YYYY.MM.DD HH:mm ~ YYYY.MM.DD HH:mm)
    return `${startObj.format('YYYY.MM.DD HH:mm')} ~ ${endObj.format('YYYY.MM.DD HH:mm')}`;
  };

  return (
    <Box sx={{ p: 0, minHeight: '100vh', bgcolor: 'background.default', position: 'relative' }}>
      
      {/* 헤더 */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <IconButton onClick={() => navigate('/groups')}><ArrowBackIcon /></IconButton>
        <Typography variant="h6" fontWeight="bold">{group.name}</Typography>
        <IconButton onClick={() => navigate('/groups/setting', { state: { group } })}><SettingsIcon /></IconButton>
      </Box>

      {/* 그룹 정보 */}
      <Box sx={{ px: 3, mb: 3, textAlign: 'left' }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2, mt: 2, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
          {group.desc}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Chip icon={<PeopleIcon />} label="멤버 4명" variant="outlined" onClick={() => navigate(`/groups/${group.id}/members`, { state: { group } })} clickable />
            {isLeader && !isMobile && (
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateSchedule} sx={{ borderRadius: 2, fontWeight: 'bold' }}>일정 추가</Button>
            )}
        </Box>
      </Box>

      <Divider />

      {/* 다가오는 일정 리스트 */}
      <Box sx={{ p: 3, pb: 10 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom align="left">
          📅 다가오는 일정
        </Typography>
        
        <List sx={{ bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1, p: 0 }}>
            {groupEvents.map((event, index) => (
                <React.Fragment key={event.id}>
                    <ListItem 
                        button 
                        alignItems="flex-start"
                        onClick={() => navigate('/schedule/detail', { 
                            state: { event: event, isLeader: isLeader } 
                        })}
                        sx={{ px: 2, py: 1.5 }}
                    >
                        {/* 왼쪽 색상 띠 */}
                        <Box sx={{ width: 4, height: 50, bgcolor: event.color || '#ed6c02', mr: 2, borderRadius: 1, flexShrink: 0, mt: 0.5 }} />
                        
                        <ListItemText 
                            primary={
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 0.5 }}>
                                    {event.title}
                                </Typography>
                            }
                            secondary={
                                <Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    {/* 시간 (수정된 포맷 적용) */}
                                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', color: 'text.secondary' }}>
                                        <AccessTimeIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
                                        {formatTime(event)}
                                    </Box>
                                    {/* 장소 (있을 때만) */}
                                    {event.location && (
                                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', color: 'text.primary' }}>
                                            <LocationOnIcon sx={{ fontSize: '1rem', mr: 0.5, color: 'action.active' }} />
                                            {event.location}
                                        </Box>
                                    )}
                                </Box>
                            }
                            disableTypography
                        />
                    </ListItem>
                    {index < groupEvents.length - 1 && <Divider component="li" />}
                </React.Fragment>
            ))}
        </List>
      </Box>

      {/* 모바일 FAB */}
      {isLeader && isMobile && (
        <Fab color="primary" sx={{ position: 'fixed', bottom: 80, right: 20 }} onClick={handleCreateSchedule}>
          <AddIcon />
        </Fab>
      )}

    </Box>
  );
}

export default GroupDetailPage;