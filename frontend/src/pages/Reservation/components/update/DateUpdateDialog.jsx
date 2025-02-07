import { useState } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  DialogContentText,
  useTheme,
} from "@mui/material";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import config from "../../../../state/config";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { FormSectionObject } from "../../../../components/FormSection";

const DateUpdateDialog = ({
  open,
  onClose,
  reservation,
  onUpdate,
  showSnackbar,
}) => {
  const theme = useTheme();
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [formValues, setFormValues] = useState(null);

  const shouldDisableDate = (date) => {
    return dayjs(date).isBefore(dayjs(), "day");
  };

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
        {
          check_in: formValues.check_in.toISOString(),
          check_out: formValues.check_out.toISOString(),
        }
      );

      if (response.data.success) {
        onUpdate({ ...reservation, ...formValues });
        showSnackbar("Dates updated successfully.", "success");
        onClose();
      } else {
        showSnackbar(
          response.data.message || "Failed to update dates.",
          "error"
        );
      }
    } catch (error) {
      console.error("Failed to update the dates:", error);
      showSnackbar("Server error occurred while updating the dates.", "error");
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Update Check-in and Check-out Dates</DialogTitle>
        <DialogContent>
          {reservation && (
            <Formik
              initialValues={{
                check_in: dayjs(reservation.check_in),
                check_out: dayjs(reservation.check_out),
              }}
              validationSchema={Yup.object({
                check_in: Yup.date()
                  .required("Check-in date is required")
                  .min(
                    dayjs().startOf("day").toDate(),
                    "Check-in date cannot be in the past"
                  ),
                check_out: Yup.date()
                  .required("Check-out date is required")
                  .min(
                    Yup.ref("check_in"),
                    "Check-out date cannot be before check-in date"
                  ),
              })}
              onSubmit={handleSubmit}
            >
              {({
                values,
                errors,
                touched,
                setFieldValue,
                handleSubmit,
                setFieldTouched,
              }) => (
                <Form onSubmit={handleSubmit}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <FormSectionObject component="fieldset" fullWidth>
                      {{
                        header: null,
                        content: (
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <DatePicker
                                label="Check-in Date"
                                value={values.check_in}
                                onChange={(newValue) =>
                                  setFieldValue("check_in", newValue)
                                }
                                onBlur={() => setFieldTouched("check_in", true)}
                                slotProps={{
                                  textField: {
                                    error:
                                      touched.check_in &&
                                      Boolean(errors.check_in),
                                    helperText:
                                      touched.check_in && errors.check_in,
                                  },
                                }}
                                shouldDisableDate={shouldDisableDate}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <DatePicker
                                label="Check-out Date"
                                value={values.check_out}
                                onChange={(newValue) =>
                                  setFieldValue("check_out", newValue)
                                }
                                onBlur={() =>
                                  setFieldTouched("check_out", true)
                                }
                                slotProps={{
                                  textField: {
                                    error:
                                      touched.check_out &&
                                      Boolean(errors.check_out),
                                    helperText:
                                      touched.check_out && errors.check_out,
                                  },
                                }}
                                shouldDisableDate={shouldDisableDate}
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
                  </LocalizationProvider>
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
            Are you sure you want to update the check-in and check-out dates?
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

DateUpdateDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  reservation: PropTypes.shape({
    id: PropTypes.number.isRequired,
    check_in: PropTypes.string.isRequired,
    check_out: PropTypes.string.isRequired,
  }),
  onUpdate: PropTypes.func.isRequired,
  showSnackbar: PropTypes.func.isRequired,
};

export default DateUpdateDialog;
