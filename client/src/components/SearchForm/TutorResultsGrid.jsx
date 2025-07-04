import React from "react";
import TutorCard from "../TutorCard";
import PropTypes from "prop-types";

export default function TutorResultsGrid({ tutors }) {
  if (!tutors || tutors.length === 0) return null;

  return (
    <div className="container mt-5 px-3 pb-2">
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {tutors.map((tutor) => (
          <div className="col fade-in" key={tutor.id}>
            <TutorCard tutor={tutor} />
          </div>
        ))}
      </div>
    </div>
  );
}

TutorResultsGrid.propTypes = {
  tutors: PropTypes.array.isRequired,
};
