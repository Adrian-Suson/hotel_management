import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Box,
  DialogContentText,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const RoomSelectionDialog = ({
  open,
  onClose,
  rooms,
  onSelectRoom,
  roomSelection,
}) => {
  const theme = useTheme();
  const [selectedRoomType, setSelectedRoomType] = useState("");
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  useEffect(() => {
    console.log("defaultReservationStatusNumber:", roomSelection);
  }, [roomSelection]);

  const handleRoomTypeChange = (event) => {
    setSelectedRoomType(event.target.value);
  };

  const handleSelectClick = (roomId) => {
    setSelectedRoomId(roomId);
    setConfirmationDialogOpen(true);
  };

  const handleConfirmationClose = () => {
    setConfirmationDialogOpen(false);
  };

  const handleConfirmationAccept = () => {
    setConfirmationDialogOpen(false);
    onSelectRoom(selectedRoomId);
  };

  const filteredRooms = selectedRoomType
    ? rooms.filter((room) => room.room_type === selectedRoomType)
    : rooms;

  const roomTypes = [...new Set(rooms.map((room) => room.room_type))];

  const columns = [
    { field: "room_number", headerName: "Room Number", flex: 1 },
    { field: "room_type", headerName: "Type", flex: 1 },
    {
      field: "rate",
      headerName: "Rate",
      flex: 1,
      renderCell: (params) => `₱${params.value}`,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <>
          <Box
            style={{
              backgroundColor: params.row.color,
              color: params.row.text_color,
              width: "100%",
              height: "100%",
              textAlign: "center",
            }}
          >
            {params.value}
          </Box>
        </>
      ),
    },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleSelectClick(params.row.id)}
          disabled={params.row.status_id !== roomSelection}
        >
          Select
        </Button>
      ),
    },
  ];

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullScreen>
        <DialogTitle>
          <Typography>Select a Room</Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="room-type-label">Room Type</InputLabel>
                <Select
                  labelId="room-type-label"
                  value={selectedRoomType}
                  label="Room Type"
                  onChange={handleRoomTypeChange}
                >
                  <MenuItem value="">
                    <em>All</em>
                  </MenuItem>
                  {roomTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Box
                sx={{
                  background: "linear-gradient(135deg, #f5f7fa, #99c199)",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                  borderRadius: "10px",
                  "& .MuiDataGrid-root": {
                    border: "none",
                    borderRadius: "10px",
                  },
                  "& .MuiDataGrid-cell": {
                    backgroundColor: theme.palette.primary[200],
                    borderBottom: "none",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  },
                  "& .MuiDataGrid-columnHeaders": {
                    color: theme.palette.secondary.dark,
                    borderBottom: "none",
                  },
                  "& .MuiDataGrid-columnHeaderTitle": {
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                  },
                  "& .MuiDataGrid-footerContainer": {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.secondary.light,
                    borderTop: "none",
                  },
                  "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                    color: theme.palette.primary.dark,
                  },
                  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows, & .MuiTablePagination-select, & .MuiTablePagination-selectIcon":
                    {
                      color: theme.palette.secondary.light,
                    },
                }}
              >
                <DataGrid
                  rows={filteredRooms}
                  columns={columns}
                  pageSize={5}
                  rowsPerPageOptions={[5]}
                  getRowId={(row) => row.id}
                  disableSelectionOnClick
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary" variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={confirmationDialogOpen} onClose={handleConfirmationClose}>
        <DialogTitle>Confirm Room Selection</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to select this room?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleConfirmationClose}
            sx={{ color: theme.palette.secondary[700] }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmationAccept}
            sx={{ color: theme.palette.primary[700] }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

RoomSelectionDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  rooms: PropTypes.array.isRequired,
  onSelectRoom: PropTypes.func.isRequired,
  roomSelection: PropTypes.number.isRequired,
};

export default RoomSelectionDialog;
