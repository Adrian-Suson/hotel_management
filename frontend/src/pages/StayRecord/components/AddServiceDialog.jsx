import { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Box,
  Button,
  FormControl,
  FormHelperText,
  List,
  ListItem,
  Typography,
  Fade,
  MenuItem,
  Select,
  InputLabel,
  IconButton,
} from "@mui/material";
import PropTypes from "prop-types";
import axios from "axios";
import { useTheme } from "@mui/material/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import config from "../../../state/config";
import { FormSectionArray } from "../../../components/FormSection";

const AddServiceDialog = ({
  open,
  onClose,
  stayRecordId,
  showSnackbar,
  userId,
  logUserAction,
  fetchStayRecords,
}) => {
  const theme = useTheme();
  const [serviceList, setServiceList] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [services, setServices] = useState([]);
  const [error, setError] = useState("");

  const fetchServices = useCallback(async () => {
    try {
      const response = await axios.get(
        `${config.API_URL}/stay_records/${stayRecordId}/services`
      );
      setServices(response.data.services);
    } catch (error) {
      console.error("Failed to fetch services:", error);
      setError("Failed to fetch services. Please try again.");
    }
  }, [stayRecordId]);

  const fetchServiceList = useCallback(async () => {
    try {
      const response = await axios.get(`${config.API_URL}/service_list`);
      setServiceList(response.data.services);
    } catch (error) {
      console.error("Failed to fetch service list:", error);
      setError("Failed to fetch service list. Please try again.");
    }
  }, []);

  useEffect(() => {
    if (open) {
      setSelectedServiceId("");
      setError("");
      fetchServices();
      fetchServiceList();
    }
  }, [open, fetchServices, fetchServiceList]);

  const handleAddService = async () => {
    if (!selectedServiceId) {
      setError("You must select a service to add.");
      return;
    }

    const selectedService = serviceList.find(
      (service) => service.id === parseInt(selectedServiceId)
    );

    if (!selectedService) {
      setError("Selected service not found.");
      return;
    }

    try {
      const response = await axios.post(
        `${config.API_URL}/stay_records/${stayRecordId}/services`,
        {
          service_list_id: selectedServiceId,
          price: selectedService.base_price,
          name: selectedService.name,
        }
      );

      const newService = {
        ...response.data.service,
        name: selectedService.name, 
      };

      setServices((prevServices) => [...prevServices, newService]);
      setSelectedServiceId("");
      setError("");
      showSnackbar("Service added successfully", "success");
      fetchStayRecords();
      logUserAction(
        userId,
        `Added service '${selectedService.name}' to stay record ID: ${stayRecordId}`
      );
    } catch (error) {
      console.error("Failed to add service:", error);
      setError("Failed to add service. Please try again.");
      showSnackbar("Failed to add service. Please try again.", "error");
    }
  };

  const handleDeleteService = async (serviceId) => {
    try {
      await axios.delete(
        `${config.API_URL}/stay_records/${stayRecordId}/services/${serviceId}`
      );
      setServices((prevServices) =>
        prevServices.filter((service) => service.id !== serviceId)
      );
      showSnackbar("Service removed successfully", "success");
      fetchStayRecords();
      logUserAction(
        userId,
        `Removed service ID: ${serviceId} from stay record ID: ${stayRecordId}`
      );
    } catch (error) {
      console.error("Failed to remove service:", error);
      setError("Failed to remove service. Please try again.");
      showSnackbar("Failed to remove service. Please try again.", "error");
    }
  };

  const calculateTotal = () => {
    return services.reduce(
      (total, service) => total + parseFloat(service.price || 0),
      0
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="add-service-modal-title"
      aria-describedby="add-service-modal-description"
      closeAfterTransition
    >
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: 600,
            bgcolor: "background.paper",
            borderRadius: "10px",
            boxShadow: 24,
            p: 4,
            outline: 0,
          }}
        >
          <Typography
            id="add-service-modal-title"
            variant="h4"
            component="h2"
            sx={{ color: theme.palette.primary[900], mb: 1 }}
          >
            Add Service
          </Typography>
          <FormSectionArray>
            {[
              error && (
                <FormHelperText
                  error
                  sx={{ color: theme.palette.error.main }}
                  key="error"
                >
                  {error}
                </FormHelperText>
              ),
              <FormControl fullWidth margin="normal" key="serviceSelect">
                <InputLabel>Service</InputLabel>
                <Select
                label="Service"
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  fullWidth
                  required
                >
                  {serviceList.map((service) => (
                    <MenuItem key={service.id} value={service.id}>
                      {service.name} - ₱
                      {parseFloat(service.base_price || 0).toFixed(2)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>,
            ]}
          </FormSectionArray>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: theme.palette.primary[900], mt: 2 }}
          >
            Added Services
          </Typography>
          <Box
            sx={{
              maxHeight: 200,
              overflowY: "auto",
              borderRadius: "4px",
              padding: "8px",
              marginBottom: "8px",
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <List>
              {services.map((service) => (
                <ListItem
                  key={service.id}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteService(service.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      width: "100%",
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{ color: theme.palette.primary[900] }}
                    >
                      {service.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      ₱{parseFloat(service.price || 0).toFixed(2)}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: theme.palette.primary[900], mr: 1 }}
            >
              <strong>Total: </strong>
            </Typography>
            <Typography variant="h6" sx={{ color: theme.palette.primary[900] }}>
              <strong>₱{calculateTotal().toFixed(2)}</strong>
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
            <Button
              onClick={onClose}
              sx={{ color: theme.palette.primary[900] }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddService}
              variant="contained"
              color="primary"
              sx={{ ml: 2 }}
            >
              Add Service
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

AddServiceDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  stayRecordId: PropTypes.number.isRequired,
  showSnackbar: PropTypes.func.isRequired,
  logUserAction: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
  fetchStayRecords: PropTypes.func.isRequired,
};

export default AddServiceDialog;
