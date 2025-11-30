import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";
import { useColorMode } from "../theme/ThemeContext";
import { useTheme } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

const drawerWidth = 240;

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { toggleColorMode } = useColorMode();

  const menuItems = [
    { text: "캘린더", icon: <CalendarMonthIcon />, path: "/" },
    { text: "그룹", icon: <GroupIcon />, path: "/groups" },
    { text: "마이페이지", icon: <PersonIcon />, path: "/mypage" },
  ];

  const getCurrentTab = () => {
    const path = location.pathname;

    // 1. 그룹 관련 페이지면 무조건 1번(그룹 탭) 리턴
    // 예: /groups, /groups/create, /groups/1, /groups/1/members 등등
    if (path.startsWith("/groups")) {
      return 1;
    }

    // 2. 마이페이지 관련이면 2번 리턴
    if (path.startsWith("/mypage")) {
      return 2;
    }

    // 3. 나머지는 기본 0번(캘린더) 리턴
    return 0;
  };

  const ThemeToggleButton = () => (
    <IconButton onClick={toggleColorMode} color="inherit">
      {theme.palette.mode === "dark" ? (
        <Brightness7Icon />
      ) : (
        <Brightness4Icon />
      )}
    </IconButton>
  );

  return (
    <Box sx={{ display: "flex", height: "100dvh" }}>
      {" "}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box
              component="img"
              src="/favicon.ico" // public 폴더 기준 경로
              alt="logo"
              sx={{ width: 24, height: 24, mr: 1.5 }} // 적절한 크기와 오른쪽 여백
            />
            <Typography
              component="h1"
              variant="h6"
              fontWeight="900"
              color="primary.main"
              sx={{ letterSpacing: -0.5 }}
            >
              R&F Calendar
            </Typography>
          </Toolbar>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>
      </Box>
      {/* 우측 전체 영역 (모바일: 전체 / PC: 사이드바 제외 나머지) */}
      <Box
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          display: "flex", // 세로 정렬을 위한 Flex 선언
          flexDirection: "column", // 위(콘텐츠)-아래(메뉴바) 배치
          overflow: "hidden", // 전체 스크롤 방지 (내부 스크롤 사용)
        }}
      >
        {/* 실제 페이지 내용 (Outlet) */}
        {/* 남는 공간을 모두 차지(flexGrow: 1)하고, 내용이 넘치면 이 안에서만 스크롤(overflow: auto) */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: "background.default",
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Container
            maxWidth="sm"
            disableGutters
            sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
          >
            <Outlet />
          </Container>
        </Box>

        {/* 모바일용 하단 탭바 */}
        <Paper
          sx={{
            display: { xs: "block", sm: "none" }, // 모바일만 보임
            zIndex: 1000,
            borderRadius: 0, // 네모 반듯하게
            flexShrink: 0, // 찌그러지지 않게 고정
          }}
          elevation={3}
        >
          <BottomNavigation
            showLabels
            value={getCurrentTab()}
            onChange={(event, newValue) => {
              navigate(menuItems[newValue].path);
            }}
          >
            {menuItems.map((item) => (
              <BottomNavigationAction
                key={item.text}
                label={item.text}
                icon={item.icon}
              />
            ))}
          </BottomNavigation>
        </Paper>
      </Box>
    </Box>
  );
}

export default Layout;
