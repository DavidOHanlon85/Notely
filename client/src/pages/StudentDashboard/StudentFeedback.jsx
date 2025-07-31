import React, { useState } from "react";
import DataTable from "react-data-table-component";
import "./StudentFeedback.css";

const mockFeedback = [
  {
    id: 1,
    date: "2025-07-15",
    tutor: "Alice Smith",
    performance: 5,
    homework: "Scales practice",
    notes: "Excellent progress!",
  },
  {
    id: 2,
    date: "2025-07-10",
    tutor: "Bob Johnson",
    performance: 3,
    homework: "Work on timing",
    notes: "Struggled a bit with rhythm.",
  },
];

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
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFeedback = mockFeedback.filter(
    (row) =>
      row.tutor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.date.includes(searchTerm) ||
      row.homework.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.notes.toLowerCase().includes(searchTerm.toLowerCase())
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
