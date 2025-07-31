import React from "react";
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
  const lessonsData = [
    { date: "Jan", totalLessons: 1 },
    { date: "Feb", totalLessons: 3 },
    { date: "Mar", totalLessons: 5 },
    { date: "Apr", totalLessons: 7 },
    { date: "May", totalLessons: 10 },
    { date: "Jun", totalLessons: 12 },
  ];

  const feedbackData = [
    { label: '5 Stars', count: 12 },
    { label: '4 Stars', count: 6 },
    { label: '3 Stars', count: 2 },
    { label: '2 Stars', count: 1 },
    { label: '1 Star', count: 0 },
  ];

  return (
    <div className="student-overview-container">
      {/* Welcome Message */}
      <div className="dashboard-welcome mt-4">
        <h2>
          Welcome back, <span className="notely-gold-name">David!</span>
        </h2>
      </div>

      {/* Statistics */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-card-header">Total Lessons</div>
          <div className="stat-card-body">12</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">Upcoming</div>
          <div className="stat-card-body">3</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">Completed</div>
          <div className="stat-card-body">9</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">Feedback Given</div>
          <div className="stat-card-body">4</div>
        </div>
      </div>

      {/* Chart 1 */}
      <div className="dashboard-charts">
        <div className="chart-container">
          <h5 className="chart-title">Lessons Over Last 6 Months</h5>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={lessonsData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderColor: "#ffc107",
                }}
                labelStyle={{ color: "#333" }}
                itemStyle={{ color: "#ffc107" }}
              />
              <Line
                type="monotone"
                dataKey="totalLessons"
                stroke="#ffc107"
                strokeWidth={3}
                dot={{ r: 4, stroke: "#000", strokeWidth: 1, fill: "#ffc107" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2 */}
        <div className="chart-container">
          <h5 className="chart-title">Feedback Summary</h5>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              layout="vertical"
              data={[...feedbackData].sort((a, b) => b.label - a.label)} // ensure 5 → 1
              margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="4"
                horizontal={false}
                stroke="#ddd"
              />
              <XAxis
                type="number"
                stroke="#444"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                stroke="#444"
                tick={{ fontSize: 14 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "#f0f0f0" }}
                contentStyle={{ borderRadius: 10, borderColor: "#ddd" }}
              />
              <Bar
                dataKey="count"
                fill="#ffc107"
                barSize={32}
                radius={[0, 10, 10, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
