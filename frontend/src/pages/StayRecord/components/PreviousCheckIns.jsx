import { Modal, Typography, Box } from "@mui/material";
import PropTypes from "prop-types";

const PreviousCheckInsModal = ({ open, onClose, history }) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="previous-check-ins-title"
            aria-describedby="previous-check-ins-description"
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 300,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                }}
            >
                <Typography id="previous-check-ins-title" variant="h6" component="h2" gutterBottom>
                    Previous Check-Ins
                </Typography>
                <Typography id="previous-check-ins-description" variant="body1">
                    {history}
                </Typography>
            </Box>
        </Modal>
    );
};

PreviousCheckInsModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    history: PropTypes.string.isRequired,
};

export default PreviousCheckInsModal;
