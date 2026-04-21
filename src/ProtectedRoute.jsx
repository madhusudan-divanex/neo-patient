import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getSecureApiData } from "./Services/api";
import Loader from "./Loader/Loader";

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [role, setRole] = useState(null); // store user role
  const location = useLocation();
  const navigate=useNavigate()

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const res = await getSecureApiData(`user/${userId}`);
        if (res?.success) {
          if(res.nextStep){
            navigate(res.nextStep)
          }
          setIsAuthenticated(true);
          setRole(res.data.role); // assuming API returns { data: { role: "patient" } }
        } else {
          throw new Error("Invalid token");
        }
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        toast.error("Session expired. Please log in again.");
        setIsAuthenticated(false);
      }
    };

    validateToken();
  }, []);

  // ⏳ While checking auth
  if (isAuthenticated === null) {
    return <Loader/>; // or a loader/spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 🚦 Role-based redirection
  const patientRoutes = [
    "/my-appointment",
    "/chat",
    "/prescription",
    "/profile",
    "/share-health-card",
    "/approve-health-card",
    "/health-card-details",
    "/near-by-doctor",
    "/congratulations"
  ];

  const doctorRoutes = [
    "/doctor/add-appointment",
    "/doctor/add-patient",
    "/doctor/change-password",
    "/doctor/edit-profile",
    "/doctor/chat",
    "/doctor/video-call",
    "/doctor/add-prescriptions",
    "/doctor/edit-prescriptions",
    "/doctor/patient-history",
    "/doctor/detail-view",
    "/doctor/requests",
    "/doctor/appointment-list",
    "/doctor/profile-approval-request",
    "/doctor/profile-approval",
    "/doctor/patient-details",
    "/doctor/reject-details",
    "/doctor/request-list",
    "/doctor/report-view",
    "/doctor/profile-edit-request",
    "/doctor/profile-accept-request",
  ];

  const currentPath = location.pathname;

  // Check if a patient is trying to access a doctor route
  if (role === "patient" && doctorRoutes.some((route) => currentPath.startsWith(route))) {
    return <Navigate to="/my-appointment" replace />;
  }

  // Check if a doctor is trying to access a patient route
  if (role === "doctor" && patientRoutes.some((route) => currentPath.startsWith(route))) {
    return <Navigate to="/doctor/appointment-list" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
