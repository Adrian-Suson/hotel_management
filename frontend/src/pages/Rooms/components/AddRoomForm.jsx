import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  Grid,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { useFormik } from "formik";
import * as Yup from "yup";
import PropTypes from "prop-types";
import config from "../../../state/config";
import { FormSectionObject } from "../../../components/FormSection";

const validationSchema = Yup.object({
  room_number: Yup.string().required("Room number is required"),
  room_type_id: Yup.string().required("Room type is required"),
  rate: Yup.number()
    .required("Rate is required")
    .positive("Rate must be positive"),
  status_code_id: Yup.string().required("Status is required"),
  max_people: Yup.number()
    .required("Max people is required")
    .positive("Max people must be a positive number"),
});

const AddRoomForm = ({ onRoomAdded, fetchRooms, showSnackbar, onCancel }) => {
  const [image, setImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true);
      try {
        const roomTypesResponse = await axios.get(
          `${config.API_URL}/room-types`
        );
        const statusOptionsResponse = await axios.get(
          `${config.API_URL}/status`
        );
        setRoomTypes(roomTypesResponse.data.roomTypes);
        setStatusOptions(statusOptionsResponse.data.statusOptions);
      } catch (error) {
        console.error("Failed to fetch room types or status options:", error);
      }
      setLoadingOptions(false);
    };
    fetchOptions();
  }, []);

  const formik = useFormik({
    initialValues: {
      room_number: "",
      room_type_id: "",
      rate: "",
      status_code_id: "",
      max_people: 2,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) =>
        formData.append(key, value)
      );
      if (image) formData.append("image", image);

      try {
        await axios.post(`${config.API_URL}/rooms`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        onRoomAdded();
        showSnackbar("Room added successfully!", "success");
        formik.resetForm();
        setImage(null);
        setImagePreviewUrl(null);
        fetchRooms();
      } catch (error) {
        showSnackbar("An error occurred. Please try again later.", "error");
        formik.setErrors({
          submit: "An error occurred. Please try again later.",
        });
      }
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Typography variant="h5" gutterBottom>
        Add New Room
      </Typography>
      <FormSectionObject>
        {{
          header: null,
          content: (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Room Number"
                  name="room_number"
                  type="number"
                  value={formik.values.room_number}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.room_number &&
                    Boolean(formik.errors.room_number)
                  }
                  helperText={
                    formik.touched.room_number && formik.errors.room_number
                  }
                  fullWidth
                  margin="normal"
                  required
                  inputProps={{ min: 0 }} // Prevent negative numbers
                  onInput={(e) => {
                    if (e.target.value < 0) e.target.value = 0; // Enforce no negative values
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Rate"
                  name="rate"
                  type="number"
                  value={formik.values.rate}
                  onChange={formik.handleChange}
                  error={formik.touched.rate && Boolean(formik.errors.rate)}
                  helperText={formik.touched.rate && formik.errors.rate}
                  fullWidth
                  margin="normal"
                  required
                  inputProps={{ min: 0 }} // Prevent negative numbers
                  onInput={(e) => {
                    if (e.target.value < 0) e.target.value = 0; // Enforce no negative values
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Room Type"
                  name="room_type_id"
                  value={formik.values.room_type_id}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.room_type_id &&
                    Boolean(formik.errors.room_type_id)
                  }
                  helperText={
                    formik.touched.room_type_id && formik.errors.room_type_id
                  }
                  fullWidth
                  margin="normal"
                  required
                >
                  {roomTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Status"
                  name="status_code_id"
                  value={formik.values.status_code_id}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.status_code_id &&
                    Boolean(formik.errors.status_code_id)
                  }
                  helperText={
                    formik.touched.status_code_id &&
                    formik.errors.status_code_id
                  }
                  fullWidth
                  margin="normal"
                  required
                >
                  {statusOptions.map((status) => (
                    <MenuItem key={status.id} value={status.id}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            backgroundColor: status.color,
                            marginRight: 1,
                            color: status.text_color,
                          }}
                        />
                        {status.label}
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              {/*<Grid item xs={12} md={6}>
                <TextField
                  label="Max People"
                  name="max_people"
                  type="number"
                  value={formik.values.max_people}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.max_people &&
                    Boolean(formik.errors.max_people)
                  }
                  helperText={
                    formik.touched.max_people && formik.errors.max_people
                  }
                  fullWidth
                  margin="normal"
                  required
                />
              </Grid>*/}
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{ mt: 2 }}
                  startIcon={<PhotoCamera />}
                >
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageChange}
                  />
                </Button>
              </Grid>
              <Grid item xs={12}>
                {image && (
                  <Box sx={{ mt: 2, textAlign: "center" }}>
                    <Typography variant="body2">{image.name}</Typography>
                    <img
                      src={imagePreviewUrl}
                      alt="Selected"
                      style={{ marginTop: 8, maxHeight: 200, maxWidth: "100%" }}
                    />
                  </Box>
                )}
              </Grid>
            </Grid>
          ),
        }}
      </FormSectionObject>
      {formik.errors.submit && (
        <Typography variant="body2" color="error" sx={{ mt: 2 }}>
          {formik.errors.submit}
        </Typography>
      )}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, my: 2 }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={formik.isSubmitting || loadingOptions}
        >
          {formik.isSubmitting || loadingOptions ? "Saving..." : "Add Room"}
        </Button>
        <Button onClick={onCancel} color="secondary" variant="contained">
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

AddRoomForm.propTypes = {
  onRoomAdded: PropTypes.func.isRequired,
  fetchRooms: PropTypes.func.isRequired,
  showSnackbar: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default AddRoomForm;
