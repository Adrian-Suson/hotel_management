import PropTypes from "prop-types";
import {
  Box,
  Button,
  ButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material";
import { FormSectionObject } from "../../../components/FormSection";
import Webcam from "react-webcam";
import { useState, useCallback, useRef, useEffect } from "react";
import axios from "axios";
import config from "../../../state/config";

// Utility function to convert dataURL to Blob
const dataURLToBlob = (dataURL) => {
  try {
    const [header, base64Data] = dataURL.split(";base64,");
    const mimeType = header.split(":")[1];
    const binary = atob(base64Data);
    const arrayBuffer = new ArrayBuffer(binary.length);
    const uintArray = new Uint8Array(arrayBuffer);

    for (let i = 0; i < binary.length; i++) {
      uintArray[i] = binary.charCodeAt(i);
    }

    return new Blob([arrayBuffer], { type: mimeType });
  } catch (error) {
    console.error("Error converting data URL to Blob:", error);
    return null;
  }
};

const generateRandomString = (length) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () =>
    characters.charAt(Math.floor(Math.random() * characters.length))
  ).join("");
};

const ConfirmReservationDialog = ({
  userId,
  logUserAction,
  confirmDialogOpen,
  handleCloseConfirmDialog,
  handleFileChange,
  roomStatus,
  setReservations,
  reservations,
  showSnackbar,
  fetchReservations,
  currentRow,
  roomId,
  setConfirmDialogOpen,
  setFile,
  setPreviewUrl,
  handleChangeRoomStatus,
}) => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isConfirmDisabled, setIsConfirmDisabled] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false); // New state to track capture
  const webcamRef = useRef(null);

  useEffect(() => {
    if (confirmDialogOpen && currentRow?.id) {
      const fetchRoomStatus = async () => {
        try {
          const { data } = await axios.get(`${config.API_URL}/rooms/${roomId}`);
          const currentRoomStatus = data.room?.status_code_id;

          if (currentRoomStatus === roomStatus) {
            setIsConfirmDisabled(true);
            showSnackbar(
              "The room is already occupied. Confirmation not allowed.",
              "error"
            );
          } else {
            setIsConfirmDisabled(false);
          }
        } catch (error) {
          console.error("Error fetching room status:", error);
          showSnackbar("Failed to fetch room status.", "error");
        }
      };

      fetchRoomStatus();
    }
  }, [confirmDialogOpen, currentRow, roomId, roomStatus, showSnackbar]);

  useEffect(() => {
    if (confirmDialogOpen && currentRow?.id) {
      const fetchReservationDetails = async () => {
        try {
          const { data } = await axios.get(
            `${config.API_URL}/reservation/${currentRow.id}`
          );
          if (data.success && data.reservation.id_picture) {
            setExistingImage(
              `${config.API_URL}/id_picture/${data.reservation.id_picture}`
            );
          }
        } catch (error) {
          console.error("Error fetching reservation details:", error);
          showSnackbar("Failed to fetch reservation details.", "error");
        }
      };

      fetchReservationDetails();
    }
  }, [confirmDialogOpen, currentRow, showSnackbar]);

  const handleCapture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    const file = dataURLToBlob(imageSrc);
    if (file) {
      handleFileChange(file);
      setUploadedFile(null);
      setIsCaptured(true); // Set captured state to true
    } else {
      showSnackbar("Failed to process captured image.", "error");
    }
  }, [webcamRef, handleFileChange, showSnackbar]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      setCapturedImage(null);
      setExistingImage(null);
      handleFileChange(file);
      setIsCaptured(true); // Set captured state to true
    }
  };


  const handleRecapture = () => {
    setCapturedImage(null);
    setExistingImage(null);
    setUploadedFile(null);
    setIsCaptured(false); // Reset captured state
  };


  const handleSubmitConfirmation = async () => {
    if (!currentRow) {
      showSnackbar("No reservation selected for confirmation.", "error");
      return;
    }

    const formData = new FormData();
    if (uploadedFile) {
      formData.append(
        "id_picture",
        uploadedFile,
        `${generateRandomString(16)}.jpg`
      );
    } else if (capturedImage) {
      const blob = dataURLToBlob(capturedImage);
      if (blob) {
        formData.append("id_picture", blob, `${generateRandomString(16)}.jpg`);
      } else {
        showSnackbar("Failed to process captured image.", "error");
        return;
      }
    }

    try {
      const { data } = await axios.post(
        `${config.API_URL}/confirmReservation/${currentRow.id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (data.success) {
        setReservations(
          reservations.map((reservation) =>
            reservation.id === currentRow.id
              ? { ...reservation, confirmed: true }
              : reservation
          )
        );
        showSnackbar("Reservation confirmed successfully.", "success");
        handleChangeRoomStatus(roomId, roomStatus);
      } else {
        showSnackbar(data.message || "Unexpected error occurred", "error");
      }

      fetchReservations();
      logUserAction(
        userId,
        `Confirmed reservation for Guest ID: ${currentRow.guest_id}`
      );
    } catch (error) {
      console.error("Error confirming reservation:", error);
      showSnackbar(
        error.response?.data?.message || "Failed to confirm reservation.",
        "error"
      );
    } finally {
      setConfirmDialogOpen(false);
      setCapturedImage(null);
      setPreviewUrl(null);
      setFile(null);
      setUploadedFile(null);
    }
  };

  const handleClose = () => {
    setCapturedImage(null);
    setExistingImage(null);
    setFile(null);
    setPreviewUrl(null);
    setUploadedFile(null);
    setIsCaptured(false); // Reset captured state
    handleCloseConfirmDialog();
  };

  return (
    <Dialog
      open={confirmDialogOpen}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle id="confirm-dialog-title">Confirm Reservation</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormSectionObject>
              {{
                header: null,
                content: (
                  <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    textAlign="center"
                    alignItems="center"
                  >
                    <DialogContentText>
                      {existingImage
                        ? "This guest already has an ID picture on file."
                        : "Please capture or upload a valid ID to confirm the reservation."}
                    </DialogContentText>
                    <Box
                      display="flex"
                      flexDirection="column"
                      justifyContent="center"
                      alignItems="center"
                    >
                      {existingImage && (
                        <>
                          <Typography variant="subtitle1" gutterBottom>
                            ID Picture
                          </Typography>
                          <img
                            src={existingImage}
                            alt="Existing ID"
                            style={{
                              maxWidth: "80%",
                              maxHeight: "350px",
                              marginTop: "10px",
                            }}
                          />
                        </>
                      )}
                      {!existingImage && (
                        <>
                          {uploadedFile && (
                            <>
                              <Typography variant="subtitle1" gutterBottom>
                                Uploaded ID Picture
                              </Typography>
                              <img
                                src={URL.createObjectURL(uploadedFile)}
                                alt="Uploaded ID"
                                style={{
                                  maxWidth: "80%",
                                  maxHeight: "350px",
                                  marginTop: "10px",
                                }}
                              />
                            </>
                          )}
                          {capturedImage && !uploadedFile && (
                            <>
                              <Typography variant="subtitle1" gutterBottom>
                                Captured ID Picture
                              </Typography>
                              <img
                                src={capturedImage}
                                alt="Captured ID"
                                style={{
                                  maxWidth: "80%",
                                  maxHeight: "350px",
                                  marginTop: "10px",
                                }}
                              />
                            </>
                          )}
                          {!uploadedFile && !capturedImage && (
                            <Webcam
                              audio={false}
                              ref={webcamRef}
                              screenshotFormat="image/jpeg"
                              width="100%"
                              height="auto"
                              style={{
                                maxWidth: "80%",
                                maxHeight: "350px",
                                marginTop: "10px",
                              }}
                            />
                          )}
                        </>
                      )}
                    </Box>
                    {!isCaptured && !existingImage && (
                      <ButtonGroup
                        variant="contained"
                        aria-label="action buttons"
                        style={{ marginTop: "10px" }}
                      >
                        <Button onClick={handleCapture}>Capture</Button>
                        <Button
                          variant="outlined"
                          component="label"
                          htmlFor="file-upload"
                        >
                          Upload
                          <input
                            type="file"
                            id="file-upload"
                            accept="image/*"
                            onChange={handleFileUpload}
                            hidden
                          />
                        </Button>
                      </ButtonGroup>
                    )}
                    {isCaptured && !existingImage && (
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleRecapture}
                        style={{ marginTop: "10px" }}
                      >
                        Recapture / Re-upload
                      </Button>
                    )}
                  </Box>
                ),
              }}
            </FormSectionObject>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmitConfirmation}
          color="primary"
          disabled={isConfirmDisabled}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ConfirmReservationDialog.propTypes = {
  userId: PropTypes.string.isRequired,
  logUserAction: PropTypes.func.isRequired,
  confirmDialogOpen: PropTypes.bool.isRequired,
  handleCloseConfirmDialog: PropTypes.func.isRequired,
  handleFileChange: PropTypes.func.isRequired,
  roomStatus: PropTypes.string.isRequired,
  setReservations: PropTypes.func.isRequired,
  reservations: PropTypes.array.isRequired,
  showSnackbar: PropTypes.func.isRequired,
  fetchReservations: PropTypes.func.isRequired,
  currentRow: PropTypes.object.isRequired,
  roomId: PropTypes.string.isRequired,
  setConfirmDialogOpen: PropTypes.func.isRequired,
  setFile: PropTypes.func.isRequired,
  setPreviewUrl: PropTypes.func.isRequired,
  handleChangeRoomStatus: PropTypes.func.isRequired,
};

export default ConfirmReservationDialog;
