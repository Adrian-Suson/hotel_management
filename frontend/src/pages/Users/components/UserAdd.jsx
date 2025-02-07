import PropTypes from "prop-types";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import axios from "axios";
import config from "../../../state/config";

const UserAdd = ({
  onClose,
  fetchUsers,
  showSnackbar,
  logUserAction,
  userId,
}) => {
  const initialValues = {
    id: "",
    username: "",
    password: "",
    role: "",
  };

  // Validation schema
  const validationSchema = Yup.object({
    id: Yup.string()
      .matches(/^[a-zA-Z0-9]+$/, "User ID must be alphanumeric")
      .min(4, "User ID must be at least 4 characters")
      .required("User ID is required"),
    username: Yup.string()
      .min(4, "Username must be at least 4 characters")
      .required("Username is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .matches(
        /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{8,}$/,
        "Password must contain at least one letter and one number"
      )
      .required("Password is required"),
    role: Yup.string().required("Role is required"),
  });

  const checkUsernameExists = async (username) => {
    try {
      const response = await axios.post(`${config.API_URL}/check_username`, {
        username,
      });
      return response.data.exists; // Assuming the API returns { exists: true/false }
    } catch (error) {
      console.error("Error checking username:", error);
      return false; // Assume the username doesn't exist in case of an error
    }
  };

  const handleSubmit = async (
    values,
    { setSubmitting, resetForm, setFieldError }
  ) => {
    setSubmitting(true);

    // Check if the username already exists
    const usernameExists = await checkUsernameExists(values.username);
    if (usernameExists) {
      setFieldError("username", "Username already exists"); // Show error in the form
      setSubmitting(false); // Stop the form submission process
      return;
    }

    try {
      const response = await axios.post(`${config.API_URL}/register`, values);
      if (response.status === 201) {
        onClose();
        fetchUsers();
        showSnackbar("User added successfully", "success");
        await logUserAction(userId, `Added user '${values.id}'`);
        resetForm();
      } else {
        showSnackbar("Failed to add user", "error");
      }
    } catch (error) {
      console.error("Failed to add user:", error);
      showSnackbar(
        "Failed to add user: " +
          (error.response?.data?.message || error.message),
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>Add New User</DialogTitle>
      <DialogContent>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          validateOnChange={true} // Real-time validation feedback
        >
          {({ isSubmitting, errors, touched }) => (
            <Form>
              {/* User ID Field */}
              <Field
                as={TextField}
                label="User ID"
                name="id"
                fullWidth
                margin="normal"
                autoFocus
                error={touched.id && Boolean(errors.id)}
                helperText={touched.id && errors.id}
              />

              {/* Username Field */}
              <Field
                as={TextField}
                label="Username"
                name="username"
                fullWidth
                margin="normal"
                error={touched.username && Boolean(errors.username)}
                helperText={touched.username && errors.username}
              />

              {/* Password Field */}
              <Field
                as={TextField}
                label="Password"
                name="password"
                type="password"
                fullWidth
                margin="normal"
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
              />

              {/* Role Field */}
              <Field
                as={TextField}
                label="Role"
                name="role"
                select
                fullWidth
                margin="normal"
                error={touched.role && Boolean(errors.role)}
                helperText={touched.role && errors.role}
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="staff">Staff</MenuItem>
              </Field>

              {/* Dialog Actions */}
              <DialogActions>
                <Button onClick={onClose} color="secondary">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  disabled={isSubmitting} // Disable button while submitting
                  startIcon={
                    isSubmitting ? <CircularProgress size={20} /> : null
                  } // Show loader when submitting
                >
                  {isSubmitting ? "Adding..." : "Add User"}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

UserAdd.propTypes = {
  onClose: PropTypes.func.isRequired,
  fetchUsers: PropTypes.func.isRequired,
  showSnackbar: PropTypes.func.isRequired,
  logUserAction: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
};

export default UserAdd;
