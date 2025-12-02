import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Fab,
  Chip,
  Avatar,
  Stack,
  Button,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import GroupIcon from "@mui/icons-material/Group";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import { useSnackbar } from "../contexts/SnackbarContext";

function GroupListPage() {
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // 메뉴 앵커
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // 참가 팝업 상태
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");

  // 빈 배열로 시작 (서버에서 가져올 것임)
  const [groups, setGroups] = useState([]);

  // 그룹 목록 불러오기 함수
  const fetchGroups = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("/api/groups", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("내 그룹 목록:", data);
        setGroups(data);
      } else {
        console.error("그룹 목록 조회 실패");
      }
    } catch (error) {
      console.error("API 에러:", error);
    }
  };

  // 화면이 켜지면 목록 불러오기
  useEffect(() => {
    fetchGroups();
  }, []);

  // --- 핸들러 ---
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleCreateGroup = () => {
    handleMenuClose();
    navigate("/groups/create");
  };

  const handleOpenJoinDialog = () => {
    handleMenuClose();
    setJoinDialogOpen(true);
  };
  const handleCloseJoinDialog = () => {
    setJoinDialogOpen(false);
    setInviteCode("");
  };

  // 그룹 참가 API 연동
  const handleSubmitJoin = async () => {
    if (!inviteCode.trim()) {
      showSnackbar("초대 코드를 입력해주세요.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/groups/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ inviteCode }),
      });

      if (response.ok) {
        showSnackbar(`그룹에 참가했습니다.`);
        handleCloseJoinDialog();
        fetchGroups(); // 목록 새로고침
      } else {
        const errorText = await response.text();
        showSnackbar(`참가 실패: ${errorText}`);
      }
    } catch (error) {
      console.error("참가 요청 에러:", error);
      showSnackbar("서버 오류가 발생했습니다.");
    }
  };

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          ml: 1,
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          내 그룹
        </Typography>
        {!isMobile && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleMenuOpen}
            sx={{ borderRadius: 2, fontWeight: "bold" }}
          >
            그룹 추가
          </Button>
        )}
      </Box>

      {groups.length === 0 ? (
        <Box
          sx={{
            flexGrow: 1, // 남은 공간 차지
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "text.secondary",
            mt: 10, // 시각적 중심 보정
          }}
        >
          <GroupIcon sx={{ fontSize: 80, mb: 2, opacity: 0.2 }} />
          <Typography variant="h6" fontWeight="bold" color="text.secondary">
            가입된 그룹이 없습니다.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
            새 그룹을 만들거나 코드로 참가해보세요!
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {groups.map((group) => (
            <Card
              key={group.id}
              sx={{ borderRadius: 3, boxShadow: 2, width: "100%" }}
            >
              <CardActionArea
                onClick={() =>
                  navigate(`/groups/${group.id}`, { state: { group } })
                }
              >
                <CardContent
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    p: 2,
                    "&:last-child": { pb: 2 },
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: group.color || "#ed6c02",
                      width: 50,
                      height: 50,
                      mr: 2,
                    }}
                  >
                    <GroupIcon />
                  </Avatar>
                  <Box sx={{ flexGrow: 1, minWidth: 0, textAlign: "left" }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        noWrap
                        sx={{ fontSize: "1.05rem" }}
                      >
                        {group.name}
                      </Typography>
                      {group.role === "leader" && (
                        <Chip
                          label="팀장"
                          size="small"
                          color="primary"
                          sx={{
                            height: 20,
                            fontSize: {
                              xs: "0.65rem",
                              sm: "0.85rem", 
                            },
                            fontWeight: "bold",
                          }}
                        />
                      )}
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      noWrap
                      sx={{ fontSize: "0.85rem" }}
                    >
                      {group.desc}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", ml: 1 }}>
                    <Chip
                      label={`${group.memberCount}명`}
                      size="small"
                      variant="outlined"
                      sx={{
                        mr: 1,
                        height: 24,
                        color: "text.secondary",
                        borderColor: "divider",
                      }}
                    />
                    <ArrowForwardIosIcon
                      sx={{ fontSize: "1rem", color: "text.disabled" }}
                    />
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Stack>
      )}

      {isMobile && (
        <Fab
          color="primary"
          sx={{ position: "fixed", bottom: 80, right: 20 }}
          onClick={handleMenuOpen}
        >
          <AddIcon />
        </Fab>
      )}

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <MenuItem onClick={handleCreateGroup} sx={{ py: 1.5, px: 2 }}>
          <CreateNewFolderIcon sx={{ mr: 2, color: "primary.main" }} />
          <Typography fontWeight="500">새 그룹 만들기</Typography>
        </MenuItem>
        <MenuItem onClick={handleOpenJoinDialog} sx={{ py: 1.5, px: 2 }}>
          <GroupAddIcon sx={{ mr: 2, color: "secondary.main" }} />
          <Typography fontWeight="500">초대 코드로 참가</Typography>
        </MenuItem>
      </Menu>

      <Dialog
        open={joinDialogOpen}
        onClose={handleCloseJoinDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle fontWeight="bold">그룹 참가</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            전달받은 그룹 초대 코드를 입력해주세요.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="code"
            label="초대 코드"
            type="text"
            fullWidth
            variant="outlined"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="예: A4SJ65"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseJoinDialog} color="inherit">
            취소
          </Button>
          <Button
            onClick={handleSubmitJoin}
            variant="contained"
            disabled={!inviteCode}
          >
            참가하기
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default GroupListPage;
