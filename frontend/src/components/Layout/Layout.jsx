import { useState, useEffect } from "react";
import { Box, useMediaQuery } from "@mui/material";
import { Outlet } from "react-router-dom";
import PropTypes from "prop-types";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ userRole }) => {
  const isNonMobile = useMediaQuery("(min-width: 600px)");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [navTitle, setNavTitle] = useState(() => {
    return localStorage.getItem("navTitle") || "Dashboard";
  });

  useEffect(() => {
    localStorage.setItem("navTitle", navTitle);
  }, [navTitle]);

  return (
    <Box display={isNonMobile ? "flex" : "block"} width="100%" height="100%">
      <Sidebar
        userRole={userRole}
        isNonMobile={isNonMobile}
        drawerWidth="300px"
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isMinimized={isMinimized}
        setIsMinimized={setIsMinimized}
        setNavTitle={setNavTitle}
      />
      <Box flexGrow={1}>
        <Navbar
          isNonMobile={isNonMobile}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          navTitle={navTitle}
          isMinimized={isMinimized}
          setIsMinimized={setIsMinimized}
        />
        <Outlet />
      </Box>
    </Box>
  );
};

Layout.propTypes = {
  userRole: PropTypes.string,
};

export default Layout;