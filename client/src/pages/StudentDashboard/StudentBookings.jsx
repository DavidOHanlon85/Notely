import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DataTable from "react-data-table-component";
import "./StudentBookings.css";

export default function StudentBookings() {
  const [bookings, setBookings] = useState([]);
  const [filterText, setFilterText] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3002/api/student/bookings",
          {
            withCredentials: true,
          }
        );
        const transformed = response.data.map((booking) => {
          const dateObj = new Date(booking.booking_date);
          dateObj.setDate(dateObj.getDate() + 1); // Force +1 day

          const dateOnly = dateObj.toISOString().split("T")[0]; // '2025-08-07'
          const timeOnly = booking.booking_time.slice(0, 5);

          const bookingDateTime = new Date(
            `${dateOnly}T${booking.booking_time}`
          );

          const now = new Date();

          return {
            id: booking.booking_id,
            date: dateOnly.split("-").reverse().join("/"), // '07/08/2025'
            time: timeOnly,
            tutor: `${booking.tutor_first_name} ${booking.tutor_second_name}`,
            tutor_id: booking.tutor_id,
            status: bookingDateTime > now ? "Upcoming" : "Completed",
            feedback_given: booking.feedback_given === 1,
            canLeaveFeedback: bookingDateTime < now && !booking.feedback_given,
            canJoin:
              now.getTime() >=
                bookingDateTime.getTime() - 24 * 60 * 60 * 1000 &&
              now.getTime() <= bookingDateTime.getTime() + 2 * 60 * 60 * 1000,
            canCancel:
              bookingDateTime > now &&
              bookingDateTime - now > 24 * 60 * 60 * 1000,
            link: booking.booking_link,
          };
        });
        setBookings(transformed);
      } catch (err) {
        console.error("Error loading bookings:", err);
      }
    };
    fetchBookings();
  }, []);

  const columns = [
    { name: "Date", selector: (row) => row.date, sortable: true },
    { name: "Time", selector: (row) => row.time, sortable: true },
    {
      name: "Tutor",
      cell: (row) => (
        <a href={`/tutor/${row.tutor_id}`} className="tutor-link">
          {row.tutor}
        </a>
      ),
      sortable: true,
    },
    {
      name: "Status",
      cell: (row) => (
        <span
          className={`badge ${
            row.status === "Upcoming" ? "badge-gold" : "badge-green"
          }`}
        >
          {row.status}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Feedback",
      cell: (row) =>
        row.canLeaveFeedback ? (
          <button
            className="badge badge-cyan clickable"
            onClick={() => navigate(`/student/feedback/${row.id}`)}
          >
            Leave Feedback
          </button>
        ) : (
          "-"
        ),
    },
    {
      name: "Join",
      cell: (row) =>
        row.canJoin ? (
          <a
            href={`/join/${row.id}`}
            className="badge badge-purple clickable"
            target="_blank"
            rel="noopener noreferrer"
          >
            Join Class
          </a>
        ) : (
          "-"
        ),
    },
    {
      name: "Cancel",
      cell: (row) =>
        row.canCancel ? (
          <button
            className="badge badge-red clickable"
            onClick={async () => {
              const confirmed = window.confirm(
                "Are you sure you want to cancel this booking? This cannot be undone."
              );
              if (!confirmed) return;

              try {
                await axios.patch(
                  `http://localhost:3002/api/booking/${row.id}/cancel`,
                  {},
                  { withCredentials: true }
                );
                setBookings((prev) => prev.filter((b) => b.id !== row.id));
              } catch (err) {
                console.error("Error cancelling booking:", err);
              }
            }}
          >
            Cancel
          </button>
        ) : (
          "-"
        ),
    },
  ];

  const filteredData = bookings.filter(
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
          noDataComponent={
            <div className="no-bookings-message">You have no bookings yet.</div>
          }
        />
      </div>
    </div>
  );
}
