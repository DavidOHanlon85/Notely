import React from "react";
import PropTypes from "prop-types";

export default function SearchResultsHeader({ hasSearched, tutors, totalTutors }) {
  if (!hasSearched) return null;

  return (
    <div className="container mt-0 fade-in">
      <h3 className="text-muted fw-semibold mb-1">
        {tutors.length > 0
          ? `${totalTutors} Tutors Found`
          : `${totalTutors} tutors found — try adjusting your search.`}
      </h3>
      <hr className="mb-4" />
    </div>
  );
}

SearchResultsHeader.propTypes = {
  hasSearched: PropTypes.bool.isRequired,
  tutors: PropTypes.array.isRequired,
  totalTutors: PropTypes.number.isRequired,
};