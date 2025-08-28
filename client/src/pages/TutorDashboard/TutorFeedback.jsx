import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import "./TutorFeedback.css";

const columns = [
  {
    name: "Date",
    selector: (row) => row.date,
    sortable: true,
  },
  {
    name: "Student",
    selector: (row) => row.student,
    sortable: true,
  },
  {
    name: "Rating",
    selector: (row) => row.rating,
    cell: (row) => (
      <span className="stars">
        {"★".repeat(row.rating)}
        {"☆".repeat(5 - row.rating)}
      </span>
    ),
    sortable: true,
  },
  {
    name: "Review",
    selector: (row) => row.text,
    wrap: true,
  },
];

export default function TutorFeedback() {
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get("http://localhost:3002/api/tutor/reviews", {
          withCredentials: true,
        });
        setReviews(res.data);
      } catch (err) {
        console.error("Failed to load reviews", err);
      }
    };
    fetchReviews();
  }, []);

  const filtered = reviews.filter(
    (row) =>
      row.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.date.includes(searchTerm)
  );

  return (
    <div className="tutor-reviews-page">
      <h2 className="reviews-heading">Student Feedback</h2>

      <div className="review-search-wrapper">
        <input
          type="text"
          className="review-search"
          placeholder="Search feedback..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-scroll-wrapper">
        <DataTable
          columns={columns}
          data={filtered}
          pagination
          highlightOnHover
          striped
          responsive
        />
      </div>
    </div>
  );
}