import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
  Grid,
  FormControl,
  Alert,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useTheme,
} from "@mui/material";
import config from "../../../../state/config";
import {
  FormSectionArray,
  FormSectionObject,
} from "../../../../components/FormSection";

const RoomDetailsModal = ({
  open,
  onClose,
  room,
  roomTypes,
  statusOptions,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState({
    room_number: "",
    room_type: "",
    rate: "",
    status: "",
    statusID: "",
    imageUrl: "",
  });
  const theme = useTheme();
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const [statusColor, setStatusColor] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogAction, setConfirmDialogAction] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false); // State to manage image modal

  useEffect(() => {
    if (room) {
      setFormData((prevState) => ({
        ...prevState,
        room_number: room.room_number || "",
        room_type: room.room_type || "",
        rate: room.rate || "",
        status: room.status || "",
        statusID: room.status_id || "",
        imageUrl: room.imageUrl || "",
      }));
      setPreviewUrl(
        room.imageUrl ? `${config.API_URL}/assets/${room.imageUrl}` : null
      );
      const selectedStatus = statusOptions.find(
        (status) => status.label === room.status
      );
      setStatusColor(selectedStatus ? selectedStatus.color : "");
    }
  }, [room, statusOptions]);

  useEffect(() => {
    if (formData.statusID) {
      console.log("StatusID updated:", formData.statusID);
    }
  }, [formData.statusID]);

  const validate = () => {
    let tempErrors = {};
    tempErrors.room_number = formData.room_number
      ? ""
      : "Room number is required.";
    tempErrors.rate = formData.rate ? "" : "Rate is required.";
    tempErrors.room_type = formData.room_type ? "" : "Room type is required.";
    tempErrors.status = formData.status ? "" : "Status is required.";
    setErrors(tempErrors);
    return Object.values(tempErrors).every((x) => x === "");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!validate()) return;
    const updatedRoom = new FormData();
    for (const key in formData) {
      updatedRoom.append(key, formData[key]);
    }
    if (selectedImage) {
      updatedRoom.append("image", selectedImage);
    }

    onSave(updatedRoom);
    handleCloseConfirmDialog();
  };

  const handleRoomNumberChange = (e) => {
    const { value } = e.target;
    setFormData((prevState) => ({ ...prevState, room_number: value }));
  };

  const handleRoomTypeChange = (event) => {
    const { value } = event.target;
    setFormData((prevState) => ({ ...prevState, room_type: value }));
  };

  const handleRateChange = (e) => {
    const { value } = e.target;
    setFormData((prevState) => ({ ...prevState, rate: value }));
  };

  const handleStatusChange = (event) => {
    const { value } = event.target;
    const selectedStatus = statusOptions.find(
      (status) => status.label === value
    );
    setFormData((prevState) => ({
      ...prevState,
      status: value,
      statusID: selectedStatus ? selectedStatus.id : "",
    }));
    setStatusColor(selectedStatus ? selectedStatus.color : "");
  };

  const handleOpenConfirmDialog = (action) => {
    setConfirmDialogAction(action);
    setConfirmDialogOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
    setConfirmDialogAction(null);
  };

  const handleConfirmDialogAction = () => {
    if (confirmDialogAction === "save") {
      handleSave();
    } else if (confirmDialogAction === "delete") {
      onDelete(room.id);
    }
    handleCloseConfirmDialog();
  };

  const handleImageClick = () => {
    setImageModalOpen(true); // Open the image modal when image is clicked
  };

  const handleImageModalClose = () => {
    setImageModalOpen(false); // Close the image modal
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: theme.palette.primary[900] }}
          >
            Edit Room Details
          </Typography>
          {previewUrl && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Box
                component="img"
                src={previewUrl}
                alt="Room Image Preview"
                sx={{ width: 200, borderRadius: 1, cursor: "pointer" }}
                onClick={handleImageClick} // Add click event to open the modal
              />
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ color: theme.palette.primary[900] }}
              >
                Current Image (Click to enlarge)
              </Typography>
            </Box>
          )}
          <FormSectionObject>
            {{
              header: null,
              content: (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      margin="dense"
                      name="room_number"
                      label="Room Number"
                      type="number"
                      value={formData.room_number}
                      onChange={handleRoomNumberChange}
                      fullWidth
                      error={!!errors.room_number}
                      helperText={errors.room_number}
                      inputProps={{ min: 0 }} // Prevent negative numbers
                      onInput={(e) => {
                        if (e.target.value < 0) e.target.value = 0; // Enforce no negative values
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      margin="dense"
                      name="rate"
                      label="Rate"
                      type="number"
                      value={formData.rate}
                      onChange={handleRateChange}
                      fullWidth
                      error={!!errors.rate}
                      helperText={errors.rate}
                      inputProps={{ min: 0 }} // Prevent negative numbers
                      onInput={(e) => {
                        if (e.target.value < 0) e.target.value = 0; // Enforce no negative values
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth margin="dense">
                      <InputLabel id="room-type-label">Room Type</InputLabel>
                      <Select
                        labelId="room-type-label"
                        id="room-type-select"
                        label="Room Type"
                        value={formData.room_type}
                        onChange={handleRoomTypeChange}
                        fullWidth
                        error={!!errors.room_type}
                      >
                        {roomTypes.map((type) => (
                          <MenuItem key={type.id} value={type.name}>
                            {type.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.room_type && (
                        <Typography color="error">
                          {errors.room_type}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl
                      fullWidth
                      margin="dense"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "&.Mui-focused fieldset": {
                            borderColor: statusColor,
                          },
                          "& fieldset": {
                            borderColor: statusColor,
                          },
                        },
                      }}
                    >
                      <InputLabel id="status-label">Status</InputLabel>
                      <Select
                        labelId="status-label"
                        id="status-select"
                        label="Status"
                        value={formData.status}
                        onChange={handleStatusChange}
                        fullWidth
                        error={!!errors.status}
                        disabled={formData.statusID === 1}
                      >
                        {statusOptions.map((status) => (
                          <MenuItem
                            key={status.id}
                            value={status.label}
                            style={{
                              color: status.label === 1 ? "gray" : "inherit",
                            }}
                          >
                            {status.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.status && (
                        <Typography color="error">{errors.status}</Typography>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormSectionArray>
                      <Typography
                        variant="subtitle1"
                        gutterBottom
                        sx={{ color: theme.palette.primary[900] }}
                      >
                        Upload New Image
                      </Typography>
                      <Button variant="contained" component="label" fullWidth>
                        Upload Image
                        <input
                          type="file"
                          onChange={handleImageChange}
                          hidden
                        />
                      </Button>
                    </FormSectionArray>
                  </Grid>
                </Grid>
              ),
            }}
          </FormSectionObject>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Button
              onClick={() => handleOpenConfirmDialog("delete")}
              color="secondary"
              variant="contained"
              sx={{ mt: 2 }}
            >
              Delete
            </Button>
            <Button
              onClick={() => handleOpenConfirmDialog("save")}
              color="primary"
              variant="contained"
              sx={{ mt: 2 }}
            >
              Save
            </Button>
          </Box>
          {Object.values(errors).some((error) => error && error !== "") && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Please fix the errors above.
            </Alert>
          )}
        </Box>
      </Modal>

      <Dialog
        open={confirmDialogOpen}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">
          {confirmDialogAction === "save" ? "Confirm Save" : "Confirm Delete"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            {confirmDialogAction === "save"
              ? "Are you sure you want to save these changes?"
              : "Are you sure you want to delete this room?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDialogAction} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Modal */}
      <Modal open={imageModalOpen} onClose={handleImageModalClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            maxWidth: "90%",
            maxHeight: "90%",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={previewUrl}
            alt="Room Image Full"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </Box>
      </Modal>
    </>
  );
};

RoomDetailsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  room: PropTypes.shape({
    room_number: PropTypes.string,
    room_type: PropTypes.string,
    rate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    status: PropTypes.string,
    status_id: PropTypes.number,
    imageUrl: PropTypes.string,
    id: PropTypes.number.isRequired,
  }).isRequired,
  roomTypes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  statusOptions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      code: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
      text_color: PropTypes.string.isRequired,
    })
  ).isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default RoomDetailsModal;
