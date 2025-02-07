import { useState, useEffect } from "react";
import { Container, Button, Box, CircularProgress, Grid } from "@mui/material";
import axios from "axios";
import config from "../../state/config";
import dayjs from "dayjs";
import PropTypes from "prop-types";
import NewStayRecordForm from "../StayRecord/components/NewStayRecordForm";
import StayRecordsTable from "./components/StayRecordTable";
import useSnackbar from "../../components/Snackbar/useSnackbar";
import AddIcon from "@mui/icons-material/Add";
import CustomSnackbar from "../../components/Snackbar/CustomSnackbar";

const StayRecordPage = ({
  defaultOccupiedStatus,
  defaultCheckoutStatus,
  defaultRoomSelection,
  logUserAction,
}) => {
  const [stayRecords, setStayRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newStayRecordDialogOpen, setNewStayRecordDialogOpen] = useState(false);
  const [roomStatusCheckIn] = useState(defaultOccupiedStatus);
  const [roomStatusCheckOut] = useState(defaultCheckoutStatus);
  const [roomSelection] = useState(defaultRoomSelection);
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const [statusOptions, setStatusOptions] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetchStatusOptions();
    console.log(roomStatusCheckOut);
    console.log(roomStatusCheckIn);
  }, [roomStatusCheckOut, roomStatusCheckIn]);

  const fetchStatusOptions = async () => {
    try {
      const { data } = await axios.get(`${config.API_URL}/status`);
      setStatusOptions(data.statusOptions);
    } catch (error) {
      console.error("Failed to fetch status options:", error);
    }
  };

  const fetchStayRecords = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${config.API_URL}/stay_records`);
      setStayRecords(
        data.stay_records.map((stayRecord) => ({
          id: stayRecord.id,
          ...stayRecord,
          check_in: dayjs(stayRecord.check_in).format("YYYY-MM-DD"),
          check_out: dayjs(stayRecord.check_out).format("YYYY-MM-DD"),
          room_id: stayRecord.room_id,
        }))
      );
    } catch (error) {
      console.error("Failed to fetch stay records:", error);
      showSnackbar("Failed to fetch data. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleNewStayRecordDialogClose = () => {
    setNewStayRecordDialogOpen(false);
  };

  const handleNewStayRecordDialogOpen = () => {
    setNewStayRecordDialogOpen(true);
  };

  const handleStayRecordAdded = () => {
    fetchStayRecords();
    logUserAction(userId, "Added a new stay record");
  };

  return (
    <Container>
      <Grid container spacing={1} alignItems="center">
        <Grid item xs={12} display="flex" justifyContent="flex-end">
          <Button
          startIcon={<AddIcon/>}
            variant="contained"
            color="primary"
            onClick={handleNewStayRecordDialogOpen}
          >
            Check in
          </Button>
        </Grid>
        <Grid item xs={12}>
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 400,
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <StayRecordsTable
              roomSelection={roomSelection}
              roomStatusCheckOut={roomStatusCheckOut}
              stayRecords={stayRecords}
              showSnackbar={showSnackbar}
              userId={userId}
              logUserAction={logUserAction}
            />
          )}
        </Grid>
      </Grid>
      <NewStayRecordForm  
        roomSelection={roomSelection}
        open={newStayRecordDialogOpen}
        roomStatus={roomStatusCheckIn}
        onClose={handleNewStayRecordDialogClose}
        onStayRecordAdded={handleStayRecordAdded}
        statusOptions={statusOptions}
        showSnackbar={showSnackbar}
      />
      <CustomSnackbar snackbar={snackbar} onClose={closeSnackbar} />
    </Container>
  );
};

StayRecordPage.propTypes = {
  defaultCheckoutStatus: PropTypes.number.isRequired,
  defaultOccupiedStatus: PropTypes.number.isRequired,
  defaultRoomSelection: PropTypes.number.isRequired,
  logUserAction: PropTypes.func.isRequired,
};

export default StayRecordPage;
