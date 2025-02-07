import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { ChromePicker } from 'react-color';

const AddStatusCodeDialog = ({
  open,
  handleClose,
  newStatusCode,
  setNewStatusCode,
  newStatusLabel,
  setNewStatusLabel,
  newStatusColor,
  setNewStatusColor,
  newTextColor,
  setNewTextColor,
  handleAddStatusCode,
}) => {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Add Status Code</DialogTitle>
      <DialogContent>
        <TextField
          label="Status Code"
          value={newStatusCode}
          onChange={(e) => setNewStatusCode(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Status Label"
          value={newStatusLabel}
          onChange={(e) => setNewStatusLabel(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          Background Color:
        </Typography>
        <Box display="flex" justifyContent="center">
          <ChromePicker
            color={newStatusColor}
            onChangeComplete={(color) => setNewStatusColor(color.hex)}
          />
        </Box>
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          Text Color:
        </Typography>
        <Box display="flex" justifyContent="center">
          <ChromePicker
            color={newTextColor}
            onChangeComplete={(color) => setNewTextColor(color.hex)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleAddStatusCode} variant="contained" color="primary">
          Add
        </Button>
        <Button onClick={handleClose} variant="contained" color="secondary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

AddStatusCodeDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  newStatusCode: PropTypes.string.isRequired,
  setNewStatusCode: PropTypes.func.isRequired,
  newStatusLabel: PropTypes.string.isRequired,
  setNewStatusLabel: PropTypes.func.isRequired,
  newStatusColor: PropTypes.string.isRequired,
  setNewStatusColor: PropTypes.func.isRequired,
  newTextColor: PropTypes.string.isRequired,
  setNewTextColor: PropTypes.func.isRequired,
  handleAddStatusCode: PropTypes.func.isRequired,
};

export default AddStatusCodeDialog;
