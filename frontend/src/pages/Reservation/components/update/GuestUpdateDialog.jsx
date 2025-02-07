import { useState } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  DialogContentText,
  useTheme,
} from "@mui/material";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import config from "../../../../state/config";
import { FormSectionObject } from "../../../../components/FormSection";

const GuestUpdateDialog = ({
  open,
  onClose,
  guest,
  onUpdate,
  showSnackbar,
  logUserAction,
}) => {
  const theme = useTheme();
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [formValues, setFormValues] = useState(null);

  const userId = localStorage.getItem("userId");

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("First Name is required"),
    lastName: Yup.string().required("Last Name is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required")
      .test(
        "checkDuplicateEmail",
        "Email already exists",
        async function (value) {
          if (!value || value === guest?.email) return true;
          try {
            const response = await axios.get(
              `${config.API_URL}/guests/email-exists/${guest?.id}`,
              { params: { email: value } }
            );
            return !response.data.exists;
          } catch (error) {
            return this.createError({
              message: `Unable to validate email: ${
                error?.response?.data?.message || error.message
              }`,
            });
          }
        }
      ),
    phoneNumber: Yup.string().required("Phone Number is required"),
  });

  const handleFormSubmit = (values) => {
    setFormValues(values);
    setConfirmationDialogOpen(true);
  };

  const handleConfirmationAccept = async () => {
    try {
      const response = await axios.put(
        `${config.API_URL}/guests/${guest.id}`,
        formValues
      );

      if (response.data.success) {
        onUpdate(formValues);
        showSnackbar("Guest updated successfully.", "success");
        logUserAction(userId, `Updated guest information for guest ID: ${guest.id}`);
        onClose();
      } else {
        showSnackbar("Failed to update Guest", "error");
      }
    } catch (error) {
      console.error("Failed to update the Guest:", error);
      showSnackbar("Server error occurred while updating the Guest.", "error");
    } finally {
      setConfirmationDialogOpen(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Guest Information</DialogTitle>
        <DialogContent>
          {guest && (
            <Formik
              initialValues={guest}
              validationSchema={validationSchema}
              onSubmit={handleFormSubmit}
            >
              {({ values, errors, touched, handleChange, handleSubmit }) => (
                <Form onSubmit={handleSubmit}>
                  <FormSectionObject component="fieldset" fullWidth>
                    {{
                      header: null,
                      content: (
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              margin="dense"
                              name="firstName"
                              label="First Name"
                              variant="outlined"
                              value={values.firstName}
                              onChange={handleChange}
                              error={
                                touched.firstName && Boolean(errors.firstName)
                              }
                              helperText={touched.firstName && errors.firstName}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              margin="dense"
                              name="lastName"
                              label="Last Name"
                              variant="outlined"
                              value={values.lastName}
                              onChange={handleChange}
                              error={
                                touched.lastName && Boolean(errors.lastName)
                              }
                              helperText={touched.lastName && errors.lastName}
                            />
                          </Grid>
                        </Grid>
                      ),
                    }}
                  </FormSectionObject>
                  <FormSectionObject>
                    {{
                      header: null,
                      content: (
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              margin="dense"
                              name="phoneNumber"
                              label="Phone Number"
                              variant="outlined"
                              value={values.phoneNumber}
                              onChange={handleChange}
                              error={
                                touched.phoneNumber &&
                                Boolean(errors.phoneNumber)
                              }
                              helperText={
                                touched.phoneNumber && errors.phoneNumber
                              }
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              margin="dense"
                              name="email"
                              label="Email"
                              variant="outlined"
                              value={values.email}
                              onChange={handleChange}
                              error={touched.email && Boolean(errors.email)}
                              helperText={touched.email && errors.email}
                            />
                          </Grid>
                        </Grid>
                      ),
                    }}
                  </FormSectionObject>
                  <DialogActions>
                    <Button
                      onClick={onClose}
                      variant="contained"
                      color="secondary"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="contained" color="primary">
                      Save
                    </Button>
                  </DialogActions>
                </Form>
              )}
            </Formik>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={confirmationDialogOpen} onClose={() => setConfirmationDialogOpen(false)}>
        <DialogTitle>Confirm Update</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to proceed with this update?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmationDialogOpen(false)}
            sx={{ color: theme.palette.secondary[700] }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmationAccept}
            sx={{ color: theme.palette.primary[700] }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

GuestUpdateDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  guest: PropTypes.shape({
    id: PropTypes.number.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    phoneNumber: PropTypes.string.isRequired,
  }),
  onUpdate: PropTypes.func.isRequired,
  showSnackbar: PropTypes.func.isRequired,
  logUserAction: PropTypes.func.isRequired,
};

export default GuestUpdateDialog;
