import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Container,
} from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";
import config from "../../state/config";
import AddIcon from "@mui/icons-material/Add";
import ReservationsTable from "./components/ReservationsTable";
import ConfirmReservationDialog from "./components/ConfirmReservationDialog";
import CustomSnackbar from "../../components/Snackbar/CustomSnackbar";
import useSnackbar from "../../components/Snackbar/useSnackbar";
import ReservationForm from "./components/ReservationForm";

const ReservationPage = ({
  defaultOccupiedStatus,
  defaultRoomSelection,
  logUserAction,
}) => {
  const [openForm, setOpenForm] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [roomStatus] = useState(defaultOccupiedStatus);
  const [roomSelection] = useState(defaultRoomSelection);
  const [statusOptions, setStatusOptions] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [currentRow, setCurrentRow] = useState(null);
  const theme = useTheme();
  const isMediumOrLarger = useMediaQuery(theme.breakpoints.up("md"));
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetchReservations();
    fetchStatusOptions();
    console.log("defaultOccupiedStatus", defaultOccupiedStatus);
    console.log("defaultRoomSelection", defaultRoomSelection);
  }, [defaultOccupiedStatus, defaultRoomSelection]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${config.API_URL}/reservations`);
      setReservations(
        data.reservations.map((reservation) => ({
          id: reservation.id,
          ...reservation,
          check_in: dayjs(reservation.check_in).format("YYYY-MM-DD"),
          check_out: dayjs(reservation.check_out).format("YYYY-MM-DD"),
          roomID: reservation.room_id,
        }))
      );
    } catch (error) {
      console.error("Failed to fetch reservations:", error);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatusOptions = async () => {
    try {
      const { data } = await axios.get(`${config.API_URL}/status`);
      setStatusOptions(data.statusOptions);
    } catch (error) {
      console.error("Failed to fetch status options:", error);
    }
  };

  const toggleRetry = () => {
    window.location.reload(false);
  };

  const toggleForm = () => setOpenForm(!openForm);

  const handleOpenDialog = (row) => {
    setCurrentRow(row);
    setOpenDialog(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      const response = await axios.delete(
        `${config.API_URL}/deleteReservation/${currentRow.id}`
      );
      if (response.data.success) {
        setReservations(
          reservations.filter((reservation) => reservation.id !== currentRow.id)
        );
        showSnackbar("Reservation deleted successfully.", "success");
        logUserAction(userId, `Deleted reservation ID: ${currentRow.guest_id}`);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      showSnackbar("Failed to delete reservation.", "error");
    } finally {
      setOpenDialog(false);
    }
  };

  const handleConfirm = (row) => {
    setCurrentRow(row);
    setConfirmDialogOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
    setFile(null);
    setPreviewUrl(null);
  };

  const handleFileChange = (file) => {
    setFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleChangeRoomStatus = async (roomId, statusId) => {
    try {
      await axios.put(`${config.API_URL}/rooms/${roomId}/status`, {
        status_code_id: statusId,
      });
      fetchReservations();
    } catch (error) {
      console.error("Error updating room status:", error);
      showSnackbar("Failed to update room status.", "error");
    }
  };

  const handleAddReservation = () => {
    fetchReservations();
    logUserAction(userId, "Added a new reservation");
  };

  if (loading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        width="100vw"
        position="fixed"
        top={0}
        left={0}
        bgcolor="rgba(255, 255, 255, 0.7)"
        zIndex={9999}
      >
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        textAlign="center"
      >
        <Typography variant="h6" color="error" gutterBottom>
          {error}
        </Typography>
        <Button variant="contained" color="primary" onClick={toggleRetry}>
          Retry
        </Button>
      </Box>
    );

  return (
    <Container>
      <Box
        display="grid"
        gridTemplateColumns={isMediumOrLarger ? "repeat(12, 1fr)" : "1fr"}
        gap="10px"
      >
        <Box
          gridColumn="span 12"
          sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}
        >
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            color="primary"
            onClick={toggleForm}
          >
            Reservation
          </Button>
        </Box>
        {loading ? (
          <CircularProgress />
        ) : (
          <Box gridColumn="span 12">
            <ReservationsTable
              userId={userId}
              roomSelection={roomSelection}
              logUserAction={logUserAction}
              reservations={reservations}
              onDelete={handleOpenDialog}
              onConfirm={handleConfirm}
              onUpdate={fetchReservations}
              showSnackbar={showSnackbar}
            />
          </Box>
        )}
        {openForm && (
          <ReservationForm
            roomSelection={roomSelection}
            roomStatus={roomStatus}
            onClose={toggleForm}
            onAddReservation={handleAddReservation}
            showSnackbar={showSnackbar}
          />
        )}
      </Box>
      <CustomSnackbar snackbar={snackbar} onClose={closeSnackbar} />
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this reservation?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirmed} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {currentRow && (
        <ConfirmReservationDialog
          userId={userId}
          logUserAction={logUserAction}
          confirmDialogOpen={confirmDialogOpen}
          handleCloseConfirmDialog={handleCloseConfirmDialog}
          handleFileChange={handleFileChange}
          file={file}
          previewUrl={previewUrl}
          roomStatus={roomStatus}
          statusOptions={statusOptions}
          handleChangeRoomStatus={handleChangeRoomStatus}
          roomId={currentRow.roomID}
          setReservations={setReservations}
          reservations={reservations}
          showSnackbar={showSnackbar}
          fetchReservations={fetchReservations}
          currentRow={currentRow}
          guestId={currentRow.guest_id}
          setConfirmDialogOpen={setConfirmDialogOpen}
          setFile={setFile}
          setPreviewUrl={setPreviewUrl}
        />
      )}
    </Container>
  );
};

ReservationPage.propTypes = {
  defaultOccupiedStatus: PropTypes.number.isRequired,
  defaultRoomSelection: PropTypes.number.isRequired,
  logUserAction: PropTypes.func.isRequired,
};

export default ReservationPage;
