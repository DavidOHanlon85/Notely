import React from "react";
import { Link } from "react-router-dom";
import "./TutorCard.css";

export default function TutorCard({ tutor }) {
  const fullName = `${tutor.tutor_first_name} ${tutor.tutor_second_name}`;

  return (
    <div className="card shadow-sm tutor-card rounded-4 p-3">
      <div className="d-flex align-items-center">
        <img
          src={`http://localhost:3002${tutor.tutor_image}`}
          alt={fullName}
          className="rounded-circle tutor-img me-3 border-gold"
        />
        <div>
          <h5 className="mb-1">
            <Link
              to={`/tutor/${tutor.tutor_id}`}
              className="text-dark text-decoration-none"
            >
              {fullName}
            </Link>
          </h5>
          <small className="text-muted d-flex align-items-center">
            <i className="bi bi-geo-alt me-1"></i> {tutor.tutor_city}
          </small>

          {/* Instrument badge if present */}
          {tutor.instruments &&
            tutor.instruments.split(", ").map((inst, idx) => (
              <span
                key={idx}
                className="badge bg-secondary text-light mt-1 me-1"
              >
                {inst}
              </span>
            ))}
        </div>
      </div>

      <p className="mt-3 mb-1 fst-italic text-muted">
        “{tutor.tutor_tag_line}”
      </p>

      <div className="d-flex flex-wrap gap-2 mt-0 mb-1">
        {/* Stats badges */}
        <span className="badge bg-light text-dark">
          <i className="bi bi-star-fill text-warning me-1"></i>
          <strong>{tutor.avg_rating || "N/A"}</strong> (
          {tutor.review_count || 0} reviews)
          <i className="bi bi-clock-fill ms-3 me-1 clock-colour"></i>
          {tutor.years_experience || 0}+ yrs experience
        </span>
      </div>

      <div
        className="d-flex flex-wrap gap-2 mt-1 mb-1"
        style={{ minHeight: "58px" }}
      >
        {tutor.tutor_sen === 1 && (
          <span className="badge bg-warning text-dark">SEN Trained</span>
        )}
        {tutor.tutor_qualified === 1 && (
          <span className="badge bg-warning text-dark">Qualified Teacher</span>
        )}
        {tutor.tutor_dbs === 1 && (
          <span className="badge bg-warning text-dark">DBS Certified</span>
        )}

        <div className="w-100"></div>
        <span className="badge bg-light text-dark mt-0">
          {tutor.tutor_modality}
        </span>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-0">
        <strong className="fs-5">
          £{Number.isFinite(tutor.tutor_price) ? tutor.tutor_price : "—"}/hr
        </strong>
        <Link
          to={`/booking/${tutor.tutor_id}`}
          style={{ textDecoration: "none" }}
        >
          <button className="btn btn-notely-gold btn-sm rounded-pill">
            Book Now
          </button>
        </Link>
      </div>
    </div>
  );
}
