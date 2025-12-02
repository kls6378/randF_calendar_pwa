import React, { createContext, useState, useContext } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

const ConfirmContext = createContext();

export const useConfirm = () => useContext(ConfirmContext);

export const ConfirmProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState({
    title: "",
    message: "",
    btnOkText: "확인",
    btnCancelText: "취소",
  });
  const [resolver, setResolver] = useState({ resolve: null });

  // 이 함수가 호출되면 Promise를 반환해서 기다리게 함
  const showConfirm = (
    title,
    message,
    btnOkText = "확인",
    btnCancelText = "취소"
  ) => {
    setOptions({ title, message, btnOkText, btnCancelText });
    setOpen(true);

    return new Promise((resolve) => {
      // resolve 함수를 state에 저장해뒀다가, 버튼 누를 때 실행함
      setResolver({ resolve });
    });
  };

  const handleOk = () => {
    setOpen(false);
    if (resolver.resolve) {
      resolver.resolve(true); // "예" 선택 -> true 반환
    }
  };

  const handleCancel = () => {
    setOpen(false);
    if (resolver.resolve) {
      resolver.resolve(false); // "아니오" 선택 -> false 반환
    }
  };

  return (
    <ConfirmContext.Provider value={{ showConfirm }}>
      {children}

      {/* 전역으로 띄워질 모달 디자인 */}
      <Dialog open={open} onClose={handleCancel} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight="bold">{options.title}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "text.primary", whiteSpace: 'pre-wrap' }}>
            {options.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={handleCancel}
            color="inherit"
            sx={{ color: "text.secondary" }}
          >
            {options.btnCancelText}
          </Button>
          <Button
            onClick={handleOk}
            variant="contained"
            color="error"
            autoFocus
          >
            {options.btnOkText}
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmContext.Provider>
  );
};
