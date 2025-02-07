import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Box,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import dayjs from "dayjs";

const DateUpdateDialog = ({
  open,
  onClose,
  checkInDate,
  checkOutDate,
  onUpdate,
}) => {
  const validationSchema = Yup.object({
    check_in: Yup.date().required("Check-in date is required"),
    check_out: Yup.date()
      .required("Check-out date is required")
      .min(
        Yup.ref("check_in"),
        "Check-out date cannot be before check-in date"
      ),
  });

  const handleUpdate = (values) => {
    onUpdate(values.check_in.toISOString(), values.check_out.toISOString());
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Update Check-in and Check-out Dates</DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Formik
            initialValues={{
              check_in: dayjs(checkInDate),
              check_out: dayjs(checkOutDate),
            }}
            validationSchema={validationSchema}
            onSubmit={handleUpdate}
          >
            {({ setFieldValue, errors, touched, values }) => (
              <Form>
                <Box mt={1}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <DatePicker
                        label="Check-in Date"
                        value={values.check_in}
                        onChange={(newValue) =>
                          setFieldValue("check_in", newValue)
                        }
                        shouldDisableDate={(date) =>
                          dayjs(date).isBefore(dayjs(), "day")
                        }
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: touched.check_in && Boolean(errors.check_in),
                            helperText: touched.check_in && errors.check_in,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DatePicker
                        label="Check-out Date"
                        value={values.check_out}
                        onChange={(newValue) =>
                          setFieldValue("check_out", newValue)
                        }
                        shouldDisableDate={(date) =>
                          dayjs(date).isBefore(dayjs(values.check_in), "day")
                        }
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error:
                              touched.check_out && Boolean(errors.check_out),
                            helperText: touched.check_out && errors.check_out,
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
                <DialogActions>
                  <Button onClick={onClose}>Cancel</Button>
                  <Button type="submit" color="primary">
                    Update
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </LocalizationProvider>
      </DialogContent>
    </Dialog>
  );
};

DateUpdateDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  checkInDate: PropTypes.string.isRequired,
  checkOutDate: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default DateUpdateDialog;
