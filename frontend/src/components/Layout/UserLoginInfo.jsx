import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  TextField,
  Button,
  Typography,
  useTheme,
  CircularProgress,
  IconButton,
  InputAdornment,
  Modal,
  Container,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import axios from "axios";
import config from "../../state/config";

// Validation schema using Yup
const validationSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, "Username must be at least 3 characters")
    .required("Username is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
});

const UserLoginInfo = ({ loggedInUserId, showSnackbar, open, onClose }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentInfo, setCurrentInfo] = useState({
    username: "",
    password: "",
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get(
          `${config.API_URL}/users/${loggedInUserId}`
        );
        if (response.data.success && response.data.user) {
          setCurrentInfo({
            username: response.data.user.username,
            password: "",
          });
        } else {
          showSnackbar("Failed to fetch user info", "error");
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        showSnackbar("Error fetching user info", "error");
      }
    };

    fetchUserInfo();
  }, [loggedInUserId, showSnackbar]);

  const handleLoginUpdate = async (values, actions) => {
    setLoading(true);
    try {
      await axios.put(
        `${config.API_URL}/update_login/${loggedInUserId}`,
        values
      );
      showSnackbar("Login info updated successfully", "success");
      setCurrentInfo({ username: values.username, password: "" });
      actions.resetForm();
      onClose(); // Close the modal after successful update
    } catch (error) {
      console.error("Error updating login info:", error);
      showSnackbar("Failed to update login info", "error");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

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
        <Box sx={{ width: "100%", mx: "auto" }}>
          <Typography
            variant="h6"
            component="h2"
            sx={{
              textAlign: "center",
              mb: 3,
              color: theme.palette.primary.main,
            }}
          >
            Update Login Information
          </Typography>
          <Formik
            initialValues={{
              username: currentInfo.username,
              password: "",
              confirmPassword: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleLoginUpdate}
          >
            {({ errors, touched }) => (
              <Form>
                <Field
                  as={TextField}
                  label="Username"
                  name="username"
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  error={touched.username && !!errors.username}
                  helperText={touched.username && errors.username}
                />
                <Field
                  as={TextField}
                  label="New Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  error={touched.password && !!errors.password}
                  helperText={touched.password && errors.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={togglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Field
                  as={TextField}
                  label="Confirm New Password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  error={touched.confirmPassword && !!errors.confirmPassword}
                  helperText={touched.confirmPassword && errors.confirmPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={toggleConfirmPasswordVisibility}
                          edge="end"
                        >
                          {showConfirmPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Box
                  sx={{
                    mt: 3,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      flex: 1,
                      mr: 1,
                    }}
                    startIcon={
                      loading ? <CircularProgress size={20} /> : <SaveIcon />
                    }
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{
                      color: theme.palette.primary.main,
                      flex: 1,
                      ml: 1,
                    }}
                    startIcon={<CloseIcon />}
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        </Box>
      </Container>
    </Modal>
  );
};

UserLoginInfo.propTypes = {
  loggedInUserId: PropTypes.string.isRequired,
  showSnackbar: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default UserLoginInfo;
