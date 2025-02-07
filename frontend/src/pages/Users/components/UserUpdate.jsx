import { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import PropTypes from "prop-types";
import config from "../../../../state/config";

const UserUpdate = ({ open, onClose, userId, initialData, fetchUsers }) => {
  const [userData, setUserData] = useState(initialData);

  useEffect(() => {
    setUserData(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    try {
      await axios.put(`${config.API_URL}/users/${userId}`, userData);
      fetchUsers();
      onClose();
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Update User</DialogTitle>
      <DialogContent>
        <TextField
          label="Username"
          name="username"
          value={userData.username}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Role"
          name="role"
          select
          value={userData.role}
          onChange={handleChange}
          fullWidth
          margin="normal"
        >
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="staff">Staff</MenuItem>
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          Update User
        </Button>
      </DialogActions>
    </Dialog>
  );
};

UserUpdate.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
  initialData: PropTypes.shape({
    username: PropTypes.string,
    role: PropTypes.string,
  }).isRequired,
  fetchUsers: PropTypes.func.isRequired,
};

export default UserUpdate;
