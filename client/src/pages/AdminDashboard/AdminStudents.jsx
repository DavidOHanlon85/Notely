import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import "./AdminStudents.css";

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3002/api/admin/students",
          {
            withCredentials: true,
          }
        );
        setStudents(res.data);
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    };
    fetchStudents();
  }, []);

  const handleVerifyToggle = async (studentId, currentlyVerified) => {
    try {
      const endpoint = currentlyVerified ? "revoke" : "verify";
      await axios.patch(
        `http://localhost:3002/api/admin/student/${studentId}/${endpoint}`,
        {},
        { withCredentials: true }
      );
      setStudents((prev) =>
        prev.map((s) =>
          s.student_id === studentId
            ? {
                ...s,
                student_verification_date: currentlyVerified
                  ? null
                  : new Date().toISOString(),
              }
            : s
        )
      );
    } catch (err) {
      console.error("Error updating student verification:", err);
    }
  };

  const columns = [
    {
      name: "Name",
      selector: (row) => `${row.name}`,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row.student_email,
      sortable: true,
    },
    {
      name: "Phone",
      selector: (row) => row.student_phone || "-",
      sortable: true,
    },
    {
      name: "Reg Date",
      selector: (row) => row.student_registration_date,
      sortable: true,
      cell: (row) => {
        const date = new Date(row.student_registration_date);
        return isNaN(date) ? "-" : date.toLocaleDateString("en-GB");
      },
    },
    {
      name: "Verified",
      selector: (row) => !!row.student_verification_date,
      sortable: true,
      cell: (row) => (
        <button
          className={`badge clickable ${
            row.student_verification_date ? "admin-badge-red" : "admin-badge-green"
          }`}
          onClick={() => {
            const action = row.student_verification_date ? "revoke" : "verify";
            const confirmed = window.confirm(`Are you sure you want to ${action} this student?`);
            if (confirmed) {
              handleVerifyToggle(row.student_id, !!row.student_verification_date);
            }
          }}
        >
          {row.student_verification_date ? "Revoke" : "Verify"}
        </button>
      ),
    },
  ];

  const filtered = students.filter(
    (student) =>
      `${student.student_first_name} ${student.student_last_name}`
        .toLowerCase()
        .includes(filterText.toLowerCase()) ||
      student.student_email?.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="admin-students">
      <div className="admin-dashboard-welcome d-flex justify-content-between align-items-center mt-0">
        <h2 className="admin-welcome-text">Students</h2>
        <div className="admin-students-search-wrapper">
          <input
            type="text"
            placeholder="Search students..."
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
          noDataComponent={
            <div className="admin-no-students-message">No students found.</div>
          }
        />
      </div>
    </div>
  );
}
