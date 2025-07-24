// src/pages/StudentDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function DashboardDemo() {
  const { id } = useParams(); // student ID from the URL
  const [dashboardData, setDashboardData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3002/api/student/dashboard/${id}`,
          { withCredentials: true } // send cookies!
        );

        setDashboardData(response.data);
      } catch (error) {
        if (error.response?.status === 401) {
          setErrorMessage("You are not logged in.");
          navigate("/student/login"); // redirect to login if not authenticated
        } else if (error.response?.status === 403) {
          setErrorMessage(
            "Access denied. You are not authorized to view this dashboard."
          );
        } else {
          setErrorMessage("Something went wrong. Please try again.");
        }
      }
    };

    fetchDashboard();
  }, [id, navigate]);

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:3002/api/student/logout",
        {},
        { withCredentials: true }
      );
      navigate("/student/login"); // redirect to login
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (errorMessage) {
    return (
      <div className="container mt-5 text-center text-danger fw-semibold">
        {errorMessage}
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-warning" role="status" />
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h1 className="mb-4">🎵 Welcome to your Dashboard</h1>
      <p>
        <strong>Name:</strong> {dashboardData.message}
      </p>
      <p>
        <strong>Your Student ID:</strong> {dashboardData.student_id}
      </p>

      <button className="btn btn-danger mt-4" onClick={handleLogout}>
        Log Out
      </button>
    </div>
  );
}
