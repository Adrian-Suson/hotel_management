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
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import PropTypes from "prop-types";

const UpdateRoomType = ({
  open,
  onClose,
  rooms,
  onSelectRoom,
  roomSelection,
}) => {
  const [selectedRoomType, setSelectedRoomType] = useState("");
  const theme = useTheme();

  const handleRoomTypeChange = (event) => {
    setSelectedRoomType(event.target.value);
  };

  const filteredRooms = selectedRoomType
    ? rooms.filter((room) => room.room_type === selectedRoomType)
    : rooms;

  const roomTypes = [...new Set(rooms.map((room) => room.room_type))];

  const columns = [
    {
      field: "room_number",
      headerName: "Room Number",
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "room_type",
      headerName: "Type",
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "rate",
      headerName: "Rate",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => `₱${params.value}`,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      headerAlign: "center",
      align: "center",
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
      headerAlign: "center",
      align: "center",
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      flex: 1,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          onClick={() => onSelectRoom(params.row)}
          disabled={params.row.status_id !== roomSelection}
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
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel size="small" id="room-type-label">
                Room Type
              </InputLabel>
              <Select
                size="small"
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
                height: "55vh",
                background: "linear-gradient(135deg, #f5f7fa, #99c199)",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                borderRadius: "10px",
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
  );
};

UpdateRoomType.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  rooms: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      number: PropTypes.string,
      room_type: PropTypes.string.isRequired,
      rate: PropTypes.string,
      color: PropTypes.string,
      text_color: PropTypes.string,
    })
  ).isRequired,
  onSelectRoom: PropTypes.func.isRequired,
  roomSelection: PropTypes.number.isRequired,
};

export default UpdateRoomType;
