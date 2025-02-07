import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { ChromePicker } from "react-color";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axios from "axios";
import config from "../../state/config";
import CustomSnackbar from "../../components/Snackbar/CustomSnackbar";
import useSnackbar from "../../components/Snackbar/useSnackbar";
import AboutUs from "./components/AboutUs";
import Slideshow from "./components/Advertisements";
import ServiceManagement from "./components/ServiceManagement";

const Setting = ({
  defaultCheckoutStatus,
  setDefaultCheckoutStatus,
  defaultOccupiedStatus,
  setDefaultOccupiedStatus,
  defaultRoomStatus,
  setDefaultRoomStatus,
  defaultRoomSelection,
  setDefaultRoomSelection,
  statusOptions,
  setStatusOptions,
  roomTypes,
  setRoomTypes,
  logUserAction,
}) => {
  const [addRoomTypeOpen, setAddRoomTypeOpen] = useState(false);
  const [newRoomType, setNewRoomType] = useState("");
  const [addStatusCodeOpen, setAddStatusCodeOpen] = useState(false);
  const [newStatusCode, setNewStatusCode] = useState("");
  const [newStatusLabel, setNewStatusLabel] = useState("");
  const [newStatusColor, setNewStatusColor] = useState("#000000");
  const [newTextColor, setNewTextColor] = useState("#FFFFFF");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  const loggedInUserId = localStorage.getItem("userId");

  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  const handleStatusChange = (event, setStatus, key, label) => {
    const selectedStatus = Number(event.target.value);
    const selectedStatusOption = statusOptions.find(
      (status) => status.id === selectedStatus
    );
    setStatus(selectedStatus);
    localStorage.setItem(key, selectedStatus.toString());
    console.log(`Selected ${key}:`, selectedStatus);
    logUserAction(
      loggedInUserId,
      `Changed ${label} to: ${selectedStatusOption.label}`
    );
  };

  useEffect(() => {
    const savedStatuses = {
      defaultCheckoutStatus: localStorage.getItem("defaultCheckoutStatus"),
      defaultOccupiedStatus: localStorage.getItem("defaultOccupiedStatus"),
      defaultRoomStatus: localStorage.getItem("defaultRoomStatus"),
      defaultRoomSelection: localStorage.getItem("defaultRoomSelection"),
    };
    if (savedStatuses.defaultCheckoutStatus) {
      setDefaultCheckoutStatus(Number(savedStatuses.defaultCheckoutStatus));
    }
    if (savedStatuses.defaultOccupiedStatus) {
      setDefaultOccupiedStatus(Number(savedStatuses.defaultOccupiedStatus));
    }
    if (savedStatuses.defaultRoomStatus) {
      setDefaultRoomStatus(Number(savedStatuses.defaultRoomStatus));
    }
    if (savedStatuses.defaultRoomSelection) {
      setDefaultRoomSelection(Number(savedStatuses.defaultRoomSelection));
    }
  }, [
    setDefaultCheckoutStatus,
    setDefaultOccupiedStatus,
    setDefaultRoomStatus,
    setDefaultRoomSelection,
  ]);

  const renderSelectField = (label, value, onChange, key, setStatus) => (
    <FormControl fullWidth margin="normal" variant="outlined">
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        onChange={(e) => onChange(e, setStatus, key, label)}
        label={label}
      >
        {statusOptions && statusOptions.length > 0 ? (
          statusOptions.map((status) => (
            <MenuItem key={status.id} value={status.id}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      backgroundColor: status.color,
                      marginRight: 1,
                      color: status.text_color,
                    }}
                  />
                  {status.code} - {status.label}
                </Box>
              </Box>
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>No status options available</MenuItem>
        )}
      </Select>
    </FormControl>
  );

  const handleAddRoomType = async () => {
    try {
      const response = await axios.post(`${config.API_URL}/room-types`, {
        name: newRoomType,
      });
      setRoomTypes([...roomTypes, response.data]);
      setNewRoomType("");
      setAddRoomTypeOpen(false);
      showSnackbar("Room type added successfully", "success");
      logUserAction(
        loggedInUserId,
        `Added new room type: ${response.data.name}`
      );
    } catch (error) {
      console.error("Failed to add room type:", error);
      showSnackbar("Failed to add room type", "error");
    }
  };

  const handleDeleteRoomType = async (id) => {
    try {
      const response = await axios.delete(`${config.API_URL}/room-types/${id}`);
      if (response.data.success) {
        const deletedType = roomTypes.find((type) => type.id === id);
        setRoomTypes(roomTypes.filter((type) => type.id !== id));
        showSnackbar("Room type deleted successfully", "success");
        logUserAction(loggedInUserId, `Deleted room type: ${deletedType.name}`);
      } else {
        console.error(response.data.message);
        showSnackbar(response.data.message, "error");
      }
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete room type:", error);
      showSnackbar("Failed to delete room type", "error");
    }
  };

  const handleAddStatusCode = async () => {
    try {
      const response = await axios.post(`${config.API_URL}/status`, {
        code: newStatusCode,
        label: newStatusLabel,
        color: newStatusColor,
        text_color: newTextColor,
      });
      setStatusOptions([...statusOptions, response.data]);
      setNewStatusCode("");
      setNewStatusLabel("");
      setNewStatusColor("#000000");
      setNewTextColor("#FFFFFF");
      setAddStatusCodeOpen(false);
      showSnackbar("Status code added successfully", "success");
      logUserAction(
        loggedInUserId,
        `Added new status code: ${response.data.code}`
      );
    } catch (error) {
      console.error("Failed to add status code:", error);
      showSnackbar("Failed to add status code", "error");
    }
  };

  const handleDeleteStatusCode = async (id) => {
    try {
      const response = await axios.delete(`${config.API_URL}/status/${id}`);
      if (response.data.success) {
        const deletedStatus = statusOptions.find((status) => status.id === id);
        setStatusOptions(statusOptions.filter((status) => status.id !== id));
        showSnackbar("Status code deleted successfully", "success");
        logUserAction(
          loggedInUserId,
          `Deleted status code: ${deletedStatus.code}`
        );
      } else {
        console.error(response.data.message);
        showSnackbar(response.data.message, "error");
      }
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete status code:", error);
      showSnackbar("Failed to delete status code", "error");
    }
  };

  const handleDeleteClick = (id, type) => {
    setDeleteTarget(id);
    setDeleteType(type);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteType === "roomType") {
      handleDeleteRoomType(deleteTarget);
    } else if (deleteType === "statusCode") {
      handleDeleteStatusCode(deleteTarget);
    }
  };

  return (
    <Box p={2}>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">About Us</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <AboutUs />
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Advertisment</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Slideshow />
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Room Status Settings</Typography>
        </AccordionSummary>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Room Settings</Typography>
        </AccordionSummary>
        <Typography variant="h6">Room Status</Typography>
        <AccordionDetails>
          {renderSelectField(
            "Default Room Status",
            defaultRoomStatus,
            handleStatusChange,
            "defaultRoomStatus",
            setDefaultRoomStatus
          )}
          <Typography variant="body2" color="textSecondary">
            Setting a default room status determines the initial state of rooms.
            Once selected, this status cannot be updated.
          </Typography>

          <Typography variant="h6">Room Selection</Typography>
          {renderSelectField(
            "Default Room Selection",
            defaultRoomSelection,
            handleStatusChange,
            "defaultRoomSelection",
            setDefaultRoomSelection
          )}
          <Typography variant="body2" color="textSecondary">
            The selected status is the only option available during check-in and
            reservation.
          </Typography>
          <Typography variant="h6">Checkout Status</Typography>
          <AccordionDetails>
            {renderSelectField(
              "Default Checkout Status",
              defaultCheckoutStatus,
              handleStatusChange,
              "defaultCheckoutStatus",
              setDefaultCheckoutStatus
            )}
            <Typography variant="body2" color="textSecondary">
              Selecting a checkout status will update the room to reflect that
              it is no longer occupied and is ready for Cleaning.
            </Typography>
          </AccordionDetails>
          <Typography variant="h6">Checkin Status</Typography>
          <AccordionDetails>
            {renderSelectField(
              "Default Occupied Status",
              defaultOccupiedStatus,
              handleStatusChange,
              "defaultOccupiedStatus",
              setDefaultOccupiedStatus
            )}
            <Typography variant="body2" color="textSecondary">
              Selecting a checkin status will update the room to reflect that it
              is currently occupied by guests.
            </Typography>
          </AccordionDetails>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddCircleOutlineIcon />}
              onClick={() => setAddStatusCodeOpen(true)}
              sx={{ marginRight: 1 }}
            >
              Add Status
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddCircleOutlineIcon />}
              onClick={() => setAddRoomTypeOpen(true)}
            >
              Add Room Type
            </Button>
          </Box>

          <FormControl
            fullWidth
            margin="normal"
            variant="outlined"
            sx={{ mt: 3 }}
          >
            <InputLabel>Room Type Lists</InputLabel>
            <Select label="Room Type Lists">
              {roomTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    {type.name}
                    <IconButton
                      size="small"
                      edge="end"
                      onClick={() => handleDeleteClick(type.id, "roomType")}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            fullWidth
            margin="normal"
            variant="outlined"
            sx={{ mt: 3 }}
          >
            <InputLabel>Status Code Lists</InputLabel>
            <Select label="Status Code Lists">
              {statusOptions.map((status) => (
                <MenuItem key={status.id} value={status.id}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          backgroundColor: status.color,
                          marginRight: 1,
                          color: status.text_color,
                        }}
                      />
                      {status.code} - {status.label}
                    </Box>
                    <IconButton
                      size="small"
                      edge="end"
                      onClick={() => handleDeleteClick(status.id, "statusCode")}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Service Management</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ServiceManagement logUserAction={logUserAction} />
        </AccordionDetails>
      </Accordion>

      <Dialog open={addRoomTypeOpen} onClose={() => setAddRoomTypeOpen(false)}>
        <DialogTitle>Add Room Type</DialogTitle>
        <DialogContent>
          <TextField
            label="Room Type"
            value={newRoomType}
            onChange={(e) => setNewRoomType(e.target.value)}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddRoomType} color="primary">
            Add
          </Button>
          <Button onClick={() => setAddRoomTypeOpen(false)} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={addStatusCodeOpen}
        onClose={() => setAddStatusCodeOpen(false)}
      >
        <DialogTitle>Add Status Code</DialogTitle>
        <DialogContent>
          <TextField
            label="Status Code"
            value={newStatusCode}
            onChange={(e) => setNewStatusCode(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Status Label"
            value={newStatusLabel}
            onChange={(e) => setNewStatusLabel(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Background Color:
          </Typography>
          <ChromePicker
            color={newStatusColor}
            onChangeComplete={(color) => setNewStatusColor(color.hex)}
          />
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Text Color:
          </Typography>
          <ChromePicker
            color={newTextColor}
            onChangeComplete={(color) => setNewTextColor(color.hex)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddStatusCode} color="primary">
            Add
          </Button>
          <Button onClick={() => setAddStatusCodeOpen(false)} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this item?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="primary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <CustomSnackbar snackbar={snackbar} onClose={closeSnackbar} />
    </Box>
  );
};

Setting.propTypes = {
  defaultCheckoutStatus: PropTypes.number.isRequired,
  setDefaultCheckoutStatus: PropTypes.func.isRequired,
  defaultOccupiedStatus: PropTypes.number.isRequired,
  setDefaultOccupiedStatus: PropTypes.func.isRequired,
  defaultRoomStatus: PropTypes.number.isRequired,
  setDefaultRoomStatus: PropTypes.func.isRequired,
  defaultRoomSelection: PropTypes.number.isRequired,
  setDefaultRoomSelection: PropTypes.func.isRequired,
  statusOptions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      label: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
      text_color: PropTypes.string.isRequired,
    })
  ).isRequired,
  setStatusOptions: PropTypes.func.isRequired,
  roomTypes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  setRoomTypes: PropTypes.func.isRequired,
  logUserAction: PropTypes.func.isRequired,
};

export default Setting;
