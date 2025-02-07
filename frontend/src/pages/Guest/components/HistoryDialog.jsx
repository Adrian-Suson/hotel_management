import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  styled,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import PropTypes from "prop-types";
import axios from "axios";
import dayjs from "dayjs";
import config from "../../../state/config";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogTitle-root": {
    background: "linear-gradient(135deg, #F5F7FAA9, #99c199)",
    color: theme.palette.primary[900],
    fontSize: "1.25rem",
    fontWeight: "bold",
  },
  "& .MuiDialogContent-root": {
    background: theme.palette.background.default,
    padding: theme.spacing(3),
  },
}));

const HistoryDialog = ({ open, onClose, guestId, showSnackbar }) => {
  const [historyRecords, setHistoryRecords] = useState([]);
  const theme = useTheme();
  const isMediumOrLarger = useMediaQuery(theme.breakpoints.up("md"));

  useEffect(() => {
    if (guestId && open) {
      const fetchHistoryRecords = async () => {
        try {
          const response = await axios.get(
            `${config.API_URL}/stay_records/guest/${guestId}/history`
          );
          if (response.data.success) {
            setHistoryRecords(response.data.history_records);
          } else {
            showSnackbar("Failed to fetch history records.", "error");
          }
        } catch (error) {
          console.error("Error fetching history records:", error);
          showSnackbar("Failed to fetch history records.", "error");
        }
      };

      fetchHistoryRecords();
    }
  }, [guestId, open, showSnackbar]);

  const columns = [
    {
      field: "id",
      headerName: "ID",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Box
          sx={{
            cursor: "pointer",
            color: theme.palette.primary[900],
          }}
        >
          {params.value}
        </Box>
      ),
    },
    {
      field: "guestName",
      headerName: "Guest Name",
      flex: 1.5,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Box
          sx={{
            cursor: "pointer",
            color: theme.palette.primary[900],
          }}
        >
          {params.value}
        </Box>
      ),
    },
    {
      field: "room_number",
      headerName: "Room No.",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Box
          sx={{
            cursor: "pointer",
            color: theme.palette.primary[900],
          }}
        >
          {params.value}
        </Box>
      ),
    },
    {
      field: "check_in",
      headerName: "Check In",
      flex: 1,
      headerAlign: "center",
      align: "center",
      valueFormatter: (params) => dayjs(params.value).format("YYYY-MM-DD"),
    },
    {
      field: "check_out",
      headerName: "Check Out",
      flex: 1,
      headerAlign: "center",
      align: "center",
      valueFormatter: (params) => dayjs(params.value).format("YYYY-MM-DD"),
    },
    {
      field: "guestNumber",
      headerName: "Guest No.",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Box
          sx={{
            cursor: "pointer",
            color: theme.palette.primary[900],
          }}
        >
          {params.value}
        </Box>
      ),
    },
  ];

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Stay History</DialogTitle>
      <DialogContent>
        <Box
          gridColumn="span 12"
          height={isMediumOrLarger ? "60vh" : "50vh"}
          sx={{
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            borderRadius: "10px",
            "& .MuiDataGrid-root": {
              background: "linear-gradient(135deg, #F5F7FAA9, #99c199)",
              border: "none",
              borderRadius: "10px",
            },
            "& .MuiDataGrid-cell": {
              backgroundColor: theme.palette.primary[200],
              borderBottom: "none",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "0.75rem",
            },
            "& .MuiDataGrid-columnHeaders": {
              background: "linear-gradient(135deg, #F5F7FAA9, #99c199)",
              borderBottom: "none",
              fontSize: "0.75rem",
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              fontSize: "0.75rem",
            },
            "& .MuiDataGrid-footerContainer": {
              fontSize: "0.75rem",
            },
            "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
              color: theme.palette.primary.dark,
              fontSize: "0.75rem",
            },
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows, & .MuiTablePagination-select, & .MuiTablePagination-selectIcon":
              {
                fontSize: "0.75rem",
              },
            evenRow: {
              backgroundColor: "transparent",
            },
          }}
        >
          <DataGrid
            rows={historyRecords}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" variant="contained">
          Close
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

HistoryDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  guestId: PropTypes.number.isRequired,
  showSnackbar: PropTypes.func.isRequired,
};

export default HistoryDialog;
