import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import config from "../../../state/config";
import CustomSnackbar from "../../../components/Snackbar/CustomSnackbar";
import useSnackbar from "../../../components/Snackbar/useSnackbar";

const Advertisements = () => {
  const [ads, setAds] = useState([]);
  const [addAdOpen, setAddAdOpen] = useState(false);
  const [newAdImage, setNewAdImage] = useState(null);
  const [newAdImageUrl, setNewAdImageUrl] = useState(null);
  const [newAdTitle, setNewAdTitle] = useState(""); 
  const [newAdDescription, setNewAdDescription] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar(); 

  const fetchAds = useCallback(async () => {
    try {
      const response = await axios.get(`${config.API_URL}/ads`);
      setAds(response.data);
    } catch (error) {
      console.error("Failed to fetch ads:", error);
    }
  }, []);
  
  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const handleAddAdOpen = () => {
    setAddAdOpen(true);
  };

  const handleAddAd = async () => {
    const formData = new FormData();
    formData.append("adImage", newAdImage);
    formData.append("title", newAdTitle);
    formData.append("description", newAdDescription);

    try {
      const response = await axios.post(
        `${config.API_URL}/upload-ad`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const newAd = {
        id: response.data.id,
        image_url: response.data.image_url,
        title: newAdTitle,
        description: newAdDescription,
      };
      setAds([...ads, newAd]);
      setNewAdImage(null);
      setNewAdImageUrl(null);
      setNewAdTitle("");
      setNewAdDescription("");
      setAddAdOpen(false);
      fetchAds();
      showSnackbar("Advertisement added successfully", "success");
    } catch (error) {
      console.error("Failed to add advertisement:", error);
      showSnackbar("Failed to add advertisement", "error");
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteTarget(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteAd = async (id) => {
    try {
      const response = await axios.delete(`${config.API_URL}/ad/${id}`);
      if (response.status === 200) {
        setAds(ads.filter((ad) => ad.id !== id));
        showSnackbar("Advertisement deleted successfully", "success");
      } else {
        console.error(response.data.message);
        showSnackbar(response.data.message, "error");
      }
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete advertisement:", error);
      showSnackbar("Failed to delete advertisement", "error");
    }
  };

  const confirmDelete = () => {
    handleDeleteAd(deleteTarget);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setNewAdImage(file);
    setNewAdImageUrl(URL.createObjectURL(file));
  };

  return (
    <Box>
      <Typography variant="h6">Advertisements</Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleAddAdOpen}
        >
          Add Advertisement
        </Button>
        <Grid container spacing={2}>
          {ads.map((ad) => (
            <Grid item xs={12} sm={6} md={4} key={ad.id}>
              <Card>
                <img
                  src={`${config.API_URL}/advertisements/${ad.image_url}`}
                  alt={`Ad ${ad.title}`}
                  style={{ width: "100%", height: "auto" }}
                />
                <CardContent>
                  <Typography variant="h6">{ad.title}</Typography>
                  <Typography variant="body2">{ad.description}</Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteClick(ad.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Dialog open={addAdOpen} onClose={() => setAddAdOpen(false)}>
        <DialogTitle>Add Advertisement</DialogTitle>
        <DialogContent>
          <Button variant="contained" component="label" fullWidth>
            Upload Image
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />
          </Button>
          {newAdImageUrl && (
            <Box mt={2}>
              <img
                src={newAdImageUrl}
                alt="Selected"
                style={{ width: "100%", height: "auto", borderRadius: 8 }}
              />
            </Box>
          )}
          <TextField
            label="Title"
            value={newAdTitle}
            onChange={(e) => setNewAdTitle(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Description"
            value={newAdDescription}
            onChange={(e) => setNewAdDescription(e.target.value)}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleAddAd} color="primary">
            Add
          </Button>
          <Button variant="contained" onClick={() => setAddAdOpen(false)} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this item?</Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setDeleteDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button variant="contained" onClick={confirmDelete} color="primary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <CustomSnackbar snackbar={snackbar} onClose={closeSnackbar} />
    </Box>
  );
};

Advertisements.propTypes = {
  ads: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      image_url: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
    })
  ),
};

export default Advertisements;
