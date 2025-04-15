import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Fab,
  Collapse,
  IconButton,
  useTheme,
  InputAdornment,
  Alert,
  CircularProgress,
  Container,
  Divider
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  ChevronLeft as ExpandMore,
  ChevronRight as ExpandLess,
  LockOutlined as LockIcon
} from "@mui/icons-material";
import Slider from "react-slick";
import config from "../../state/config";
import AdvertisementCard from "./components/AdvertisementCard";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const LoginPage = ({ setUserRole }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Form states
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(true);
  
  // Advertisement states
  const [ads, setAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [adsLoading, setAdsLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setAdsLoading(true);
        const response = await axios.get(`${config.API_URL}/ads`);
        setAds(response.data);
      } catch (error) {
        console.error("Failed to fetch advertisements:", error);
      } finally {
        setAdsLoading(false);
      }
    };
    
    fetchAds();
    
    // Check if token exists and redirect if already logged in
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    if (token && role) {
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "staff") {
        navigate("/staff/dashboard");
      }
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = formData;
    
    // Form validation
    if (!username.trim() || !password.trim()) {
      setError("Username and password are required");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(`${config.API_URL}/login`, {
        username,
        password,
      });
      
      if (response.data.success) {
        const { token, role, userId } = response.data;

        // Store user data securely
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("userId", userId);
        setUserRole(role);

        // Log user action
        await axios.post(
          `${config.API_URL}/user_log`,
          { userId, action: "User logged in" },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Redirect based on role
        if (role === "admin") {
          navigate("/admin/dashboard");
        } else if (role === "staff") {
          navigate("/staff/dashboard");
        } else {
          setError("Invalid role assigned to user");
        }
      }
    } catch (err) {
      if (err.response) {
        switch (err.response.status) {
          case 404:
            setError("Account does not exist");
            break;
          case 401:
            setError("Invalid username or password");
            break;
          case 429:
            setError("Too many login attempts. Please try again later.");
            break;
          default:
            setError("Authentication failed. Please try again.");
        }
      } else {
        setError("Network error. Please check your connection.");
      }
    } finally {
      setIsLoading(false);
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
    customPaging: () => (
      <div
        style={{
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          background: theme.palette.common.white,
          opacity: 0.7,
        }}
      />
    ),
  };

  const currentAdImage =
    ads.length > 0 && ads[currentAdIndex]?.image_url
      ? `${config.API_URL}/advertisements/${ads[currentAdIndex].image_url}`
      : "";

  const renderLogo = () => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        width: "100%",
      }}
    >
      <img
        src="../../assets/Logo.png"
        alt="SBA Hotel"
        style={{ height: "40px", marginRight: "12px" }}
      />
      <Typography
        variant="h5"
        component="div"
        sx={{
          fontWeight: 600,
          letterSpacing: "0.5px",
          display: { xs: "none", sm: "block" },
        }}
      >
        SBA Hotel Management
      </Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Dynamic Background with Overlay */}
      <Box
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backgroundImage: currentAdImage ? `url(${currentAdImage})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(8px)",
          zIndex: -2,
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
          background: `linear-gradient(rgba(0, 24, 40, 0.8), rgba(0, 0, 0, 0.85))`,
          zIndex: -1,
        }}
      />

      <Container maxWidth="xl" sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
        <Grid container spacing={3} sx={{ mt: 4, mb: 4 }}>
          {/* Advertisement Slider */}
          <Grid
            item
            xs={12}
            md={isFormOpen ? 7 : 12}
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
            }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: isFormOpen ? 600 : 800,
                height: "auto",
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              }}
            >
              {adsLoading ? (
                <Box
                  sx={{
                    height: 400,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(255,255,255,0.1)",
                  }}
                >
                  <CircularProgress color="primary" />
                </Box>
              ) : ads.length > 0 ? (
                <Slider {...sliderSettings}>
                  {ads.map((ad) => (
                    <Box key={ad.id}>
                      <AdvertisementCard advertisement={ad} />
                    </Box>
                  ))}
                </Slider>
              ) : (
                <Box
                  sx={{
                    height: 400,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    backgroundColor: "rgba(255,255,255,0.1)",
                  }}
                >
                  <Typography variant="h6">
                    Welcome to SBA Hotel Management System
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Login Form */}
          <Grid
            item
            xs={12}
            md={5}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: { xs: "100%", sm: 450 },
                zIndex: 1,
              }}
            >
              <Card
                sx={{
                  width: "100%",
                  borderRadius: 2,
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                  transition: "all 0.3s ease",
                  opacity: isFormOpen ? 1 : 0,
                  visibility: isFormOpen ? "visible" : "hidden",
                  transform: isFormOpen ? "translateY(0)" : "translateY(-20px)",
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Collapse in={isFormOpen}>
                    {/* Add Logo at the top of the form */}
                    <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                      {renderLogo()}
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 3,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <LockIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                        <Typography variant="h5" component="h1" fontWeight="500">
                          Sign In
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => setIsFormOpen(false)}
                        sx={{ display: { xs: "none", md: "flex" } }}
                      >
                        <ExpandLess />
                      </IconButton>
                    </Box>

                    {error && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                      </Alert>
                    )}

                    <form onSubmit={handleSubmit} noValidate>
                      <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={formData.username}
                        onChange={handleInputChange}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        id="password"
                        autoComplete="current-password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={handlePasswordVisibility}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{ mb: 3 }}
                      />

                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        disabled={isLoading}
                        sx={{
                          py: 1.5,
                          fontWeight: 500,
                          fontSize: "1rem",
                          textTransform: "none",
                          boxShadow: 2,
                        }}
                      >
                        {isLoading ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          "Sign In"
                        )}
                      </Button>

                      <Box sx={{ mt: 3, mb: 2 }}>
                        <Divider>
                          <Typography variant="body2" color="text.secondary">
                            Hotel Staff Only
                          </Typography>
                        </Divider>
                      </Box>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        align="center"
                        sx={{ mt: 2 }}
                      >
                        Forgot password? Contact system administrator
                      </Typography>
                    </form>
                  </Collapse>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Toggle Button for Collapsed Form */}
      <Fab
        color="primary"
        aria-label="Toggle login form"
        onClick={() => setIsFormOpen(true)}
        sx={{
          position: "fixed",
          right: 24,
          top: "50%",
          transform: "translateY(-50%)",
          display: isFormOpen ? "none" : "flex",
          backgroundColor: theme.palette.primary.main,
          "&:hover": {
            backgroundColor: theme.palette.primary.dark,
          },
        }}
      >
        <ExpandMore />
      </Fab>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          position: "fixed",
          bottom: 0,
          width: "100%",
          py: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(5px)",
          color: "white",
          textAlign: "center",
          zIndex: 1,
        }}
      >
        <Typography variant="body2">
          © {new Date().getFullYear()} SBA Hotel Management System. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

LoginPage.propTypes = {
  setUserRole: PropTypes.func.isRequired,
};

export default LoginPage;