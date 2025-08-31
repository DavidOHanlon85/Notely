import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./AdminOverview.css";

export default function AdminOverview() {
  const [sortRange, setSortRange] = useState("last_month");
  const [summary, setSummary] = useState(null);

  console.log("Admin summary data:", summary);

  {/* Fetch Overview */}

  useEffect(() => {
    const fetchAdminOverview = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/admin/overview?range=${sortRange}`,
          { withCredentials: true }
        );
        setSummary(res.data);
      } catch (err) {
        console.error("Error fetching admin overview:", err);
      }
    };
    fetchAdminOverview();
  }, [sortRange]);

  if (!summary) return <p>Loading...</p>;

  return (
    <div className="admin-overview-container">
      <div className="admin-dashboard-welcome d-flex justify-content-between align-items-center mt-0">
        <h2 className="admin-welcome-text">Admin Overview</h2>

        <div className="admin-sort-wrapper">
          <select
            className="admin-sort-select"
            value={sortRange}
            onChange={(e) => setSortRange(e.target.value)}
          >
            <option value="last_month">Last Month</option>
            <option value="last_quarter">Last Quarter</option>
            <option value="last_year">Last Year</option>
            <option value="all_time">All Time</option>
          </select>
        </div>
      </div>

      <div className="admin-dashboard-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-card-header">Total Revenue</div>
          <div className="admin-stat-card-body">
            £{Number(summary.totalRevenue).toFixed(2)}
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card-header">Tutor Payouts</div>
          <div className="admin-stat-card-body">
            £{(Number(summary.totalRevenue) * 0.8).toFixed(2)}
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card-header">Total Bookings</div>
          <div className="admin-stat-card-body">{summary.totalBookings}</div>
        </div>
        <div
          className="admin-stat-card"
          title={`🎓 Students: ${Number(
            summary?.newUsers?.students ?? 0
          )}, 🎵 Tutors: ${Number(summary?.newUsers?.tutors ?? 0)}`}
        >
          <div className="admin-stat-card-header">New Users</div>
          <div className="admin-stat-card-body">
            {Number(summary?.newUsers?.students ?? 0) +
              Number(summary?.newUsers?.tutors ?? 0)}
          </div>
        </div>
      </div>

      <div className="admin-dashboard-charts">
        {/* Student Growth */}
        <div className="admin-chart-container">
          <h5 className="admin-chart-title">New Students Over Time</h5>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={summary.studentGrowthOverTime || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis dataKey="count" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#003366"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tutor Growth */}
        <div className="admin-chart-container">
          <h5 className="admin-chart-title">New Tutors Over Time</h5>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={summary.tutorGrowthOverTime || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis dataKey="count" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#003366"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
