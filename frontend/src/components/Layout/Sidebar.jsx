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
  Divider,
  Tooltip,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRightOutlined,
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
    }
    if (userId) {
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
            px: isMinimized ? 2 : 4,
          }}
        >
          <ListItemIcon
            sx={{
              color:
                active === path
                  ? theme.palette.primary.contrastText
                  : theme.palette.text.primary,
            }}
          >
            {icon}
          </ListItemIcon>
          {!isMinimized && <ListItemText primary={text} />}
          {active === path && !isMinimized && <ChevronRightOutlined />}
        </ListItemButton>
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
            width: isMinimized ? "70px" : drawerWidth,
            "& .MuiDrawer-paper": {
              color: theme.palette.text.primary,
              backgroundColor: theme.palette.background.default,
              boxSizing: "border-box",
              borderWidth: isNonMobile ? 0 : "2px",
              width: isMinimized ? "64px" : drawerWidth,
              transition: "width 0.3s",
              overflow: "hidden", // Prevent scrolling the whole drawer
            },
          }}
        >
          <Box width="100%" height="100%" display="flex" flexDirection="column">
            <Box p={isMinimized ? 1.5 : 4}>
              <FlexBetween color={theme.palette.primary.main}>
                <Box
                  display="flex"
                  alignItems="center"
                  gap="0.5rem"
                  sx={{ userSelect: "none" }}
                >
                  <Box
                    component="img"
                    alt="profile"
                    src={Logo}
                    height={isMinimized ? "35px" : "50px"}
                    width={isMinimized ? "35px" : "50px"}
                    borderRadius="50%"
                    sx={{ objectFit: "cover" }}
                  />
                  {!isMinimized && (
                    <Typography variant="h6" color={theme.palette.text.primary}>
                      Hotel Management
                    </Typography>
                  )}
                </Box>

                {!isNonMobile && (
                  <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    <ChevronLeft />
                  </IconButton>
                )}
              </FlexBetween>
            </Box>

            {/* Scrollable content */}
            <Box
              sx={{
                flexGrow: 1,
                overflowY: "auto",
                maxHeight: "calc(90vh - 160px)",
              }}
            >
              <List>
                {(userRole === "admin" ? adminNavItems : staffNavItems).map(
                  renderNavItem
                )}
                {userRole === "admin" && (
                  <>
                    <ListItem disablePadding>
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
                          px: isMinimized ? 2 : 4,
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            color: openManagement
                              ? theme.palette.primary.contrastText
                              : theme.palette.text.primary,
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
                        {isMinimized ? null : openManagement ? (
                          <ExpandLess />
                        ) : (
                          <ExpandMore />
                        )}
                      </ListItemButton>
                    </ListItem>
                    <Collapse in={openManagement} timeout="auto" unmountOnExit>
                      <List sx={{ ml: 4 }} component="div" disablePadding>
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
                position="absolute"
                bottom="1rem"
                textAlign="center"
                width="75%"
                px={isMinimized ? "0.5rem" : "2rem"}
                onClick={() => setOpenProfileModal(true)}
              >
                <Divider />
                <Box mt="5px" display="flex" alignItems="center" gap="0.5rem">
                  <Box sx={{ mr: isMinimized ? 0 : 4 }}>
                    <Avatar
                      src={`${config.API_URL}/profile_pictures/${profile.image_url}`}
                    >
                      {user.username.charAt(0).toUpperCase()}
                    </Avatar>
                  </Box>

                  {/* Profile Information */}
                  {!isMinimized && (
                    <Box>
                      <Typography variant="body1">
                        {profile.first_name} {profile.last_name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {user.role}
                      </Typography>
                    </Box>
                  )}

                  {/* Log Out Icon on the Right */}
                  <Box ml="auto">
                    {/* Aligns the logout icon to the right */}
                    <Tooltip title="Log Out" arrow>
                      <IconButton
                        onClick={handleLogout}
                        aria-label="Log out"
                        sx={{
                          color: "text.secondary",
                          "&:hover": {
                            color: "red",
                          },
                        }}
                      >
                        <ExitToAppIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </Drawer>
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
