import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  AppBar,
  Toolbar,
  Grid,
  Card,
  CardContent,
  Fab,
  Collapse,
  IconButton,
  useTheme,
  InputAdornment,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ExpandMore from "@mui/icons-material/ArrowBackIosNew";
import ExpandLess from "@mui/icons-material/ArrowForwardIos";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Slider from "react-slick";
import config from "../../state/config";
import PropTypes from "prop-types";
import AdvertisementCard from "./components/AdvertisementCard";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const LoginPage = ({ setUserRole }) => {
  const theme = useTheme();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [ads, setAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/ads`);
        console.log(response.data); // Log response data
        setAds(response.data);
      } catch (error) {
        console.error("Failed to fetch ads:", error);
      }
    };
    fetchAds();
  }, []);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (username === "" || password === "") {
      setError("Username and password are required");
      return;
    }

    try {
      const response = await axios.post(`${config.API_URL}/login`, {
        username,
        password,
      });
      if (response.data.success) {
        const { token, role, userId } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("userId", userId);
        setUserRole(role);

        await axios.post(`${config.API_URL}/user_log`, {
          userId,
          action: "User logged in",
        });

        if (role === "admin") {
          navigate("/admin/dashboard");
        } else if (role === "staff") {
          navigate("/staff/dashboard");
        } else {
          setError("Invalid role");
        }
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError("The account does not exist.");
      } else if (err.response && err.response.status === 401) {
        setError("Invalid credentials");
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 15000,
    pauseOnHover: true,
    arrows: false,
    beforeChange: (current, next) => setCurrentAdIndex(next),
  };

  const currentAdImage =
    ads.length > 0
      ? `${config.API_URL}/advertisements/${ads[currentAdIndex].image_url}`
      : "";

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Image and Blur Effect */}
      <Box
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backgroundImage: currentAdImage ? `url(${currentAdImage})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(6px)", // Slightly increase the blur for smoother background
          zIndex: -1,
          transition: "background-image 1s ease-in-out",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0, 0, 0, 0.7)", // Darken the overlay a bit more
          zIndex: -1,
        }}
      />
      <AppBar
        position="fixed" // Keep it at the top even on scroll
        sx={{
          width: "100%",
          boxShadow: 5,
          backgroundColor: "rgba(0, 0, 0, 0.6)", // Slightly opaque background
          color: theme.palette.common.white,
          zIndex: theme.zIndex.appBar + 1, // Ensure it appears above other elements
        }}
      >
        <Toolbar>
          <Typography
            variant="h5"
            component="div"
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src="../../assets/Logo.png"
              alt="Logo"
              style={{ height: "50px", marginRight: "10px" }}
            />
            SBA Hotel Management System
          </Typography>
        </Toolbar>
      </AppBar>

      <Grid container sx={{ flexGrow: 1 }}>
        {/* Advertisement slider for larger screens */}
        <Grid
          item
          xs={12}
          md={isFormOpen ? 7 : 12}
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            transition: "width 0.3s ease",
          }}
        >
          <Box
            sx={{
              width: isFormOpen
                ? { xs: "100%", md: 500 }
                : { xs: "100%", md: 700 },
              height: "auto",
            }}
          >
            {ads.length > 0 ? (
              <Slider {...sliderSettings}>
                {ads.map((ad) => (
                  <Box key={ad.id}>
                    <AdvertisementCard advertisement={ad} />
                  </Box>
                ))}
              </Slider>
            ) : (
              <Typography variant="h4" sx={{ mt: 2, color: "white" }}>
                Loading advertisements...
              </Typography>
            )}
          </Box>
        </Grid>

        {/* Login form that is always visible */}
        <Grid
          item
          xs={12}
          md={5}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              maxWidth: { xs: "90%", md: 400 },
              zIndex: 1,
            }}
          >
            <Card
              sx={{
                width: "100%",
                boxShadow: 5,
                borderRadius: 3,
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                transition: "all 0.3s ease",
                opacity: isFormOpen ? 1 : 0,
                visibility: isFormOpen ? "visible" : "hidden",
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  p: { xs: 2, md: 4 },
                }}
              >
                <Collapse in={isFormOpen}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <Typography variant="h5" gutterBottom>
                      Login
                    </Typography>
                    <IconButton
                      sx={{
                        transition: "transform 1s ease, opacity 0.5s ease",
                        opacity: isFormOpen ? 1 : 0,
                      }}
                      onClick={() => setIsFormOpen(false)}
                    >
                      <ExpandLess />
                    </IconButton>
                  </Box>
                  <form onSubmit={handleSubmit} noValidate>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      label="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handlePasswordVisibility}
                              edge="end"
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 2 }}
                    />
                    {error && (
                      <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                        {error}
                      </Typography>
                    )}
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="primary"
                      sx={{
                        mt: 3,
                        mb: 2,
                        bgcolor: theme.palette.primary.main,
                        "&:hover": {
                          bgcolor: theme.palette.primary.dark,
                        },
                      }}
                    >
                      Login
                    </Button>
                  </form>
                </Collapse>
              </CardContent>
            </Card>
          </Box>
        </Grid>

        {/* Fab Button for Collapsed Form */}
        <Fab
          onClick={() => setIsFormOpen(true)}
          sx={{
            position: "absolute",
            top: "50%",
            bottom: 20,
            right: 20,
            display: isFormOpen ? "none" : "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 1)",
              color: "rgba(0, 0, 0, 0.5)",
            },
          }}
        >
          <ExpandMore />
        </Fab>
      </Grid>
    </Box>
  );
};

LoginPage.propTypes = {
  setUserRole: PropTypes.func.isRequired,
};

export default LoginPage;
