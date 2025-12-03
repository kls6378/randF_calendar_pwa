import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
  FormControlLabel,
  Switch,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ClassIcon from "@mui/icons-material/Class";
import GroupIcon from "@mui/icons-material/Group";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { useSnackbar } from '../contexts/SnackbarContext';
import dayjs from "dayjs";
import "dayjs/locale/ko";

const DAYS = [
  { label: "일", value: 0 },
  { label: "월", value: 1 },
  { label: "화", value: 2 },
  { label: "수", value: 3 },
  { label: "목", value: 4 },
  { label: "금", value: 5 },
  { label: "토", value: 6 },
];

function AddEventPage() {
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const location = useLocation();

  const eventToEdit = location.state?.eventToEdit;
  const isEditMode = !!eventToEdit;

  const groupContext = location.state?.groupContext;

  // 현재 날짜에 따라 개강일 설정
  const getInitialSemesterStart = () => {
    const now = dayjs();
    const currentMonth = now.month(); // 0(1월) ~ 11(12월)

    // 1월(0) ~ 6월(5) -> 같은 해 3월 1일
    if (currentMonth < 6) {
      return now.month(2).date(1); // month(2)는 3월
    } 
    // 7월(6) ~ 12월(11) -> 같은 해 9월 1일
    else {
      return now.month(8).date(1); // month(8)은 9월
    }
  };

  const initialSemesterDate = getInitialSemesterStart();

  // 상태 관리
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("personal");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // 중복 클릭 방지

  // [개인/그룹] 전용 상태
  const [place, setPlace] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [start, setStart] = useState(dayjs().hour(9).minute(0));
  const [end, setEnd] = useState(dayjs().hour(10).minute(0));

  // [강의] 전용 상태
  const [lectureRoom, setLectureRoom] = useState("");
  const [semesterStart, setSemesterStart] = useState(initialSemesterDate);
  const [semesterEnd, setSemesterEnd] = useState(initialSemesterDate.add(16, "week").subtract(1,"day"));
  const [lectureStartTime, setLectureStartTime] = useState(
    dayjs().hour(9).minute(0)
  );
  const [lectureEndTime, setLectureEndTime] = useState(
    dayjs().hour(10).minute(0)
  );
  const [selectedDays, setSelectedDays] = useState([]);

  const handleDayChange = (event, newDays) => {
    setSelectedDays(newDays);
  };
  const handleSemesterStartChange = (newValue) => { 
    setSemesterStart(newValue); 
    if (newValue) {
        // 개강일로부터 16주 뒤를 종강일로 자동 설정 (하루 뺌 = 16주차 수업일까지)
        setSemesterEnd(newValue.add(16, 'week').subtract(1, 'day'));
        
        // 아직 요일 선택 안 했으면 해당 요일 자동 선택
        if (selectedDays.length === 0) setSelectedDays([newValue.day()]); 
    }
  };

  // 시작시간 변경 시 종료시간은 (시작시간+1)
  const handleStartTimeChange = (newTime) => {
    setStart(newTime);
    if (newTime) {
        setEnd(newTime.add(1, 'hour'));
    }
  };

  //강의 시간도
  const handleLectureStartTimeChange = (newTime) => {
    setLectureStartTime(newTime);
    if (newTime) {
        setLectureEndTime(newTime.add(1, 'hour'));
    }
  };

  // 초기화 로직 순서 변경
  useEffect(() => {
    // 1순위: 수정 모드인지 확인
    if (isEditMode) {
      const evt = eventToEdit;
      setTitle(evt.title);
      setCategory(evt.category || "personal");
      setDescription(evt.description || "");

      if (evt.category === "lecture") {
        setLectureRoom(evt.location || "");
        if (evt.startRecur) setSemesterStart(dayjs(evt.startRecur));
        if (evt.endRecur) setSemesterEnd(dayjs(evt.endRecur));
        if (evt.startTime)
          setLectureStartTime(dayjs(evt.startTime, "HH:mm:ss"));
        if (evt.endTime) setLectureEndTime(dayjs(evt.endTime, "HH:mm:ss"));
        if (Array.isArray(evt.daysOfWeek)) setSelectedDays(evt.daysOfWeek);
      } else {
        // 개인 OR 그룹 일정
        setPlace(evt.location || ""); // 장소 채우기
        setAllDay(evt.allDay || false);

        // 날짜/시간 복구
        const startDateStr = evt.date || evt.start;
        const endDateStr = evt.end || evt.date; // 종료일 없으면 시작일과 동일

        // dayjs로 변환해서 상태 저장
        if (startDateStr) setStart(dayjs(startDateStr));
        if (endDateStr) setEnd(dayjs(endDateStr));
      }
    }
    // 2순위: 그룹 생성 모드 (수정이 아닐 때만)
    else if (groupContext) {
      setCategory("group");
    }
    // 3순위: 날짜 클릭 생성 모드
    else if (location.state?.selectedDate) {
      const initDate = dayjs(location.state.selectedDate);
      setStart(initDate.hour(9).minute(0));
      setEnd(initDate.hour(10).minute(0));
      setSelectedDays([initDate.day()]);
    }
  }, [location.state, isEditMode, eventToEdit, groupContext]);

  const handleStartDateChange = (newDate) => {
    setStart(newDate);

    // 시작 날짜가 유효하다면, 종료 날짜도 같은 날짜로 변경 (시간은 기존 end 시간 유지)
    if (newDate) {
      const syncedEndDate = end
        .year(newDate.year())
        .month(newDate.month())
        .date(newDate.date());

      setEnd(syncedEndDate);
    }
  };

  // API 연동을 위한 handleSubmit 수정
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 데이터 구성
    let payload = { title, category, description };

    if (category === "personal" || category === "group") {
      payload = {
        ...payload,
        location: place,
        allDay,
        // ISO 문자열로 변환 (서버 호환)
        start: start.format(),
        end: end.format(),
        groupId: groupContext ? groupContext.id : eventToEdit?.groupId || null,
      };
    } else {
      if (selectedDays.length === 0) {
        showSnackbar("반복할 요일을 최소 하나 이상 선택해주세요.");
        return;
      }
      payload = {
        ...payload,
        location: lectureRoom,
        startRecur: semesterStart.format("YYYY-MM-DD"),
        endRecur: semesterEnd.format("YYYY-MM-DD"),
        startTime: lectureStartTime.format("HH:mm:00"),
        endTime: lectureEndTime.format("HH:mm:00"),
        daysOfWeek: selectedDays,
      };
    }

    setIsSubmitting(true); // 버튼 비활성화

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("로그인이 필요합니다.");
        setIsSubmitting(false);
        return;
      }

      let url = "/api/schedules";
      let method = "POST";

      // 수정 모드라면 URL과 메서드 변경
      if (isEditMode) {
        url = `/api/schedules/${eventToEdit.id}`; // id는 number
        method = "PUT";
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        showSnackbar(isEditMode ? '일정이 수정되었습니다!' : '새 일정이 등록되었습니다!');
        navigate(-1); // 성공 시 뒤로가기
      } else {
        const errorText = await response.text();
        showSnackbar(`저장 실패: ${errorText}`);
      }
    } catch (error) {
      console.error("일정 저장 에러:", error);
      showSnackbar("서버 연결에 실패했습니다.");
    } finally {
      setIsSubmitting(false); // 버튼 활성화
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: "sm", mx: "auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" fontWeight="bold">
          {isEditMode
            ? "일정 수정"
            : groupContext
            ? "그룹 일정 추가"
            : "새 일정 만들기"}
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* 헤더: 그룹 칩 or 카테고리 선택 */}
          {groupContext ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 1,
                p: 1,
                bgcolor: "background.paper",
                borderRadius: 2,
              }}
            >
              <Chip
                icon={<GroupIcon sx={{ "&&": { color: "white" } }} />}
                label={groupContext.name}
                sx={{
                  fontWeight: "bold",
                  bgcolor: groupContext.color || "#ed6c02",
                  color: "white",
                  border: "none",
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {isEditMode ? "일정을 수정합니다." : "새 일정을 생성합니다."}
              </Typography>
            </Box>
          ) : (
            <FormControl fullWidth disabled={isEditMode}>
              <InputLabel>카테고리</InputLabel>
              <Select
                value={category}
                label="카테고리"
                onChange={(e) => setCategory(e.target.value)}
              >
                <MenuItem value="personal">💚 개인 일정</MenuItem>
                <MenuItem value="lecture">📘 강의 시간표</MenuItem>
              </Select>
            </FormControl>
          )}

          <TextField
            label={category === 'lecture' ? "강의명" : "일정 제목"}
            required
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            InputProps={{inputProps: { maxLength: 20 }}}
          />
          <Divider />

          {category === "personal" || category === "group" ? (
            <>
              <TextField
                label="장소"
                fullWidth
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                InputProps={{
                  inputProps: { maxLength: 50 },
                  startAdornment: (
                    <LocationOnIcon color="action" sx={{ mr: 1 }} />
                  ),
                }}
              />
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="ko"
              >
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={allDay}
                        onChange={(e) => setAllDay(e.target.checked)}
                      />
                    }
                    label="하루 종일"
                  />
                </Box>
                <Stack direction="row" spacing={2}>
                  <DatePicker
                    label="시작 날짜"
                    value={start}
                    onChange={handleStartDateChange}
                    format="YYYY.MM.DD (dd)"
                    slotProps={{ textField: { fullWidth: true } }}
                  />

                  {!allDay && (
                    <TimePicker
                      label="시간"
                      value={start}
                      onChange={handleStartTimeChange}
                      format="A hh:mm"
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  )}
                </Stack>
                <Stack direction="row" spacing={2}>
                  <DatePicker
                    label="종료 날짜"
                    value={end}
                    onChange={(newValue) => setEnd(newValue)}
                    format="YYYY.MM.DD (dd)"
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                  {!allDay && (
                    <TimePicker
                      label="시간"
                      value={end}
                      onChange={(newValue) => setEnd(newValue)}
                      format="A hh:mm"
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  )}
                </Stack>
              </LocalizationProvider>
            </>
          ) : (
            <>
              <Typography variant="subtitle2" color="primary" fontWeight="bold">
                📅 반복 요일 및 시간
              </Typography>
              <Box sx={{ width: "100%" }}>
                <ToggleButtonGroup
                  value={selectedDays}
                  onChange={handleDayChange}
                  aria-label="days"
                  multiple
                  fullWidth
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 0.5,
                    "& .MuiToggleButtonGroup-grouped": {
                      border: "1px solid rgba(0,0,0,0.12) !important",
                      borderRadius: "50% !important",
                      width: 40,
                      height: 40,
                      margin: 0,
                    },
                    "& .MuiToggleButtonGroup-grouped:not(:first-of-type)": {
                      borderLeft: "1px solid rgba(0,0,0,0.12) !important",
                      marginLeft: 0,
                    },
                  }}
                >
                  {DAYS.map((day) => (
                    <ToggleButton
                      key={day.value}
                      value={day.value}
                      sx={{
                        color: "text.secondary",
                        "&.Mui-selected": {
                          bgcolor: "primary.main",
                          color: "white",
                          "&:hover": { bgcolor: "primary.dark" },
                        },
                      }}
                    >
                      {day.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>
              <TextField
                label="강의실"
                required
                fullWidth
                value={lectureRoom}
                onChange={(e) => setLectureRoom(e.target.value)}
                InputProps={{
                  inputProps: { maxLength: 20 },
                  startAdornment: <ClassIcon color="action" sx={{ mr: 1 }} />,
                }}
              />
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="ko"
              >
                <Stack direction="row" spacing={2}>
                  <DatePicker
                    label="첫 강의일 (개강)"
                    value={semesterStart}
                    onChange={handleSemesterStartChange}
                    format="YYYY.MM.DD (dd)"
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                  <DatePicker
                    label="마지막 강의일 (종강)"
                    value={semesterEnd}
                    onChange={(newValue) => setSemesterEnd(newValue)}
                    format="YYYY.MM.DD (dd)"
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Stack>
                <Stack direction="row" spacing={2}>
                  <TimePicker
                    label="수업 시작 시간"
                    value={lectureStartTime}
                    onChange={handleLectureStartTimeChange}
                    format="A hh:mm"
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                  <TimePicker
                    label="수업 종료 시간"
                    value={lectureEndTime}
                    onChange={(newValue) => setLectureEndTime(newValue)}
                    format="A hh:mm"
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Stack>
              </LocalizationProvider>
            </>
          )}

          <Divider />
          <TextField
            label="메모 (선택)"
            multiline
            rows={3}
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isSubmitting}
            sx={{ mt: 2, height: 50, fontSize: "1.1rem", borderRadius: 2 }}
          >
            {isEditMode ? "수정 완료" : "저장하기"}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

export default AddEventPage;
