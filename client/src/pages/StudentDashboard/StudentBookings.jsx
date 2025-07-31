import React, { useState } from "react";
import DataTable from "react-data-table-component";
import "./StudentBookings.css";

const mockBookings = [
  {
    id: 1,
    date: "2025-08-02",
    time: "14:00",
    tutor: "Alice Smith",
    status: "Upcoming",
    canLeaveFeedback: false,
    canJoin: true,
  },
  {
    id: 2,
    date: "2025-07-26",
    time: "10:00",
    tutor: "Bob Johnson",
    status: "Completed",
    canLeaveFeedback: true,
    canJoin: false,
  },
];

const columns = [
  { name: "Date", selector: (row) => row.date, sortable: true },
  { name: "Time", selector: (row) => row.time, sortable: true },
  { name: "Tutor", selector: (row) => row.tutor, sortable: true },
  {
    name: "Status",
    selector: (row) => row.status,
    cell: (row) => (
      <span className={`status-badge ${row.status === "Upcoming" ? "badge-upcoming" : "badge-completed"}`}>
        {row.status}
      </span>
    ),
    sortable: true,
  },
  {
    name: "Feedback",
    cell: (row) =>
      row.canLeaveFeedback ? (
        <span className="badge badge-feedback">Leave Feedback</span>
      ) : (
        "-"
      ),
  },
  {
    name: "Join",
    cell: (row) =>
      row.canJoin ? (
        <span className="badge badge-join">Join Class</span>
      ) : (
        "-"
      ),
  },
];

export default function StudentBookings() {
  const [filterText, setFilterText] = useState("");

  const filteredData = mockBookings.filter(
    (booking) =>
      booking.date.includes(filterText) ||
      booking.time.includes(filterText) ||
      booking.tutor.toLowerCase().includes(filterText.toLowerCase()) ||
      booking.status.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="student-bookings">
      <h2 className="bookings-heading">Your Bookings</h2>

      <div className="bookings-search-wrapper">
        <input
          type="text"
          placeholder="Search bookings..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="table-scroll-wrapper">
        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          highlightOnHover
          striped
          responsive
        />
      </div>
    </div>
  );
}