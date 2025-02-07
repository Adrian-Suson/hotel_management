import { useRef } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import PropTypes from "prop-types";
import Webcam from "react-webcam";

const WebcamCaptureDialog = ({ open, onClose, onCapture }) => {
  const webcamRef = useRef(null);

  const handleCapture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    onCapture(imageSrc);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Capture ID Photo</DialogTitle>
      <DialogContent>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width="100%"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="secondary">
          Cancel
        </Button>
        <Button onClick={handleCapture} variant="contained" color="primary">
          Capture
        </Button>
      </DialogActions>
    </Dialog>
  );
};

WebcamCaptureDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCapture: PropTypes.func.isRequired,
};

export default WebcamCaptureDialog;
