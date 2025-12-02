import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  Chip,
  Divider,
  Paper,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GroupIcon from "@mui/icons-material/Group";
import { useSnackbar } from "../contexts/SnackbarContext";
import { useConfirm } from "../contexts/ConfirmContext";
import dayjs from "dayjs";

function EventDetailPage() {
  const { showSnackbar } = useSnackbar();
  const { showConfirm } = useConfirm();
  const navigate = useNavigate();
  const location = useLocation();

  // 초기값은 location state에서 가져오지만, 이후엔 서버 데이터를 사용하기 위해 state로 관리
  const initialEvent = location.state?.event;
  const [event, setEvent] = useState(initialEvent);

  const isLeader = location.state?.isLeader; // 그룹 리더 여부 등은 그대로 유지
  const canEdit = event?.category !== "group" || isLeader;

  // 화면에 진입시 최신 데이터 불러오기
  useEffect(() => {
    const fetchEventDetail = async () => {
      // ID가 없으면 조회 불가
      if (!initialEvent?.id) return;

      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        // 상세 조회(/api/schedules/:id) 사용
        const response = await fetch(`/api/schedules/${initialEvent.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const latestData = await response.json();
          setEvent(latestData); // 최신 데이터로 갈아끼우기
        } else {
          console.error("일정을 찾을 수 없습니다.");
          // 만약 삭제된 일정이면 뒤로가기 처리 등을 할 수도 있음
        }
      } catch (error) {
        console.error("상세 정보 로딩 실패:", error);
      }
    };

    fetchEventDetail();
  }, [initialEvent?.id]);

  if (!event) return <Box p={3}>정보가 없습니다.</Box>;

  // 삭제 API 연동
  const handleDelete = async () => {
    const isConfirmed = await showConfirm(
      "일정 삭제", // 제목
      `정말 삭제하시겠습니까?`, // 내용
      "삭제", // 확인 버튼 텍스트
      "취소" // 취소 버튼 텍스트
    );
    if (isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/schedules/${event.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          showSnackbar("일정이 삭제되었습니다.");
          navigate("/", { replace: true }); // 삭제 후엔 홈으로 가는 게 안전함
        } else {
          showSnackbar("삭제에 실패했습니다.");
        }
      } catch (error) {
        console.error("삭제 요청 에러:", error);
        showSnackbar("서버 오류가 발생했습니다.");
      }
    }
  };

  // 수정 버튼 클릭 핸들러
  const handleEdit = () => {
    navigate("/schedule/add", {
      state: {
        eventToEdit: event,
        // 그룹 일정이면, '색상' 정보를 포함한 가짜 groupContext를 만들어서 보냄
        groupContext:
          event.category === "group"
            ? {
                id: event.groupId, // (백엔드 연동 시 필요)
                name: "그룹 일정 수정", // 칩에 표시될 이름
                color: event.color, // 이 색상을 넘겨야 수정 페이지 칩이 그 색으로 나옴
              }
            : null,
      },
    });
  };

  const getCategoryLabel = (cat) => {
    if (cat === "lecture") return { label: "강의", color: "primary" };
    if (cat === "group") return { label: "그룹", color: "warning" };
    return { label: "개인", color: "success" };
  };
  const categoryInfo = getCategoryLabel(event.category);

  const getFormattedDate = () => {
    if (event.category === "lecture") {
      const start = dayjs(event.startRecur || event.start).format("YYYY.MM.DD");
      const end = dayjs(event.endRecur || event.end).format("YYYY.MM.DD");
      const time = `${event.startTime?.slice(0, 5)} ~ ${event.endTime?.slice(
        0,
        5
      )}`;
      return `${start} ~ ${end} (매주 ${time})`;
    }
    const startObj = dayjs(event.start || event.date);
    const endObj = dayjs(event.end || event.date);
    if (event.allDay) {
      return `${startObj.format("YYYY.MM.DD")} ~ ${endObj.format(
        "YYYY.MM.DD"
      )}`;
    }
    return `${startObj.format("YYYY.MM.DD HH:mm")} ~ ${endObj.format(
      "YYYY.MM.DD HH:mm"
    )}`;
  };

  const rowStyle = { display: "flex", alignItems: "flex-start", gap: 2 };
  const iconStyle = { color: "action.active", mt: 0.3 };

  return (
    <Box
      sx={{
        p: 3,
        maxWidth: "sm",
        mx: "auto",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 헤더 */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" fontWeight="bold">
          일정 상세
        </Typography>
        <Box width={40} />
      </Box>

      {/* 메인 카드 */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, flexGrow: 1 }}>
        <Stack spacing={3}>
          <Box sx={{ textAlign: "left" }}>
            <Chip
              label={categoryInfo.label}
              color={
                event.category === "group" ? undefined : categoryInfo.color
              }
              size="small"
              sx={{
                mb: 1,
                fontWeight: "bold",
                ...(event.category === "group" && {
                  bgcolor: event.color,
                  color: "#fff",
                  border: "none",
                }),
              }}
            />
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{ wordBreak: "keep-all", textAlign: "left" }}
            >
              {event.title}
            </Typography>
          </Box>

          <Divider />

          {event.category === "group" && event.groupName && (
            <Box sx={rowStyle}>
              <GroupIcon sx={iconStyle} />
              <Box sx={{ textAlign: "left" }}>
                <Typography
                  variant="caption"
                  display="block"
                  color="text.secondary"
                  sx={{ fontWeight: "bold", mb: 0.5 }}
                >
                  그룹명
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="500"
                  sx={{ color: "primary.main", fontWeight: "bold" }}
                >
                  {event.groupName}
                </Typography>
              </Box>
            </Box>
          )}

          <Box sx={rowStyle}>
            <AccessTimeIcon sx={iconStyle} />
            <Box sx={{ textAlign: "left" }}>
              <Typography
                variant="caption"
                display="block"
                color="text.secondary"
                sx={{ fontWeight: "bold", mb: 0.5 }}
              >
                일시
              </Typography>
              <Typography variant="body1" fontWeight="500">
                {getFormattedDate()}
              </Typography>
            </Box>
          </Box>

          {event.location && (
            <Box sx={rowStyle}>
              <LocationOnIcon sx={iconStyle} />
              <Box sx={{ textAlign: "left" }}>
                <Typography
                  variant="caption"
                  display="block"
                  color="text.secondary"
                  sx={{ fontWeight: "bold", mb: 0.5 }}
                >
                  {event.category === "lecture" ? "강의실" : "장소"}
                </Typography>
                <Typography variant="body1" fontWeight="500">
                  {event.location}
                </Typography>
              </Box>
            </Box>
          )}

          {event.description && (
            <Box sx={rowStyle}>
              <EventNoteIcon sx={iconStyle} />
              <Box sx={{ textAlign: "left", width: "100%" }}>
                <Typography
                  variant="caption"
                  display="block"
                  color="text.secondary"
                  sx={{ fontWeight: "bold", mb: 0.5 }}
                >
                  메모
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                >
                  {event.description}
                </Typography>
              </Box>
            </Box>
          )}
        </Stack>
      </Paper>

      {/* 하단 버튼 그룹 */}
      {canEdit && (
        <Stack direction="row" spacing={2} sx={{ mt: 3, mb: 2 }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<EditIcon />}
            onClick={handleEdit}
            size="large"
            sx={{ borderRadius: 2 }}
          >
            수정
          </Button>
          <Button
            variant="outlined"
            color="error"
            fullWidth
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            size="large"
            sx={{ borderRadius: 2 }}
          >
            삭제
          </Button>
        </Stack>
      )}
    </Box>
  );
}

export default EventDetailPage;
