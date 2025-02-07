import PropTypes from "prop-types";
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Slideshow from "./components/Advertisements";
import ServiceManagement from "./components/ServiceManagement";
import RoomSettings from "./components/RoomSettings";
import useSnackbar from "../../components/Snackbar/useSnackbar";
import CustomSnackbar from "../../components/Snackbar/CustomSnackbar";
import { useEffect } from "react";

const Setting = ({
  defaultCheckoutStatus,
  setDefaultCheckoutStatus,
  defaultOccupiedStatus,
  setDefaultOccupiedStatus,
  defaultRoomSelection,
  setDefaultRoomSelection,
  statusOptions,
  setStatusOptions,
  roomTypes,
  setRoomTypes,
  logUserAction,
}) => {
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  useEffect(() => {
    const savedStatuses = {
      defaultCheckoutStatus: localStorage.getItem("defaultCheckoutStatus"),
      defaultOccupiedStatus: localStorage.getItem("defaultOccupiedStatus"),
      defaultRoomStatus: localStorage.getItem("defaultRoomStatus"),
      defaultRoomSelection: localStorage.getItem("defaultRoomSelection"),
    };
    if (savedStatuses.defaultCheckoutStatus) {
      setDefaultCheckoutStatus(Number(savedStatuses.defaultCheckoutStatus));
    }
    if (savedStatuses.defaultOccupiedStatus) {
      setDefaultOccupiedStatus(Number(savedStatuses.defaultOccupiedStatus));
    }

    if (savedStatuses.defaultRoomSelection) {
      setDefaultRoomSelection(Number(savedStatuses.defaultRoomSelection));
    }
  }, [
    setDefaultCheckoutStatus,
    setDefaultOccupiedStatus,
    setDefaultRoomSelection,
  ]);

  return (
    <Box p={2}>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Advertisement Management</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Slideshow />
        </AccordionDetails>
      </Accordion>

      <RoomSettings
        defaultCheckoutStatus={defaultCheckoutStatus}
        setDefaultCheckoutStatus={setDefaultCheckoutStatus}
        defaultOccupiedStatus={defaultOccupiedStatus}
        setDefaultOccupiedStatus={setDefaultOccupiedStatus}
        defaultRoomSelection={defaultRoomSelection}
        setDefaultRoomSelection={setDefaultRoomSelection}
        statusOptions={statusOptions}
        setStatusOptions={setStatusOptions}
        roomTypes={roomTypes}
        setRoomTypes={setRoomTypes}
        logUserAction={logUserAction}
      />

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Service & Discount Management</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ServiceManagement logUserAction={logUserAction} showSnackbar={showSnackbar} />
        </AccordionDetails>
      </Accordion>

      <CustomSnackbar snackbar={snackbar} onClose={closeSnackbar} />
    </Box>
  );
};

Setting.propTypes = {
  defaultCheckoutStatus: PropTypes.number.isRequired,
  setDefaultCheckoutStatus: PropTypes.func.isRequired,
  defaultOccupiedStatus: PropTypes.number.isRequired,
  setDefaultOccupiedStatus: PropTypes.func.isRequired,
  defaultRoomSelection: PropTypes.number.isRequired,
  setDefaultRoomSelection: PropTypes.func.isRequired,
  statusOptions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      label: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
      text_color: PropTypes.string.isRequired,
    })
  ).isRequired,
  setStatusOptions: PropTypes.func.isRequired,
  roomTypes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  setRoomTypes: PropTypes.func.isRequired,
  logUserAction: PropTypes.func.isRequired,
};

export default Setting;
