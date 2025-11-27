import React, { useState, useRef, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { 
  Box, IconButton, Typography, ToggleButton, ToggleButtonGroup, Popover, 
  useTheme, useMediaQuery, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, Divider,
  Button 
} from '@mui/material';
import styled from '@emotion/styled';

// 아이콘들
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CloseIcon from '@mui/icons-material/Close';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AddIcon from '@mui/icons-material/Add';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import 'dayjs/locale/ko';
import { useNavigate } from 'react-router-dom';

// 스와이프 & 애니메이션 라이브러리
import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence } from 'framer-motion';

dayjs.extend(isBetween);
dayjs.locale('ko'); 

const CATEGORY_COLORS = {
  lecture: '#1976d2',
  personal: '#2e7d32',
};

// 애니메이션 효과: direction이 0이면 이동 없음(즉시 전환)
const variants = {
  enter: (direction) => ({
    // 0이면 제자리(0), 아니면 100% 또는 -100%에서 시작
    x: direction === 0 ? 0 : (direction > 0 ? '100%' : '-100%'),
    opacity: direction === 0 ? 1 : 0, // 0이면 투명도 1부터 시작 (깜빡임 방지)
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    // 0이면 제자리(0), 아니면 반대쪽으로 이동
    x: direction === 0 ? 0 : (direction < 0 ? '100%' : '-100%'),
    opacity: direction === 0 ? 1 : 0, // 0이면 사라질 때도 투명해지지 않음
  }),
};

const CalendarWrapper = styled.div`
  height: 100%;
  @media (min-width: 600px) { height: auto; } /* PC는 auto (스크롤바 해결) */

  .fc { font-family: inherit; --fc-border-color: ${({ theme }) => theme.palette.divider}; --fc-page-bg-color: transparent; height: 100%; }
  .fc-col-header-cell, .fc-timegrid-axis { background-color: ${({ theme }) => theme.palette.background.default}; }
  .fc-col-header-cell.fc-day-today { background-color: ${({ theme }) => theme.palette.background.default} !important; border-bottom: 2px solid ${({ theme }) => theme.palette.primary.main}; }
  .fc-col-header-cell.fc-day-today .fc-col-header-cell-cushion { color: ${({ theme }) => theme.palette.primary.main} !important; font-weight: 800; }
  .fc-daygrid-day-top { justify-content: center; padding-top: 4px; }
  .fc-day-sat .fc-col-header-cell-cushion, .fc-day-sat .fc-daygrid-day-number { color: #1976d2 !important; }
  .fc-day-sun .fc-col-header-cell-cushion, .fc-day-sun .fc-daygrid-day-number { color: #d32f2f !important; }
  .fc-daygrid-day-number, .fc-col-header-cell-cushion { color: ${({ theme }) => theme.palette.text.primary}; text-decoration: none; }
  .fc-timegrid-slot-label-cushion { font-size: 0.85rem; font-weight: 500; }
  .fc-day-today { background-color: ${({ theme }) => theme.palette.action.hover} !important; }
  .fc-daygrid-day { cursor: pointer; }
  .fc-event { pointer-events: none; }
  .fc-daygrid-more-link { pointer-events: none; text-decoration: none; color: ${({ theme }) => theme.palette.text.secondary}; font-weight: bold; font-size: 0.8rem; background-color: transparent !important; }
`;

const LegendDot = ({ color, label }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mr: 1.5 }}>
    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, mr: 0.5 }} />
    <Typography variant="caption" color="text.secondary" fontWeight="bold">{label}</Typography>
  </Box>
);

function HomePage() {
  const theme = useTheme();
  const calendarRef = useRef(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [viewType, setViewType] = useState('dayGridMonth'); 
  
  // 애니메이션 방향 상태 (0: 없음, 1: 다음, -1: 이전)
  const [direction, setDirection] = useState(0);

  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayEvents, setDayEvents] = useState([]);

  const [rawEvents] = useState([
    { id: 1, title: '인공지능개론', category: 'lecture', daysOfWeek: [4], startTime: '15:00:00', endTime: '18:00:00', location: '공학관 202호', description: '교재: 인공지능의 이해\n* 매주 수업 시작 전 쪽지시험 있음', startRecur: '2025-09-01', endRecur: '2025-12-21' },
    { id: 2, title: '여자친구랑 데이트', category: 'personal', start: '2025-11-29T18:00:00', end: '2025-11-29T22:00:00', location: '성심당 본점', description: '1. 튀김소보로 사기\n2. 저녁 먹기', allDay: false },
    { id: 3, title: '개교기념일 축제', category: 'personal', date: '2025-11-30', allDay: true, location: '대운동장 메인 무대', description: '축제!' },
    { title: '캡스톤 디자인', daysOfWeek: [1], startTime: '10:00:00', endTime: '13:00:00', category: 'lecture', location: '공학관 301호' },
    { title: '네트워크', daysOfWeek: [2], startTime: '09:00:00', endTime: '10:30:00', category: 'lecture', location: '공학관 404호' },
    { title: '컴퓨터구조', daysOfWeek: [2], startTime: '10:30:00', endTime: '12:00:00', category: 'lecture', location: 'IT관 201호' },
    { title: '운영체제', daysOfWeek: [2], startTime: '12:30:00', endTime: '13:00:00', category: 'lecture', location: '온라인' },
    { title: '소프트웨어공학', daysOfWeek: [2], startTime: '13:30:00', endTime: '14:00:00', category: 'lecture', location: '공학관 101호' },
    { title: '데이터베이스', daysOfWeek: [3], startTime: '14:00:00', endTime: '16:00:00', category: 'lecture', location: 'IT관 505호' },
    { title: '치과 예약', date: '2025-11-28', category: 'personal', location: '서울치과' }, 
    { title: '부산 여행', start: '2025-11-26', end: '2025-11-28', category: 'personal', allDay: true, location: '부산' },
    { title: '팀 회의', date: '2025-11-27T15:00:00', category: 'group', location: '스타벅스 정문점' },
    { category: "lecture", daysOfWeek: [1, 5, 3], description: "테스트 강의...", endRecur: "2025-12-19", endTime: "21:30:00", location: "MC408", startRecur: "2025-09-01", startTime: "19:00:00", title: "테스트 강의", type: "lecture" },
    { allDay: true, category: "personal", description:"테스트 일정...", end:"2025-11-26T10:00:00+09:00", location:"메가커피", start:"2025-11-26T09:00:00+09:00", title:"테스트 일정", type:"personal"},
    { allDay: false, category: "personal", description:"테스트 일정...", end:"2025-11-26T12:50:00+09:00", location:"메가커피", start:"2025-11-26T09:15:00+09:00", title:"테스트 일정", type:"personal"},
    { 
      title: '팀 회의', 
      date: '2025-11-27T15:00:00', 
      category: 'group', 
      location: '스타벅스 정문점',
      color: '#1a237e' // 남색 
    },
    { 
      title: '농구 동아리',
      date: '2025-11-30T10:00:00', 
      category: 'group', 
      location: '체육관',
      color: '#d32f2f' // 빨강
    },
  ]);

  const events = useMemo(() => {
    return rawEvents.map(event => {
      if (event.category === 'group') {
        return { ...event, color: event.color || '#ed6c02' }; // 데이터 색상 사용
      }
      return { 
        ...event, 
        color: CATEGORY_COLORS[event.category] || CATEGORY_COLORS.lecture 
      };
    });
  }, [rawEvents]);

  // --- 핸들러 ---
  const handlePrev = () => { 
    setDirection(-1);
    const unit = viewType === 'dayGridMonth' ? 'month' : 'week';
    setCurrentDate(prev => prev.subtract(1, unit));
  };
  
  const handleNext = () => { 
    setDirection(1);
    const unit = viewType === 'dayGridMonth' ? 'month' : 'week';
    setCurrentDate(prev => prev.add(1, unit));
  };

  // 뷰 토글 시에는 direction을 0으로 설정 -> 애니메이션 끔
  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setDirection(0);
      setViewType(newView);
    }
  };

  const handleTitleClick = (event) => setAnchorEl(event.currentTarget);
  
  const handleDateChange = (newDate) => { 
    setDirection(0);
    setCurrentDate(newDate); 
    setAnchorEl(null); 
  };
  
  const handleAddEvent = (date = null) => { navigate('/schedule/add', { state: { selectedDate: date ? date.format('YYYY-MM-DD') : null } }); };
  
  const handleDateClick = (arg) => { 
    const clickedDateStr = arg.dateStr.split('T')[0]; 
    const clickedDayjs = dayjs(clickedDateStr);
    const matchedEvents = events.filter(event => {
      if (event.date) return event.date.split('T')[0] === clickedDateStr;
      if (event.start && event.end) return clickedDayjs.isSame(event.start, 'day') || (clickedDayjs.isAfter(event.start, 'day') && clickedDayjs.isBefore(event.end, 'day'));
      if (event.daysOfWeek) return event.daysOfWeek.includes(clickedDayjs.day());
      return false;
    });
    setSelectedDate(clickedDayjs); setDayEvents(matchedEvents); setOpenDialog(true);
  };
  
  const getEventTimeText = (event) => { 
     if (event.allDay) return '종일';
     if (event.startTime) return `${event.startTime.slice(0,5)} ~ ${event.endTime ? event.endTime.slice(0,5) : ''}`;
     if (event.date) return event.date.includes('T') ? event.date.split('T')[1].slice(0, 5) : '종일';
     return '시간 미정';
  };
  
  const renderSlotLabel = (arg) => { let hour = arg.date.getHours(); return hour === 0 ? '오전 12' : hour === 12 ? '오후 12' : hour > 12 ? String(hour - 12) : String(hour); };
  
  const renderDayHeader = (arg) => { 
    const date = arg.date;
    const dayName = date.toLocaleDateString('ko-KR', { weekday: 'short' });
    if (arg.view.type === 'dayGridMonth') return <div>{dayName}</div>;
    const dayNumber = date.getDate();
    return <div style={{ lineHeight: '1.2' }}><div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{dayName}</div><div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{dayNumber}</div></div>;
  };

  const renderEventContent = (eventInfo) => {
    if (eventInfo.view.type === 'dayGridMonth') return null;
    return (
      <div style={{ padding: '2px', lineHeight: '1.2', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
        <div style={{ fontWeight: 'bold', fontSize: '0.85rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{eventInfo.event.title}</div>
        {eventInfo.event.extendedProps.location && (<div style={{ fontSize: '0.75rem', opacity: 0.9, marginTop: '1px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{eventInfo.event.extendedProps.location}</div>)}
      </div>
    );
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleNext(),
    onSwipedRight: () => handlePrev(),
    preventScrollOnSwipe: true,
    trackMouse: true
  });

  return (
    <Box sx={{ p: 0, height: { xs: '100%', sm: 'auto' }, width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* 헤더 */}
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CalendarMonthIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="h5" fontWeight="bold" onClick={handleTitleClick} sx={{ cursor: 'pointer', mr: 1, '&:hover': { color: 'primary.main' } }}>
              {currentDate.format('YYYY.MM')}
            </Typography>
            <IconButton onClick={handlePrev} size="small" sx={{ ml: 1 }}><ArrowBackIosNewIcon fontSize="inherit" /></IconButton>
            <IconButton onClick={handleNext} size="small"><ArrowForwardIosIcon fontSize="inherit" /></IconButton>
          </Box>
          <Box>
            {isMobile ? (<IconButton onClick={() => handleAddEvent(dayjs())} color="primary" sx={{ border: '1px solid', borderColor: 'divider' }}><AddIcon /></IconButton>) : (<Button variant="contained" startIcon={<AddIcon />} onClick={() => handleAddEvent(dayjs())} sx={{ borderRadius: 2, fontWeight: 'bold' }}>일정 추가</Button>)}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex' }}>
            <LegendDot color={CATEGORY_COLORS.lecture} label="강의" />
            <LegendDot color={CATEGORY_COLORS.personal} label="개인" />
          </Box>
          <ToggleButtonGroup value={viewType} exclusive onChange={handleViewChange} size="small" sx={{ height: 32 }}>
            <ToggleButton value="dayGridMonth" sx={{ px: 2, fontSize: '0.8rem' }}>월</ToggleButton>
            <ToggleButton value="timeGridWeek" sx={{ px: 2, fontSize: '0.8rem' }}>주</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* 애니메이션 영역 */}
      <Box {...swipeHandlers} sx={{ flexGrow: 1, overflow: 'hidden', position: 'relative', height: { xs: '100%', sm: 'auto' } }}>
        <AnimatePresence mode='popLayout' initial={false} custom={direction}>
          <motion.div
            key={currentDate.format('YYYY-MM-DD') + viewType} 
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            // direction이 0일 때 duration을 0으로 줘서 즉시 전환!
            transition={{ duration: direction === 0 ? 0 : 0.3, ease: "easeInOut" }}
            style={{ height: isMobile ? '100%' : 'auto', width: '100%' }}
          >
            <CalendarWrapper theme={theme}>
                <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                
                initialView={viewType}
                initialDate={currentDate.toDate()}
                
                headerToolbar={false}
                dayHeaderContent={renderDayHeader}
                slotLabelContent={renderSlotLabel}
                allDayText=""
                displayEventTime={false}
                locale="ko"
                
                // PC: auto, Mobile: 100%
                height={isMobile ? "100%" : "auto"}
                
                events={events}
                dayMaxEvents={true}
                
                dateClick={handleDateClick}
                moreLinkContent={(args) => `+${args.num}`}
                eventContent={viewType === 'timeGridWeek' ? renderEventContent : undefined}
                dayCellContent={(arg) => arg.dayNumberText.replace('일', '')}
                />
            </CalendarWrapper>
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* ... (Popover, Dialog 기존과 동일) ... */}
      <Popover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={() => setAnchorEl(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
            <DateCalendar views={['year', 'month']} value={currentDate} onChange={handleDateChange} openTo="month" />
        </LocalizationProvider>
      </Popover>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" fontWeight="bold">{selectedDate?.format('D일 (dd)')}</Typography>
          <Box>
            <IconButton onClick={() => handleAddEvent(selectedDate)} color="primary" sx={{ mr: 1 }}><AddIcon /></IconButton>
            <IconButton onClick={() => setOpenDialog(false)} size="small"><CloseIcon /></IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ minHeight: '150px', p: 0 }}>
          {dayEvents.length > 0 ? (
            <List>
              {dayEvents.map((event, index) => (
                <React.Fragment key={index}>
                  <ListItem button onClick={() => navigate('/schedule/detail', { state: { event: event } })}>
                    <Box sx={{ width: 4, height: 40, bgcolor: event.color, mr: 2, borderRadius: 1 }} />
                    <ListItemText primary={event.title} secondary={<React.Fragment><Typography variant="body2" component="span" display="block" color="text.secondary">{getEventTimeText(event)}</Typography>{event.location && (<Box component="span" sx={{ display: 'block', mt: 0.5, color: 'text.primary', fontSize: '0.85rem' }}>{event.location}</Box>)}</React.Fragment>} primaryTypographyProps={{ fontWeight: '500' }} />
                  </ListItem>
                  {index < dayEvents.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '150px', color: 'text.secondary' }}>
              <EventNoteIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
              <Typography>일정이 없습니다</Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default HomePage;