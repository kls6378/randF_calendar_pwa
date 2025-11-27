import React, { createContext, useState, useMemo, useContext, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// 색상 모드 관리자 (리모콘)
const ColorModeContext = createContext({ toggleColorMode: () => {} });

// 이 훅을 쓰면 어디서든 모드를 바꿀 수 있음
export const useColorMode = () => useContext(ColorModeContext);

export const ColorModeProvider = ({ children }) => {
  // 초기값: 브라우저 저장소 확인 -> 없으면 시스템 설정 -> 없으면 'dark'
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode ? savedMode : 'dark'; // 기본값을 'dark'로 설정
  });

  // 모드 변경 함수
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('themeMode', newMode); // 저장소에 기억
          return newMode;
        });
      },
    }),
    [],
  );

  // MUI 테마 생성
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode, // 'light' or 'dark'
          // (필요하면 여기서 주조색 primary, secondary 색상을 커스텀할 수 있습니다)
          ...(mode === 'dark' && {
            background: {
              default: '#121212',
              paper: '#1e1e1e',
            },
          }),
        },
      }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        {/* CssBaseline: 다크모드 시 배경색, 글자색을 자동으로 바꿔줌 */}
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};