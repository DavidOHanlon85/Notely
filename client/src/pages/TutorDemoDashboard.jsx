import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function TutorDemoDashboard() {
  const { tutorId } = useParams();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3002/api/tutor/dashboard/${tutorId}`,
          { withCredentials: true }
        );

        setDashboardData(response.data);
      } catch (error) {
        if (error.response?.status === 401) {
          setErrorMessage("You are not logged in.");
          navigate("/tutor/login");
        } else if (error.response?.status === 403) {
          setErrorMessage("Access denied.");
        } else {
          setErrorMessage("Something went wrong.");
        }
      }
    };

    fetchDashboard();
  }, [tutorId, navigate]);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:3002/api/tutor/logout", {}, { withCredentials: true });
      navigate("/tutor/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="container py-5">
      {errorMessage ? (
        <p className="text-danger">{errorMessage}</p>
      ) : dashboardData ? (
        <>
          <h1>Welcome, {dashboardData.tutor_first_name}</h1>
          <p>This is your tutor dashboard. You're logged in as tutor #{dashboardData.tutor_id}.</p>
          <button className="btn btn-danger mt-3" onClick={handleLogout}>
            Log Out
          </button>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}