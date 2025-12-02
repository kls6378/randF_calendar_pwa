import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Fab,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleIcon from "@mui/icons-material/People";
import AddIcon from "@mui/icons-material/Add";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventNoteIcon from "@mui/icons-material/EventNote";
import dayjs from "dayjs";

function GroupDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // 그룹 정보와 일정을 State로 관리
  const [group, setGroup] = useState(location.state?.group || null);
  const [groupEvents, setGroupEvents] = useState([]);

  // 데이터 불러오기 (그룹 정보 & 일정)
  useEffect(() => {
    const fetchGroupData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        // 1. 그룹 상세 정보 가져오기
        const groupRes = await fetch(`/api/groups/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (groupRes.ok) {
          const groupData = await groupRes.json();
          setGroup(groupData);
        } else {
          console.error("그룹 정보 로딩 실패");
        }

        // 2. 전체 일정 가져와서 '이 그룹의 일정'만 필터링
        const scheduleRes = await fetch("/api/schedules", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (scheduleRes.ok) {
          const allSchedules = await scheduleRes.json();
          // category가 'group'이고, groupId가 현재 페이지의 id와 같은 것만 필터링
          const myGroupSchedules = allSchedules.filter(
            (s) => s.category === "group" && s.groupId === parseInt(id)
          );
          setGroupEvents(myGroupSchedules);
        }
      } catch (error) {
        console.error("데이터 로딩 중 에러:", error);
      }
    };

    fetchGroupData();
  }, [id]);

  // 로딩 중이거나 데이터가 없을 때 처리
  if (!group) {
    return <Box p={3}>로딩 중...</Box>;
  }

  const isLeader = group.role === "leader";

  const handleCreateSchedule = () => {
    navigate("/schedule/add", { state: { groupContext: group } });
  };

  // 날짜/시간 포맷팅 함수
  const formatTime = (event) => {
    const startObj = dayjs(event.start);
    const endObj = dayjs(event.end);

    // 1. 하루 종일 (YYYY.MM.DD ~ YYYY.MM.DD)
    if (event.allDay) {
      return `${startObj.format("YYYY.MM.DD")} ~ ${endObj.format(
        "YYYY.MM.DD"
      )}`;
    }

    // 2. 시간 있음 (YYYY.MM.DD HH:mm ~ YYYY.MM.DD HH:mm)
    return `${startObj.format("YYYY.MM.DD HH:mm")} ~ ${endObj.format(
      "YYYY.MM.DD HH:mm"
    )}`;
  };

  return (
    <Box
      sx={{
        p: 0,
        minHeight: "100vh",
        bgcolor: "background.default",
        position: "relative",
      }}
    >
      {/* 헤더 */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <IconButton onClick={() => navigate("/groups")}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" fontWeight="bold">
          {group.name}
        </Typography>
        <IconButton
          onClick={() => navigate("/groups/setting", { state: { group } })}
        >
          <SettingsIcon />
        </IconButton>
      </Box>

      {/* 그룹 정보 */}
      <Box sx={{ px: 3, mb: 3, textAlign: "left" }}>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 2, mt: 2, whiteSpace: "pre-wrap", lineHeight: 1.6 }}
        >
          {group.desc}
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 2,
          }}
        >
          <Chip
            icon={<PeopleIcon />}
            label={`멤버 ${group.memberCount || 0}명`}
            variant="outlined"
            onClick={() =>
              navigate(`/groups/${group.id}/members`, { state: { group } })
            }
            clickable
          />
          {isLeader && !isMobile && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateSchedule}
              sx={{ borderRadius: 2, fontWeight: "bold" }}
            >
              일정 추가
            </Button>
          )}
        </Box>
      </Box>

      <Divider />

      {/* 다가오는 일정 리스트 */}
      <Box sx={{ p: 3, pb: 10 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom align="left">
          📅 다가오는 일정
        </Typography>

        {groupEvents.length > 0 ? (
          <List
            sx={{
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: 1,
              p: 0,
            }}
          >
            {groupEvents.map((event, index) => (
              <React.Fragment key={event.id}>
                <ListItem
                  button
                  alignItems="flex-start"
                  onClick={() =>
                    navigate("/schedule/detail", {
                      state: { event: event, isLeader: isLeader },
                    })
                  }
                  sx={{ px: 2, py: 1.5 }}
                >
                  <Box
                    sx={{
                      width: 4,
                      height: 50,
                      bgcolor: group.color || event.color || "#ed6c02",
                      mr: 2,
                      borderRadius: 1,
                      flexShrink: 0,
                      mt: 0.5,
                    }}
                  />

                  <ListItemText
                    primary={
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        sx={{ mb: 0.5 }}
                      >
                        {event.title}
                      </Typography>
                    }
                    secondary={
                      <Box
                        component="span"
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.5,
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            fontSize: "0.85rem",
                            color: "text.secondary",
                          }}
                        >
                          <AccessTimeIcon sx={{ fontSize: "1rem", mr: 0.5 }} />
                          {formatTime(event)}
                        </Box>
                        {event.location && (
                          <Box
                            component="span"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              fontSize: "0.85rem",
                              color: "text.primary",
                            }}
                          >
                            <LocationOnIcon
                              sx={{
                                fontSize: "1rem",
                                mr: 0.5,
                                color: "action.active",
                              }}
                            />
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
        ) : (
          // 일정이 없을 때 보여줄 UI
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 6,
              color: "text.secondary",
              bgcolor: "background.paper",
              borderRadius: 2,
              border: "1px dashed #e0e0e0",
            }}
          >
            <EventNoteIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
            <Typography variant="body1" fontWeight="bold" sx={{ opacity: 0.7 }}>
              등록된 일정이 없습니다.
            </Typography>
            {isLeader && (
              <Typography variant="caption" sx={{ mt: 0.5, opacity: 0.6 }}>
                + 버튼을 눌러 새 일정을 추가해보세요!
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* 모바일 FAB */}
      {isLeader && isMobile && (
        <Fab
          color="primary"
          sx={{ position: "fixed", bottom: 80, right: 20 }}
          onClick={handleCreateSchedule}
        >
          <AddIcon />
        </Fab>
      )}
    </Box>
  );
}

export default GroupDetailPage;