import { useState } from "react";
import PropTypes from "prop-types";
import {
  AppBar,
  IconButton,
  Toolbar,
  Typography,
  useTheme,
  Box,
  Tooltip,
} from "@mui/material";
import {
  Info as InfoIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import AboutUsDialog from "./AboutUS";

const Navbar = ({
  isNonMobile = true,
  navTitle,
  isMinimized,
  setIsMinimized,
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  const theme = useTheme();
  const [aboutUsOpen, setAboutUsOpen] = useState(false);

  
  const handleAboutUsOpen = () => setAboutUsOpen(true);
  const handleAboutUsClose = () => setAboutUsOpen(false);

  const displayTitle =
    navTitle === "Dashboard"
      ? "Dashboard Overview"
      : navTitle !== "Transaction History" &&
        navTitle !== "Settings" &&
        navTitle !== "Guest History"
      ? `${navTitle} Management`
      : navTitle;

  const handleToggle = () => {
    if (isNonMobile) {
      setIsMinimized(!isMinimized);
    } else {
      setIsSidebarOpen(!isSidebarOpen);
    }
  };

  return (
    <>
      <AppBar position="static" sx={{ background: "none", boxShadow: "none" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* Menu icon toggles sidebar or minimization */}
          <IconButton onClick={handleToggle}>
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: "flex", justifyContent: "center", ml: "auto" }}>
          <Typography
            variant="h3"
            color={theme.palette.primary.main}
            sx={{ fontWeight: "bold", letterSpacing: 1 }}
          >
            {displayTitle}
          </Typography>
          </Box>

          {/* Right-side buttons */}
          <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}>
            <Tooltip title="About US" arrow>
              <IconButton
                size="small"
                onClick={handleAboutUsOpen}
                sx={{ color: theme.palette.primary.main }}
              >
                <InfoIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <AboutUsDialog open={aboutUsOpen} onClose={handleAboutUsClose} />
    </>
  );
};

Navbar.propTypes = {
  navTitle: PropTypes.string.isRequired,
  isMinimized: PropTypes.bool.isRequired,
  setIsMinimized: PropTypes.func.isRequired,
  isNonMobile: PropTypes.bool,
  isSidebarOpen: PropTypes.bool.isRequired,
  setIsSidebarOpen: PropTypes.func.isRequired,
};

export default Navbar;
