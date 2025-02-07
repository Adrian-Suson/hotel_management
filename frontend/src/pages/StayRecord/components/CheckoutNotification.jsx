import { useState, useEffect } from "react";
import {
  Snackbar,
  Alert,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Fab,
  styled,
} from "@mui/material";
import NotificationImportantIcon from "@mui/icons-material/NotificationImportant";
import PropTypes from "prop-types";
import dayjs from "dayjs";

const StyledFab = styled(Fab)(({ theme }) => ({
  color: theme.palette.secondary[100],
  background: theme.palette.primary.main,
  fontSize: "0.75rem",
  position: "fixed",
  bottom: 5,
  right: 16,
  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)",
  width: "48px",
  height: "48px",
  minHeight: "48px",
  "&:hover": {
    transform: "scale(1.1)",
    color: theme.palette.primary[700],
    background: theme.palette.secondary.main,
  },
}));

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

const StyledListItem = styled(ListItem)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  "&:last-child": {
    borderBottom: "none",
  },
}));
const CheckoutNotification = ({ stayRecords, showSnackbar, fetchStayRecords }) => {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [checkoutTodayRecords, setCheckoutTodayRecords] = useState([]);

  useEffect(() => {
    // Today's date
    const today = dayjs().startOf('day'); // Strip time component from today's date

    // Filter records due for checkout today
    const checkoutToday = stayRecords.filter((record) =>
      dayjs(record.check_out).isSame(today, 'day')
    );

    // Set records and trigger notification if any rooms are due for checkout
    setCheckoutTodayRecords(checkoutToday);
    if (checkoutToday.length > 0) {
      setNotificationOpen(true);
    }
  }, [stayRecords]);

  const handleNotificationClose = () => {
    setNotificationOpen(false);
  };

  const handleNotificationDialogOpen = () => {
    setNotificationDialogOpen(true);
  };

  const handleNotificationDialogClose = () => {
    setNotificationDialogOpen(false);
  };

  // You can add an action here to refetch stay records if necessary
  const handleRefetch = async () => {
    await fetchStayRecords();  // Trigger a refetch from parent when needed
    showSnackbar("Stay records refreshed", "success");
  };

  return (
    <>
      <Snackbar
        open={notificationOpen}
        autoHideDuration={6000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleNotificationClose} severity="warning" sx={{ width: "100%" }}>
          There are rooms that are due for checkout today!
        </Alert>
      </Snackbar>
      <StyledFab onClick={handleNotificationDialogOpen}>
        <Badge badgeContent={checkoutTodayRecords.length} color="error">
          <NotificationImportantIcon />
        </Badge>
      </StyledFab>
      <StyledDialog open={notificationDialogOpen} onClose={handleNotificationDialogClose}>
        <DialogTitle>Rooms Due for Checkout Today</DialogTitle>
        <DialogContent>
          <List>
            {checkoutTodayRecords.map((record) => (
              <StyledListItem key={record.id}>
                <ListItemText
                  primary={`Room ${record.room_number}`}
                  secondary={`Guest: ${record.guestName}`}
                />
              </StyledListItem>
            ))}
          </List>
          <button onClick={handleRefetch}>Refresh Stay Records</button>
        </DialogContent>
      </StyledDialog>
    </>
  );
};

CheckoutNotification.propTypes = {
  stayRecords: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      guestName: PropTypes.string,
      room_number: PropTypes.string,
      check_out: PropTypes.string.isRequired,
    })
  ).isRequired,
  showSnackbar: PropTypes.func.isRequired,
  fetchStayRecords: PropTypes.func.isRequired,  // Accept fetchStayRecords as prop
};

export default CheckoutNotification;
