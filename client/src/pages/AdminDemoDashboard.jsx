import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminDemoDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`http://localhost:3002/api/admin/dashboard/${id}`, {
          withCredentials: true,
        });

        setAdminName(res.data.admin_first_name);
        setMessage(res.data.message);
      } catch (err) {
        setMessage("Access denied or session expired.");
        console.error(err.response?.data || err.message);
      }
    };

    fetchDashboard();
  }, [id]);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:3002/api/admin/logout", {}, { withCredentials: true });
      navigate("/admin/login");
    } catch (err) {
      console.error("Logout error:", err.response?.data || err.message);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-3">Admin Dashboard</h1>
      {message && <p>{message}</p>}
      {adminName && <p>Welcome, {adminName}!</p>}
      <button className="btn btn-notely-navy mt-3" onClick={handleLogout}>
        Log Out
      </button>
    </div>
  );
}