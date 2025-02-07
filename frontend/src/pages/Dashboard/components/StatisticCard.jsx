import { Box, Typography, Paper, useTheme } from "@mui/material";
import PropTypes from "prop-types";

const StatisticCard = ({ icon, title, value, bgColor }) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        borderRadius: 3,
        boxShadow: 3,
        background: bgColor,
        color: theme.palette.common.white,
        cursor: "pointer",
        transition: "transform 0.2s ease-in-out",
        "&:hover": {
          boxShadow: 6,
          transform: "translateY(-5px)",
        },
      }}
    >
      <Box display="flex" alignItems="center">
        <Box>{icon}</Box>
        <Box>
          <Typography variant="subtitle1" fontWeight="bold">
            {title}
          </Typography>
          <Typography variant="h3" fontWeight="bold">
            {value}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

StatisticCard.propTypes = {
  icon: PropTypes.element.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  bgColor: PropTypes.string,
};

export default StatisticCard;
