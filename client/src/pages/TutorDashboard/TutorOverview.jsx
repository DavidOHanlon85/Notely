import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TutorOverview.css";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function TutorOverview() {
  const [summary, setSummary] = useState(null);
  const [sortRange, setSortRange] = useState("last_month");

  { /* Fetch Dashboard */}

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/tutor/overview?range=${sortRange}`,
          { withCredentials: true }
        );
        setSummary(res.data);
      } catch (err) {
        console.error("Dashboard fetch failed:", err);
      }
    };
    fetchDashboard();
  }, [sortRange]);

  if (!summary) return <p>Loading...</p>;

  return (
    <div className="tutor-overview-container">
      <div className="dashboard-welcome d-flex justify-content-between align-items-center mt-0">
        <h2 className="welcome-text">
          Welcome back, <span className="notely-purple-name">{summary.tutorName}!</span>
        </h2>

        <div className="sort-wrapper">
          <select
            className="sort-select"
            value={sortRange}
            onChange={(e) => setSortRange(e.target.value)}
          >
            <option value="last_month">Last Month</option>
            <option value="last_quarter">Last Quarter</option>
            <option value="last_year">Last Year</option>
            <option value="all_time">From Beginning</option>
          </select>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-card-header">Total Revenue</div>
          <div className="stat-card-body">
            £{summary.totalRevenue.toFixed(2)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">Total Lessons</div>
          <div className="stat-card-body">{summary.totalLessons}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">Completed</div>
          <div className="stat-card-body">{summary.completedLessons}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">Avg. Rating</div>
          <div className="stat-card-body">
            ★{" "}
            {typeof summary.averageRating === "number"
              ? summary.averageRating.toFixed(1)
              : "N/A"}
          </div>
        </div>
      </div>

      <div className="dashboard-charts">
        {/* Revenue Over Time */}
        <div className="chart-container">
          <h5 className="chart-title">Monthly Revenue</h5>
          {summary.revenueOverTime?.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={summary.revenueOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis dataKey="revenue" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6f42c1"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p>No revenue data found.</p>
          )}
        </div>

        {/* Feedback Summary */}
        <div className="chart-container">
          <h5 className="chart-title">Feedback Summary</h5>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart layout="vertical" data={summary.feedbackStars}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="label" />
              <Tooltip
                cursor={false}
                contentStyle={{
                  border: "none",
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                }}
              />
              <Bar
                dataKey="count"
                fill="#6f42c1"
                barSize={38}
                radius={[0, 10, 10, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
