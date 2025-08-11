import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import "./TutorBookings.css";

export default function TutorBookings() {
  const [bookings, setBookings] = useState([]);
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3002/api/tutor/bookings",
          {
            withCredentials: true,
          }
        );

        const now = new Date();
        const transformed = response.data.map((booking) => {
          const dateObj = new Date(booking.booking_date);
          dateObj.setDate(dateObj.getDate() + 1); 

          const formattedDate = dateObj
            .toISOString()
            .split("T")[0]
            .split("-")
            .reverse()
            .join("/");
          const formattedTime = booking.booking_time.slice(0, 5);

          const bookingDateTime = new Date(
            `${formattedDate.split("/").reverse().join("-")}T${
              booking.booking_time
            }`
          );

          return {
            id: booking.booking_id,
            student: `${booking.student_first_name} ${booking.student_last_name}`,
            student_id: booking.student_id,
            date: formattedDate,
            time: formattedTime,
            status: bookingDateTime > now ? "Upcoming" : "Completed",
            feedback_given: booking.feedback_given === 1,
            canLeaveFeedback:
              bookingDateTime < now && booking.feedback_given === 0,
            canJoin:
              bookingDateTime - now <= 24 * 60 * 60 * 1000 &&
              bookingDateTime > now,
            canCancel:
              bookingDateTime > now &&
              bookingDateTime - now > 24 * 60 * 60 * 1000,
            link: booking.booking_link,
            bookingDateTime,
          };
        });

        setBookings(transformed);
      } catch (err) {
        console.error("Error fetching tutor bookings:", err);
      }
    };

    fetchBookings();
  }, []);

  const columns = [
    { name: "Date", selector: (row) => row.date, sortable: true },
    { name: "Time", selector: (row) => row.time, sortable: true },
    {
      name: "Student",
      selector: (row) => row.student,
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
          <a
            href={`/tutor/feedback/${row.id}`}
            className="badge badge-cyan clickable"
          >
            Leave Feedback
          </a>
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
                "Are you sure you want to cancel this booking? This will notify the student and cannot be undone."
              );
              if (!confirmed) return;

              try {
                await axios.patch(
                  `http://localhost:3002/api/tutor/booking/${row.id}/cancel`,
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
      booking.student.toLowerCase().includes(filterText.toLowerCase()) ||
      booking.status.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="tutor-bookings">
      <h2 className="bookings-heading">Your Bookings</h2>

      <div className="bookings-search-wrapper">
        <input
          type="text"
          placeholder="Search lessons..."
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
            <div className="no-bookings-message">No lessons found.</div>
          }
        />
      </div>
    </div>
  );
}
