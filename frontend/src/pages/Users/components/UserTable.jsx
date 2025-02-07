import { useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Stack,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UserProfileModal from "./UserProfile";

const UserTable = ({
  users,
  fetchUsers,
  showSnackbar,
  logUserAction,
  LoguserId,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handleViewProfile = async (userId) => {
    setSelectedUserId(userId);
    setProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setProfileModalOpen(false);
    setSelectedUserId(null);
  };

  // Filter out the user with ID "admin-000000" and apply the search filter
  const filteredData = users.filter(
    (user) =>
      user.userId !== "admin-000000" && // Exclude the admin-000000 user
      (user.userId.toString().toLowerCase().includes(search.toLowerCase()) ||
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        user.role.toLowerCase().includes(search.toLowerCase()))
  );

  const columns = [
    {
      field: "userId",
      headerName: "ID",
      flex: 1,
      disableColumnMenu: true,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "username",
      headerName: "Username",
      flex: 1,
      disableColumnMenu: true,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "role",
      headerName: "Role",
      flex: 1,
      disableColumnMenu: true,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "view",
      headerName: "View Profile",
      flex: 1,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Button
          onClick={() => handleViewProfile(params.row.userId)}
          sx={{
            color: theme.palette.secondary[100],
            background: theme.palette.primary.main,
            "&:hover": {
              transform: "scale(1.1)",
              color: theme.palette.primary[700],
              background: theme.palette.secondary.main,
            },
          }}
        >
          <VisibilityIcon />
        </Button>
      ),
    },
  ];

  return (
    <>
      <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={2}>
        <Box
          gridColumn="span 12"
          height={isSmallScreen ? "75vh" : "60vh"}
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
              fullWidth
              size="small"
              margin="normal"
              value={search}
              onChange={handleSearchChange}
              sx={{
                mr: 2,
                width: "300px",
              }}
              InputProps={{
                endAdornment: <SearchIcon />,
              }}
            />
          </Stack>

          <DataGrid rows={filteredData} columns={columns} />
        </Box>
      </Box>

      {selectedUserId && (
        <UserProfileModal
          fetchUsers={fetchUsers}
          userId={selectedUserId}
          open={profileModalOpen}
          showSnackbar={showSnackbar}
          logUserAction={logUserAction}
          LoguserId={LoguserId}
          onClose={handleCloseProfileModal}
        />
      )}
    </>
  );
};

UserTable.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      userId: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired,
    })
  ).isRequired,
  fetchUsers: PropTypes.func.isRequired,
  showSnackbar: PropTypes.func.isRequired,
  logUserAction: PropTypes.func.isRequired,
  LoguserId: PropTypes.string.isRequired,
};

export default UserTable;
