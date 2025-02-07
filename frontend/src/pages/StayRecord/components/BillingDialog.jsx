import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import PropTypes from "prop-types";
import axios from "axios";
import config from "../../../state/config";
import dayjs from "dayjs";
import VisibilityIcon from "@mui/icons-material/Visibility";

const BillingDialog = ({
  open,
  onClose,
  billDetails,
  setBillDetails,
  onChangeRoomStatus,
  selectedRoomId,
  selectedStayRecordId,
  checkInDate,
  checkOutDate,
  roomStatusCheckOut,
  userId,
  logUserAction,
  fetchStayRecords,
  showSnackbar,
}) => {
  const [discountId, setDiscountId] = useState("");
  const [cashTendered, setCashTendered] = useState("");
  const [change, setChange] = useState(0);
  const [deposit, setDeposit] = useState(0);
  const [services, setServices] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [servicesDialogOpen, setServicesDialogOpen] = useState(false);
  const [isOvertime, setIsOvertime] = useState(false);

  const fetchServices = useCallback(async () => {
    if (!selectedStayRecordId) return;
    try {
      const { data } = await axios.get(
        `${config.API_URL}/stay_records/${selectedStayRecordId}/services`
      );
      const additionalServicesCharges = data.services.reduce(
        (total, service) => total + parseFloat(service.price),
        0
      );
      setServices(data.services);
      setBillDetails((prev) => ({
        ...prev,
        additionalServicesCharges,
      }));
    } catch (error) {
      showSnackbar("Failed to fetch services", "error");
    }
  }, [selectedStayRecordId, setBillDetails, showSnackbar]);

  const fetchDiscounts = useCallback(async () => {
    try {
      const { data } = await axios.get(`${config.API_URL}/discounts`);
      setDiscounts(data.discounts);
    } catch (error) {
      showSnackbar("Failed to fetch discounts", "error");
    }
  }, [showSnackbar]);

  const fetchDeposit = useCallback(async () => {
    if (!selectedStayRecordId) return;
    try {
      const { data } = await axios.get(
        `${config.API_URL}/stay_records/${selectedStayRecordId}/deposit`
      );
      setDeposit(data.deposit || 0);
    } catch (error) {
      showSnackbar("Failed to fetch deposit", "error");
    }
  }, [selectedStayRecordId, showSnackbar]);

  useEffect(() => {
    if (!open) return;
    fetchDiscounts();
    fetchServices();
    fetchDeposit();
    setIsOvertime(dayjs().isAfter(dayjs(checkOutDate), "day"));
  }, [open, fetchDiscounts, fetchServices, fetchDeposit, checkOutDate]);

  const discountAmount = useMemo(() => {
    if (!discountId) return 0; // No discount if "None" is selected

    const selectedDiscount = discounts.find(
      (discount) => discount && discount.id === discountId
    );
    return selectedDiscount
      ? (billDetails.roomCharges + billDetails.additionalServicesCharges) *
          (selectedDiscount.percentage / 100)
      : 0;
  }, [discountId, discounts, billDetails]);

  const totalAmount = useMemo(() => {
    const roomCharges = parseFloat(billDetails.roomCharges) || 0;
    const additionalServiceCharges =
      parseFloat(billDetails.additionalServicesCharges) || 0;
    const totalServiceCharges = roomCharges + additionalServiceCharges;
    const totalDiscount = discountAmount || 0;
    const total = totalServiceCharges - totalDiscount - deposit;
    return total;
  }, [billDetails, discountAmount, deposit]);

  const handlePaymentAndStatusChange = async () => {
    try {
      const depositAmount = parseFloat(deposit) || 0;
      const totalAmountDue = parseFloat(totalAmount) || 0;

      // Get the selected discount's details
      const selectedDiscount = discounts.find(
        (discount) => discount.id === discountId
      );
      const discountPercentage = selectedDiscount
        ? selectedDiscount.percentage
        : 0;
      const discountName = selectedDiscount ? selectedDiscount.name : null;

      const payload = {
        amount: totalAmountDue,
        deposit_amount: depositAmount,
        payment_method: "cash",
        total_service_charges:
          parseFloat(billDetails.additionalServicesCharges) || 0,
        discount_percentage: discountPercentage, // Sending discount percentage
        discount_name: discountName, // Sending discount name
      };

      await axios.post(
        `${config.API_URL}/stay_records/${selectedStayRecordId}/payment`,
        payload
      );

      showSnackbar("Payment processed successfully", "success");
      logUserAction(
        userId,
        `Processed payment for stay record ID: ${selectedStayRecordId}`
      );
      await onChangeRoomStatus(selectedRoomId, roomStatusCheckOut);
      fetchStayRecords();
      onClose();
    } catch (error) {
      showSnackbar("Payment or status update failed", "error");
    }
  };

  const numberOfDays = useMemo(() => {
    const days = dayjs(checkOutDate).diff(dayjs(checkInDate), "day");
    return days > 0 ? days : 1;
  }, [checkInDate, checkOutDate]);

  const roomRatePerDay = useMemo(() => {
    return parseFloat(billDetails.roomRate).toFixed(2);
  }, [billDetails.roomRate]);

  const roomCharges = useMemo(() => {
    const rate = parseFloat(billDetails.roomRate) || 0;
    return (rate * numberOfDays).toFixed(2);
  }, [billDetails.roomRate, numberOfDays]);

  useEffect(() => {
    setBillDetails((prev) => ({
      ...prev,
      roomCharges: parseFloat(roomCharges),
    }));
  }, [roomCharges, setBillDetails]);

  const handleCashTenderedChange = (e) => {
    const cash = parseFloat(e.target.value) || 0;
    const changeAmount = cash - totalAmount;
    setCashTendered(cash);
    setChange(changeAmount >= 0 ? changeAmount : 0);
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="billing-modal-title"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            overflowY: "auto",
            border: "1px solid #000",
            borderRadius: "8px",
          }}
        >
          <Typography
            variant="h5"
            color="primary"
            id="billing-modal-title"
            align="center"
            gutterBottom
          >
            Billing Details
          </Typography>

          {isOvertime && (
            <Typography variant="h6" color="error" align="center" gutterBottom>
              Overtime: Extra Day Added
            </Typography>
          )}

          <Box mb={0.5}>
            <Typography color="primary" variant="h6">
              Stay Duration: {numberOfDays} {numberOfDays > 1 ? "days" : "day"}{" "}
              @ ₱{roomRatePerDay} per day
            </Typography>
          </Box>
          <Paper variant="outlined" sx={{ p: 1, mb: 0.5 }}>
            <Typography variant="body1">
              <strong>Room Charges:</strong> ₱{roomCharges}
            </Typography>
            <Typography variant="body1">
              <strong>Additional Services:</strong> ₱
              {(billDetails.additionalServicesCharges ?? 0).toFixed(2)}
            </Typography>
            <Typography variant="body1">
              <strong>Deposit:</strong> ₱{deposit}
            </Typography>
            <Button
              onClick={() => setServicesDialogOpen(true)}
              fullWidth
              sx={{ mt: 1 }}
              endIcon={<VisibilityIcon />}
            >
              View Services
            </Button>
          </Paper>
          <Paper variant="outlined" sx={{ p: 1, mb: 0.5 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12}>
                <Box display="flex" flex="row" justifyContent="space-between">
                  <FormControl fullWidth>
                    <InputLabel>Discount</InputLabel>
                    <Select
                      value={discountId}
                      onChange={(e) => setDiscountId(e.target.value)}
                      label="Discount"
                    >
                      <MenuItem value="">None</MenuItem>{" "}
                      {/* Option to remove discount */}
                      {discounts.map((discount) => (
                        <MenuItem key={discount.id} value={discount.id}>
                          {discount.name} ({discount.percentage}%)
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">
                  <strong>Discount Amount:</strong> ₱{discountAmount.toFixed(2)}
                </Typography>
                <Typography variant="body1">
                  <strong>Total Amount:</strong> ₱{totalAmount.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Cash Tendered"
                  variant="outlined"
                  value={cashTendered}
                  onChange={handleCashTenderedChange}
                  fullWidth
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">
                  <strong>Change:</strong> ₱{change.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          <Box display="flex" justifyContent="flex-end" sx={{ mt: 2 }}>
            <Box>
              <Button
                onClick={onClose}
                variant="contained"
                color="secondary"
                sx={{ mr: 2 }}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePaymentAndStatusChange}
                variant="contained"
                color="primary"
                disabled={parseFloat(cashTendered) < totalAmount}
              >
                Confirm Payment
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Services Dialog */}
      <Dialog
        open={servicesDialogOpen}
        onClose={() => setServicesDialogOpen(false)}
        maxWidth="md"
        sx={{
          "& .MuiDialogContent-root": {
            minWidth: 600,
          },
        }}
      >
        <DialogTitle>Additional Services</DialogTitle>
        <DialogContent>
          <List>
            {services.map((service) => (
              <ListItem key={service.id}>
                <ListItemText
                  primary={service.name}
                  secondary={`₱${parseFloat(service.price).toFixed(2)}`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setServicesDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

BillingDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  billDetails: PropTypes.shape({
    roomCharges: PropTypes.number,
    additionalServicesCharges: PropTypes.number,
    roomRate: PropTypes.string,
    discountName: PropTypes.string,
  }).isRequired,
  setBillDetails: PropTypes.func.isRequired,
  onChangeRoomStatus: PropTypes.func.isRequired,
  selectedRoomId: PropTypes.number.isRequired,
  selectedStayRecordId: PropTypes.number.isRequired,
  checkInDate: PropTypes.string.isRequired,
  checkOutDate: PropTypes.string.isRequired,
  roomStatusCheckOut: PropTypes.number.isRequired,
  userId: PropTypes.string.isRequired,
  logUserAction: PropTypes.func.isRequired,
  fetchStayRecords: PropTypes.func.isRequired,
  showSnackbar: PropTypes.func.isRequired,
};

export default BillingDialog;
