import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useTheme,
  Box,
  useMediaQuery,
  Tooltip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import PropTypes from "prop-types";
import axios from "axios";
import config from "../../../state/config";
import RoomSelectionDialog from "./update/updateRoomType";
import DateUpdateDialog from "./update/DateUpdateDialog";
import GuestUpdateDialog from "./update/GuestUpdateDialog";
import GuestNumberUpdateDialog from "./update/GuestNumberUpdateDialog";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import DeleteIcon from "@mui/icons-material/Delete";

const ReservationsTable = ({
  reservations,
  onDelete,
  onConfirm,
  onUpdate,
  showSnackbar,
  roomSelection,
  logUserAction,
  userId,
}) => {
  const theme = useTheme();
  const isMediumOrLarger = useMediaQuery(theme.breakpoints.up("md"));
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openRoomDialog, setOpenRoomDialog] = useState(false);
  const [openDateDialog, setOpenDateDialog] = useState(false);
  const [openGuestNumberDialog, setOpenGuestNumberDialog] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState(null);

  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/rooms`);
      setRooms(response.data.rooms);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
      setRooms([]);
    }
  };

  const fetchGuestData = async (guestId) => {
    try {
      const response = await axios.get(`${config.API_URL}/guests/${guestId}`);
      const guestData = response.data.guest;
      setSelectedGuest({
        id: guestData.id,
        firstName: guestData.first_name,
        lastName: guestData.last_name,
        email: guestData.email,
        phoneNumber: guestData.phone,
      });
      setOpenEditDialog(true);
    } catch (error) {
      showSnackbar("Failed to fetch guest data", "error");
    }
  };

  const handleEditClick = (guest) => {
    fetchGuestData(guest.guest_id);
  };

  const handleEditDialogClose = () => {
    setOpenEditDialog(false);
    setSelectedGuest(null);
  };

  const handleRoomClick = async (reservation) => {
    await fetchRooms();
    setSelectedRoom(reservation);
    setOpenRoomDialog(true);
  };

  const handleRoomSelect = async (room) => {
    const updatedReservation = {
      ...selectedRoom,
      room_id: room.id,
      room_number: room.number,
    };

    setConfirmationAction(() => async () => {
      try {
        const response = await axios.put(
          `${config.API_URL}/reservations/${selectedRoom.id}`,
          {
            room_id: room.id,
          }
        );

        if (response.data.success) {
          onUpdate(updatedReservation);
          showSnackbar("Room updated successfully.", "success");
          logUserAction(
            userId,
            `Updated room for reservation ID: ${selectedRoom.guest_id}`
          );
        } else {
          showSnackbar("Failed to update room.", "error");
        }
      } catch (error) {
        console.error("Failed to update the room:", error);
        showSnackbar("Server error occurred while updating the room.", "error");
      }

      setOpenRoomDialog(false);
    });
    setConfirmationDialogOpen(true);
  };

  const handleDateClick = (reservation) => {
    setSelectedReservation(reservation);
    setOpenDateDialog(true);
  };

  const handleGuestNumberClick = (reservation) => {
    setSelectedReservation(reservation);
    setOpenGuestNumberDialog(true);
  };

  const columns = [
    {
      field: "guestName",
      headerName: "Guest Name",
      flex: 2,
      headerAlign: "center",
      align: "center",
      disableColumnMenu: true,
      renderCell: (params) => (
        <Tooltip title="Update Guest Info">
          <Box
            variant="text"
            onClick={() => handleEditClick(params.row)}
            style={{ cursor: "pointer", color: theme.palette.primary[900] }}
          >
            {params.value}
          </Box>
        </Tooltip>
      ),
    },
    {
      field: "room_number",
      headerName: "Room No.",
      flex: 1,
      headerAlign: "center",
      align: "center",
      disableColumnMenu: true,
      renderCell: (params) => (
        <Tooltip title="Change Room">
          <Box
            variant="text"
            onClick={() => handleRoomClick(params.row)}
            style={{ cursor: "pointer", color: theme.palette.primary[900] }}
          >
            {params.value}
          </Box>
        </Tooltip>
      ),
    },
    {
      field: "check_in",
      headerName: "Check In",
      flex: 1.5,
      headerAlign: "center",
      align: "center",
      disableColumnMenu: true,
      renderCell: (params) => (
        <Tooltip title="Update Check-in">
          <Box
            variant="text"
            onClick={() => handleDateClick(params.row)}
            style={{ cursor: "pointer", color: theme.palette.primary[900] }}
          >
            {params.value}
          </Box>
        </Tooltip>
      ),
    },
    {
      field: "check_out",
      headerName: "Check Out",
      flex: 1.5,
      headerAlign: "center",
      align: "center",
      disableColumnMenu: true,
      renderCell: (params) => (
        <Tooltip title="Update CheckOut">
          <Box
            variant="text"
            onClick={() => handleDateClick(params.row)}
            style={{ cursor: "pointer", color: theme.palette.primary[900] }}
          >
            {params.value}
          </Box>
        </Tooltip>
      ),
    },
    {
      field: "guestNumber",
      headerName: "Guest No.",
      flex: 1,
      headerAlign: "center",
      align: "center",
      disableColumnMenu: true,
      renderCell: (params) => (
        <Tooltip title="Update Guest Number">
          <Box
            variant="text"
            onClick={() => handleGuestNumberClick(params.row)}
            style={{ cursor: "pointer", color: theme.palette.primary[900] }}
          >
            {params.value}
          </Box>
        </Tooltip>
      ),
    },
    {
      field: "confirm",
      headerName: "Confirm",
      flex: 1,
      headerAlign: "center",
      align: "center",
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Tooltip title="Confirm">
          <Button
            sx={{
              color: theme.palette.secondary[100],
              background: theme.palette.primary.main,
              "&:hover": {
                transform: "scale(1.1)",
                color: theme.palette.secondary[100],
                background: theme.palette.secondary.main,
              },
            }}
            onClick={() => {
              onConfirm(params.row);
            }}
          >
            <AssignmentTurnedInIcon />
          </Button>
        </Tooltip>
      ),
    },
    {
      field: "cancel",
      headerName: "Cancel",
      flex: 1,
      headerAlign: "center",
      align: "center",
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Tooltip title="Delete">
          <Button
            sx={{
              color: theme.palette.secondary[100],
              background: "#9C2621FF",
              "&:hover": {
                transform: "scale(1.1)",
                color: theme.palette.secondary[100],
                background: "#F31C15FF",
              },
            }}
            onClick={() => {
              onDelete(params.row);
            }}
          >
            <DeleteIcon />
          </Button>
        </Tooltip>
      ),
    },
  ];

  const handleConfirmationClose = () => {
    setConfirmationDialogOpen(false);
    setConfirmationAction(null);
  };

  const handleConfirmationAccept = () => {
    if (confirmationAction) confirmationAction();
    handleConfirmationClose();
  };

  return (
    <>
      <Box display="grid" gridTemplateColumns="repeat(12, 1fr)">
        <Box
          gridColumn="span 12"
          height={isMediumOrLarger ? "75vh" : "50vh"}
          sx={{
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            borderRadius: "10px",

            // Root DataGrid Styling
            "& .MuiDataGrid-root": {
              background: "#FFFFFFDA",
              border: "none",
              borderRadius: "10px",
            },

            // Cell Styling
            "& .MuiDataGrid-cell": {
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "0.75rem",
            },

            // Column Headers Styling
            "& .MuiDataGrid-columnHeaders": {
              fontSize: "0.75rem",
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              fontSize: "0.75rem",
            },

            // Footer Container Styling
            "& .MuiDataGrid-footerContainer": {
              fontSize: "0.75rem",
            },

            // Toolbar Buttons Styling
            "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
              fontSize: "0.75rem",
            },

            // Pagination Styling
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows, & .MuiTablePagination-select, & .MuiTablePagination-selectIcon":
              {
                fontSize: "0.75rem",
              },
          }}
        >
          <DataGrid
            rows={reservations}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
          />
        </Box>
      </Box>
      <GuestUpdateDialog
        open={openEditDialog}
        onClose={handleEditDialogClose}
        guest={selectedGuest}
        onUpdate={onUpdate}
        showSnackbar={showSnackbar}
        logUserAction={logUserAction}
      />
      <RoomSelectionDialog
        roomSelection={roomSelection}
        open={openRoomDialog}
        onClose={() => setOpenRoomDialog(false)}
        rooms={rooms}
        onSelectRoom={handleRoomSelect}
      />
      <DateUpdateDialog
        open={openDateDialog}
        onClose={() => setOpenDateDialog(false)}
        reservation={selectedReservation}
        onUpdate={(updatedReservation) => {
          onUpdate(updatedReservation);
          setSelectedReservation(null);
          logUserAction(
            userId,
            `Updated dates for reservation ID: ${updatedReservation.guest_id}`
          );
        }}
        showSnackbar={showSnackbar}
      />
      <GuestNumberUpdateDialog
        open={openGuestNumberDialog}
        onClose={() => setOpenGuestNumberDialog(false)}
        reservation={selectedReservation}
        onUpdate={(updatedReservation) => {
          onUpdate(updatedReservation);
          setSelectedReservation(null);
          logUserAction(
            userId,
            `Updated guest number for reservation ID: ${updatedReservation.guest_id}`
          );
        }}
        showSnackbar={showSnackbar}
      />
      <Dialog open={confirmationDialogOpen} onClose={handleConfirmationClose}>
        <DialogTitle>Confirm Update</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to proceed with this update?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmationClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirmationAccept} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

ReservationsTable.propTypes = {
  reservations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      guestName: PropTypes.string.isRequired,
      room_number: PropTypes.string.isRequired,
      check_in: PropTypes.string.isRequired,
      check_out: PropTypes.string.isRequired,
      guestNumber: PropTypes.number.isRequired,
    })
  ).isRequired,
  onDelete: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  showSnackbar: PropTypes.func.isRequired,
  roomSelection: PropTypes.number.isRequired,
  userId: PropTypes.string.isRequired,
  logUserAction: PropTypes.func.isRequired,
};

export default ReservationsTable;
