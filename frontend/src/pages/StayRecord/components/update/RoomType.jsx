import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import PropTypes from "prop-types";

const UpdateRoomType = ({ open, onClose, rooms, onSelectRoom }) => {
  const [selectedRoomType, setSelectedRoomType] = useState("");

  const handleRoomTypeChange = (event) => {
    setSelectedRoomType(event.target.value);
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
        <Chip
          label={params.value}
          style={{
            backgroundColor: params.row.color,
            color: params.row.text_color,
          }}
        />
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
          onClick={() => onSelectRoom(params.row)}
        >
          Select
        </Button>
      ),
    },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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
            <Box height="50vh" width="100%">
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
  );
};

UpdateRoomType.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  rooms: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      room_number: PropTypes.string.isRequired,
      room_type: PropTypes.string.isRequired,
      rate: PropTypes.string,
      color: PropTypes.string,
      text_color: PropTypes.string,
      status: PropTypes.string.isRequired,
    })
  ).isRequired,
  onSelectRoom: PropTypes.func.isRequired,
};

export default UpdateRoomType;