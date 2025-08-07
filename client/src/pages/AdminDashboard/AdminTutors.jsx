import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom";
import "./AdminTutors.css";

export default function AdminTutors() {
  const [tutors, setTutors] = useState([]);
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const res = await axios.get("http://localhost:3002/api/admin/tutors", {
          withCredentials: true,
        });
        setTutors(res.data);
      } catch (err) {
        console.error("Error fetching tutors:", err);
      }
    };

    fetchTutors();
  }, []);

  const handleVerifyToggle = async (tutorId, currentlyVerified) => {
    try {
      const endpoint = currentlyVerified ? "revoke" : "verify";
      await axios.patch(
        `http://localhost:3002/api/admin/tutor/${tutorId}/${endpoint}`,
        {},
        { withCredentials: true }
      );
      setTutors((prev) =>
        prev.map((tutor) =>
          tutor.tutor_id === tutorId
            ? {
                ...tutor,
                tutor_approval_date: currentlyVerified ? null : new Date().toISOString(),
              }
            : tutor
        )
      );
    } catch (err) {
      console.error("Error updating verification:", err);
    }
  };

  const handleSendReminder = async (tutorId) => {
    try {
      await axios.post(
        `http://localhost:3002/api/admin/tutor/${tutorId}/stripe-reminder`,
        {},
        { withCredentials: true }
      );
      alert("Reminder sent!");
    } catch (err) {
      console.error("Error sending reminder:", err);
    }
  };

  const columns = [
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => (
        <Link to={`/tutor/${row.tutor_id}`} className="admin-tutor-link">
          {row.name}
        </Link>
      ),
    },
    {
      name: "Email",
      selector: (row) => row.tutor_email,
      sortable: true,
    },
    {
      name: "Phone",
      selector: (row) => row.tutor_phone || "-",
      sortable: true,
    },
    {
      name: "City",
      selector: (row) => row.tutor_city || "-",
      sortable: true,
    },
    {
      name: "Reg Date",
      selector: (row) => row.tutor_registration_date || "-",
      sortable: true,
    },
    {
      name: "Bookings",
      selector: (row) => row.booking_count ?? "-",
      sortable: true,
    },
    {
      name: "Rating",
      selector: (row) => row.average_rating ?? 0,
      cell: (row) =>
        row.average_rating !== null && !isNaN(row.average_rating) ? (
          <span className="admin-rating-badge">
            ★ {Number(row.average_rating).toFixed(1)}
          </span>
        ) : (
          "-"
        ),
      sortable: true,
    },
    {
      name: "Verified",
      selector: (row) => !!row.tutor_approval_date,
      sortable: true,
      cell: (row) => (
        <button
          className={`badge clickable ${
            row.tutor_approval_date ? "admin-badge-red" : "admin-badge-green"
          }`}
          onClick={() => {
            const action = row.tutor_approval_date ? "revoke" : "verify";
            const confirmed = window.confirm(`Are you sure you want to ${action} this tutor?`);
            if (confirmed) {
              handleVerifyToggle(row.tutor_id, !!row.tutor_approval_date);
            }
          }}
        >
          {row.tutor_approval_date ? "Revoke" : "Verify"}
        </button>
      ),
    },
    {
      name: "Stripe",
      selector: (row) => !!row.tutor_stripe_account_id,
      sortable: true,
      cell: (row) =>
        row.tutor_stripe_account_id ? (
          "-"
        ) : (
          <button
            className="badge admin-badge-cyan clickable"
            onClick={() => {
              const confirmed = window.confirm("Send Stripe reminder email to this tutor?");
              if (confirmed) {
                handleSendReminder(row.tutor_id);
              }
            }}
          >
            Send Reminder
          </button>
        ),
    },
  ];

  const filtered = tutors.filter(
    (tutor) =>
      tutor.name?.toLowerCase().includes(filterText.toLowerCase()) ||
      tutor.tutor_email?.toLowerCase().includes(filterText.toLowerCase()) ||
      tutor.tutor_city?.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="admin-tutors">
      <div className="admin-dashboard-welcome d-flex justify-content-between align-items-center mt-0">
        <h2 className="admin-welcome-text">Tutors</h2>
        <div className="admin-tutors-search-wrapper">
          <input
            type="text"
            placeholder="Search tutors..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="admin-search-input"
          />
        </div>
      </div>

      <div className="admin-table-scroll-wrapper">
        <DataTable
          columns={columns}
          data={filtered}
          pagination
          highlightOnHover
          striped
          responsive
          noDataComponent={<div className="admin-no-tutors-message">No tutors found.</div>}
        />
      </div>
    </div>
  );
}