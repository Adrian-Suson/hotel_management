import { Snackbar, Alert, Slide } from "@mui/material";
import { CheckCircle, Info, Warning, Error } from "@mui/icons-material";
import PropTypes from "prop-types";

const CustomSnackbar = ({ snackbar, onClose }) => (
  <Snackbar
    open={snackbar.open}
    autoHideDuration={snackbar.autoHideDuration || 6000}
    onClose={onClose}
    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
    TransitionComponent={SlideTransition}
    sx={{
      borderRadius: 2,
      boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)", 
      mb: 2,
    }}
  >
    <Alert
      onClose={onClose}
      severity={snackbar.severity}
      icon={getAlertIcon(snackbar.severity)} 
      sx={{
        width: "100%",
        borderRadius: 2,
        fontWeight: "bold",
        fontSize: "0.9rem",
        background: getAlertBackground(snackbar.severity),
        color: "#fff",
        padding: "8px 16px",
      }}
    >
      {snackbar.message}
    </Alert>
  </Snackbar>
);

const SlideTransition = (props) => {
  return <Slide {...props} direction="up" />;
};

const getAlertIcon = (severity) => {
  switch (severity) {
    case "success":
      return <CheckCircle sx={{color: "#fff"}} fontSize="inherit" />;
    case "info":
      return <Info sx={{color: "#fff"}} fontSize="inherit" />;
    case "warning":
      return <Warning sx={{color: "#fff"}} fontSize="inherit" />;
    case "error":
      return <Error sx={{color: "#fff"}}  fontSize="inherit" />;
    default:
      return null;
  }
};

const getAlertBackground = (severity) => {
  switch (severity) {
    case "success":
      return "linear-gradient(135deg, #4caf50, #7FBB82)";
    case "info":
      return "linear-gradient(135deg, #2196f3, #86C4F7)";
    case "warning":
      return "linear-gradient(135deg, #ff9800, #F5CB8C)";
    case "error":
      return "linear-gradient(135deg, #f44336, #E79090)";
    default:
      return "#333"; 
  }
};

CustomSnackbar.propTypes = {
  snackbar: PropTypes.shape({
    open: PropTypes.bool.isRequired,
    message: PropTypes.string.isRequired,
    severity: PropTypes.oneOf(["success", "info", "warning", "error"])
      .isRequired,
    autoHideDuration: PropTypes.number,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CustomSnackbar;
