import React from "react";
import PropTypes from "prop-types";

export default function PaginationFeedback({
  currentPage,
  totalFeedback,
  feedbackPerPage,
  setCurrentPage,
}) {


    console.log("Total Feedback:", totalFeedback, "Limit:", feedbackPerPage);

    const totalPages = Math.ceil(Number(totalFeedback) / Number(feedbackPerPage));

  if (totalPages <= 1) return null;
  console.log("Total Pages:", totalPages);

  return (
    <div className="notely-pagination mb-0 mt-0">
      {/* Previous Button */}
      {currentPage > 1 && (
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          className="notely-arrow-btn"
        >
          <i className="bi bi-chevron-left"></i>
        </button>
      )}

      {/* Page Dots */}
      {Array.from({ length: totalPages }).map((_, index) => (
        <button
          key={index}
          className={`notely-dot ${index + 1 === currentPage ? "active" : ""}`}
          onClick={() => setCurrentPage(index + 1)}
        />
      ))}

      {/* Next Button */}
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

PaginationFeedback.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalFeedback: PropTypes.number.isRequired,
  feedbackPerPage: PropTypes.number.isRequired,
  setCurrentPage: PropTypes.func.isRequired,
};
