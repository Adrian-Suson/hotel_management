import PropTypes from "prop-types";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  MenuItem,
  Box,
} from "@mui/material";

const StatusDialog = ({
  open,
  statusOptions,
  newStatus,
  onChange,
  onClose,
  onUpdate,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Update Room Status</DialogTitle>
    <DialogContent>
      <TextField
        select
        label="Status"
        value={newStatus}
        onChange={(e) => onChange(e.target.value)}
        fullWidth
        margin="normal"
      >
        {statusOptions.map((status) => (
          <MenuItem key={status.id} value={status.id}>
            <Box sx={styles.statusOption}>
              <Box sx={styles.statusColorBox(status.color, status.text_color)} />
              {status.label}
            </Box>
          </MenuItem>
        ))}
      </TextField>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary">
        Cancel
      </Button>
      <Button onClick={onUpdate} color="primary">
        Update
      </Button>
    </DialogActions>
  </Dialog>
);

const styles = {
  statusOption: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  statusColorBox: (backgroundColor, textColor) => ({
    width: 20,
    height: 20,
    backgroundColor,
    marginRight: 1,
    color: textColor,
  }),
};

StatusDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  statusOptions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      code: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      color: PropTypes.string,
      text_color: PropTypes.string,
    })
  ).isRequired,
  newStatus: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  onChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default StatusDialog;
