import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import PropTypes from "prop-types";
import axios from "axios";
import config from "../../../state/config";

const AddDiscountDialog = ({
  open,
  onClose,
  onAddDiscount,
  fetchDiscounts,
}) => {
  const [discountName, setDiscountName] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");

  const handleAddDiscount = async () => {
    const percentage = parseFloat(discountPercentage);

    if (
      discountName.trim() === "" ||
      isNaN(percentage) ||
      percentage <= 0 ||
      percentage > 100
    ) {
      setAlertSeverity("error");
      setSnackbarMessage(
        "Invalid discount name or percentage. Please enter a valid name and percentage between 0 and 100."
      );
      setSnackbarOpen(true);
      return;
    }

    try {
      const { data } = await axios.post(`${config.API_URL}/discounts`, {
        name: discountName,
        percentage,
      });
      onAddDiscount(data.discount);
      setAlertSeverity("success");
      setSnackbarMessage("Discount added successfully");
      setSnackbarOpen(true);
      setDiscountName("");
      setDiscountPercentage("");
      fetchDiscounts();
      onClose();
    } catch (error) {
      console.error("Failed to add discount:", error);
      setAlertSeverity("error");
      setSnackbarMessage(
        error.response?.data?.message ||
          "Failed to add discount. Please try again."
      );
      setSnackbarOpen(true);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Discount</DialogTitle>
        <DialogContent>
          <TextField
            label="Discount Name"
            value={discountName}
            onChange={(e) => setDiscountName(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Discount Percentage"
            type="number"
            value={discountPercentage}
            onChange={(e) => setDiscountPercentage(e.target.value)}
            fullWidth
            margin="normal"
            helperText="Enter a value between 0 and 100"
            required
            inputProps={{ min: 0, max: 100 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="contained" color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleAddDiscount}
            variant="contained"
            color="primary"
          >
            Add Discount
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={alertSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

AddDiscountDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAddDiscount: PropTypes.func.isRequired,
  fetchDiscounts: PropTypes.func.isRequired,
};

export default AddDiscountDialog;