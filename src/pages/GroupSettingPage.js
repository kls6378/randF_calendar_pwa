import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Stack,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  FormLabel,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { useSnackbar } from "../contexts/SnackbarContext";
import { useConfirm } from "../contexts/ConfirmContext";

// 빨, 주, 노, 남, 보, 시안
const GROUP_COLORS = [
  "#d32f2f",
  "#ed6c02",
  "#fbc02d",
  "#1a237e",
  "#9c27b0",
  "#00bcd4",
];

function GroupSettingPage() {
  const { showSnackbar } = useSnackbar();
  const { showConfirm } = useConfirm();
  const navigate = useNavigate();
  const location = useLocation();

  const groupData = location.state?.group || {
    name: "샘플 그룹",
    desc: "설명",
    color: GROUP_COLORS[0],
    inviteCode: "TEST-CODE",
    role: "member",
  };

  const isLeader = groupData.role === "leader";

  const [name, setName] = useState(groupData.name);
  const [desc, setDesc] = useState(groupData.desc);
  const [color, setColor] = useState(groupData.color);

  // --- 핸들러 ---
  const handleCopyCode = () => {
    navigator.clipboard.writeText(groupData.inviteCode);
    showSnackbar("초대 코드가 복사되었습니다.");
  };
  // 설정 저장 (색상 변경 + 정보 수정)
  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // 색상 변경 API 호출 (모든 멤버 공통)
      // 색상이 변경되었을 때만 호출하거나, 그냥 항상 호출해도 무방
      const colorRes = await fetch(`/api/groups/${groupData.id}/color`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ color }),
      });

      // 리더인 경우 그룹 정보(이름, 설명) 수정 API 호출
      if (isLeader) {
        const infoRes = await fetch(`/api/groups/${groupData.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, description: desc }),
        });

        if (!infoRes.ok) throw new Error("정보 수정 실패");
      }

      if (colorRes.ok) {
        showSnackbar("설정이 저장되었습니다.");
        // 변경된 내용을 반영하기 위해 뒤로 가되, 목록을 새로고침하게 유도하면 좋음
        navigate(-1);
      } else {
        showSnackbar("저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("저장 중 오류:", error);
      showSnackbar("서버 오류가 발생했습니다.");
    }
  };

  // 그룹 삭제 (리더)
  const handleDeleteGroup = async () => {
    const isConfirmed = await showConfirm(
      "그룹 삭제", // 제목
      `정말 ${groupData.name} 그룹을 삭제하시겠습니까?\n모든 멤버와 일정이 삭제됩니다.`, // 내용
      "삭제", // 확인 버튼 텍스트 
      "취소" // 취소 버튼 텍스트 
    );
    if (isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/groups/${groupData.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          showSnackbar("그룹이 삭제되었습니다.");
          navigate("/groups"); // 목록으로 이동
        } else {
          showSnackbar("삭제 실패: 권한이 없거나 오류가 발생했습니다.");
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  // 그룹 나가기 (멤버)
  const handleLeaveGroup = async () => {
    const isConfirmed = await showConfirm(
      "그룹 퇴장", // 제목
      `'${groupData.name}' 그룹에서 나가시겠습니까?`, // 내용
      "나가기", // 확인 버튼 텍스트 
      "취소" // 취소 버튼 텍스트 
    );
    if (isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/groups/${groupData.id}/leave`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          showSnackbar("그룹에서 나갔습니다.");
          navigate("/groups"); // 목록으로 이동
        } else {
          showSnackbar("나가기 실패");
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: "sm", mx: "auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" fontWeight="bold">
          그룹 설정
        </Typography>
      </Box>

      <Stack spacing={4}>
        {/* 초대 코드 영역 */}
        {isLeader && (
          <Box>
            <FormLabel
              component="legend"
              sx={{ mb: 1, fontWeight: "bold", fontSize: "0.9rem" }}
            >
              초대 코드
            </FormLabel>

            <Paper
              elevation={0}
              onClick={handleCopyCode} // 박스 클릭 시 복사
              sx={{
                p: 3,
                display: "flex",
                flexDirection: "column", // 세로 정렬
                alignItems: "center", // 가로 가운데 정렬
                justifyContent: "center",
                border: "2px dashed",
                borderColor: "primary.main",
                bgcolor: "background.paper",
                cursor: "pointer", // 손가락 커서
                transition: "all 0.2s", // 부드러운 전환
                "&:hover": {
                  bgcolor: "action.hover", // 호버 시 약간 어두워짐
                  borderColor: "primary.dark",
                  transform: "translateY(-2px)", // 살짝 떠오르는 효과
                },
                "&:active": {
                  transform: "translateY(0)", // 클릭 시 눌리는 효과
                  bgcolor: "action.selected",
                },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                <Typography
                  variant="h5"
                  color="primary"
                  fontWeight="bold"
                  sx={{ letterSpacing: 3 }}
                >
                  {groupData.inviteCode}
                </Typography>
                <ContentCopyIcon fontSize="small" color="primary" />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                클릭하여 복사
              </Typography>
            </Paper>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block", textAlign: "center" }}
            >
              팀원들에게 이 코드를 공유하세요.
            </Typography>
            <Divider sx={{ mt: 3 }} />
          </Box>
        )}

        {/* 기본 정보 (리더만 수정 가능, 팀원은 아예 안 보임) */}
        {isLeader && (
          <Box>
            <FormLabel
              component="legend"
              sx={{ mb: 2, fontWeight: "bold", fontSize: "0.9rem" }}
            >
              기본 정보
            </FormLabel>
            <Stack spacing={2}>
              <TextField
                label="그룹 이름"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                InputProps={{inputProps: { maxLength: 20 }}}
              />
              <TextField
                label="그룹 설명"
                multiline
                rows={3}
                fullWidth
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </Stack>
          </Box>
        )}

        {/* 색상 설정 (모두 보임) */}
        <Box>
          <FormLabel
            component="legend"
            sx={{ mb: 1, fontWeight: "bold", fontSize: "0.9rem" }}
          >
            내 달력에 표시될 색상
          </FormLabel>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <ToggleButtonGroup
              value={color}
              exclusive
              onChange={(e, newColor) => newColor && setColor(newColor)}
              sx={{
                display: "flex",
                flexWrap: "wrap",
                width: "100%",
                justifyContent: "space-between",
                border: "none",
              }}
            >
              {GROUP_COLORS.map((c) => (
                <ToggleButton
                  key={c}
                  value={c}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50% !important",
                    border: "none",
                    bgcolor: c,
                    margin: "4px !important",
                    "&:hover": { bgcolor: c, opacity: 0.8 },
                    "&.Mui-selected": {
                      bgcolor: c,
                      opacity: 1,
                      boxShadow: `0 0 0 3px white, 0 0 0 5px ${c}`,
                    },
                  }}
                >
                  {color === c && (
                    <CheckIcon sx={{ color: "white", fontSize: "1.2rem" }} />
                  )}
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
          sx={{ height: 50, fontSize: "1.1rem", borderRadius: 2 }}
        >
          {isLeader ? "설정 저장" : "색상 변경 저장"}
        </Button>

        <Divider sx={{ my: 2 }} />

        {/* 위험 구역 */}
        <Box>
          {isLeader ? (
            <Button
              variant="outlined"
              color="error"
              fullWidth
              startIcon={<DeleteIcon />}
              onClick={handleDeleteGroup}
            >
              그룹 삭제하기
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="error"
              fullWidth
              startIcon={<ExitToAppIcon />}
              onClick={handleLeaveGroup}
            >
              그룹 나가기
            </Button>
          )}
        </Box>
      </Stack>
    </Box>
  );
}

export default GroupSettingPage;