import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import axios from "axios";
import "./App.css";
import ProtectedRoute from "./state/ProtectedRoute";
import Layout from "./components/Layout/Layout";
import LoginPage from "./pages/Login/LoginPage";
import RoomsPage from "./pages/Rooms/RoomPage";
import Dashboard from "./pages/Dashboard/Dashboard";
import Setting from "./pages/Settings/Setting";
import Users from "./pages/Users/Users";
import History from "./pages/History/HistoryPage";
import Reservation from "./pages/Reservation/ReservationPage";
import Guest from "./pages/Guest/GuestPage";
import StayRecord from "./pages/StayRecord/StayRecordPage";
import config from "./state/config";

const logUserAction = async (userId, action) => {
  try {
    await axios.post(`${config.API_URL}/user_log`, {
      userId,
      action,
    });
  } catch (error) {
    console.error("Failed to log user action:", error);
  }
};

function App() {
  const [defaultOccupiedStatus, setDefaultOccupiedStatus] = useState(() => {
    const storedValue = localStorage.getItem("defaultOccupiedStatus");
    return storedValue ? Number(storedValue) : 1; // Default value is 1
  });

  const [defaultCheckoutStatus, setDefaultCheckoutStatus] = useState(() => {
    const storedValue = localStorage.getItem("defaultCheckoutStatus");
    return storedValue ? Number(storedValue) : 5; // Default value is 5
  });

  const [defaultRoomSelection, setDefaultRoomSelection] = useState(() => {
    const storedValue = localStorage.getItem("defaultRoomSelection");
    return storedValue ? Number(storedValue) : 3; // Default value is 3
  });

  const [statusOptions, setStatusOptions] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [userRole, setUserRole] = useState(localStorage.getItem("role"));

  useEffect(() => {
    const fetchStatusOptions = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/status`);
        setStatusOptions(response.data.statusOptions);
        if (!defaultCheckoutStatus) {
          const firstStatusId = response.data.statusOptions[0]?.id || 0;
          setDefaultCheckoutStatus(firstStatusId);
          localStorage.setItem(
            "defaultCheckoutStatus",
            firstStatusId.toString()
          );
        }
        if (!defaultOccupiedStatus) {
          const firstStatusId = response.data.statusOptions[0]?.id || 0;
          setDefaultOccupiedStatus(firstStatusId);
          localStorage.setItem(
            "defaultOccupiedStatus",
            firstStatusId.toString()
          );
        }
      } catch (error) {
        console.error("Error fetching status options:", error);
      }
    };

    const fetchRoomTypes = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/room-types`);
        setRoomTypes(response.data.roomTypes);
      } catch (error) {
        console.error("Error fetching room types:", error);
      }
    };

    fetchStatusOptions();
    fetchRoomTypes();
  }, [defaultCheckoutStatus, defaultOccupiedStatus]);

  return (
    <div className="main-content">
      <div style={{ flexGrow: 1 }}>
        <Routes>
          {/* Login Route */}
          <Route path="/" element={<LoginPage setUserRole={setUserRole} />} />

          {/* Admin Routes */}
          <Route
            element={
              <ProtectedRoute role="admin">
                <Layout userRole={userRole} />
              </ProtectedRoute>
            }
          >
            <Route
              path="/admin/dashboard"
              element={<Dashboard logUserAction={logUserAction} />}
            />
            <Route
              path="/admin/users"
              element={<Users logUserAction={logUserAction} />}
            />
            <Route
              path="/admin/rooms"
              element={<RoomsPage logUserAction={logUserAction} />}
            />
            <Route
              path="/admin/stay-record"
              element={
                <StayRecord
                  logUserAction={logUserAction}
                  defaultOccupiedStatus={defaultOccupiedStatus}
                  defaultCheckoutStatus={defaultCheckoutStatus}
                  defaultRoomSelection={defaultRoomSelection}
                />
              }
            />
            <Route
              path="/admin/reservation"
              element={
                <Reservation
                  logUserAction={logUserAction}
                  defaultRoomSelection={defaultRoomSelection}
                  defaultOccupiedStatus={defaultOccupiedStatus}
                />
              }
            />
            <Route
              path="/admin/guest-Record"
              element={
                <Guest
                  logUserAction={logUserAction}
                  defaultOccupiedStatus={defaultOccupiedStatus}
                  defaultRoomSelection={defaultRoomSelection}
                />
              }
            />
            <Route
              path="/admin/transaction-history"
              element={<History logUserAction={logUserAction} />}
            />
            <Route
              path="/admin/settings"
              element={
                <Setting
                  defaultOccupiedStatus={defaultOccupiedStatus}
                  setDefaultOccupiedStatus={setDefaultOccupiedStatus}
                  defaultCheckoutStatus={defaultCheckoutStatus}
                  setDefaultCheckoutStatus={setDefaultCheckoutStatus}
                  statusOptions={statusOptions}
                  setStatusOptions={setStatusOptions}
                  roomTypes={roomTypes}
                  setRoomTypes={setRoomTypes}
                  defaultRoomSelection={defaultRoomSelection}
                  setDefaultRoomSelection={setDefaultRoomSelection}
                  logUserAction={logUserAction}
                />
              }
            />
          </Route>

          {/* Staff Routes */}
          <Route
            element={
              <ProtectedRoute role="staff">
                <Layout userRole={userRole} />
              </ProtectedRoute>
            }
          >
            <Route
              path="/staff/dashboard"
              element={<Dashboard logUserAction={logUserAction} />}
            />
            <Route
              path="/staff/stay-record"
              element={
                <StayRecord
                  logUserAction={logUserAction}
                  defaultOccupiedStatus={defaultOccupiedStatus}
                  defaultCheckoutStatus={defaultCheckoutStatus}
                  defaultRoomSelection={defaultRoomSelection}
                />
              }
            />
            <Route
              path="/staff/reservation"
              element={
                <Reservation
                  logUserAction={logUserAction}
                  defaultRoomSelection={defaultRoomSelection}
                  defaultOccupiedStatus={defaultOccupiedStatus}
                />
              }
            />
            <Route
              path="/staff/guest-record"
              element={
                <Guest
                  logUserAction={logUserAction}
                  defaultOccupiedStatus={defaultOccupiedStatus}
                  defaultRoomSelection={defaultRoomSelection}
                />
              }
            />
            <Route
              path="/staff/transaction-history"
              element={<History logUserAction={logUserAction} />}
            />
          </Route>
        </Routes>
      </div>
    </div>
  );
}

export default App;
