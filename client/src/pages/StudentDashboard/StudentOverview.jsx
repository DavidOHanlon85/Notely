import React, { useState, useEffect } from "react";
import axios from "axios";
import "./StudentOverview.css";
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

export default function StudentOverview() {
  const [summary, setSummary] = useState(null);

  { /* Fetch Dashboard */ }

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/student/overview`,
          {
            withCredentials: true,
          }
        );
        setSummary(res.data);
      } catch (err) {
        console.error("Dashboard fetch failed:", err);
      }
    };
    fetchDashboard();
  }, []);

  console.log("Lessons per month:", summary);

  if (!summary) return <p>Loading...</p>;

  // Make the chart cumulative

  const cumulativeLessonsData = summary.lessonsPerMonth.reduce(
    (acc, curr, index) => {
      const prevTotal = index === 0 ? 0 : acc[index - 1].totalLessons;
      acc.push({
        date: curr.date,
        totalLessons: prevTotal + curr.totalLessons,
      });
      return acc;
    },
    []
  );

  return (
    <div className="student-overview-container">
      <div className="dashboard-welcome mt-4">
        <h2>
          Welcome back, <span className="notely-gold-name">David!</span>
        </h2>
      </div>

      {/* Stat Cards */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-card-header">Total Lessons</div>
          <div className="stat-card-body">{summary.totalLessons}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">Upcoming</div>
          <div className="stat-card-body">{summary.upcomingLessons.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">Completed</div>
          <div className="stat-card-body">{summary.completedLessons}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <a href="/student/dashboard/feedback" className="feedback-link">
              Tutor Feedback
            </a>
          </div>
          <div className="stat-card-body">{summary.feedbackGiven}</div>
        </div>
      </div>

      {/* Tables */}
      <div className="dashboard-tables">
        {/* Booking Breakdown Table */}
        <div className="table-container">
          <h5 className="chart-title">Booking Breakdown</h5>
          <table className="notely-table">
            <thead>
              <tr>
                <th>Tutor</th>
                <th>Lessons</th>
                <th>Avg Rating</th>
              </tr>
            </thead>
            <tbody>
              {summary.bookingBreakdown?.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.tutor_name}</td>
                  <td>{row.lesson_count}</td>
                  <td className="avg-rating">
                    {row.avg_rating != null &&
                    !isNaN(Number(row.avg_rating)) ? (
                      <>
                        <span className="star">★</span>{" "}
                        {Number(row.avg_rating).toFixed(1)}
                      </>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Upcoming Lessons Table */}
        {/* Upcoming Lessons Table */}
        <div className="table-container">
          <h5 className="chart-title">
            <a href="/student/dashboard/bookings" className="chart-link">
              Upcoming Lessons
            </a>
          </h5>
          <table className="notely-table">
            <thead>
              <tr>
                <th>Tutor</th>
                <th>Date</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {summary.upcomingLessons
                ?.filter((row) => {
                  if (!row.booking_date || !row.booking_time) return false;

                  const baseDate = new Date(row.booking_date);
                  const [hours, minutes, seconds] = row.booking_time
                    .split(":")
                    .map(Number);
                  baseDate.setHours(hours, minutes, seconds || 0, 0);

                  if (isNaN(baseDate.getTime())) {
                    console.warn(
                      "Invalid lessonStart value:",
                      row.booking_date,
                      row.booking_time
                    );
                    return false;
                  }

                  return baseDate > new Date();
                })
                .map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.tutor_name}</td>
                    <td>{row.formatted_date}</td>
                    <td>{row.formatted_time || "-"}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts */}
      <div className="dashboard-charts">
        {/* Lessons Chart */}
        <div className="chart-container">
          <h5 className="chart-title">Lessons Over Last 6 Months</h5>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cumulativeLessonsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis
                allowDecimals={false}
                domain={[0, "dataMax"]}
                tickFormatter={(tick) => (Number.isInteger(tick) ? tick : "")}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="totalLessons"
                stroke="#ffc107"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Feedback Summary Chart */}
        <div className="chart-container">
          <h5 className="chart-title">Feedback Summary</h5>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart layout="vertical" data={summary.feedbackStars}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                allowDecimals={false}
                tickFormatter={(tick) => (Number.isInteger(tick) ? tick : "")}
              />
              <YAxis type="category" dataKey="label" />
              <Tooltip
                cursor={false}
                contentStyle={{ border: "none", backgroundColor: "#fff" }}
              />
              <Bar
                dataKey="count"
                fill="#ffc107"
                barSize={30}
                radius={[0, 10, 10, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
