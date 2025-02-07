import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  useTheme,
  Card,
  CardContent,
  CardActionArea,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import axios from "axios";
import dayjs from "dayjs";
import config from "../../state/config";
import StatisticCard from "./components/StatisticCard";

// Custom Hook for data fetching
const useDashboardData = () => {
  const [totalCheckIns, setTotalCheckIns] = useState(0);
  const [checkOutsToday, setCheckOutsToday] = useState(0);
  const [reservationsToday, setReservationsToday] = useState(0);
  const [roomUsageData, setRoomUsageData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [
        stayRecordsResponse,
        reservationsResponse,
        roomUsageResponse,
        roomsResponse,
      ] = await Promise.all([
        axios.get(`${config.API_URL}/stay_records`),
        axios.get(`${config.API_URL}/reservations`),
        axios.get(`${config.API_URL}/room_usage`),
        axios.get(`${config.API_URL}/rooms`),
      ]);

      const stayRecords = stayRecordsResponse.data.stay_records;
      const today = dayjs().format("YYYY-MM-DD");

      const totalCheckInsCount = stayRecords.length;
      const checkOutsCount = stayRecords.filter(
        (record) => dayjs(record.check_out).format("YYYY-MM-DD") === today
      ).length;

      setTotalCheckIns(totalCheckInsCount);
      setCheckOutsToday(checkOutsCount);

      // Filter reservations for today based on check-in date
      const arrivalsToday = reservationsResponse.data.reservations.filter(
        (reservation) => dayjs(reservation.check_in).format("YYYY-MM-DD") === today
      ).length;

      setReservationsToday(arrivalsToday);

      const roomUsageMap = roomUsageResponse.data.room_usage.reduce(
        (acc, usage) => {
          acc[usage.room_number] = usage.usage_count;
          return acc;
        },
        {}
      );

      const mergedRoomData = roomsResponse.data.rooms.map((room) => ({
        room: room.room_number,
        usage: roomUsageMap[room.room_number] || 0,
        status: room.status,
        color: room.color,
        imageUrl: room.imageUrl,
        rate: room.rate,
        room_type: room.room_type,
      }));

      setRoomUsageData(mergedRoomData);
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to load data. Please try again later."
      );
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    totalCheckIns,
    checkOutsToday,
    reservationsToday,
    roomUsageData,
    loading,
    error,
  };
};

const Dashboard = () => {
  const theme = useTheme();
  const {
    totalCheckIns,
    checkOutsToday,
    reservationsToday,
    roomUsageData,
    loading,
    error,
  } = useDashboardData();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <StatisticCard
            icon={<BookOnlineIcon style={{ fontSize: 50, marginRight: 16 }} />}
            title="Arrivals"
            value={reservationsToday}
            bgColor={`linear-gradient(135deg, #FFC300, #CC7A00)`}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <StatisticCard
            icon={
              <CheckCircleOutlineIcon
                style={{ fontSize: 50, marginRight: 16 }}
              />
            }
            title="In-House"
            value={totalCheckIns}
            bgColor={`linear-gradient(135deg, #4CAF50, #2E7D32)`}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <StatisticCard
            icon={<ExitToAppIcon style={{ fontSize: 50, marginRight: 16 }} />}
            title="Check-Outs Today"
            value={checkOutsToday}
            bgColor={`linear-gradient(135deg, #6A1B1A, #4A1210)`}
          />
        </Grid>

        <Grid item xs={12}>
          <Paper
            elevation={6}
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: 3,
              background: "linear-gradient(135deg, #F5F7FAA9, #99c199)",
              height: "60vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              fontWeight="bold"
              sx={{
                borderBottom: `2px solid ${theme.palette.primary.main}`,
                pb: 1,
                mb: 3,
              }}
            >
              Rooms Overview
            </Typography>
            <Box
              sx={{
                flexGrow: 1,
                overflowY: "auto",
              }}
            >
              <Grid container spacing={3}>
                {roomUsageData.map((room) => (
                  <Grid item xs={12} sm={6} md={4} key={room.room}>
                    <Card
                      sx={{
                        m: 1,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: theme.shadows[3],
                        "&:hover": {
                          boxShadow: theme.shadows[6],
                          transform: "translateY(-2px)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      <CardActionArea>
                        <Box
                          component="img"
                          sx={{
                            height: 150,
                            width: "100%",
                            objectFit: "cover",
                            borderRadius: "4px 4px 0 0",
                            mb: 2,
                          }}
                          src={`${config.API_URL}/assets/${room.imageUrl}`}
                          alt={`Room ${room.room}`}
                        />
                        <CardContent>
                          <Typography
                            variant="h6"
                            component="div"
                            sx={{ fontWeight: "bold" }}
                          >
                            Room {room.room}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              gap: 1,
                              mt: 1,
                            }}
                          >
                            <span
                              style={{
                                display: "inline-block",
                                width: 12,
                                height: 12,
                                borderRadius: "50%",
                                backgroundColor: room.color,
                              }}
                            ></span>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontWeight: "medium" }}
                            >
                              Status:{" "}
                              <span style={{ color: room.color }}>
                                {room.status}
                              </span>
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Usage Count: {room.usage}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
