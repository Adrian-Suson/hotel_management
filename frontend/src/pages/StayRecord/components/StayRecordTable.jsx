import { useState, useEffect, useCallback } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, useMediaQuery, useTheme, Button, Tooltip } from "@mui/material";
import CheckOutIcon from "@mui/icons-material/AssignmentReturn";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import PropTypes from "prop-types";
import axios from "axios";
import config from "../../../state/config";
import dayjs from "dayjs";
import GuestUpdateDialog from "./update/UpdateGuest";
import UpdateRoomType from "./update/RoomType";
import StatusDialog from "./update/StatusUpdate";
import DateUpdateDialog from "./update/DateUpdate";
import GuestNumberUpdateDialog from "./update/GuestNumberUpdate";
import AddServiceDialog from "./AddServiceDialog";
import BillingDialog from "./BillingDialog";
import CheckoutNotification from "./CheckoutNotification";
import DepositEditDialog from "./DepositEditDialog";

const StayRecordsTable = ({
  stayRecords: initialStayRecords,
  roomStatusCheckOut,
  showSnackbar,
  userId,
  logUserAction,
}) => {
  const theme = useTheme();
  const isMediumOrLarger = useMediaQuery(theme.breakpoints.up("md"));
  const [openDepositDialog, setOpenDepositDialog] = useState(false);
  const [stayRecords, setStayRecords] = useState(initialStayRecords);
  const [openDialog, setOpenDialog] = useState(null);
  const [selectedStayRecord, setSelectedStayRecord] = useState(null);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [selectedCheckIn, setSelectedCheckIn] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [selectedDates, setSelectedDates] = useState({
    checkIn: "",
    checkOut: "",
  });
  const [billDetails, setBillDetails] = useState({
    roomCharges: 0,
    additionalServicesCharges: 0,
    discount: 0,
    totalAmount: 0,
  });

  const fetchRooms = useCallback(async () => {
    try {
      const response = await axios.get(`${config.API_URL}/rooms`);
      setRooms(response.data.rooms);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
      showSnackbar("Failed to fetch rooms.", "error");
    }
  }, [showSnackbar]);

  const fetchStatusOptions = useCallback(async () => {
    try {
      const { data } = await axios.get(`${config.API_URL}/status`);
      setStatusOptions(data.statusOptions);
    } catch (error) {
      console.error("Failed to fetch status options:", error);
      showSnackbar("Failed to fetch status options.", "error");
    }
  }, [showSnackbar]);

  const roomsToCheckout = stayRecords.filter(
    (stayRecord) =>
      dayjs().isAfter(stayRecord.check_out) &&
      stayRecord.status !== roomStatusCheckOut
  );

  const fetchStayRecords = useCallback(async () => {
    try {
      const { data } = await axios.get(`${config.API_URL}/stay_records`);

      const records = await Promise.all(
        data.stay_records.map(async (stayRecord) => {
          // Fetch services for each stay record
          const { data: servicesData } = await axios.get(
            `${config.API_URL}/stay_records/${stayRecord.id}/services`
          );

          // Ensure all prices are valid numbers and default to 0 if invalid
          const serviceRate = servicesData.services.reduce(
            (total, service) => total + (parseFloat(service.price) || 0), // Use 0 if service price is invalid
            0
          );

          const checkIn = dayjs(stayRecord.check_in);
          const checkOut = dayjs(stayRecord.check_out).endOf("day");
          const currentDate = dayjs();

          // Ensure roomRate is a valid number
          const roomRate = parseFloat(stayRecord.roomRate) || 0; // Default to 0 if roomRate is invalid

          // Calculate total rate safely
          const totalRate = calculateTotalRate(
            checkIn,
            checkOut,
            roomRate,
            serviceRate,
            currentDate
          );

          return {
            id: stayRecord.id,
            ...stayRecord,
            check_in: checkIn.format("YYYY-MM-DD"),
            check_out: checkOut.format("YYYY-MM-DD"),
            serviceRate: serviceRate || 0, // Ensure serviceRate is a valid number
            totalRate: totalRate || 0, // Ensure totalRate is a valid number
            status: stayRecord.status,
            roomCharges: totalRate,
            additionalServicesCharges: serviceRate,
            totalAmount: totalRate,
            depositAmount: stayRecord.depositAmount || 0, // Default to 0 if no deposit
          };
        })
      );

      // Set the fetched and processed stay records in the state
      setStayRecords(records);
    } catch (error) {
      console.error("Failed to fetch stay records:", error);
      showSnackbar("Failed to fetch data. Please try again.", "error");
    }
  }, [showSnackbar]);

  const calculateTotalRate = (
    checkInDate,
    checkOutDate,
    roomRate,
    additionalServicesCharges,
    currentDate
  ) => {
    const checkIn = dayjs(checkInDate);
    const checkOut = dayjs(checkOutDate);

    let numberOfDays = checkOut.diff(checkIn, "day");
    numberOfDays = numberOfDays <= 0 ? 1 : numberOfDays;
    const extraDays = currentDate.isAfter(checkOut, "day") ? 1 : 0;

    return (numberOfDays + extraDays) * roomRate + additionalServicesCharges;
  };
  useEffect(() => {
    const fetchData = async () => {
      await fetchRooms(); // Ensure rooms are fetched first if needed
      await fetchStatusOptions();
      await fetchStayRecords(); // Fetch stay records after the dependencies
    };

    fetchData();
  }, [fetchRooms, fetchStatusOptions, fetchStayRecords]);

  const fetchGuestData = async (guestId) => {
    try {
      const response = await axios.get(`${config.API_URL}/guests/${guestId}`);
      const guestData = response.data.guest;
      setSelectedGuest({
        id: guestData.id,
        firstName: guestData.first_name,
        lastName: guestData.last_name,
        email: guestData.email,
        phoneNumber: guestData.phone,
        id_picture: guestData.id_picture || "",
      });
      setOpenDialog("guestUpdate");
    } catch (error) {
      showSnackbar("Failed to fetch guest data", "error");
    }
  };

  const handleOpenDialog = (dialogType, record = null) => {
    setSelectedStayRecord(record);
    if (record?.room_id) {
      setSelectedRoomId(record.room_id);
    }
    if (record?.check_in && record?.check_out) {
      setSelectedDates({
        checkIn: record.check_in,
        checkOut: record.check_out,
      });
    }

    if (dialogType === "guestUpdate" && record?.guest_id) {
      fetchGuestData(record.guest_id);
    } else {
      setOpenDialog(dialogType);
    }
  };

  const handleChangeRoomStatus = async (roomId, statusId) => {
    try {
      await axios.put(`${config.API_URL}/rooms/${roomId}/status`, {
        status_code_id: statusId,
      });
      showSnackbar("Room status updated successfully!", "success");
      fetchStayRecords();
    } catch (error) {
      console.error("Error updating room status:", error);
      showSnackbar("Failed to update room status.", "error");
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(null);
    setSelectedStayRecord(null);
    setSelectedGuest(null);
    setSelectedRoomId(null);
    setSelectedCheckIn(null);
    setSelectedDates({ checkIn: "", checkOut: "" });
  };

  const handleUpdate = (updatedGuest) => {
    const updatedStayRecords = stayRecords.map((stayRecord) =>
      stayRecord.id === updatedGuest.id
        ? { ...stayRecord, ...updatedGuest }
        : stayRecord
    );
    setStayRecords(updatedStayRecords);
    fetchStayRecords();
    showSnackbar("Guest details updated successfully", "success");
    logUserAction(
      userId,
      `Updated guest details for guest ID: ${updatedGuest.id}`
    );
  };

  const handleDateUpdate = async (newCheckInDate, newCheckOutDate) => {
    try {
      await axios.put(
        `${config.API_URL}/stay_records/${selectedStayRecord.id}`,
        {
          check_in: newCheckInDate,
          check_out: newCheckOutDate,
        }
      );
      showSnackbar("Dates updated successfully", "success");

      // Ensure re-fetching the updated stay records after date change
      await fetchStayRecords();

      logUserAction(
        userId,
        `Updated dates for stay record ID: ${selectedStayRecord.id}`
      );
    } catch (error) {
      showSnackbar("Failed to update dates", "error");
    } finally {
      handleCloseDialog();
    }
  };

  const handleRoomSelect = async (selectedRoom) => {
    try {
      await axios.put(
        `${config.API_URL}/stay_records/${selectedStayRecord.id}`,
        {
          room_id: selectedRoom.id,
        }
      );
      showSnackbar("Room updated successfully", "success");
      fetchStayRecords();
      logUserAction(
        userId,
        `Updated room for stay record ID: ${selectedStayRecord.id}`
      );
    } catch (error) {
      showSnackbar("Failed to update room", "error");
    } finally {
      handleCloseDialog();
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await axios.put(`${config.API_URL}/rooms/${selectedRoomId}/status`, {
        status_code_id: newStatus,
      });
      showSnackbar("Room status updated successfully!", "success");
      fetchStayRecords();
      fetchRooms();
      logUserAction(
        userId,
        `Updated room status for room ID: ${selectedRoomId}`
      );
    } catch (error) {
      showSnackbar("Failed to update room status.", "error");
    } finally {
      handleCloseDialog();
    }
  };

  const handleCheckout = (checkIn) => {
    setSelectedCheckIn(checkIn);
    setSelectedRoomId(checkIn.room_id);

    const { roomCharges, additionalServicesCharges, totalAmount, roomRate } =
      checkIn;

    setBillDetails({
      roomCharges,
      additionalServicesCharges,
      discount: 0,
      totalAmount,
      roomRate,
    });

    setOpenDialog("billing");
    logUserAction(userId, `Opened billing for stay record ID: ${checkIn.id}`);
  };

  const handleAddService = (service, charge) => {
    setBillDetails((prevBillDetails) => ({
      ...prevBillDetails,
      additionalServicesCharges:
        prevBillDetails.additionalServicesCharges + charge,
      totalAmount: prevBillDetails.totalAmount + charge,
    }));
  };

  const handleApplyDiscount = (percentage) => {
    const discountAmount =
      (billDetails.roomCharges + billDetails.additionalServicesCharges) *
      (percentage / 100);
    const totalAmountAfterDiscount =
      billDetails.roomRate +
      billDetails.additionalServicesCharges -
      discountAmount;
    setBillDetails((prevBillDetails) => ({
      ...prevBillDetails,
      discount: discountAmount,
      totalAmount: totalAmountAfterDiscount,
    }));
  };

  const handlePayment = async () => {
    try {
      const currentDate = dayjs();
      const checkOutDate = dayjs(selectedCheckIn.check_out);

      if (currentDate.isAfter(checkOutDate)) {
        await handleChangeRoomStatus(
          selectedCheckIn.room_id,
          roomStatusCheckOut
        );
      }

      await axios.post(
        `${config.API_URL}/stay_records/${selectedCheckIn.id}/payment`,
        {
          amount: billDetails.totalAmount,
        }
      );
      showSnackbar("Payment successful!", "success");
      setOpenDialog(false);
      fetchStayRecords();
      logUserAction(
        userId,
        `Processed payment for stay record ID: ${selectedCheckIn.id}`
      );
    } catch (error) {
      console.error("Payment failed:", error);
      showSnackbar("Payment failed. Please try again.", "error");
    }
  };

  const handleDepositClick = (stayRecord) => {
    setSelectedStayRecord(stayRecord);
    setOpenDepositDialog(true);
  };

  const handleCloseDepositDialog = () => {
    setOpenDepositDialog(false);
  };

  const columns = [
    {
      field: "guestName",
      headerName: "Guest Name",
      flex: 2.5,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Tooltip title="View Guest Info">
          <Box
            onClick={() => handleOpenDialog("guestUpdate", params.row)}
            style={{
              fontSize: "0.75rem",
              cursor: "pointer",
              color: theme.palette.primary[900],
            }}
          >
            {params.value}
          </Box>
        </Tooltip>
      ),
    },
    {
      field: "room_number",
      headerName: "Rm No.",
      flex: 1.5,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Box
          style={{
            fontSize: "0.75rem",
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
      flex: 1.5,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Tooltip title="Update check-in">
          <Box
            onClick={() => handleOpenDialog("dateUpdate", params.row)}
            style={{
              fontSize: "0.75rem",
              cursor: "pointer",
              color: theme.palette.primary[900],
            }}
          >
            {params.value}
          </Box>
        </Tooltip>
      ),
    },
    {
      field: "check_out",
      headerName: "Check Out",
      flex: 1.5,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Tooltip title="Update checkOut">
          <Box
            onClick={() => handleOpenDialog("dateUpdate", params.row)}
            style={{
              fontSize: "0.75rem",
              cursor: "pointer",
              color: theme.palette.primary[900],
            }}
          >
            {params.value}
          </Box>
        </Tooltip>
      ),
    },
    {
      field: "guestNumber",
      headerName: "Guest No.",
      flex: 1.5,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Tooltip title="Update Guest Number">
          <Box
            onClick={() => handleOpenDialog("guestNumberUpdate", params.row)}
            style={{
              fontSize: "0.75rem",
              cursor: "pointer",
              color: theme.palette.primary[900],
            }}
          >
            {params.value}
          </Box>
        </Tooltip>
      ),
    },
    {
      field: "roomRate",
      headerName: "Room Rate",
      flex: 1.5,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Box
          style={{
            fontSize: "0.75rem",
            color: theme.palette.primary[900],
          }}
        >
          ₱{params.value}
        </Box>
      ),
    },
    {
      field: "serviceRate",
      headerName: "Service Rate",
      flex: 2,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Box
          style={{
            fontSize: "0.75rem",
            color: theme.palette.primary[900],
          }}
        >
          ₱{params.value}
        </Box>
      ),
    },
    {
      field: "depositAmount",
      headerName: "Deposit",
      flex: 1.5,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Box
          onClick={() => handleDepositClick(params.row)}
          style={{
            fontSize: "0.75rem",
            cursor: "pointer",
            color: theme.palette.primary[900],
          }}
        >
          ₱{params.value}
        </Box>
      ),
    },
    {
      field: "totalRate",
      headerName: "Total Rate",
      flex: 2,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Box
          style={{
            fontSize: "0.75rem",
            color: theme.palette.primary[900],
          }}
        >
          ₱{params.value}
        </Box>
      ),
    },
    {
      field: "roomStatus",
      headerName: "Status",
      flex: 1.2,
      headerAlign: "center",
      align: "center",
      disableColumnMenu: true,
      renderCell: (params) => (
        <Button
          sx={{
            fontSize: "0.75rem",
            backgroundColor: params.row.bgColor,
            color: params.row.textColor,
            width: "100%",
            height: "100%",
            textAlign: "center",
            cursor: "pointer",
          }}
          onClick={() => handleOpenDialog("statusUpdate", params.row)}
        >
          {params.row.code}
        </Button>
      ),
    },
    {
      field: "services",
      headerName: "Services",
      flex: 1.5,
      headerAlign: "center",
      align: "center",
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Tooltip title="Add Service">
          <Button
            sx={{
              fontSize: "0.75rem",
              color: theme.palette.secondary[100],
              background: theme.palette.primary.main,
              "&:hover": {
                transform: "scale(1.1)",
                color: theme.palette.primary[700],
                background: theme.palette.secondary.main,
              },
            }}
            onClick={() => handleOpenDialog("addService", params.row)}
          >
            <NoteAddIcon />
          </Button>
        </Tooltip>
      ),
    },
    {
      field: "checkout",
      headerName: "Checkout",
      flex: 1.5,
      headerAlign: "center",
      align: "center",
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Tooltip title="Checkout">
          <Button
            sx={{
              fontSize: "0.75rem",
              color: theme.palette.secondary[100],
              background: theme.palette.primary.main,
              "&:hover": {
                transform: "scale(1.1)",
                color: theme.palette.primary[700],
                background: theme.palette.secondary.main,
              },
            }}
            onClick={() => handleCheckout(params.row)}
          >
            <CheckOutIcon />
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box display="grid" gridTemplateColumns="repeat(12, 1fr)">
      <Box
        gridColumn="span 12"
        height={isMediumOrLarger ? "75vh" : "50vh"}
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
        <DataGrid
          rows={stayRecords}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
        />
      </Box>

      {openDialog === "guestUpdate" && selectedGuest && (
        <GuestUpdateDialog
          open={true}
          onClose={handleCloseDialog}
          guest={selectedGuest}
          onUpdate={handleUpdate}
          showSnackbar={showSnackbar}
        />
      )}
      {openDialog === "roomUpdate" && (
        <UpdateRoomType
          open={true}
          onClose={handleCloseDialog}
          rooms={rooms}
          onSelectRoom={handleRoomSelect}
        />
      )}
      {openDialog === "statusUpdate" && (
        <StatusDialog
          open={true}
          statusOptions={statusOptions}
          newStatus={newStatus}
          onChange={setNewStatus}
          onClose={handleCloseDialog}
          onUpdate={handleStatusUpdate}
        />
      )}
      {openDialog === "dateUpdate" && (
        <DateUpdateDialog
          open={true}
          onClose={handleCloseDialog}
          checkInDate={selectedDates.checkIn}
          checkOutDate={selectedDates.checkOut}
          onUpdate={handleDateUpdate}
        />
      )}
      {openDialog === "guestNumberUpdate" && selectedStayRecord && (
        <GuestNumberUpdateDialog
          open={true}
          onClose={handleCloseDialog}
          stayRecord={selectedStayRecord}
          onUpdate={handleUpdate}
          showSnackbar={showSnackbar}
        />
      )}
      {openDialog === "addService" && selectedStayRecord && (
        <AddServiceDialog
          showSnackbar={showSnackbar}
          userId={userId}
          logUserAction={logUserAction}
          open={true}
          fetchStayRecords={fetchStayRecords}
          onClose={handleCloseDialog}
          stayRecordId={selectedStayRecord.id}
        />
      )}
      {openDialog === "billing" && selectedCheckIn && (
        <BillingDialog
          roomStatusCheckOut={roomStatusCheckOut}
          open={true}
          onClose={handleCloseDialog}
          billDetails={billDetails}
          setBillDetails={setBillDetails}
          onAddService={handleAddService}
          onApplyDiscount={handleApplyDiscount}
          onPayment={handlePayment}
          onChangeRoomStatus={handleChangeRoomStatus}
          selectedRoomId={selectedRoomId}
          selectedStayRecordId={selectedCheckIn?.id}
          checkInDate={selectedCheckIn?.check_in}
          checkOutDate={selectedCheckIn?.check_out}
          fetchStayRecords={fetchStayRecords}
          userId={userId}
          logUserAction={logUserAction}
          showSnackbar={showSnackbar}
          stayRecord={selectedCheckIn}
          roomRate={selectedStayRecord}
        />
      )}
      {selectedStayRecord && (
        <DepositEditDialog
          open={openDepositDialog}
          onClose={handleCloseDepositDialog}
          stayRecordId={selectedStayRecord.id}
          currentDeposit={selectedStayRecord.depositAmount}
          fetchStayRecords={fetchStayRecords}
          showSnackbar={showSnackbar}
          userId={userId}
          logUserAction={logUserAction}
        />
      )}
      {roomsToCheckout.length > 0 && (
        <CheckoutNotification
          showSnackbar={showSnackbar}
          stayRecords={stayRecords}
          fetchStayRecords={fetchStayRecords}
        />
      )}
    </Box>
  );
};

StayRecordsTable.propTypes = {
  stayRecords: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      guestName: PropTypes.string,
      room_number: PropTypes.string,
      check_in: PropTypes.string,
      check_out: PropTypes.string,
      guestNumber: PropTypes.number,
      roomRate: PropTypes.string,
      serviceRate: PropTypes.number,
      totalRate: PropTypes.number,
      status: PropTypes.string,
    })
  ).isRequired,
  roomStatusCheckOut: PropTypes.number.isRequired,
  userId: PropTypes.string.isRequired,
  showSnackbar: PropTypes.func.isRequired,
  logUserAction: PropTypes.func.isRequired,
  roomSelection: PropTypes.number.isRequired,
};

export default StayRecordsTable;
