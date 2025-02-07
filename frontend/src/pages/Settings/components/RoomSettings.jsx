import { useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Button,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ButtonGroup,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axios from "axios";
import config from "../../../state/config";
import useSnackbar from "../../../components/Snackbar/useSnackbar";
import CustomSnackbar from "../../../components/Snackbar/CustomSnackbar";
import AddRoomTypeDialog from "./Dialog/AddRoomTypeDialog";
import AddStatusCodeDialog from "./Dialog/AddStatusCodeDialog";

const RoomSettings = ({
  defaultCheckoutStatus,
  setDefaultCheckoutStatus,
  defaultOccupiedStatus,
  setDefaultOccupiedStatus,
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
  const [roomTypeListOpen, setRoomTypeListOpen] = useState(false);
  const [statusCodeListOpen, setStatusCodeListOpen] = useState(false);

  const loggedInUserId = localStorage.getItem("userId");

  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  const handleStatusChange = (event, setStatus, key, label) => {
    const selectedStatus = Number(event.target.value);
    const selectedStatusOption = statusOptions.find(
      (status) => status.id === selectedStatus
    );
    setStatus(selectedStatus);
    localStorage.setItem(key, selectedStatus.toString());
    logUserAction(
      loggedInUserId,
      `Changed ${label} to: ${selectedStatusOption.label}`
    );
  };

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
    <>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Room Management</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Room Selection</Typography>
              {renderSelectField(
                "Default Room Selection",
                defaultRoomSelection,
                handleStatusChange,
                "defaultRoomSelection",
                setDefaultRoomSelection
              )}
              <Typography variant="body2" color="textSecondary">
                The selected status is the only option available during check-in
                and reservation.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Checkout Status</Typography>
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
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Checkin Status</Typography>
              {renderSelectField(
                "Default Occupied Status",
                defaultOccupiedStatus,
                handleStatusChange,
                "defaultOccupiedStatus",
                setDefaultOccupiedStatus
              )}
              <Typography variant="body2" color="textSecondary">
                Selecting a checkin status will update the room to reflect that
                it is currently occupied by guests.
              </Typography>
            </Grid>
          </Grid>
        </AccordionDetails>
        <AccordionDetails>
          <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
            <ButtonGroup color="primary">
              <Button
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() => setAddStatusCodeOpen(true)}
              >
                Add Status
              </Button>
              <Button
                variant="outlined"
                onClick={() => setStatusCodeListOpen(true)}
              >
                View Status List
              </Button>
            </ButtonGroup>
            <ButtonGroup color="primary" sx={{ marginLeft: 1 }}>
              <Button
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() => setAddRoomTypeOpen(true)}
              >
                Add Room Type
              </Button>
              <Button
                variant="outlined"
                onClick={() => setRoomTypeListOpen(true)}
              >
                View Room Types List
              </Button>
            </ButtonGroup>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Dialog for Room Type List */}
      <Dialog
        open={roomTypeListOpen}
        onClose={() => setRoomTypeListOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Room Type Lists</DialogTitle>
        <DialogContent>
          <List>
            {roomTypes.map((type) => (
              <ListItem key={type.id}>
                <ListItemText primary={type.name} />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteClick(type.id, "roomType")}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoomTypeListOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for Status Code List */}
      <Dialog
        open={statusCodeListOpen}
        onClose={() => setStatusCodeListOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Status Code Lists</DialogTitle>
        <DialogContent>
          <List>
            {statusOptions.map((status) => (
              <ListItem key={status.id}>
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
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteClick(status.id, "statusCode")}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusCodeListOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for Adding Room Type */}
      <AddRoomTypeDialog
        open={addRoomTypeOpen}
        handleClose={() => setAddRoomTypeOpen(false)}
        newRoomType={newRoomType}
        setNewRoomType={setNewRoomType}
        handleAddRoomType={handleAddRoomType}
      />

      {/* Dialog for Adding Status Code */}
      <AddStatusCodeDialog
        open={addStatusCodeOpen}
        handleClose={() => setAddStatusCodeOpen(false)}
        newStatusCode={newStatusCode}
        setNewStatusCode={setNewStatusCode}
        newStatusLabel={newStatusLabel}
        setNewStatusLabel={setNewStatusLabel}
        newStatusColor={newStatusColor}
        setNewStatusColor={setNewStatusColor}
        newTextColor={newTextColor}
        setNewTextColor={setNewTextColor}
        handleAddStatusCode={handleAddStatusCode}
      />

      {/* Dialog for Confirming Deletion */}
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
    </>
  );
};

RoomSettings.propTypes = {
  defaultCheckoutStatus: PropTypes.number.isRequired,
  setDefaultCheckoutStatus: PropTypes.func.isRequired,
  defaultOccupiedStatus: PropTypes.number.isRequired,
  setDefaultOccupiedStatus: PropTypes.func.isRequired,
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

export default RoomSettings;
