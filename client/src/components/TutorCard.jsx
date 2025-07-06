import React from "react";
import { Link } from "react-router-dom";
import "./TutorCard.css"; // for styling

export default function TutorCard({ tutor }) {
  return (
    <div className="card shadow-sm tutor-card rounded-4 p-3">
      <div className="d-flex align-items-center">
        <img
          src={tutor.image}
          alt={tutor.name}
          className="rounded-circle tutor-img me-3 border-gold"
        />
        <div>
          <h5 className="mb-1">
            <Link to={`/tutors/${tutor.id}`} className="text-dark text-decoration-none">
              {tutor.name}
            </Link>
          </h5>
          <small className="text-muted d-flex align-items-center">
            <i className="bi bi-geo-alt me-1"></i> {tutor.location || tutor.city}
          </small>
          <span className="badge bg-light text-dark mt-1">
          {tutor.instrument && (
  <span className="badge bg-secondary text-light mt-1">{tutor.instrument}</span>
)}

          </span>
        </div>
      </div>

      <p className="mt-3 mb-1 fst-italic text-muted">
        “{tutor.tagline}”
      </p>

      <div className="d-flex flex-wrap gap-2 mt-1 mb-1" style={{ minHeight: "58px" }}>
  {tutor.sen === 1 && <span className="badge bg-warning text-dark">SEN Trained</span>}
  {tutor.qualified === 1 && <span className="badge bg-warning text-dark">Qualified Teacher</span>}
  {tutor.dbs === 1 && <span className="badge bg-warning text-dark">DBS Certified</span>}

  {/* Hidden placeholder badges to preserve spacing */}
  {tutor.sen !== 1 && tutor.qualified !== 1 && tutor.dbs !== 1 && (
    <>
      <span className="badge invisible">Placeholder</span>
      <span className="badge invisible">Placeholder</span>
      <span className="badge invisible">Placeholder</span>
    </>
  )}

  <div className="w-100"></div>
  <span className="badge bg-light text-dark mt-0">{tutor.modality}</span>
</div>




      <div className="d-flex justify-content-between align-items-center mt-0">
        <strong className="fs-5">£{Number(tutor.price)}/hr</strong>
        <div className="d-flex gap-2">
          
          <button className="btn btn-notely-gold btn-sm rounded-pill">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
