import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  TextField,
  Button,
  Container,
  Modal,
  Typography,
  Avatar,
  IconButton,
  CircularProgress,
  Grid,
  useTheme,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import config from "../../../state/config";

const UserProfile = ({
  userId,
  open,
  onClose,
  fetchUsers,
  logUserAction,
  LoguserId,
  showSnackbar,
}) => {
  const theme = useTheme();
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const loggedInUserId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/profile/${userId}`);
        setProfile(response.data.profile);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setLoading(false);
        showSnackbar("Failed to fetch profile", "error");
      }
    };

    if (userId && open) {
      fetchProfileData();
    }
  }, [userId, open, showSnackbar]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile({
      ...profile,
      [name]: value,
    });
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setSelectedImage(file);
    setProfile({
      ...profile,
      image_url: URL.createObjectURL(file),
    });
  };

  const handleUpdate = async () => {
    const formData = new FormData();
    formData.append("firstName", profile.first_name);
    formData.append("lastName", profile.last_name);
    formData.append("email", profile.email);
    formData.append("phoneNumber", profile.phone_number);
    formData.append("address", profile.address);
    if (selectedImage) {
      formData.append("profilePic", selectedImage);
    }

    try {
      const response = await axios.put(
        `${config.API_URL}/profile/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setEditing(false);
      fetchUsers();
      await logUserAction(LoguserId, `Updated profile for user ID: ${userId}`);
      showSnackbar("Profile updated", "success");
      if (response.data.imageName) {
        setProfile((prev) => ({
          ...prev,
          image_url: response.data.imageName,
        }));
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
      showSnackbar("Failed to update profile", "error");
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Container
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: "10px",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography
            variant="h6"
            component="h2"
            sx={{ color: theme.palette.primary[900] }}
          >
            User Profile
          </Typography>
          {userId === loggedInUserId &&
            (editing ? (
              <IconButton
                onClick={handleUpdate}
                sx={{ color: theme.palette.primary.main }}
              >
                <SaveIcon />
              </IconButton>
            ) : (
              <IconButton
                onClick={() => setEditing(true)}
                sx={{ color: theme.palette.primary.main }}
              >
                <EditIcon />
              </IconButton>
            ))}
        </Box>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Avatar
            src={
              selectedImage
                ? URL.createObjectURL(selectedImage)
                : `${config.API_URL}/profile_pictures/${profile.image_url}`
            }
            alt={`${profile.first_name} ${profile.last_name}`}
            sx={{ width: 100, height: 100, mb: 2 }}
          />
          {editing && (
            <Button variant="contained" component="label" sx={{ mb: 2 }}>
              Change Image
              <input
                type="file"
                hidden
                onChange={handleImageChange}
                name="profilePic"
              />
            </Button>
          )}
          {editing ? (
            <>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="First Name"
                    name="first_name"
                    value={profile.first_name || ""}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Last Name"
                    name="last_name"
                    value={profile.last_name || ""}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Email"
                    name="email"
                    value={profile.email || ""}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Phone Number"
                    name="phone_number"
                    value={profile.phone_number || ""}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
              </Grid>
              <TextField
                label="Address"
                name="address"
                value={profile.address || ""}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
            </>
          ) : (
            <>
              <Typography
                variant="body1"
                gutterBottom
                sx={{ color: theme.palette.primary[900] }}
              >
                {profile.first_name} {profile.last_name}
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                gutterBottom
                sx={{ color: theme.palette.primary[900] }}
              >
                {profile.email}
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                gutterBottom
                sx={{ color: theme.palette.primary[900] }}
              >
                {profile.phone_number}
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                gutterBottom
                sx={{ color: theme.palette.primary[900] }}
              >
                {profile.address}
              </Typography>
            </>
          )}
        </Box>
        <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
            }}
            onClick={onClose}
            startIcon={<CloseIcon />}
          >
            Close
          </Button>
        </Box>
      </Container>
    </Modal>
  );
};

UserProfile.propTypes = {
  userId: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  fetchUsers: PropTypes.func.isRequired,
  logUserAction: PropTypes.func.isRequired,
  LoguserId: PropTypes.string.isRequired,
  showSnackbar: PropTypes.func.isRequired,
};

export default UserProfile;
