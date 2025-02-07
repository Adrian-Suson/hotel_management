import { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { Box, Button, Container } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import UserAdd from "./components/UserAdd";
import UserTable from "./components/UserTable";
import axios from "axios";
import config from "../../state/config";
import useSnackbar from "../../components/Snackbar/useSnackbar";
import CustomSnackbar from "../../components/Snackbar/CustomSnackbar";

const Users = ({ logUserAction }) => {
  const [users, setUsers] = useState([]);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const userId = localStorage.getItem("userId");
  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get(`${config.API_URL}/users`);
      setUsers(response.data.users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <Container m="1.5rem 2.5rem">
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mt: "1rem",
          mb: "0.5rem",
        }}
      >
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={handleOpenDialog}
        >
          Add User
        </Button>
      </Box>
      {isDialogOpen && (
        <UserAdd
          fetchUsers={fetchUsers}
          onClose={handleCloseDialog}
          showSnackbar={showSnackbar}
          logUserAction={logUserAction}
          userId={userId}
        />
      )}
      <UserTable
        users={users}
        setUsers={setUsers}
        fetchUsers={fetchUsers}
        showSnackbar={showSnackbar}
        logUserAction={logUserAction}
        LoguserId={userId}
      />
      <CustomSnackbar snackbar={snackbar} onClose={closeSnackbar} />
    </Container>
  );
};

Users.propTypes = {
  logUserAction: PropTypes.func.isRequired,
};

export default Users;
