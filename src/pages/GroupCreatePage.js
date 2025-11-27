import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, TextField, Button, Typography, IconButton, Stack, FormHelperText
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function GroupCreatePage() {
  const navigate = useNavigate();
  
  // 상태 관리 (색상 제거됨)
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 전송할 데이터 (심플해짐)
    const newGroup = {
      name,
      description: desc,
    };

    console.log('그룹 생성 요청:', newGroup);
    // TODO: 백엔드 API 호출 (POST /groups) -> 응답으로 inviteCode 등을 받음
    
    alert(`'${name}' 그룹이 생성되었습니다!`);
    navigate('/groups');
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
              placeholder="예: 캡스톤 디자인 3조"
              autoFocus
              helperText={`${name.length}/20자`} // 글자수 힌트 정도는 있으면 좋음
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
            disabled={!name.trim()} 
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