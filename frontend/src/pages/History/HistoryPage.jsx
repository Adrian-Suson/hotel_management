import { Container} from "@mui/material";
import HistoryTable from "./components/HistoryTable";
import PropTypes from "prop-types";
import useSnackbar from "../../components/Snackbar/useSnackbar";
import CustomSnackbar from "../../components/Snackbar/CustomSnackbar";

const HistoryPage = ({ logUserAction }) => {
  const LoguserId = localStorage.getItem("userId");
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  return (
    <Container>
      <HistoryTable
        logUserAction={logUserAction}
        showSnackbar={showSnackbar}
        LoguserId={LoguserId}
      />
      <CustomSnackbar snackbar={snackbar} onClose={closeSnackbar} />
    </Container>
  );
};

HistoryPage.propTypes = {
  logUserAction: PropTypes.func.isRequired,
};

export default HistoryPage;
