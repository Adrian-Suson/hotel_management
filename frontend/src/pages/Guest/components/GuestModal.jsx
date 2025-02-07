import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Grid,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import PropTypes from "prop-types";
import axios from "axios";
import config from "../../../state/config";
import HistoryDialog from "./HistoryDialog";

const GuestModal = ({
  open,
  onClose,
  guest,
  showSnackbar,
}) => {
  const [previewUrl, setPreviewUrl] = useState("");
  const [status, setStatus] = useState({
    isStayRecordFormOpen: false,
    isReservationFormOpen: false,
    isHistoryDialogOpen: false,
    isLoading: true,
    error: null,
  });
  const [hasStayRecord, setHasStayRecord] = useState(false);
  const [hasReservation, setHasReservation] = useState(false);

  const resetStates = () => {
    setPreviewUrl("");
    setStatus({
      isStayRecordFormOpen: false,
      isReservationFormOpen: false,
      isHistoryDialogOpen: false,
      isLoading: true,
      error: null,
    });
    setHasStayRecord(false);
    setHasReservation(false);
  };

  const fetchGuestData = useCallback(async () => {
    try {
      setStatus((prevStatus) => ({
        ...prevStatus,
        isLoading: true,
        error: null,
      }));

      const [stayRecordsResponse, reservationsResponse, guestResponse] =
        await Promise.all([
          axios.get(`${config.API_URL}/stay_records/guest/${guest.id}`),
          axios.get(`${config.API_URL}/reservations/guest/${guest.id}`),
          axios.get(`${config.API_URL}/guests/${guest.id}`),
        ]);

      if (guestResponse.data.success) {
        const updatedGuest = guestResponse.data.guest;
        setPreviewUrl(
          `${config.API_URL}/id_picture/${updatedGuest.id_picture}`
        );
      } else {
        throw new Error("Failed to fetch guest data.");
      }

      setHasStayRecord(
        stayRecordsResponse.data.success &&
        stayRecordsResponse.data.stay_records.length > 0
      );
      setHasReservation(
        reservationsResponse.data.success &&
        reservationsResponse.data.reservations.length > 0
      );

      setStatus((prevStatus) => ({ ...prevStatus, isLoading: false }));
    } catch (error) {
      console.error("Error fetching guest data:", error);
      showSnackbar("Failed to fetch guest data.", "error");
      setStatus((prevStatus) => ({ ...prevStatus, isLoading: false, error }));
    }
  }, [guest.id, showSnackbar]);

  useEffect(() => {
    if (open) {
      resetStates();
      if (guest && guest.id) {
        fetchGuestData();
      }
    }
  }, [open, guest, fetchGuestData]);

  const handleDialogToggle = useCallback(
    (dialog, isOpen) => {
      setStatus((prevStatus) => ({
        ...prevStatus,
        [dialog]: isOpen,
      }));
      if (!isOpen) {
        fetchGuestData();
      }
    },
    [fetchGuestData]
  );

  // Memoize the loading state to avoid unnecessary re-renders
  const isDataLoading = useMemo(() => status.isLoading, [status.isLoading]);

  if (isDataLoading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent sx={{ textAlign: "center" }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Loading guest information...
          </Typography>
        </DialogContent>
      </Dialog>
    );
  }

  if (!guest || status.error) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent sx={{ textAlign: "center" }}>
          <Alert severity="error">
            {status.error ? status.error.message : "Failed to load guest data."}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary" variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Guest Information</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1" color="textPrimary">
                <strong>First Name:</strong> {guest.first_name}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1" color="textPrimary">
                <strong>Last Name:</strong> {guest.last_name}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1" color="textPrimary">
                <strong>Phone Number:</strong> {guest.phone}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1" color="textPrimary">
                <strong>Email:</strong> {guest.email}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1" color="textPrimary">
                <strong>ID Picture:</strong>
              </Typography>
              {previewUrl && (
                <Box mt={2} textAlign="center">
                  <img
                    src={previewUrl}
                    alt="ID"
                    style={{ maxWidth: "100%", maxHeight: "200px" }}
                  />
                </Box>
              )}
            </Grid>
          </Grid>
          <Box mt={2} display="flex" justifyContent="center" gap={2}>
            {hasStayRecord && (
              <Alert severity="info">This guest is currently checked in.</Alert>
            )}
            {hasReservation && (
              <Alert severity="info">
                This guest has an active reservation.
              </Alert>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleDialogToggle("isHistoryDialogOpen", true)}
            >
              View History
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary" variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <HistoryDialog
        open={status.isHistoryDialogOpen}
        onClose={() => handleDialogToggle("isHistoryDialogOpen", false)}
        guestId={guest.id}
        showSnackbar={showSnackbar}
      />
    </>
  );
};

GuestModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  guest: PropTypes.shape({
    id: PropTypes.number,
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    id_picture: PropTypes.string,
  }),
  showSnackbar: PropTypes.func.isRequired,
  roomStatus: PropTypes.number.isRequired,
  roomSelection: PropTypes.number.isRequired,
  logUserAction: PropTypes.func.isRequired,
  LogUserId: PropTypes.string.isRequired,
};

export default GuestModal;
