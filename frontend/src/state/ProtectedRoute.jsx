import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) {
    window.alert("You need to be logged in to access this page.");
    return <Navigate to="/" />;
  }

  if (role && userRole !== role) {
    window.alert("You do not have the required permissions to access this page.");
    return <Navigate to="/" />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  role: PropTypes.string,
};

export default ProtectedRoute;
