import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import "./StudentFeedback.css";

const columns = [
  {
    name: "Date",
    selector: (row) => row.date,
    sortable: true,
  },
  {
    name: "Tutor",
    selector: (row) => row.tutor,
    sortable: true,
    cell: (row) => (
      <a
        href={`/tutor/${row.tutor_id}`}
        className="tutor-link"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        {row.tutor}
      </a>
    ),
  },
  {
    name: "Performance",
    selector: (row) => row.performance,
    cell: (row) => (
      <span className="stars">
        {"★".repeat(row.performance)}
        {"☆".repeat(5 - row.performance)}
      </span>
    ),
    sortable: true,
  },
  {
    name: "Homework",
    selector: (row) => row.homework,
    wrap: true,
  },
  {
    name: "Notes",
    selector: (row) => row.notes,
    wrap: true,
  },
];

export default function StudentFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await axios.get("http://localhost:3002/api/student/feedback", {
          withCredentials: true,
        });
        setFeedback(res.data);
      } catch (err) {
        console.error("Failed to load feedback", err);
      }
    };

    fetchFeedback();
  }, []);

  const filteredFeedback = feedback.filter(
    (row) =>
      row.tutor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.date.includes(searchTerm) ||
      row.homework?.toLowerCase().includes(searchTerm) ||
      row.notes?.toLowerCase().includes(searchTerm)
  );

  return (
    <div className="student-feedback">
      <h2 className="feedback-heading">Your Feedback</h2>

      <div className="feedback-search-wrapper">
        <input
          type="text"
          className="feedback-search"
          placeholder="Search feedback..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-scroll-wrapper">
        <DataTable
          columns={columns}
          data={filteredFeedback}
          pagination
          highlightOnHover
          striped
          responsive
        />
      </div>
    </div>
  );
}