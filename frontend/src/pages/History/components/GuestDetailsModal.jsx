import {
  Modal,
  Typography,
  Box,
  Button,
  useTheme,
  Divider,
  Grid,
} from "@mui/material";
import PropTypes from "prop-types";
import config from "../../../state/config";
import logoRight from "../../../../assets/Logo.png";
import logoLeft from "../../../../assets/Logo2.jpg";
import dayjs from "dayjs";

const GuestDetailsModal = ({
  open,
  onClose,
  record,
  LoguserId,
  logUserAction,
  showSnackbar,
}) => {
  const theme = useTheme();

  if (!record) {
    return null;
  }

  // Calculate the stay duration in days
  const stayDuration = Math.max(
    dayjs(record.check_out).diff(dayjs(record.check_in), "day"),
    1
  );

  // Calculate the total room rate based on the stay duration
  const roomRate = parseFloat(record.roomRate) || 0;
  const totalRoomRate = roomRate * stayDuration;

  // Calculate overtime charges
  const isOvertime = dayjs(record.payment_date).isAfter(
    dayjs(record.check_out).endOf("day")
  );
  const overtimeDays = isOvertime
    ? dayjs(record.payment_date).diff(dayjs(record.check_out), "day")
    : 0;
  const overtimeCharges = overtimeDays * roomRate;

  // Calculate deposit and total amount including overtime charges and deposit
  const depositAmount = parseFloat(record.deposit) || 0;
  const serviceCharges = parseFloat(record.total_service_charges) || 0;
  const totalAmount =
    totalRoomRate + serviceCharges + overtimeCharges - depositAmount;

  const formattedPaymentDate = dayjs(record.payment_date).format("YYYY-MM-DD");

  const handlePrint = () => {
    const printContent = `
       <div style="width: 600px; padding: 20px; font-family: Arial, sans-serif;">
      <div class="header-container" style="text-align: center; border-bottom: 1px solid #000; padding-bottom: 10px;">
        <img src="${logoRight}" alt="Left Logo" style="display: inline-block; vertical-align: middle; width: 100px; height: auto;">
        <div style="display: inline-block; vertical-align: middle; text-align: center; width: 60%;">
          <h1 style="margin: 0; font-size: 18px; font-weight: bold;">Republic of the Philippines</h1>
          <h2 style="margin: 0; font-size: 16px; font-weight: bold;">ZAMBOANGA PENINSULA POLYTECHNIC STATE UNIVERSITY</h2>
          <h3 style="margin: 0; font-size: 14px;">Region IX, Zamboanga Peninsula<br>R.T. Lim Blvd., Zamboanga City</h3>
          <h2 style="margin: 0; font-size: 16px; font-weight: bold;">SCHOOL OF BUSINESS ADMINISTRATION</h2>
          <h2 style="margin: 0; font-size: 16px; font-weight: bold;">GUEST DETAILS REPORT</h2>
        </div>
        <img src="${logoLeft}" alt="Right Logo" style="display: inline-block; vertical-align: middle; width: 100px; height: auto;">
      </div>

      <div style="text-align: center; margin-top: 20px;">
        <img src="${config.API_URL}/id_picture/${
      record.guestIdPicture
    }" alt="Profile Picture" style="width: 150px; margin-top: 10px;">
        <h3 style="color: ${
          theme.palette.primary[900]
        }; margin-top: 10px;">Guest Details</h3>
      </div>
        <hr>
        <h3 style="color: ${
          theme.palette.text.primary
        };">Personal Information</h3>
        <p><strong>Name:</strong> ${record.guestName}</p>
        <p><strong>Email:</strong> ${record.guestEmail}</p>
        <p><strong>Phone:</strong> ${record.guestPhone}</p>
        <hr>
        <h3 style="color: ${theme.palette.text.primary};">Room Details</h3>
        <p><strong>Room Number:</strong> ${record.room_number}</p>
        <p><strong>Room Type:</strong> ${record.roomTypeName}</p>
        <p><strong>Stay Duration:</strong> ${stayDuration} day(s)</p>
        <hr>
        <h3 style="color: ${theme.palette.text.primary};">Stay Information</h3>
        <p><strong>Check In:</strong> ${record.check_in}</p>
        <p><strong>Check Out:</strong> ${record.check_out} ${
      isOvertime
        ? `<strong style="color: red;">(Overtime: ${formattedPaymentDate})</strong>`
        : ""
    }</p>
        <p><strong>Number of Guests:</strong> ${record.guestNumber}</p>
        <p><strong>Adults:</strong> ${record.adults}</p>
        <p><strong>Kids:</strong> ${record.kids}</p>
        ${
          isOvertime
            ? `<p><strong style="color: red;">Overtime:</strong> ${overtimeDays} extra day(s) charged at ₱${roomRate.toFixed(
                2
              )} per day.</p>`
            : ""
        }
        <hr>
        <h3 style="color: ${
          theme.palette.text.primary
        };">Payment Information</h3>
        <p><strong>Room Rate:</strong> ₱${roomRate.toFixed(
          2
        )} x ${stayDuration} day(s) = ₱${totalRoomRate.toFixed(2)}</p>
        ${
          isOvertime
            ? `<p><strong>Overtime Charges:</strong> ₱${overtimeCharges.toFixed(
                2
              )} (${overtimeDays} day(s))</p>`
            : ""
        }
        <p><strong>Service Charges:</strong> ${
          serviceCharges > 0 ? `₱${serviceCharges.toFixed(2)}` : "None"
        }</p>
        <p><strong>Deposit:</strong> ₱${depositAmount.toFixed(2)}</p>
        <p><strong>Total Amount:</strong> ₱${totalAmount.toFixed(2)}</p>
        <p><strong>Discount:</strong> ${
          record.discount_percentage && record.discount_name
            ? `${record.discount_percentage}% (${record.discount_name})`
            : "None"
        }</p>
        <p><strong>Amount Paid:</strong> ₱${parseFloat(
          record.amount_paid || 0
        ).toFixed(2)}</p>
      </div>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print</title>
        </head>
        <body onload="window.print(); window.close();">
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();

    logUserAction(LoguserId, `Printed guest details of ID: ${record.guestId}`);
    showSnackbar("Guest details printed successfully.", "success");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(5px)",
      }}
    >
      <Box
        sx={{
          width: 950,
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          p: 4,
          position: "relative",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img
            src={`${config.API_URL}/id_picture/${record.guestIdPicture}` || ""}
            alt="Profile Picture"
            style={{ width: 150 }}
          />
        </Box>

        <Typography
          variant="h5"
          component="h2"
          textAlign="center"
          gutterBottom
          sx={{ color: theme.palette.primary[900] }}
        >
          Guest Details
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={1}>
          <Grid item xs={12} sm={6}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: theme.palette.text.primary, mb: 0.5 }}
            >
              Personal Information
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: theme.palette.text.primary, mb: 0.5 }}
            >
              <strong>Name:</strong> {record.guestName}
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: theme.palette.text.primary, mb: 0.5 }}
            >
              <strong>Email:</strong> {record.guestEmail}
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: theme.palette.text.primary, mb: 0.5 }}
            >
              <strong>Phone:</strong> {record.guestPhone}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: theme.palette.text.primary, mb: 0.5 }}
            >
              Room Details
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: theme.palette.text.primary, mb: 0.5 }}
            >
              <strong>Room Number:</strong> {record.room_number}
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: theme.palette.text.primary, mb: 0.5 }}
            >
              <strong>Room Type:</strong> {record.roomTypeName}
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: theme.palette.text.primary, mb: 0.5 }}
            >
              <strong>Stay Duration:</strong> {stayDuration} day(s)
              {isOvertime && <span> + {overtimeDays} extra day(s)</span>}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: theme.palette.text.primary, mb: 0.5 }}
            >
              Stay Information
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: theme.palette.text.primary, mb: 0.5 }}
            >
              <strong>Check In:</strong> {record.check_in}
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: theme.palette.text.primary, mb: 0.5 }}
            >
              <strong>Check Out:</strong> {record.check_out}{" "}
              {isOvertime && (
                <strong style={{ color: "red", mb: 0.5 }}>
                  (Overtime: {formattedPaymentDate})
                </strong>
              )}
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: theme.palette.text.primary, mb: 0.5 }}
            >
              <strong>Number of Guests:</strong> {record.guestNumber}
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: theme.palette.text.primary, mb: 0.5 }}
            >
              <strong>Adults:</strong> {record.adults}
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: theme.palette.text.primary, mb: 0.5 }}
            >
              <strong>Kids:</strong> {record.kids}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: theme.palette.text.primary, mb: 0.5 }}
            >
              Payment Information
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: theme.palette.text.primary, mb: 0.5 }}
            >
              <strong>Room Rate:</strong> ₱{roomRate.toFixed(2)} x{" "}
              {stayDuration} day(s) = ₱{totalRoomRate.toFixed(2)}
            </Typography>
            {isOvertime && (
              <Typography
                variant="body1"
                sx={{ color: theme.palette.text.primary, mb: 0.5 }}
              >
                <strong>Overtime Charges:</strong> ₱{overtimeCharges.toFixed(2)}{" "}
                ({overtimeDays} day(s))
              </Typography>
            )}
            <Typography
              variant="body1"
              sx={{ color: theme.palette.text.primary, mb: 0.5 }}
            >
              <strong>Service Charges:</strong>{" "}
              {serviceCharges > 0 ? `₱${serviceCharges.toFixed(2)}` : "None"}
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: theme.palette.text.primary, mb: 0.5 }}
            >
              <strong>Deposit:</strong> ₱{depositAmount.toFixed(2)}
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: theme.palette.text.primary, mb: 0.5 }}
            >
              <strong>Total Amount:</strong> ₱{totalAmount.toFixed(2)}
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: theme.palette.text.primary, mb: 0.5 }}
            >
              <strong>Discount:</strong>{" "}
              {record.discount_percentage && record.discount_name
                ? `${record.discount_percentage}% (${record.discount_name})`
                : "None"}
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: theme.palette.text.primary, mb: 0.5 }}
            >
              <strong>Amount Paid:</strong> ₱
              {parseFloat(record.amount_paid || 0).toFixed(2)}
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, display: "flex", justifyContent: "center", gap: 2 }}>
          <Button
            onClick={onClose}
            color="primary"
            variant="contained"
            sx={{ mt: 2 }}
          >
            Close
          </Button>
          <Button
            onClick={handlePrint}
            color="secondary"
            variant="contained"
            sx={{ mt: 2 }}
          >
            Print
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

GuestDetailsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  record: PropTypes.shape({
    guestId: PropTypes.number,
    guestIdPicture: PropTypes.string,
    guestName: PropTypes.string,
    guestEmail: PropTypes.string,
    guestPhone: PropTypes.string,
    room_number: PropTypes.string,
    roomRate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    roomTypeName: PropTypes.string,
    status: PropTypes.string,
    check_in: PropTypes.string,
    check_out: PropTypes.string,
    payment_date: PropTypes.string,
    adults: PropTypes.number,
    kids: PropTypes.number,
    guestNumber: PropTypes.number,
    amount_paid: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    total_service_charges: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    discount_percentage: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    discount_name: PropTypes.string,
    deposit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  logUserAction: PropTypes.func.isRequired,
  showSnackbar: PropTypes.func.isRequired,
  LoguserId: PropTypes.string.isRequired,
};

export default GuestDetailsModal;
