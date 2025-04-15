import {
  Box,
  Collapse,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  ChevronLeft,
  HomeOutlined,
  PeopleAltOutlined,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import PropTypes from "prop-types";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import BedroomParentOutlinedIcon from "@mui/icons-material/BedroomParentOutlined";
import ReservationIcon from "@mui/icons-material/BookOnlineOutlined";
import HistoryIcon from "@mui/icons-material/History";
import GroupsIcon from "@mui/icons-material/Groups";
import HotelIcon from "@mui/icons-material/Hotel";
import SettingsIcon from "@mui/icons-material/Settings";
import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FlexBetween from "../FlexBetween";
import Logo from "../../../assets/Logo.png";
import axios from "axios";
import config from "../../state/config";
import UserProfileModal from "./UserProfile";

const adminNavItems = [
  { text: "Dashboard", icon: <HomeOutlined /> },
  { text: "Reservation", icon: <ReservationIcon /> },
  { text: "Stay Record", icon: <HotelIcon /> },
  { text: "Guest Record", icon: <GroupsIcon /> },
  { text: "Transaction History", icon: <HistoryIcon /> },
];

const staffNavItems = [
  { text: "Dashboard", icon: <HomeOutlined /> },
  { text: "Reservation", icon: <ReservationIcon /> },
  { text: "Stay Record", icon: <HotelIcon /> },
  { text: "Guest Record", icon: <GroupsIcon /> },
  { text: "Transaction History", icon: <HistoryIcon /> },
];

const managementItems = [
  { text: "Rooms", icon: <BedroomParentOutlinedIcon /> },
  { text: "Users", icon: <PeopleAltOutlined /> },
  { text: "Settings", icon: <SettingsIcon /> },
];

const Sidebar = ({
  drawerWidth = "240px",
  isSidebarOpen,
  setIsSidebarOpen,
  isNonMobile = true,
  setNavTitle,
  userRole,
  isMinimized,
}) => {
  const { pathname } = useLocation();
  const [profile, setProfile] = useState({});
  const [active, setActive] = useState("");
  const [openManagement, setOpenManagement] = useState(false);
  const [user, setUser] = useState(null);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    setActive(pathname.substring(1));
  }, [pathname]);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await axios.get(`${config.API_URL}/profile/${userId}`);
      setProfile(response.data.profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }, [userId]);

  const fetchUser = useCallback(async () => {
    try {
      const response = await axios.get(`${config.API_URL}/users/${userId}`);
      setUser(response.data.user);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUser();
      fetchProfile();
    }
  }, [userId, fetchUser, fetchProfile]);

  const handleNavigation = async (path, action, title) => {
    navigate(path);
    setActive(path);
    setNavTitle(title);
    if (userId) {
      await axios.post(`${config.API_URL}/user_log`, {
        userId,
        action,
      });
    }
  };

  const handleLogout = async () => {
    if (userId) {
      await axios.post(`${config.API_URL}/user_log`, {
        userId,
        action: "User logged out",
      });
    }
    navigate("/", { replace: true });
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    window.location.reload(false);
  };

  const renderNavItem = ({ text, icon }) => {
    const lcText = text.toLowerCase().replace(/\s+/g, "-");
    const path = `${userRole}/${lcText}`;
    return (
      <ListItem key={text} disablePadding>
        <Tooltip title={isMinimized ? text : ""} placement="right">
          <ListItemButton
            onClick={() =>
              handleNavigation(`/${path}`, `Navigated to ${text}`, text)
            }
            sx={{
              backgroundColor:
                active === path ? theme.palette.primary.light : "transparent",
              color:
                active === path
                  ? theme.palette.primary.contrastText
                  : theme.palette.text.primary,
              "&:hover": {
                backgroundColor: theme.palette.primary.light,
                color: theme.palette.primary.contrastText,
              },
              justifyContent: isMinimized ? "center" : "flex-start",
              px: isMinimized ? 2 : 3,
              py: 1.5,
            }}
          >
            <ListItemIcon
              sx={{
                color:
                  active === path
                    ? theme.palette.primary.contrastText
                    : theme.palette.text.primary,
                minWidth: isMinimized ? 0 : 40,
                justifyContent: isMinimized ? "center" : "flex-start",
              }}
            >
              {icon}
            </ListItemIcon>
            {!isMinimized && <ListItemText primary={text} />}
          </ListItemButton>
        </Tooltip>
      </ListItem>
    );
  };

  return (
    <Box component="nav">
      {isSidebarOpen && (
        <Drawer
          open={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          variant="persistent"
          anchor="left"
          sx={{
            width: isMinimized ? "64px" : drawerWidth,
            "& .MuiDrawer-paper": {
              color: theme.palette.text.primary,
              backgroundColor: theme.palette.background.default,
              boxSizing: "border-box",
              borderWidth: isNonMobile ? 0 : "2px",
              width: isMinimized ? "64px" : drawerWidth,
              transition: "width 0.3s ease",
              display: "flex",
              flexDirection: "column",
            },
          }}
        >
          {/* Header Section */}
          <Box p={2}>
            <FlexBetween>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap="0.5rem"
                sx={{ userSelect: "none" }}
              >
                <Box
                  component="img"
                  alt="Hotel Logo"
                  src={Logo}
                  height={isMinimized ? "30px" : "40px"}
                  width={isMinimized ? "30px" : "40px"}
                  borderRadius="50%"
                  sx={{ objectFit: "cover" }}
                />
                {!isMinimized && (
                  <Typography variant="h6" color={theme.palette.text.primary}>
                    Hotel Management
                  </Typography>
                )}
              </Box>
              {!isNonMobile && !isMinimized && (
                <IconButton onClick={() => setIsSidebarOpen(false)}>
                  <ChevronLeft />
                </IconButton>
              )}
            </FlexBetween>
          </Box>

          {/* Navigation Items */}
          <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
            <List>
              {(userRole === "admin" ? adminNavItems : staffNavItems).map(
                renderNavItem
              )}
              {userRole === "admin" && (
                <>
                  <ListItem disablePadding>
                    <Tooltip
                      title={isMinimized ? "Management" : ""}
                      placement="right"
                    >
                      <ListItemButton
                        onClick={() => setOpenManagement(!openManagement)}
                        sx={{
                          backgroundColor: openManagement
                            ? theme.palette.primary.light
                            : "transparent",
                          color: openManagement
                            ? theme.palette.primary.contrastText
                            : theme.palette.text.primary,
                          "&:hover": {
                            backgroundColor: theme.palette.primary.light,
                            color: theme.palette.primary.contrastText,
                          },
                          justifyContent: isMinimized ? "center" : "flex-start",
                          px: isMinimized ? 2 : 3,
                          py: 1.5,
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            color: openManagement
                              ? theme.palette.primary.contrastText
                              : theme.palette.text.primary,
                            minWidth: isMinimized ? 0 : 40,
                            justifyContent: isMinimized
                              ? "center"
                              : "flex-start",
                          }}
                        >
                          {isMinimized ? (
                            openManagement ? (
                              <ExpandLess />
                            ) : (
                              <ExpandMore />
                            )
                          ) : (
                            <SettingsIcon />
                          )}
                        </ListItemIcon>
                        {!isMinimized && <ListItemText primary="Management" />}
                      </ListItemButton>
                    </Tooltip>
                  </ListItem>
                  <Collapse in={openManagement} timeout="auto" unmountOnExit>
                    <List sx={{ ml: isMinimized ? 0 : 4 }} disablePadding>
                      {managementItems.map(renderNavItem)}
                    </List>
                  </Collapse>
                </>
              )}
            </List>
          </Box>

          {/* Profile Section */}
          {user && (
            <Box
              sx={{
                mt: "auto",
                p: isMinimized ? 1 : 2,
                borderTop: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box
                display="flex"
                flexDirection={isMinimized ? "column" : "row"}
                alignItems="center"
                gap={isMinimized ? 1 : 2}
                onClick={() => setOpenProfileModal(true)}
                sx={{ cursor: "pointer" }}
              >
                <Avatar
                  src={`${config.API_URL}/profile_pictures/${profile.image_url}`}
                  sx={{ width: isMinimized ? 30 : 40, height: isMinimized ? 30 : 40 }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </Avatar>
                {!isMinimized && (
                  <Box flexGrow={1}>
                    <Typography variant="body2">
                      {profile.first_name} {profile.last_name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {user.role}
                    </Typography>
                  </Box>
                )}
                <Tooltip title="Log Out" placement="right">
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLogout();
                    }}
                    aria-label="Log out"
                    sx={{
                      color: theme.palette.text.secondary,
                      "&:hover": { color: theme.palette.error.main },
                      ml: isMinimized ? 0 : "auto",
                    }}
                  >
                    <ExitToAppIcon fontSize={isMinimized ? "small" : "medium"} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          )}
          {openProfileModal && (
            <UserProfileModal
              userId={userId}
              open={openProfileModal}
              onClose={() => setOpenProfileModal(false)}
              fetchUser={fetchUser}
              fetchProfile={fetchProfile}
            />
          )}
        </Drawer>
      )}
    </Box>
  );
};

Sidebar.propTypes = {
  drawerWidth: PropTypes.string,
  isSidebarOpen: PropTypes.bool.isRequired,
  setIsSidebarOpen: PropTypes.func.isRequired,
  isNonMobile: PropTypes.bool,
  setNavTitle: PropTypes.func.isRequired,
  userRole: PropTypes.string.isRequired,
  isMinimized: PropTypes.bool.isRequired,
};

export default Sidebar;