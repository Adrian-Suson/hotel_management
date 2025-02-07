import { Container } from "@mui/material";
import GuestTable from "./components/GuestTable";
import PropTypes from "prop-types";
import useSnackbar from "../../components/Snackbar/useSnackbar";
import CustomSnackbar from "../../components/Snackbar/CustomSnackbar";
import { useState } from "react";

const GuestPage = ({
  defaultOccupiedStatus,
  defaultRoomSelection,
  logUserAction,
}) => {
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const [roomStatus] = useState(defaultOccupiedStatus);
  const [roomSelection] = useState(defaultRoomSelection);
  const LogUserId = localStorage.getItem("userId");

  return (
    <Container>
      <GuestTable
        LogUserId={LogUserId}
        logUserAction={logUserAction}
        roomStatus={roomStatus}
        roomSelection={roomSelection}
        showSnackbar={showSnackbar}
      />
      <CustomSnackbar snackbar={snackbar} onClose={closeSnackbar} />
    </Container>
  );
};

GuestPage.propTypes = {
  defaultOccupiedStatus: PropTypes.number.isRequired,
  defaultRoomSelection: PropTypes.number.isRequired,
  logUserAction: PropTypes.func.isRequired,
};
export default GuestPage;
