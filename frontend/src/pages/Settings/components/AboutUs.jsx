import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import axios from "axios";
import config from "../../../state/config";
import CustomSnackbar from "../../../components/Snackbar/CustomSnackbar";
import useSnackbar from "../../../components/Snackbar/useSnackbar";

const AboutUs = () => {
  const [aboutUs, setAboutUs] = useState({ title: "", description: "" });
  const [editAboutUsOpen, setEditAboutUsOpen] = useState(false);
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchAboutUs = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/about-us`);
        if (response.data) {
          setAboutUs(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch About Us data:", error);
      }
    };
    fetchAboutUs();
  }, []);

  const handleEditAboutUsOpen = () => {
    setEditAboutUsOpen(true);
  };

  const handleSaveAboutUs = async () => {
    try {
      const response = await axios.put(`${config.API_URL}/about-us`, aboutUs);
      setAboutUs(response.data);
      setEditAboutUsOpen(false);
      showSnackbar("About Us section updated successfully", "success");
    } catch (error) {
      console.error("Failed to update About Us section:", error);
      showSnackbar("Failed to update About Us section", "error");
    }
  };

  return (
    <Box>
      <Typography variant="h6">About Us</Typography>
      <Box>
        <Typography variant="subtitle1">Title</Typography>
        <Typography variant="body1">{aboutUs.title}</Typography>
        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          Description
        </Typography>
        <Typography variant="body1">{aboutUs.description}</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleEditAboutUsOpen}
          sx={{ mt: 2 }}
        >
          Edit About Us
        </Button>
      </Box>

      <Dialog open={editAboutUsOpen} onClose={() => setEditAboutUsOpen(false)}>
        <DialogTitle>Edit About Us</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            value={aboutUs.title}
            onChange={(e) =>
              setAboutUs((prev) => ({ ...prev, title: e.target.value }))
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Description"
            value={aboutUs.description}
            onChange={(e) =>
              setAboutUs((prev) => ({ ...prev, description: e.target.value }))
            }
            fullWidth
            margin="normal"
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSaveAboutUs} color="primary">
            Save
          </Button>
          <Button onClick={() => setEditAboutUsOpen(false)} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <CustomSnackbar snackbar={snackbar} onClose={closeSnackbar} />
    </Box>
  );
};

AboutUs.propTypes = {
  aboutUs: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
  }),
};

export default AboutUs;
