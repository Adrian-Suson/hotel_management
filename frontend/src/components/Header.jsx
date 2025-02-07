import { Typography, Box, useTheme } from "@mui/material";
import PropTypes from "prop-types";


const Header = ({ title, subtitle }) => {
  const theme = useTheme();
  return (
    <Box display="flex" flexDirection="column" alignItems="flex-start">
      <Typography
        variant="h2"
        color={theme.palette.secondary.dark}
        fontWeight="bold"
        sx={{ mb: "5px" }}
      >
        {title}
      </Typography>
      <Typography variant="h5" color={theme.palette.secondary.dark}>
        {subtitle}
      </Typography>
    </Box>
  );
};

Header.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
};

export default Header;
