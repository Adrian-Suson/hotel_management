// AddRoomTypeDialog.js
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
} from "@mui/material";

const AddRoomTypeDialog = ({
  open,
  handleClose,
  newRoomType,
  setNewRoomType,
  handleAddRoomType,
}) => (
  <Dialog open={open} onClose={handleClose}>
    <DialogTitle>Add Room Type</DialogTitle>
    <DialogContent>
      <TextField
        label="Room Type"
        value={newRoomType}
        onChange={(e) => setNewRoomType(e.target.value)}
        fullWidth
        margin="normal"
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={handleAddRoomType} variant="contained" color="primary">
        Add
      </Button>
      <Button onClick={handleClose} variant="contained" color="secondary">
        Cancel
      </Button>
    </DialogActions>
  </Dialog>
);

AddRoomTypeDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  newRoomType: PropTypes.string.isRequired,
  setNewRoomType: PropTypes.func.isRequired,
  handleAddRoomType: PropTypes.func.isRequired,
};

export default AddRoomTypeDialog;
