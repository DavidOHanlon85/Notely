import React from "react";
import PropTypes from "prop-types";

export default function Pagination({ currentPage, totalTutors, resultsPerPage, setCurrentPage }) {
  const totalPages = Math.ceil(totalTutors / resultsPerPage);

  if (totalPages <= 1) return null; // No pagination needed

  return (
    <div className="notely-pagination mb-5">
      {/* Previous Arrow */}
      {currentPage > 1 && (
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          className="notely-arrow-btn"
        >
          <i className="bi bi-chevron-left"></i>
        </button>
      )}

      {/* Dot Indicators */}
      {Array.from({ length: totalPages }).map((_, index) => (
        <button
          key={index}
          className={`notely-dot ${index + 1 === currentPage ? "active" : ""}`}
          onClick={() => setCurrentPage(index + 1)}
        />
      ))}

      {/* Next Arrow */}
      {currentPage < totalPages && (
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          className="notely-arrow-btn"
        >
          <i className="bi bi-chevron-right"></i>
        </button>
      )}
    </div>
  );
}

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalTutors: PropTypes.number.isRequired,
  resultsPerPage: PropTypes.number.isRequired,
  setCurrentPage: PropTypes.func.isRequired,
};