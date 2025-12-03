import React, { useState, useRef, useMemo, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Box,
  IconButton,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Popover,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Fab,
} from "@mui/material";
import styled from "@emotion/styled";

// 아이콘들
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CloseIcon from "@mui/icons-material/Close";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AddIcon from "@mui/icons-material/Add";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import "dayjs/locale/ko";
import { useNavigate } from "react-router-dom";

// 스와이프 & 애니메이션 라이브러리
import { useSwipeable } from "react-swipeable";
import { motion, AnimatePresence } from "framer-motion";

dayjs.extend(isBetween);
dayjs.locale("ko");

const CATEGORY_COLORS = {
  lecture: "#1976d2",
  personal: "#2e7d32",
};

// 애니메이션 효과: direction이 0이면 이동 없음(즉시 전환)
const variants = {
  enter: (direction) => ({
    // 0이면 제자리(0), 아니면 100% 또는 -100%에서 시작
    x: direction === 0 ? 0 : direction > 0 ? "100%" : "-100%",
    opacity: direction === 0 ? 1 : 0, // 0이면 투명도 1부터 시작 (깜빡임 방지)
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    // 0이면 제자리(0), 아니면 반대쪽으로 이동
    x: direction === 0 ? 0 : direction < 0 ? "100%" : "-100%",
    opacity: direction === 0 ? 1 : 0, // 0이면 사라질 때도 투명해지지 않음
  }),
};

const CalendarWrapper = styled.div`
  height: 100%;
  @media (min-width: 600px) {
    height: auto;
  } /* PC는 auto (스크롤바 해결) */

  /* 모바일 전용 스타일 */
  @media (max-width: 600px) {
    /* 월간 달력 */
    /* 일정 제목 & 시간 글자 크기 줄이기 */
    .fc-event-title,
    .fc-event-time {
      font-size: 0.65rem !important;
      line-height: 1.1 !important; /* 줄간격 살짝 좁게 */
    }

    /* 날짜 숫자 (1일, 2일...) 크기 줄이기 */
    .fc-daygrid-day-number {
      font-size: 0.7rem !important;
      padding: 2px !important; /* 여백 줄여서 공간 확보 */
    }

    /* 요일 헤더 (일, 월, 화...) 크기 줄이기 */
    .fc-col-header-cell-cushion {
      font-size: 0.75rem !important;
    }

    /* 더보기 링크 (+2) 글자 줄이기 */
    .fc-daygrid-more-link {
      font-size: 0.65rem !important;
    }

    /* 월간/종일 일정 박스 높이 강제 축소 */
    .fc-daygrid-event {
      margin-top: 0px !important;
      margin-bottom: 1px !important; /* 일정 간 간격 1px */
      min-height: 0 !important; /* 최소 높이 제한 해제 */
    }
    /* 내부 텍스트와 껍데기들의 여백/높이 싹 제거 */
    .fc-event-main,
    .fc-event-main-frame,
    .fc-event-title-container,
    .fc-event-title {
      padding-top: 0.3px !important; 
      padding-bottom: 0.3px !important;
      line-height: 1 !important; /* 줄 간격을 글자 크기에 딱 맞춤 */
      font-size: 0.65rem !important; /* 글자 크기 */
      display: flex;
      align-items: center; /* 텍스트 수직 정렬 */
    }

    /* 일정 내부 텍스트 여백 제거 */
    .fc-event-main {
      padding: 0 2px !important;
    }

    /* 주간 달력 */

    /* 주간 달력 요일 글자 크기*/
    .fc-col-header-cell-cushion > div > div:first-of-type {
      font-size: 0.75rem !important; 
    }

    /* 날짜 숫자 (30, 1, 2...) */
    .fc-col-header-cell-cushion > div > div:last-of-type {
      font-size: 0.7rem !important; 
      font-weight: 600 !important; /* 너무 두껍지 않게 조절 */
    }

    /* 주간 달력 상단 종일 일정 강제 축소 */
    .fc-timeGridWeek-view .fc-daygrid-event .fc-event-main div {
      font-size: 0.65rem !important;
      line-height: 1.1 !important; /* 줄간격 좁히기 */
      font-weight: normal !important; /* 굵기 빼기 */
      padding: 0px !important; /* 내부 여백 제거 */
      margin: 0px !important; 
    }

    /* 일정 제목 & 장소 */
    /* 제목 (첫 번째 div) */
    .fc-timegrid-event .fc-event-main > div > div:first-of-type {
      font-size: 0.65rem !important;
      line-height: 1.1 !important;
    }
    /* 장소 (두 번째 div, 존재할 경우) */
    .fc-timegrid-event .fc-event-main > div > div:nth-of-type(2) {
      font-size: 0.6rem !important; /* 제목보다 더 작게 */
      margin-top: 0px !important; /* 간격 좁히기 */
      opacity: 0.8;
    }

    /* 왼쪽 시간축 (오전 1시, 2시...) 글씨도 줄이고 싶다면 */
    .fc-timegrid-slot-label-cushion {
      font-size: 0.6rem !important;
    }
  }

  /* 일정 텍스트 줄바꿈 설정 */
  .fc-event-title {
    white-space: normal !important; /* 줄바꿈 허용 */
    overflow: hidden;
    text-overflow: clip; /* ... 표시 제거 */
    word-break: break-all; /* 긴 단어도 강제로 줄바꿈 */
  }

  /* 일정 자체의 레이아웃 조정 */
  .fc-daygrid-event {
    white-space: normal !important; /* 박스 자체도 줄바꿈 허용 */
    align-items: flex-start !important; /* 텍스트가 여러 줄일 때 위쪽 정렬 */
  }

  /* 주간 뷰 일반 일정(세로형) 줄바꿈 설정 */
  .fc-timegrid-event .fc-event-main {
    white-space: normal !important;
  }

  /* 커스텀 렌더링된 제목/장소 div 줄바꿈 허용 */
  .fc-timegrid-event .fc-event-main > div > div {
    white-space: normal !important; /* 줄바꿈 켜기 */
    word-break: break-all !important; /* 긴 단어도 강제로 줄바꿈 */
    overflow: visible !important; /* 잘림 방지 */
  }

  .fc {
    font-family: inherit;
    --fc-border-color: ${({ theme }) => theme.palette.divider};
    --fc-page-bg-color: transparent;
    height: 100%;
  }
  .fc-col-header-cell,
  .fc-timegrid-axis {
    background-color: ${({ theme }) => theme.palette.background.default};
  }
  .fc-col-header-cell.fc-day-today {
    background-color: ${({ theme }) =>
      theme.palette.background.default} !important;
    border-bottom: 2px solid ${({ theme }) => theme.palette.primary.main};
  }
  .fc-col-header-cell.fc-day-today .fc-col-header-cell-cushion {
    color: ${({ theme }) => theme.palette.primary.main} !important;
    font-weight: 800;
  }
  .fc-daygrid-day-top {
    justify-content: center;
    padding-top: 4px;
  }
  .fc-day-sat .fc-col-header-cell-cushion,
  .fc-day-sat .fc-daygrid-day-number {
    color: #1976d2 !important;
  }
  .fc-day-sun .fc-col-header-cell-cushion,
  .fc-day-sun .fc-daygrid-day-number {
    color: #d32f2f !important;
  }
  .fc-daygrid-day-number,
  .fc-col-header-cell-cushion {
    color: ${({ theme }) => theme.palette.text.primary};
    text-decoration: none;
  }
  .fc-timegrid-slot-label-cushion {
    font-size: 0.85rem;
    font-weight: 500;
  }
  .fc-day-today {
    background-color: ${({ theme }) => theme.palette.action.hover} !important;
  }
  .fc-daygrid-day {
    cursor: pointer;
  }
  .fc-event {
    pointer-events: none;
  }
  .fc-daygrid-more-link {
    pointer-events: none;
    text-decoration: none;
    color: ${({ theme }) => theme.palette.text.secondary};
    font-weight: bold;
    font-size: 0.8rem;
    background-color: transparent !important;
  }
  .fc-theme-standard td,
  .fc-theme-standard th {
    border-right: none !important;
    border-left: none !important;
  }
  .fc-scrollgrid {
    border-right: none !important;
    border-left: none !important;
    border-top: none !important;
  }
`;

function HomePage() {
  const theme = useTheme();
  const calendarRef = useRef(null);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState(dayjs());
  const [viewType, setViewType] = useState("dayGridMonth");

  // 애니메이션 방향 상태 (0: 없음, 1: 다음, -1: 이전)
  const [direction, setDirection] = useState(0);

  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayEvents, setDayEvents] = useState([]);

  // 빈 배열로 시작
  const [rawEvents, setRawEvents] = useState([]);

  // 서버에서 일정 데이터 가져오기 (useEffect)
  useEffect(() => {
    const fetchSchedules = async () => {
      const token = localStorage.getItem("token");
      // 토큰 없으면 로그인으로 튕기게 할 수도 있음
      if (!token) return;

      try {
        const response = await fetch("/api/schedules", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setRawEvents(data); // 서버 데이터 저장
        } else {
          console.error("일정 불러오기 실패");
        }
      } catch (error) {
        console.error("API 에러:", error);
      }
    };

    fetchSchedules();
  }, []); // 컴포넌트 마운트 시 1회 실행

  // 데이터 가공 로직 수정
  const events = useMemo(() => {
    return rawEvents.map((event) => {
      let adjustedEnd = event.end;

      // 1. 종료일이 존재하고
      // 2. '하루 종일(allDay)' 설정이 되어 있거나 OR 날짜 문자열에 시간('T')이 없는 경우
      // -> 종료일에 하루를 더해줘야 달력에 정상적으로 보임
      if (event.end && (event.allDay || event.end.length <= 10)) {
        adjustedEnd = dayjs(event.end).add(1, 'day').format('YYYY-MM-DD');
      }

      // 색상 처리 로직
      let eventColor = CATEGORY_COLORS.lecture; // 기본값
      if (event.category === "group") {
        eventColor = event.color || "#ed6c02";
      } else if (CATEGORY_COLORS[event.category]) {
        eventColor = CATEGORY_COLORS[event.category];
      }

      return {
        ...event,
        end: adjustedEnd, // 여기서 보정된 날짜를 덮어씌움
        color: eventColor,
      };
    });
  }, [rawEvents]);

  // --- 핸들러 ---
  const handlePrev = () => {
    setDirection(-1);
    const unit = viewType === "dayGridMonth" ? "month" : "week";
    setCurrentDate((prev) => prev.subtract(1, unit));
  };

  const handleNext = () => {
    setDirection(1);
    const unit = viewType === "dayGridMonth" ? "month" : "week";
    setCurrentDate((prev) => prev.add(1, unit));
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

  const handleAddEvent = (date = null) => {
    navigate("/schedule/add", {
      state: { selectedDate: date ? date.format("YYYY-MM-DD") : null },
    });
  };

  const handleDateClick = (arg) => {
    const clickedDateStr = arg.dateStr.split("T")[0];
    const clickedDayjs = dayjs(clickedDateStr);
    const matchedEvents = events.filter((event) => {
      if (event.date) return event.date.split("T")[0] === clickedDateStr;
      if (event.start && event.end)
        return (
          clickedDayjs.isSame(event.start, "day") ||
          (clickedDayjs.isAfter(event.start, "day") &&
            clickedDayjs.isBefore(event.end, "day"))
        );
      if (event.daysOfWeek)
        return event.daysOfWeek.includes(clickedDayjs.day());
      return false;
    });
    setSelectedDate(clickedDayjs);
    setDayEvents(matchedEvents);
    setOpenDialog(true);
  };

  const getEventTimeText = (event) => {
     // 하루 종일인 경우
     if (event.allDay) return '종일';

     // 일반/그룹 일정 (start/end가 DateTime 형식일 때)
     if (event.start && event.end && !event.startTime) {
        const s = dayjs(event.start).format('HH:mm');
        const e = dayjs(event.end).format('HH:mm');
        return `${s} ~ ${e}`; // 오전 9:00 ~ 오전 10:00
     }

     // 강의 일정 (startTime/endTime 필드가 따로 있는 경우)
     if (event.startTime) {
        return `${event.startTime.slice(0,5)} ~ ${event.endTime ? event.endTime.slice(0,5) : ''}`;
     }
     
     // 날짜만 있는 경우
     if (event.date) {
        return event.date.includes('T') ? event.date.split('T')[1].slice(0, 5) : '종일';
     }

     return '시간 미정';
  };

  const renderSlotLabel = (arg) => {
    let hour = arg.date.getHours();
    return hour === 0
      ? "오전 12"
      : hour === 12
      ? "오후 12"
      : hour > 12
      ? String(hour - 12)
      : String(hour);
  };

  const renderDayHeader = (arg) => {
    const date = arg.date;
    const dayName = date.toLocaleDateString("ko-KR", { weekday: "short" });
    if (arg.view.type === "dayGridMonth") return <div>{dayName}</div>;
    const dayNumber = date.getDate();
    return (
      <div style={{ lineHeight: "1.2" }}>
        <div style={{ fontSize: "0.9rem", opacity: 0.8 }}>{dayName}</div>
        <div style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
          {dayNumber}
        </div>
      </div>
    );
  };

  const renderEventContent = (eventInfo) => {
    if (eventInfo.view.type === "dayGridMonth") return null;
    return (
      <div
        style={{
          padding: "2px",
          lineHeight: "1.2",
          height: "100%",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
        }}
      >
        <div
          style={{
            fontWeight: "bold",
            fontSize: "0.85rem",
            whiteSpace: "nowrap",
            textOverflow: "clip",
            overflow: "hidden",
          }}
        >
          {eventInfo.event.title}
        </div>
        {eventInfo.event.extendedProps.location && (
          <div
            style={{
              fontSize: "0.75rem",
              opacity: 0.9,
              marginTop: "1px",
              whiteSpace: "nowrap",
              textOverflow: "clip",
              overflow: "hidden",
            }}
          >
            {eventInfo.event.extendedProps.location}
          </div>
        )}
      </div>
    );
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleNext(),
    onSwipedRight: () => handlePrev(),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  return (
    <Box
      sx={{
        p: 0,
        height: { xs: "100%", sm: "auto" },
        width: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* 헤더 */}
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <CalendarMonthIcon sx={{ mr: 1, color: "text.secondary" }} />
            <Typography
              variant="h5"
              fontWeight="bold"
              onClick={handleTitleClick}
              sx={{
                cursor: "pointer",
                mr: 1,
                "&:hover": { color: "primary.main" },
              }}
            >
              {currentDate.format("YYYY.MM")}
            </Typography>
            <IconButton onClick={handlePrev} size="small" sx={{ ml: 1 }}>
              <ArrowBackIosNewIcon fontSize="inherit" />
            </IconButton>
            <IconButton onClick={handleNext} size="small">
              <ArrowForwardIosIcon fontSize="inherit" />
            </IconButton>
          </Box>
          {/* 우측: 뷰 토글(월/주) + PC용 일정추가 버튼 */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* 토글 버튼을 여기로 이동 */}
            <ToggleButtonGroup
              value={viewType}
              exclusive
              onChange={handleViewChange}
              size="small"
              sx={{ height: 32 }}
            >
              <ToggleButton
                value="dayGridMonth"
                sx={{ px: 1.5, fontSize: "0.8rem", fontWeight: "bold" }}
              >
                월
              </ToggleButton>
              <ToggleButton
                value="timeGridWeek"
                sx={{ px: 1.5, fontSize: "0.8rem", fontWeight: "bold" }}
              >
                주
              </ToggleButton>
            </ToggleButtonGroup>

            {/* PC에서만 보이는 일정 추가 버튼 */}
            {!isMobile && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleAddEvent(dayjs())}
                sx={{ borderRadius: 2, fontWeight: "bold" }} // 높이 맞춰줌
              >
                일정 추가
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* 애니메이션 영역 */}
      <Box
        {...swipeHandlers}
        sx={{
          flexGrow: 1,
          overflow: "hidden",
          position: "relative",
          height: { xs: "100%", sm: "auto" },
        }}
      >
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={currentDate.format("YYYY-MM-DD") + viewType}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            // direction이 0일 때 duration을 0으로 줘서 즉시 전환!
            transition={{
              duration: direction === 0 ? 0 : 0.3,
              ease: "easeInOut",
            }}
            style={{ height: isMobile ? "100%" : "auto", width: "100%" }}
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
                eventContent={
                  viewType === "timeGridWeek" ? renderEventContent : undefined
                }
                dayCellContent={(arg) => arg.dayNumberText.replace("일", "")}
              />
            </CalendarWrapper>
          </motion.div>
        </AnimatePresence>
      </Box>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
          <DateCalendar
            views={["year", "month"]}
            value={currentDate}
            onChange={handleDateChange}
            openTo="month"
          />
        </LocalizationProvider>
      </Popover>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            {selectedDate?.format("D일 (dd)")}
          </Typography>
          <Box>
            <IconButton
              onClick={() => handleAddEvent(selectedDate)}
              color="primary"
              sx={{ mr: 1 }}
            >
              <AddIcon />
            </IconButton>
            <IconButton onClick={() => setOpenDialog(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ minHeight: "150px", p: 0 }}>
          {dayEvents.length > 0 ? (
            <List>
              {dayEvents.map((event, index) => (
                <React.Fragment key={index}>
                  <ListItem
                    button
                    onClick={() =>
                      navigate("/schedule/detail", { state: { event: event } })
                    }
                  >
                    <Box
                      sx={{
                        width: 4,
                        height: 40,
                        bgcolor: event.color,
                        mr: 2,
                        borderRadius: 1,
                      }}
                    />
                    <ListItemText
                      primary={event.title}
                      secondary={
                        <React.Fragment>
                          <Typography
                            variant="body2"
                            component="span"
                            display="block"
                            color="text.secondary"
                          >
                            {getEventTimeText(event)}
                          </Typography>
                          {event.location && (
                            <Box
                              component="span"
                              sx={{
                                display: "block",
                                mt: 0.5,
                                color: "text.primary",
                                fontSize: "0.85rem",
                              }}
                            >
                              {event.location}
                            </Box>
                          )}
                        </React.Fragment>
                      }
                      primaryTypographyProps={{ fontWeight: "500" }}
                    />
                  </ListItem>
                  {index < dayEvents.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "150px",
                color: "text.secondary",
              }}
            >
              <EventNoteIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
              <Typography>일정이 없습니다</Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
      {isMobile && (
        <Fab
          color="primary"
          sx={{
            position: "fixed",
            bottom: 80, // 하단 탭바 높이만큼 띄움
            right: 20,
            zIndex: 1000,
          }}
          onClick={() => handleAddEvent(dayjs())}
        >
          <AddIcon />
        </Fab>
      )}
    </Box>
  );
}

export default HomePage;
