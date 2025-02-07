import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ButtonGroup,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import useSnackbar from "../../../components/Snackbar/useSnackbar";
import CustomSnackbar from "../../../components/Snackbar/CustomSnackbar";
import axios from "axios";
import config from "../../../state/config";

const ServiceManagement = ({ logUserAction }) => {
  const [services, setServices] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [addServiceOpen, setAddServiceOpen] = useState(false);
  const [addDiscountOpen, setAddDiscountOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceDescription, setNewServiceDescription] = useState("");
  const [newServiceBasePrice, setNewServiceBasePrice] = useState("");
  const [newDiscountName, setNewDiscountName] = useState("");
  const [newDiscountPercentage, setNewDiscountPercentage] = useState("");
  const [discountError, setDiscountError] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteTargetType, setDeleteTargetType] = useState(null); // 'service' or 'discount'
  const [serviceListDialogOpen, setServiceListDialogOpen] = useState(false);
  const [discountListDialogOpen, setDiscountListDialogOpen] = useState(false);

  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const loggedInUserId = localStorage.getItem("userId");

  const fetchServices = useCallback(async () => {
    try {
      const response = await axios.get(`${config.API_URL}/service_list`);
      if (response.status === 200 && response.data.services) {
        const newServices = response.data.services.map((service) => ({
          ...service,
          base_price: parseFloat(service.base_price),
        }));
        setServices(newServices);
      }
    } catch (error) {
      console.error("Failed to fetch services:", error);
      showSnackbar("Failed to fetch services", "error");
    }
  }, [showSnackbar]);

  const fetchDiscounts = useCallback(async () => {
    try {
      const response = await axios.get(`${config.API_URL}/discounts`);
      if (response.status === 200 && response.data.discounts) {
        setDiscounts(response.data.discounts);
      }
    } catch (error) {
      console.error("Failed to fetch discounts:", error);
      showSnackbar("Failed to fetch discounts", "error");
    }
  }, [showSnackbar]);

  useEffect(() => {
    fetchServices();
    fetchDiscounts();
  }, [fetchServices, fetchDiscounts]);

  const handleAddService = async () => {
    try {
      const response = await axios.post(`${config.API_URL}/service_list`, {
        name: newServiceName,
        description: newServiceDescription,
        base_price: newServiceBasePrice,
      });
      setServices((prevServices) => [
        ...prevServices,
        {
          ...response.data.service,
          base_price: parseFloat(response.data.service.base_price),
        },
      ]);
      setNewServiceName("");
      setNewServiceDescription("");
      setNewServiceBasePrice("");
      setAddServiceOpen(false);
      showSnackbar("Service added successfully", "success");
      logUserAction(
        loggedInUserId,
        `Added new service: ${response.data.service.name}`
      );
    } catch (error) {
      console.error("Failed to add service:", error);
      showSnackbar("Failed to add service", "error");
    }
  };

  const handleAddDiscount = async () => {
    const percentage = parseFloat(newDiscountPercentage);
    if (percentage < 0 || percentage > 100) {
      setDiscountError("Discount percentage must be between 0 and 100.");
      return;
    }

    try {
      const response = await axios.post(`${config.API_URL}/discounts`, {
        name: newDiscountName,
        percentage,
      });
      setDiscounts((prevDiscounts) => [
        ...prevDiscounts,
        {
          id: response.data.discountId,
          name: newDiscountName,
          percentage,
        },
      ]);
      setNewDiscountName("");
      setNewDiscountPercentage("");
      setDiscountError("");
      setAddDiscountOpen(false);
      showSnackbar("Discount added successfully", "success");
      logUserAction(loggedInUserId, `Added new discount: ${newDiscountName}`);
    } catch (error) {
      console.error("Failed to add discount:", error);
      showSnackbar("Failed to add discount", "error");
    }
  };

  const handleDelete = async () => {
    const targetId = deleteTarget;
    const targetType = deleteTargetType;

    try {
      if (targetType === "service") {
        const response = await axios.delete(
          `${config.API_URL}/service_list/${targetId}`
        );
        if (response.data.success) {
          setServices((prevServices) =>
            prevServices.filter((service) => service.id !== targetId)
          );
          showSnackbar("Service deleted successfully", "success");
          logUserAction(loggedInUserId, `Deleted service: ${targetId}`);
        }
      } else if (targetType === "discount") {
        const response = await axios.delete(
          `${config.API_URL}/discounts/${targetId}`
        );
        if (response.data.success) {
          setDiscounts((prevDiscounts) =>
            prevDiscounts.filter((discount) => discount.id !== targetId)
          );
          showSnackbar("Discount deleted successfully", "success");
          logUserAction(loggedInUserId, `Deleted discount: ${targetId}`);
        }
      }
    } catch (error) {
      console.error(`Failed to delete ${targetType}:`, error);
      showSnackbar(`Failed to delete ${targetType}`, "error");
    }

    setDeleteDialogOpen(false);
  };

  const handleDeleteClick = (id, type) => {
    setDeleteTarget(id);
    setDeleteTargetType(type);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2, gap: 2 }}>
        <ButtonGroup color="primary">
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => setAddServiceOpen(true)}
          >
            Add Service
          </Button>
          <Button
            variant="outlined"
            onClick={() => setServiceListDialogOpen(true)}
          >
            Service Lists
          </Button>
        </ButtonGroup>
        <ButtonGroup color="primary">
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => setAddDiscountOpen(true)}
          >
            Add Discount
          </Button>
          <Button
            variant="outlined"
            onClick={() => setDiscountListDialogOpen(true)}
          >
            Discount Lists
          </Button>
        </ButtonGroup>
      </Box>

      {/* Add Service Dialog */}
      <Dialog open={addServiceOpen} onClose={() => setAddServiceOpen(false)}>
        <DialogTitle>Add Service</DialogTitle>
        <DialogContent>
          <TextField
            label="Service Name"
            value={newServiceName}
            onChange={(e) => setNewServiceName(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Service Description"
            value={newServiceDescription}
            onChange={(e) => setNewServiceDescription(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Base Price"
            type="number"
            value={newServiceBasePrice}
            onChange={(e) => setNewServiceBasePrice(e.target.value)}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={handleAddService}
            color="primary"
          >
            Add
          </Button>
          <Button
            variant="contained"
            onClick={() => setAddServiceOpen(false)}
            color="secondary"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Discount Dialog */}
      <Dialog open={addDiscountOpen} onClose={() => setAddDiscountOpen(false)}>
        <DialogTitle>Add Discount</DialogTitle>
        <DialogContent>
          <TextField
            label="Discount Name"
            value={newDiscountName}
            onChange={(e) => setNewDiscountName(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Discount Percentage"
            type="number"
            value={newDiscountPercentage}
            onChange={(e) => {
              setNewDiscountPercentage(e.target.value);
              setDiscountError(""); // Clear error when user types
            }}
            fullWidth
            margin="normal"
            helperText={discountError}
            error={!!discountError}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={handleAddDiscount}
            color="primary"
          >
            Add
          </Button>
          <Button
            variant="contained"
            onClick={() => setAddDiscountOpen(false)}
            color="secondary"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this {deleteTargetType}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={handleDelete}
            color="primary"
          >
            Delete
          </Button>
          <Button
            variant="contained"
            onClick={() => setDeleteDialogOpen(false)}
            color="secondary"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Service List Dialog */}
      <Dialog
        open={serviceListDialogOpen}
        onClose={() => setServiceListDialogOpen(false)}
      >
        <DialogTitle>Service List</DialogTitle>
        <DialogContent>
          <List>
            {services.map((service) => (
              <ListItem
                key={service.id}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteClick(service.id, "service")}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={service.name}
                  secondary={`Description: ${service.description}, Base Price: $${service.base_price.toFixed(2)}`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => setServiceListDialogOpen(false)}
            color="secondary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Discount List Dialog */}
      <Dialog
        open={discountListDialogOpen}
        onClose={() => setDiscountListDialogOpen(false)}
      >
        <DialogTitle>Discount List</DialogTitle>
        <DialogContent>
          <List>
            {discounts.map((discount) => (
              <ListItem
                key={discount.id}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteClick(discount.id, "discount")}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={discount.name}
                  secondary={`Percentage: ${discount.percentage}%`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => setDiscountListDialogOpen(false)}
            color="secondary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <CustomSnackbar snackbar={snackbar} onClose={closeSnackbar} />

    </>
  );
};

ServiceManagement.propTypes = {
  logUserAction: PropTypes.func.isRequired,
};

export default ServiceManagement;
