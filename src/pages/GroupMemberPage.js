import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Divider,
  Skeleton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import { useSnackbar } from '../contexts/SnackbarContext';
import { useConfirm } from '../contexts/ConfirmContext';

function GroupMemberPage() {
  const { showSnackbar } = useSnackbar();
  const { showConfirm } = useConfirm();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); // URL 파라미터에서 groupId 가져오기

  const groupData = location.state?.group || {
    role: "member",
    name: "샘플 그룹",
  };
  const isLeader = groupData.role === "leader";

  // 빈 배열로 시작
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 멤버 목록 API 호출
  useEffect(() => {
    const fetchMembers = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(`/api/groups/${id}/members`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setMembers(data);
        } else {
          console.error("멤버 목록 로딩 실패");
        }
      } catch (error) {
        console.error("API 에러:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [id]);

  // 정렬 로직 (팀장 맨 위 -> 나머지 가나다순)
  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      // 1순위: 팀장이면 앞으로 (-1)
      if (a.role === "leader") return -1;
      if (b.role === "leader") return 1;
      // 2순위: 이름 가나다순
      return a.nickname.localeCompare(b.nickname);
    });
  }, [members]);

  // 강퇴 API 연동
  const handleKick = async (memberId, memberName) => {
    const isConfirmed = await showConfirm(
      '멤버 강퇴',                          // 제목
      `${memberName}님을 내보내시겠습니까?`, // 내용
      '내보내기',                           // 확인 버튼 텍스트
      '취소'                                // 취소 버튼 텍스트
    );
    if (isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        // 주의: memberId는 users 테이블의 id가 아니라 group_members 테이블의 id(PK)여야 함
        const response = await fetch(`/api/groups/${id}/members/${memberId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          // 화면에서도 즉시 제거 (새로고침 없이)
          setMembers((prev) => prev.filter((m) => m.id !== memberId));
          showSnackbar("내보냈습니다.");
        } else {
          showSnackbar("내보내기 실패: 권한이 없거나 오류가 발생했습니다.");
        }
      } catch (error) {
        console.error("강퇴 에러:", error);
      }
    }
  };

  return (
    <Box sx={{ p: 0, minHeight: "100vh", bgcolor: "background.paper" }}>
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid #eee",
        }}
      >
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" fontWeight="bold">
          멤버 ({members.length})
        </Typography>
      </Box>

      {loading ? (
        // 1. 로딩 중일 때: 스켈레톤(뼈대) UI 보여주기
        <Box sx={{ p: 2 }}>
          <Skeleton
            variant="rectangular"
            height={60}
            sx={{ mb: 1, borderRadius: 2 }}
          />
          <Skeleton
            variant="rectangular"
            height={60}
            sx={{ mb: 1, borderRadius: 2 }}
          />
          <Skeleton
            variant="rectangular"
            height={60}
            sx={{ mb: 1, borderRadius: 2 }}
          />
        </Box>
      ) : (
        // 2. 로딩 끝났을 때: 실제 리스트 보여주기
        <List sx={{ p: 0 }}>
          {sortedMembers.map((member) => {
            // 안전한 이름 표시용 변수
            const displayName = member.nickname || member.name || "?";

            return (
              <React.Fragment key={member.id}>
                <ListItem
                  sx={{ py: 1.5 }}
                  secondaryAction={
                    isLeader &&
                    member.role !== "leader" && (
                      <IconButton
                        edge="end"
                        onClick={() => handleKick(member.id, displayName)}
                        size="small"
                        color="default"
                      >
                        <PersonRemoveIcon fontSize="small" />
                      </IconButton>
                    )
                  }
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor:
                          member.role === "leader"
                            ? "primary.main"
                            : "grey.300",
                      }}
                    >
                      {/* 안전하게 첫 글자 추출 */}
                      {displayName[0]}
                    </Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography fontWeight="bold">{displayName}</Typography>
                        {member.role === "leader" && (
                          <Chip
                            label="팀장"
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{
                              height: 18,
                              fontSize: {
                              xs: "0.65rem",
                              sm: "0.85rem", 
                            },
                              px: 0,
                              borderColor: "primary.main",
                              color: "primary.main",
                              fontWeight: "bold",
                            }}
                          />
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            );
          })}
        </List>
      )}
    </Box>
  );
}

export default GroupMemberPage;