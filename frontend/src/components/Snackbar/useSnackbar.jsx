import { useState, useCallback } from "react";

const useSnackbar = () => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
    autoHideDuration: 6000, // Default auto-hide duration
  });

  const showSnackbar = useCallback((message, severity = "success", autoHideDuration = 6000) => {
    setSnackbar({ open: true, message, severity, autoHideDuration });
  }, []);

  const closeSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  return { snackbar, showSnackbar, closeSnackbar };
};

export default useSnackbar;
