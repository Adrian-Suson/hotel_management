import { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Grid,
  Box,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useFormik } from "formik";
import * as yup from "yup";
import axios from "axios";
import PropTypes from "prop-types";
import config from "../../../state/config";
import dayjs from "dayjs";
import RoomSelectionDialog from "./RoomSelectionDialog";
import WebcamCaptureDialog from "./WebcamCaptureDialog";
import {
  FormSectionArray,
  FormSectionFunction,
} from "../../../components/FormSection";

// Validation schema for the form
const validationSchema = (initialGuestData) =>
  yup.object({
    firstName: yup
      .string()
      .required("First name is required")
      .min(2, "First name should have at least 2 characters")
      .max(50, "First name should not exceed 50 characters")
      .matches(
        /^[a-zA-Z. ]+$/,
        "First name should only contain letters, spaces, and periods"
      ),
    lastName: yup
      .string()
      .required("Last name is required")
      .min(2, "Last name should have at least 2 characters")
      .max(50, "Last name should not exceed 50 characters")
      .matches(
        /^[a-zA-Z. ]+$/,
        "Last name should only contain letters, spaces, and periods"
      ),
    phoneNumber: yup
      .string()
      .matches(/^0[0-9\s]*$/, "Phone number must contain only digits")
      .min(10, "Phone number should be at least 10 digits")
      .max(15, "Phone number should not exceed 15 digits")
      .required("Phone number is required"),
    email: yup
      .string()
      .email("Please enter a valid email address")
      .required("Email is required"),
    checkInDate: yup
      .date()
      .required("Check-in date is required")
      .min(
        dayjs().startOf("day").toDate(),
        "Check-in date cannot be in the past"
      ),
    checkOutDate: yup
      .date()
      .required("Check-out date is required")
      .min(
        yup.ref("checkInDate"),
        "Check-out date cannot be before check-in date"
      ),
    adults: yup
      .number()
      .min(1, "At least one adult is required")
      .max(10, "Number of adults cannot exceed 10")
      .required("Number of adults is required"),
    kids: yup
      .number()
      .min(0, "Number of kids cannot be negative")
      .max(10, "Number of kids cannot exceed 10"),
    room_id: yup.string().required("Room selection is required"),
    id_picture: yup
      .mixed()
      .test(
        "required",
        "ID picture is required",
        (value) => value || initialGuestData?.id_picture
      ),
  });

const steps = ["Guest Information", "Stay Record Details", "Review & Complete"];

const NewStayRecordForm = ({
  open,
  onClose,
  showSnackbar,
  roomStatus,
  roomSelection,
  initialGuestData,
  logUserAction,
  LogUserId,
}) => {
  const [rooms, setRooms] = useState([]);
  const [openRoomDialog, setOpenRoomDialog] = useState(false);
  const [openWebcamDialog, setOpenWebcamDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    fetchRooms();
    if (initialGuestData?.id_picture) {
      setPreviewUrl(
        `${config.API_URL}/id_picture/${initialGuestData.id_picture}`
      );
    }
  }, [initialGuestData]);

  // Fetch available rooms
  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/rooms`);
      setRooms(response.data.rooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  // Function to handle phone number formatting
  const handleNumberInputChange = (field, event) => {
    const value = event.target.value;
    formik.setFieldValue(field, formatPhoneNumber(value));
  };

  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{4})(\d{3})(\d{4})$/);
    if (match) {
      return `${match[1]} ${match[2]} ${match[3]}`;
    }
    return value;
  };

  const handleChangeRoomStatus = async (roomId, statusId) => {
    try {
      await axios.put(`${config.API_URL}/rooms/${roomId}/status`, {
        status_code_id: statusId,
      });
    } catch (error) {
      console.error("Error updating room status:", error);
    }
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      firstName: initialGuestData?.first_name || "",
      lastName: initialGuestData?.last_name || "",
      phoneNumber: initialGuestData?.phone || "",
      email: initialGuestData?.email || "",
      checkInDate: null,
      checkOutDate: null,
      adults: 1,
      kids: 0,
      room_id: "",
    },
    validationSchema: validationSchema(initialGuestData),
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        formData.append("firstName", values.firstName);
        formData.append("lastName", values.lastName);
        formData.append("email", values.email);
        formData.append("phoneNumber", values.phoneNumber);
        formData.append("room_id", values.room_id);
        formData.append(
          "check_in",
          dayjs(values.checkInDate).format("YYYY-MM-DD")
        );
        formData.append(
          "check_out",
          dayjs(values.checkOutDate).format("YYYY-MM-DD")
        );
        formData.append("adults", values.adults);
        formData.append("kids", values.kids);
        formData.append("room_status", roomStatus);
        if (file) {
          formData.append("id_picture", file);
        }

        const response = await axios.post(
          `${config.API_URL}/makeStayRecord`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data.success) {
          showSnackbar("Stay record created successfully!", "success");
          await handleChangeRoomStatus(values.room_id, roomStatus);
          onClose();
          logUserAction(
            LogUserId,
            `Created stay record for guest ID: ${initialGuestData.id}`
          );
        } else {
          throw new Error(response.data.message);
        }
      } catch (error) {
        console.error("Stay record Error:", error);
        showSnackbar(
          error.response?.data?.message ||
            "An error occurred during stay record.",
          error.response?.data?.message === "Email already exists."
            ? "warning"
            : "error"
        );
      }
    },
  });

  // Function to disable dates in the past
  const shouldDisableDate = (date) => {
    return dayjs(date).isBefore(dayjs(), "day");
  };

  // Function to select room
  const handleSelectRoom = (roomId) => {
    formik.setFieldValue("room_id", roomId);
    const room = rooms.find((room) => room.id === roomId);
    setSelectedRoom(room);
    setOpenRoomDialog(false);
  };

  const handleNextGuestInfo = async () => {
    const guestInfoErrors = await formik.validateForm();
    if (
      !guestInfoErrors.firstName &&
      !guestInfoErrors.lastName &&
      !guestInfoErrors.phoneNumber &&
      !guestInfoErrors.email
    ) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    } else {
      formik.setTouched({
        firstName: true,
        lastName: true,
        phoneNumber: true,
        email: true,
      });
      showSnackbar("Please fill all required fields correctly.", "error");
    }
  };

  const handleNextStayRecordDetails = async () => {
    const stayRecordDetailsErrors = await formik.validateForm();
    if (
      !stayRecordDetailsErrors.checkInDate &&
      !stayRecordDetailsErrors.checkOutDate &&
      !stayRecordDetailsErrors.adults &&
      !stayRecordDetailsErrors.kids &&
      !stayRecordDetailsErrors.room_id
    ) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    } else {
      formik.setTouched({
        checkInDate: true,
        checkOutDate: true,
        adults: true,
        kids: true,
        room_id: true,
      });
      showSnackbar("Please fill all required fields correctly.", "error");
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (activeStep === 0) {
      handleNextGuestInfo();
    } else if (activeStep === 1) {
      handleNextStayRecordDetails();
    } else if (activeStep === steps.length - 1) {
      formik.handleSubmit();
    }
  };

  // Handle file input change
  const handleFileChange = (event) => {
    const newFile = event.target.files[0];
    setFile(newFile);
    setPreviewUrl(URL.createObjectURL(newFile)); 
  };

  // Handle image capture from webcam
  const handleCapture = (imageSrc) => {
    const newFile = dataURLtoFile(imageSrc, "captured_id.jpg");
    setFile(newFile);
    setPreviewUrl(imageSrc);
  };

  // Convert data URL to file object
  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const calculateTotalRate = (checkInDate, checkOutDate, roomRate) => {
    const checkIn = dayjs(checkInDate);
    const checkOut = dayjs(checkOutDate);
    const numberOfDays = checkOut.diff(checkIn, "day") || 1;
    return numberOfDays * roomRate;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography>Stay Record</Typography>
      </DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <form onSubmit={handleSubmit}>
            {activeStep === 0 && (
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <FormSectionArray>
                  <Typography variant="h6" gutterBottom>
                    Guest Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        margin="dense"
                        name="firstName"
                        label="First Name"
                        type="text"
                        variant="outlined"
                        value={formik.values.firstName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                          formik.touched.firstName &&
                          Boolean(formik.errors.firstName)
                        }
                        helperText={
                          formik.touched.firstName && formik.errors.firstName
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        margin="dense"
                        name="lastName"
                        label="Last Name"
                        type="text"
                        variant="outlined"
                        value={formik.values.lastName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                          formik.touched.lastName &&
                          Boolean(formik.errors.lastName)
                        }
                        helperText={
                          formik.touched.lastName && formik.errors.lastName
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        margin="dense"
                        name="phoneNumber"
                        label="Phone Number"
                        type="text"
                        variant="outlined"
                        value={formik.values.phoneNumber}
                        onChange={(e) =>
                          handleNumberInputChange("phoneNumber", e)
                        }
                        onBlur={formik.handleBlur}
                        error={
                          formik.touched.phoneNumber &&
                          Boolean(formik.errors.phoneNumber)
                        }
                        helperText={
                          formik.touched.phoneNumber &&
                          formik.errors.phoneNumber
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        margin="dense"
                        name="email"
                        label="Email"
                        type="email"
                        variant="outlined"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                          formik.touched.email && Boolean(formik.errors.email)
                        }
                        helperText={formik.touched.email && formik.errors.email}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormSectionArray>
                        <Typography
                          variant="body1"
                          sx={{ color: "primary.main" }}
                        >
                          Please upload a valid ID to confirm the Stay Record.
                        </Typography>
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <input
                            type="file"
                            onChange={handleFileChange}
                            accept="image/*"
                            style={{ display: "none" }}
                            id="upload-photo"
                          />
                          <label htmlFor="upload-photo">
                            <Button
                              variant="contained"
                              color="primary"
                              component="span"
                            >
                              Upload ID
                            </Button>
                          </label>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setOpenWebcamDialog(true)}
                            sx={{ ml: 2 }}
                          >
                            Capture ID
                          </Button>
                        </Box>
                        {previewUrl && (
                          <Box mt={2} textAlign="center">
                            <Typography variant="subtitle1">
                              Selected ID Picture:
                            </Typography>
                            <img
                              src={previewUrl}
                              alt="Selected ID"
                              style={{ maxWidth: "100%", maxHeight: "200px" }}
                            />
                          </Box>
                        )}
                      </FormSectionArray>
                    </Grid>
                  </Grid>
                </FormSectionArray>
              </Grid>
            )}
            {activeStep === 1 && (
              <Grid container spacing={2} mt="1px">
                <FormSectionFunction>
                  {() => (
                    <>
                      <Typography variant="h6" gutterBottom>
                        Stay Record Details
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <DatePicker
                            label="Check-in Date"
                            value={formik.values.checkInDate}
                            onChange={(newValue) =>
                              formik.setFieldValue("checkInDate", newValue)
                            }
                            onBlur={() =>
                              formik.setFieldTouched("checkInDate", true)
                            }
                            slotProps={{
                              textField: {
                                error:
                                  formik.touched.checkInDate &&
                                  Boolean(formik.errors.checkInDate),
                                helperText:
                                  formik.touched.checkInDate &&
                                  formik.errors.checkInDate,
                              },
                            }}
                            shouldDisableDate={shouldDisableDate}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <DatePicker
                            label="Check-out Date"
                            value={formik.values.checkOutDate}
                            onChange={(newValue) =>
                              formik.setFieldValue("checkOutDate", newValue)
                            }
                            onBlur={() =>
                              formik.setFieldTouched("checkOutDate", true)
                            }
                            slotProps={{
                              textField: {
                                error:
                                  formik.touched.checkOutDate &&
                                  Boolean(formik.errors.checkOutDate),
                                helperText:
                                  formik.touched.checkOutDate &&
                                  formik.errors.checkOutDate,
                              },
                            }}
                            shouldDisableDate={shouldDisableDate}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            margin="dense"
                            name="adults"
                            label="Number of Adults"
                            type="number"
                            variant="outlined"
                            value={formik.values.adults}
                            onChange={(e) =>
                              handleNumberInputChange("adults", e)
                            }
                            onInput={(e) => {
                              e.target.value = e.target.value.replace(
                                /[^0-9]/g,
                                ""
                              );
                            }}
                            error={
                              formik.touched.adults &&
                              Boolean(formik.errors.adults)
                            }
                            helperText={
                              formik.touched.adults && formik.errors.adults
                            }
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            margin="dense"
                            name="kids"
                            label="Number of Kids"
                            type="number"
                            variant="outlined"
                            value={formik.values.kids}
                            onChange={(e) => handleNumberInputChange("kids", e)}
                            onInput={(e) => {
                              e.target.value = e.target.value.replace(
                                /[^0-9]/g,
                                ""
                              );
                            }}
                            error={
                              formik.touched.kids && Boolean(formik.errors.kids)
                            }
                            helperText={
                              formik.touched.kids && formik.errors.kids
                            }
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Box mt={2}>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => setOpenRoomDialog(true)}
                              fullWidth
                            >
                              Select Room
                            </Button>
                            {formik.touched.room_id &&
                              formik.errors.room_id && (
                                <Typography color="error" mt={1}>
                                  {formik.errors.room_id}
                                </Typography>
                              )}
                            {selectedRoom && (
                              <Typography mt={2}>
                                <strong>Selected Room:</strong>{" "}
                                {selectedRoom.room_number} -{" "}
                                {selectedRoom.room_type} - ₱{selectedRoom.rate}
                              </Typography>
                            )}
                          </Box>
                        </Grid>
                      </Grid>
                    </>
                  )}
                </FormSectionFunction>
              </Grid>
            )}
            {activeStep === 2 && (
              <Grid container spacing={2} mt="1px">
                <FormSectionFunction>
                  {() => (
                    <>
                      <Typography variant="h6" gutterBottom>
                        Review & Complete
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography variant="body1">
                            <strong>First Name:</strong>{" "}
                            {formik.values.firstName}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body1">
                            <strong>Last Name:</strong> {formik.values.lastName}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body1">
                            <strong>Phone Number:</strong>{" "}
                            {formik.values.phoneNumber}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body1">
                            <strong>Email:</strong> {formik.values.email}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body1">
                            <strong>Check-in Date:</strong>{" "}
                            {dayjs(formik.values.checkInDate).format(
                              "YYYY-MM-DD"
                            )}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body1">
                            <strong>Check-out Date:</strong>{" "}
                            {dayjs(formik.values.checkOutDate).format(
                              "YYYY-MM-DD"
                            )}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body1">
                            <strong>Number of Adults:</strong>{" "}
                            {formik.values.adults}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body1">
                            <strong>Number of Kids:</strong>{" "}
                            {formik.values.kids}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body1">
                            <strong>Selected Room:</strong>{" "}
                            {selectedRoom
                              ? `${selectedRoom.room_number} - ${selectedRoom.room_type}`
                              : "No room selected"}
                          </Typography>
                        </Grid>
                        {previewUrl && (
                          <Grid item xs={12}>
                            <Typography variant="body1">
                              <strong>ID Picture:</strong>
                            </Typography>
                            <Box mt={2} textAlign="center">
                              <img
                                src={previewUrl}
                                alt="Selected ID"
                                style={{
                                  maxWidth: "100%",
                                  maxHeight: "200px",
                                }}
                              />
                            </Box>
                          </Grid>
                        )}
                        <Grid item xs={12}>
                          <Typography variant="body1">
                            <strong>Total Rate:</strong> ₱
                            {selectedRoom
                              ? calculateTotalRate(
                                  formik.values.checkInDate,
                                  formik.values.checkOutDate,
                                  selectedRoom.rate
                                )
                              : "0"}
                          </Typography>
                        </Grid>
                      </Grid>
                    </>
                  )}
                </FormSectionFunction>
              </Grid>
            )}
            <DialogActions>
              {activeStep !== 0 && (
                <Button
                  onClick={handleBack}
                  color="secondary"
                  variant="contained"
                >
                  Back
                </Button>
              )}
              <Button
                type="submit"
                color="primary"
                variant="contained"
                disabled={
                  activeStep === steps.length - 1 &&
                  (!formik.isValid || !formik.dirty)
                }
              >
                {activeStep === steps.length - 1
                  ? "Complete Stay Record"
                  : "Next"}
              </Button>
              {activeStep === 2 && (
                <Button onClick={onClose} color="secondary" variant="contained">
                  Cancel
                </Button>
              )}
            </DialogActions>
          </form>
        </LocalizationProvider>
      </DialogContent>
      <RoomSelectionDialog
        roomSelection={roomSelection}
        open={openRoomDialog}
        onClose={() => setOpenRoomDialog(false)}
        rooms={rooms}
        onSelectRoom={handleSelectRoom}
      />
      <WebcamCaptureDialog
        open={openWebcamDialog}
        onClose={() => setOpenWebcamDialog(false)}
        onCapture={handleCapture}
      />
    </Dialog>
  );
};

NewStayRecordForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  showSnackbar: PropTypes.func.isRequired,
  roomStatus: PropTypes.number.isRequired,
  roomSelection: PropTypes.number.isRequired,
  initialGuestData: PropTypes.shape({
    id: PropTypes.number,
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    phone: PropTypes.string,
    email: PropTypes.string,
    id_picture: PropTypes.string,
  }),
  logUserAction: PropTypes.func.isRequired,
  LogUserId: PropTypes.string.isRequired,
};

export default NewStayRecordForm;
