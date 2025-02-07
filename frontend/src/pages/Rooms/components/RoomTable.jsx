import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Box, Button, useMediaQuery, useTheme } from "@mui/material";
import { DataGrid, GridToolbarContainer } from "@mui/x-data-grid";
import axios from "axios";
import config from "../../../state/config";
import Legend from "./Legend";
import { StatusDialog } from "./update/UpdateDialogs";
import RoomDetailsModal from "./update/RoomDetailsModal";

const RoomTable = ({
  rooms: initialRooms,
  roomfetch,
  logUserAction,
  LoguserId,
  showSnackbar,
}) => {
  const theme = useTheme();
  const isMediumOrLarger = useMediaQuery(theme.breakpoints.up("md"));
  const [rooms, setRooms] = useState(initialRooms || []);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [statusOptions, setStatusOptions] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [dialogs, setDialogs] = useState({
    status: false,
    roomDetails: false,
  });
  const [newStatus, setNewStatus] = useState(0);

  useEffect(() => {
    const fetchStatusOptions = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/status`);
        setStatusOptions(response.data.statusOptions);
      } catch (error) {
        console.error("Error fetching status options:", error);
      }
    };

    const fetchRoomTypes = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/room-types`);
        setRoomTypes(response.data.roomTypes);
      } catch (error) {
        console.error("Error fetching room types:", error);
      }
    };

    fetchStatusOptions();
    fetchRoomTypes();
  }, []);

  useEffect(() => {
    console.log("Rooms updated:", initialRooms);
    setRooms(initialRooms);
  }, [initialRooms]);

  const columns = [
    {
      field: "roomNumber",
      headerName: "Room Number",
      flex: 1,
      headerAlign: "center",
      align: "center",
      disableColumnMenu: true,
      renderCell: (params) => (
        <Box
          style={{
            width: "100%",
            borderRadius: "10px",
            textAlign: "center",
            padding: "5px 0",
            cursor: "pointer",
          }}
        >
          {params.value}
        </Box>
      ),
    },
    {
      field: "roomType",
      headerName: "Room Type",
      flex: 1,
      headerAlign: "center",
      align: "center",
      disableColumnMenu: true,
      renderCell: (params) => (
        <Box
          style={{
            width: "100%",
            borderRadius: "10px",
            textAlign: "center",
            padding: "5px 0",
            cursor: "pointer",
          }}
        >
          {params.value}
        </Box>
      ),
    },
    {
      field: "rate",
      headerName: "Rate",
      flex: 1,
      headerAlign: "center",
      align: "center",
      disableColumnMenu: true,
      renderCell: (params) => (
        <Box
          style={{
            width: "100%",
            borderRadius: "10px",
            textAlign: "center",
            padding: "5px 0",
            cursor: "pointer",
          }}
        >
          {params.value}
        </Box>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      headerAlign: "center",
      align: "center",
      disableColumnMenu: true,
      renderCell: (params) => (
        <Button
          style={{
            backgroundColor: params.row.color,
            color: params.row.textColor,
            width: "100%",
            height: "100%",
            textAlign: "center",
            cursor: "pointer",
          }}
          onClick={() => handleDialogOpen("status", params.row)}
          disabled={params.row.status_id === 1}
        >
          {params.value}
        </Button>
      ),
    },
    {
      field: "imageUrl",
      headerName: "Image",
      flex: 1,
      headerAlign: "center",
      align: "center",
      disableColumnMenu: true,
      renderCell: (params) => (
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            cursor: "pointer",
          }}
        >
          <img
            src={
              params.value
                ? `${config.API_URL}/assets/${params.value}`
                : "/frontend/assets/default-image.jpg"
            }
            alt="Room"
            style={{ width: 50, height: 50 }}
          />
        </Box>
      ),
    },
    {
      field: "view",
      headerName: "View",
      flex: 1,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleDialogOpen("roomDetails", params.row)}
        >
          View
        </Button>
      ),
    },
  ];

  const handleDialogOpen = (dialog, room) => {
    setSelectedRoom(room);
    setDialogs((prev) => ({ ...prev, [dialog]: true }));
  };

  const handleDialogClose = (dialog) => {
    setDialogs((prev) => ({ ...prev, [dialog]: false }));
  };

  const handleSave = async (updatedRoom) => {
    try {
      const roomId = selectedRoom;
      if (updatedRoom.status) {
        const response = await axios.put(
          `${config.API_URL}/rooms/${roomId.id}/status`,
          { status_code_id: updatedRoom.status }
        );
        if (!response.data.success) {
          throw new Error(response.data.message);
        }
        logUserAction(
          LoguserId,
          `Updated room:'${roomId.room_number}' status to ${updatedRoom.label}`
        );
        showSnackbar("Room status updated successfully!", "success");
      } else {
        const response = await axios.put(
          `${config.API_URL}/rooms/${roomId.id}`,
          updatedRoom
        );
        if (!response.data.success) {
          throw new Error(response.data.message);
        }
        logUserAction(LoguserId, "Updated room details");
        showSnackbar("Room details updated successfully!", "success");
      }
      const updatedRooms = rooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              ...updatedRoom,
              status: updatedRoom.label,
              color: updatedRoom.color,
              textColor: updatedRoom.textColor,
            }
          : room
      );
      setRooms(updatedRooms);
      roomfetch();
      setDialogs({
        status: false,
        roomDetails: false,
      });
    } catch (error) {
      console.error("Failed to update room details:", error);
      showSnackbar("Failed to update room details.", "error");
    }
  };

  const handleDelete = async (roomId) => {
    try {
      const response = await axios.delete(`${config.API_URL}/rooms/${roomId}`);
      if (response.data.success) {
        const updatedRooms = rooms.filter((room) => room.id !== roomId);
        setRooms(updatedRooms);
        setDialogs((prev) => ({ ...prev, roomDetails: false }));
        logUserAction(LoguserId, "Deleted room");
        showSnackbar("Room deleted successfully!", "success");
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Failed to delete room:", error);
      showSnackbar("Failed to delete room.", "error");
    }
  };

  const CustomToolbar = () => {
    return (
      <GridToolbarContainer
        sx={{ display: "flex", justifyContent: "center", padding: "8px" }}
      >
        <Legend />
      </GridToolbarContainer>
    );
  };

  return (
    <Box display="grid" gridTemplateColumns="repeat(12, 1fr)">
      <Box
        gridColumn="span 12"
        height={isMediumOrLarger ? "75vh" : "60vh"}
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
          rows={rooms}
          columns={columns}
          slots={{
            footer: CustomToolbar,
          }}
        />
      </Box>

      {selectedRoom && (
        <>
          <StatusDialog
            open={dialogs.status}
            statusOptions={statusOptions}
            newStatus={newStatus}
            onChange={setNewStatus}
            onClose={() => handleDialogClose("status")}
            onUpdate={() =>
              handleSave({
                status: newStatus,
                label: statusOptions.find((option) => option.id === newStatus)
                  ?.label,
                color: statusOptions.find((option) => option.id === newStatus)
                  ?.color,
                textColor: statusOptions.find(
                  (option) => option.id === newStatus
                )?.text_color,
              })
            }
          />

          <RoomDetailsModal
            open={dialogs.roomDetails}
            room={selectedRoom}
            roomTypes={roomTypes}
            statusOptions={statusOptions}
            onClose={() => handleDialogClose("roomDetails")}
            onSave={handleSave}
            onDelete={() => handleDelete(selectedRoom.id)}
          />
        </>
      )}
    </Box>
  );
};

RoomTable.propTypes = {
  rooms: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      roomNumber: PropTypes.string.isRequired,
      roomType: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      rate: PropTypes.number.isRequired,
      imageUrl: PropTypes.string,
      textColor: PropTypes.string,
    })
  ).isRequired,
  roomfetch: PropTypes.func.isRequired,
  logUserAction: PropTypes.func.isRequired,
  LoguserId: PropTypes.string.isRequired,
  showSnackbar: PropTypes.func.isRequired,
};

export default RoomTable;
