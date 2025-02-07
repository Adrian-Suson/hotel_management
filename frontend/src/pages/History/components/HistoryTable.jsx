import { useState, useEffect, useCallback } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  useMediaQuery,
  useTheme,
  Snackbar,
  Alert,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from "@mui/material";
import axios from "axios";
import config from "../../../state/config";
import dayjs from "dayjs";
import PropTypes from "prop-types";
import SearchIcon from "@mui/icons-material/Search";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import GuestDetailsModal from "./GuestDetailsModal";
import PrintIcon from "@mui/icons-material/Print";
import * as XLSX from "xlsx"; // Import XLSX for exporting Excel
import FileDownloadIcon from "@mui/icons-material/FileDownload"; // Import Excel export icon

// Import the handlePrint function
import { handlePrint } from "./printHelper";

const HistoryTable = ({ logUserAction, showSnackbar, LoguserId }) => {
  const theme = useTheme();
  const isMediumOrLarger = useMediaQuery(theme.breakpoints.up("md"));

  const [checkIns, setCheckIns] = useState([]);
  const [filteredCheckIns, setFilteredCheckIns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [filterType, setFilterType] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [search, setSearch] = useState("");
  const [printDialogOpen, setPrintDialogOpen] = useState(false);

  const fetchCheckins = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${config.API_URL}/transaction_history`
      );
      const formattedCheckIns = data.transaction_history.map((checkin) => ({
        id: checkin.id,
        guestId: checkin.guest_id,
        ...checkin,
        check_in: dayjs(checkin.check_in).format("YYYY-MM-DD"),
        check_out: dayjs(checkin.check_out).format("YYYY-MM-DD"),
      }));
      setCheckIns(formattedCheckIns);
      setFilteredCheckIns(formattedCheckIns);
    } catch (error) {
      console.error("Failed to fetch stay records:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCheckins();
  }, [fetchCheckins]);

  const handleViewClick = (record) => {
    setCurrentRecord(record);
    setModalOpen(true);
    logUserAction(LoguserId, `Viewed details of ID:'${record.id}'`);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handlePrintDialogOpen = useCallback(() => {
    setPrintDialogOpen(true);
  }, []);

  const handlePrintDialogClose = () => {
    setPrintDialogOpen(false);
  };

  const handlePrintClick = () => {
    handlePrint({
      checkIns,
      filterType,
      startDate,
      endDate,
      handlePrintDialogClose,
      logUserAction,
      LoguserId,
    });
  };

  const handleSearchChange = useCallback(
    (event) => {
      const value = event.target.value.toLowerCase();
      setSearch(value);
      setFilteredCheckIns(
        checkIns.filter(
          (checkin) =>
            checkin.id.toString().toLowerCase().includes(value) ||
            checkin.guestName.toLowerCase().includes(value) ||
            checkin.room_number.toLowerCase().includes(value) ||
            checkin.check_in.toLowerCase().includes(value) ||
            checkin.check_out.toLowerCase().includes(value) ||
            checkin.guestNumber.toString().toLowerCase().includes(value)
        )
      );
    },
    [checkIns]
  );

  // Function to export data to Excel with improved formatting
  const handleExportToExcel = () => {
    // Define the data structure for Excel
    const excelData = filteredCheckIns.map((checkin) => ({
      ID: checkin.id,
      "Guest Name": checkin.guestName,
      "Room No.": checkin.room_number,
      "Check In": checkin.check_in,
      "Check Out": checkin.check_out,
      "Guest No.": checkin.guestNumber,
    }));

    // Create a new workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    // Set column widths
    const columnWidths = [
      { wpx: 50 }, // ID
      { wpx: 150 }, // Guest Name
      { wpx: 100 }, // Room No.
      { wpx: 100 }, // Check In
      { wpx: 100 }, // Check Out
      { wpx: 100 }, // Guest No.
    ];
    worksheet["!cols"] = columnWidths;

    // Apply header styling
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "#006400" } },
      alignment: { horizontal: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
      },
    };

    // Set header style for all headers
    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = headerStyle;
    }

    // Enable auto-filter for all columns
    worksheet["!autofilter"] = { ref: worksheet["!ref"] };

    // Freeze the header row
    worksheet["!freeze"] = { xSplit: 0, ySplit: 1 };

    // Format dates columns
    const dateFormat = { numFmt: "yyyy-mm-dd" }; // Excel date format
    const checkInCol = 3; // Column index for "Check In"
    const checkOutCol = 4; // Column index for "Check Out"
    for (let R = 1; R <= range.e.r; R++) {
      const checkInCellAddress = XLSX.utils.encode_cell({
        r: R,
        c: checkInCol,
      });
      const checkOutCellAddress = XLSX.utils.encode_cell({
        r: R,
        c: checkOutCol,
      });

      if (worksheet[checkInCellAddress])
        worksheet[checkInCellAddress].s = dateFormat;
      if (worksheet[checkOutCellAddress])
        worksheet[checkOutCellAddress].s = dateFormat;
    }

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered CheckIns");

    // Export the Excel file
    XLSX.writeFile(workbook, "CheckIns_History.xlsx");
  };

  const columns = [
    {
      field: "id",
      headerName: "ID",
      flex: 1,
      disableColumnMenu: true,
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
      disableColumnMenu: true,
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
      disableColumnMenu: true,
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
      disableColumnMenu: true,
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
      field: "check_out",
      headerName: "Check Out",
      flex: 1,
      headerAlign: "center",
      align: "center",
      disableColumnMenu: true,
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
      field: "guestNumber",
      headerName: "Guest No.",
      flex: 1,
      headerAlign: "center",
      align: "center",
      disableColumnMenu: true,
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
      field: "view",
      headerName: "View",
      flex: 1,
      headerAlign: "center",
      align: "center",
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Button
          variant="contained"
          sx={{
            color: theme.palette.secondary[100],
            background: theme.palette.primary.main,
            "&:hover": {
              transform: "scale(1.1)",
              color: theme.palette.primary[700],
              background: theme.palette.secondary.main,
            },
          }}
          onClick={() => handleViewClick(params.row)}
          startIcon={<RemoveRedEyeIcon />}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <>
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={2}>
            <Box
              gridColumn="span 12"
              height={isMediumOrLarger ? "75vh" : "60vh"}
              sx={{
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                borderRadius: "10px",

                // Root DataGrid Styling
                "& .MuiDataGrid-root": {
                  background: "#FFFFFFDA",
                  border: "none",
                  borderRadius: "10px",
                },

                // Cell Styling
                "& .MuiDataGrid-cell": {
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "0.75rem",
                },

                // Column Headers Styling
                "& .MuiDataGrid-columnHeaders": {
                  fontSize: "0.75rem",
                },
                "& .MuiDataGrid-columnHeaderTitle": {
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  fontSize: "0.75rem",
                },

                // Footer Container Styling
                "& .MuiDataGrid-footerContainer": {
                  fontSize: "0.75rem",
                },

                // Toolbar Buttons Styling
                "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                  fontSize: "0.75rem",
                },

                // Pagination Styling
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows, & .MuiTablePagination-select, & .MuiTablePagination-selectIcon":
                  {
                    fontSize: "0.75rem",
                  },
              }}
            >
              <Stack
                direction="row"
                spacing={2}
                justifyContent="space-between"
                alignItems="center"
                my={1}
                mx={2}
              >
                <TextField
                  label="Search"
                  variant="outlined"
                  value={search}
                  size="small"
                  onChange={handleSearchChange}
                  sx={{ width: "300px" }}
                  InputProps={{
                    endAdornment: <SearchIcon />,
                  }}
                />
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={handlePrintDialogOpen}
                    startIcon={<PrintIcon />}
                  >
                    Print
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    onClick={handleExportToExcel}
                    startIcon={<FileDownloadIcon />} // Add Excel icon here
                  >
                    Export to Excel
                  </Button>
                </Stack>
              </Stack>
              <DataGrid rows={filteredCheckIns} columns={columns} />
            </Box>
          </Box>
        </>
      )}
      {currentRecord && (
        <GuestDetailsModal
          open={modalOpen}
          record={currentRecord}
          onClose={handleCloseModal}
          logUserAction={logUserAction}
          LoguserId={LoguserId}
          showSnackbar={showSnackbar}
        />
      )}
      <Dialog open={printDialogOpen} onClose={handlePrintDialogClose}>
        <DialogTitle>Print Filters</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <FormControl variant="outlined" sx={{ minWidth: 200, my: 2 }}>
              <InputLabel>Filter Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Filter Type"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="year">By Year</MenuItem>
                <MenuItem value="month">By Month</MenuItem>
                <MenuItem value="day">By Day</MenuItem>
                <MenuItem value="range">By Range</MenuItem>
              </Select>
            </FormControl>

            {filterType !== "all" && filterType !== "range" && (
              <Stack direction="row" spacing={2} sx={{ my: 2 }}>
                <DatePicker
                  views={
                    filterType === "year"
                      ? ["year"]
                      : filterType === "month"
                      ? ["year", "month"]
                      : ["year", "month", "day"]
                  }
                  label={`Select ${
                    filterType.charAt(0).toUpperCase() + filterType.slice(1)
                  }`}
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  renderInput={(params) => (
                    <TextField {...params} sx={{ my: 2 }} />
                  )}
                />
              </Stack>
            )}

            {filterType === "range" && (
              <Stack direction="row" spacing={2} sx={{ my: 2 }}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  renderInput={(params) => (
                    <TextField {...params} sx={{ mb: 2 }} />
                  )}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  renderInput={(params) => (
                    <TextField {...params} sx={{ mb: 2 }} />
                  )}
                />
              </Stack>
            )}
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={handlePrintClick}
            color="primary"
          >
            Print
          </Button>
          <Button
            variant="contained"
            onClick={handlePrintDialogClose}
            color="secondary"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

HistoryTable.propTypes = {
  logUserAction: PropTypes.func.isRequired,
  showSnackbar: PropTypes.func.isRequired,
  LoguserId: PropTypes.string.isRequired,
};

export default HistoryTable;
