import { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
} from "@mui/material";
import PropTypes from "prop-types";
import axios from "axios";
import config from "../../../state/config";

const DepositEditDialog = ({
    open,
    onClose,
    stayRecordId,
    currentDeposit,
    fetchStayRecords,
    showSnackbar,
    userId,
    logUserAction
}) => {
    const [depositAmount, setDepositAmount] = useState(currentDeposit);

    const handleSave = async () => {
        try {
            // Update the deposit amount for the stay record
            await axios.put(`${config.API_URL}/stay_records/${stayRecordId}/deposit`, {
                deposit_amount: depositAmount,
            });

            // Log the user action
            logUserAction(userId, `Updated deposit for stay record ID: ${stayRecordId} to amount: ₱${depositAmount}`);

            showSnackbar("Deposit updated successfully", "success");
            fetchStayRecords(); // Refresh the stay records after the update
            onClose(); // Close the dialog
        } catch (error) {
            showSnackbar("Failed to update deposit", "error");
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Edit Deposit</DialogTitle>
            <DialogContent>
                <Box m={1}>
                    <TextField
                        label="Deposit Amount"
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        fullWidth
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={onClose} color="secondary">
                    Cancel
                </Button>
                <Button variant="contained" onClick={handleSave} color="primary">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

DepositEditDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    stayRecordId: PropTypes.number.isRequired,
    currentDeposit: PropTypes.string.isRequired,
    fetchStayRecords: PropTypes.func.isRequired,
    showSnackbar: PropTypes.func.isRequired,
    userId: PropTypes.string.isRequired,  // Define the userId prop type
    logUserAction: PropTypes.func.isRequired,  // Define the logUserAction prop type
};

export default DepositEditDialog;
