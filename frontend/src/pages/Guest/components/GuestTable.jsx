import { useCallback, useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  useMediaQuery,
  useTheme,
  Button,
  TextField,
  Stack,
  CircularProgress,
} from "@mui/material";
import PropTypes from "prop-types";
import config from "../../../state/config";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import SearchIcon from "@mui/icons-material/Search";
import GuestModal from "./GuestModal";
import axios from "axios";

const GuestTable = ({
  showSnackbar,
  roomStatus,
  roomSelection,
  logUserAction,
  LogUserId,
}) => {
  const theme = useTheme();
  const isMediumOrLarger = useMediaQuery(theme.breakpoints.up("md"));
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [guests, setGuests] = useState([]);
  const [filteredGuests, setFilteredGuests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGuests = useCallback(async () => {
    try {
      const response = await axios.get(`${config.API_URL}/guests`);
      if (response.data.success) {
        setGuests(response.data.guests);
        setFilteredGuests(
          response.data.guests.filter((guest) => guest.id_picture)
        );
      } else {
        console.error("Failed to fetch guests:", response.data.message);
        showSnackbar("Failed to fetch guests.", "error");
      }
    } catch (error) {
      console.error("Error fetching guests:", error);
      showSnackbar("An error occurred while fetching guests.", "error");
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  useEffect(() => {
    setFilteredGuests(
      guests
        .filter((guest) => guest.id_picture) // Filter only guests with id_picture
        .filter(
          (guest) =>
            guest.first_name.toLowerCase().includes(search.toLowerCase()) ||
            guest.last_name.toLowerCase().includes(search.toLowerCase()) ||
            guest.email.toLowerCase().includes(search.toLowerCase()) ||
            guest.phone.toLowerCase().includes(search.toLowerCase())
        )
    );
  }, [search, guests]);

  const handleOpen = async (guest) => {
    setSelectedGuest(guest);
    setOpen(true);
  };

  const handleClose = () => {
    setSelectedGuest(null);
    setOpen(false);
    fetchGuests();
  };

  const handleSearchChange = useCallback((event) => {
    setSearch(event.target.value);
  }, []);

  const columns = [
    {
      field: "first_name",
      headerName: "First Name",
      flex: 1,
      headerAlign: "center",
      align: "center",
      disableColumnMenu: true,
    },
    {
      field: "last_name",
      headerName: "Last Name",
      flex: 1,
      headerAlign: "center",
      align: "center",
      disableColumnMenu: true,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      headerAlign: "center",
      disableColumnMenu: true,
    },
    {
      field: "phone",
      headerName: "Phone",
      flex: 1,
      headerAlign: "center",
      align: "center",
      disableColumnMenu: true,
    },
    {
      field: "id_picture",
      headerName: "ID Picture",
      flex: 1,
      headerAlign: "center",
      align: "center",
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <img
          src={`${config.API_URL}/id_picture/${params.value}`}
          alt="ID"
          style={{ width: 50, height: 50, objectFit: "cover" }}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      headerAlign: "center",
      align: "center",
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Button
          variant="contained"
          sx={{
            color: theme.palette.secondary[100],
            background: theme.palette.primary.main,
            "&:hover": {
              transform: "scale(1.1)",
              color: theme.palette.primary[700],
              background: theme.palette.secondary.main,
            },
          }}
          startIcon={<RemoveRedEyeIcon />}
          onClick={() => handleOpen(params.row)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <>
      <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={2}>
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
          <Stack
            direction="row"
            spacing={2}
            justifyContent="space-between"
            alignItems="center"
            my={1}
            mx={2}
          >
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              value={search}
              onChange={handleSearchChange}
              sx={{ width: "300px" }}
              InputProps={{
                endAdornment: <SearchIcon />,
              }}
            />
          </Stack>

          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
            >
              <CircularProgress />
            </Box>
          ) : (
            <DataGrid
              rows={filteredGuests}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5]}
            />
          )}
        </Box>
      </Box>
      <GuestModal
        open={open}
        onClose={handleClose}
        guest={selectedGuest || {}}
        fetchGuests={fetchGuests}
        showSnackbar={showSnackbar}
        roomStatus={roomStatus}
        roomSelection={roomSelection}
        logUserAction={logUserAction}
        LogUserId={LogUserId}
      />
    </>
  );
};

GuestTable.propTypes = {
  showSnackbar: PropTypes.func.isRequired,
  roomStatus: PropTypes.number.isRequired,
  roomSelection: PropTypes.number.isRequired,
  logUserAction: PropTypes.func.isRequired,
  LogUserId: PropTypes.string.isRequired,
};

export default GuestTable;
