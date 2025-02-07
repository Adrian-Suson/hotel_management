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

const GuestNumberUpdateDialog = ({
  open,
  onClose,
  reservation,
  onUpdate,
  showSnackbar,
}) => {
  const theme = useTheme();
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [formValues, setFormValues] = useState(null);

  const handleSubmit = (values) => {
    setFormValues(values);
    setConfirmationDialogOpen(true);
  };

  const handleConfirmationClose = () => {
    setConfirmationDialogOpen(false);
  };

  const handleConfirmationAccept = async () => {
    setConfirmationDialogOpen(false);
    try {
      const response = await axios.put(
        `${config.API_URL}/reservations/${reservation.id}`,
        formValues
      );

      if (response.data.success) {
        onUpdate({ ...reservation, ...formValues });
        showSnackbar("Guest numbers updated successfully.", "success");
        onClose();
      } else {
        showSnackbar(
          response.data.message || "Failed to update guest numbers.",
          "error"
        );
      }
    } catch (error) {
      console.error("Failed to update guest numbers:", error);
      showSnackbar(
        "Server error occurred while updating guest numbers.",
        "error"
      );
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Update Guest Numbers</DialogTitle>
        <DialogContent>
          {reservation && (
            <Formik
              initialValues={{
                adults: reservation.adults,
                kids: reservation.kids,
              }}
              validationSchema={Yup.object({
                adults: Yup.number()
                  .required("Number of adults is required")
                  .min(1, "Must have at least 1 adult"),
                kids: Yup.number().min(0, "Number of kids cannot be negative"),
              })}
              onSubmit={handleSubmit}
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
                              name="adults"
                              label="Adults"
                              type="number"
                              value={values.adults}
                              onChange={handleChange}
                              error={touched.adults && Boolean(errors.adults)}
                              helperText={touched.adults && errors.adults}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              margin="dense"
                              name="kids"
                              label="Kids"
                              type="number"
                              value={values.kids}
                              onChange={handleChange}
                              error={touched.kids && Boolean(errors.kids)}
                              helperText={touched.kids && errors.kids}
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
      <Dialog open={confirmationDialogOpen} onClose={handleConfirmationClose}>
        <DialogTitle>Confirm Update</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to update the guest numbers?
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

GuestNumberUpdateDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  reservation: PropTypes.shape({
    id: PropTypes.number.isRequired,
    adults: PropTypes.number.isRequired,
    kids: PropTypes.number.isRequired,
  }),
  onUpdate: PropTypes.func.isRequired,
  showSnackbar: PropTypes.func.isRequired,
};

export default GuestNumberUpdateDialog;
