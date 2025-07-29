import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminDemoDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [adminName, setAdminName] = useState(null);
  const [adminId, setAdminId] = useState(null);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`http://localhost:3002/api/admin/dashboard/${id}`, {
          withCredentials: true,
        });

        setAdminName(res.data.admin_first_name);
        setAdminId(res.data.admin_id);
        setMessage(res.data.message);
      } catch (err) {
        if (err.response?.status === 401) {
          setErrorMessage("You are not logged in.");
          navigate("/admin/login");
        } else if (err.response?.status === 403) {
          setErrorMessage("Access denied.");
        } else {
          setErrorMessage("Something went wrong.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [id, navigate]);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:3002/api/admin/logout", {}, { withCredentials: true });
      navigate("/admin/login");
    } catch (err) {
      console.error("Logout error:", err.response?.data || err.message);
    }
  };

  return (
    <div className="container py-5">
      {loading ? (
        <p>Loading...</p>
      ) : errorMessage ? (
        <p className="text-danger">{errorMessage}</p>
      ) : (
        <>
          <h1>Welcome, {adminName}!</h1>
          <p>{message} You're logged in as admin #{adminId}.</p>
          <button className="btn btn-notely-navy mt-3" onClick={handleLogout}>
            Log Out
          </button>
        </>
      )}
    </div>
  );
}