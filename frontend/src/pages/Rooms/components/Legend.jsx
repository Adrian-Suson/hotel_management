import { Box, Typography, Tooltip, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import config from "../../../state/config";

const Legend = () => {
  const [statusOptions, setStatusOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStatusOptions = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/status`);
        if (response.data.success) {
          setStatusOptions(response.data.statusOptions);
        } else {
          console.error("Failed to fetch status options");
          setError("Failed to fetch status options");
        }
      } catch (error) {
        console.error("Fetch Status Options Error:", error);
        setError("Error fetching status options");
      } finally {
        setLoading(false);
      }
    };

    fetchStatusOptions();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="center" flexWrap="wrap" p={1} borderRadius="10px">
      {statusOptions.map((status) => (
        <Tooltip key={status.code} title={status.description || status.label} arrow>
          <Box
            display="flex"
            alignItems="center"
            m={0.5}
            p={0.5}
            bgcolor={status.color}
            color={status.text_color}
            borderRadius="5px"
            boxShadow="0 1px 3px rgba(0, 0, 0, 0.2)"
            minWidth="60px"
            justifyContent="center"
          >
            <Typography variant="body2" style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
              {status.code}
            </Typography>
          </Box>
        </Tooltip>
      ))}
    </Box>
  );
};

export default Legend;
