import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, TextField, Button, Typography, IconButton, Stack, FormHelperText
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSnackbar } from "../contexts/SnackbarContext";

function GroupCreatePage() {
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  
  // 상태 관리 (색상 제거됨)
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // 중복 방지용 상태

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    setIsSubmitting(true);

    const newGroup = {
      name,
      description: desc,
    };

    try {
      const token = localStorage.getItem('token');
      
      // 서버에 그룹 생성 요청
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newGroup)
      });

      if (response.ok) {
        const data = await response.json(); // { id: 123, inviteCode: 'X8Y2...' }
        
        // 성공 시 초대 코드 알려주기
        showSnackbar(`${name} 그룹 생성 완료!`);
        
        // 목록 페이지로 이동
        navigate('/groups');
      } else {
        const errorText = await response.text();
        showSnackbar(`그룹 생성 실패: ${errorText}`);
      }
    } catch (error) {
      console.error("그룹 생성 에러:", error);
      showSnackbar("서버 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 'sm', mx: 'auto' }}>
      
      {/* 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" fontWeight="bold">새 그룹 만들기</Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={4}>
          
          {/* 1. 그룹 이름 */}
          <Box>
            <TextField
              label="그룹 이름"
              required
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 캡스톤 디자인"
              autoFocus
              helperText={`${name.length}/50자`} // 글자수 힌트 정도는 있으면 좋음
              InputProps={{inputProps: { maxLength: 20 }}}
            />
          </Box>

          {/* 2. 그룹 설명 */}
          <TextField
            label="그룹 설명 (선택)"
            multiline
            rows={4}
            fullWidth
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="어떤 모임인지 간단히 설명해주세요."
          />

          {/* 안내 문구 (생성 시 자동 기능 안내) */}
          <FormHelperText sx={{ textAlign: 'center', mt: 2 }}>
            그룹을 생성하면 <b>초대 코드</b>가 자동으로 발급됩니다.
          </FormHelperText>

          {/* 생성 버튼 */}
          <Button 
            type="submit" 
            variant="contained" 
            size="large" 
            disabled={!name.trim() || isSubmitting} 
            sx={{ height: 50, fontSize: '1.1rem', borderRadius: 2 }}
          >
            완료
          </Button>

        </Stack>
      </Box>
    </Box>
  );
}

export default GroupCreatePage;