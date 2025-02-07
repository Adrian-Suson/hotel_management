import { useState, useEffect } from "react";
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
  Typography,
  Box,
} from "@mui/material";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import config from "../../../../state/config";
import {
  FormSectionObject,
  FormSectionArray,
} from "../../../../components/FormSection";

const GuestUpdateDialog = ({ open, onClose, guest, onUpdate, showSnackbar }) => {
  const theme = useTheme();
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [formValues, setFormValues] = useState(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (guest && guest.id_picture) {
      setPreviewUrl(`${config.API_URL}/id_picture/${guest.id_picture}`);
    }
  }, [guest]);

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

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleConfirmationAccept = async () => {
    try {
      const formData = new FormData();
      formData.append("firstName", formValues.firstName);
      formData.append("lastName", formValues.lastName);
      formData.append("email", formValues.email);
      formData.append("phoneNumber", formValues.phoneNumber);
      if (file) {
        formData.append("id_picture", file);
      }

      const response = await axios.put(
        `${config.API_URL}/guests/${guest.id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.success) {
        onUpdate(formValues);
        showSnackbar("Guest information updated successfully", "success");
        onClose();
      } else {
        showSnackbar(
          response.data.message || "Failed to update guest information",
          "error"
        );
      }
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || "Failed to update guest information",
        "error"
      );
    } finally {
      setConfirmationDialogOpen(false);
    }
  };

  const handleConfirmationClose = () => {
    setConfirmationDialogOpen(false);
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
                  <FormSectionObject>
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
                  <FormSectionObject>
                    {{
                      header: null,
                      content: (
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <FormSectionArray>
                              <DialogContentText>
                                Please upload a valid ID to confirm the
                                reservation.
                              </DialogContentText>
                              <input
                                type="file"
                                onChange={handleFileChange}
                                accept="image/*"
                              />
                              {(file || previewUrl) && (
                                <Box mt={2} textAlign="center">
                                  <Typography variant="subtitle1">
                                    {file
                                      ? "Selected ID Picture:"
                                      : "Current ID Picture:"}
                                  </Typography>
                                  <img
                                    src={previewUrl}
                                    alt="ID"
                                    style={{
                                      maxWidth: "100%",
                                      maxHeight: "200px",
                                    }}
                                  />
                                </Box>
                              )}
                            </FormSectionArray>
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
      <Dialog open={confirmationDialogOpen} onClose={handleConfirmationClose}>
        <DialogTitle>Confirm Update</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to proceed with this update?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleConfirmationClose}
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
    id_picture: PropTypes.string,
  }),
  onUpdate: PropTypes.func.isRequired,
  showSnackbar: PropTypes.func.isRequired,
};

export default GuestUpdateDialog;
