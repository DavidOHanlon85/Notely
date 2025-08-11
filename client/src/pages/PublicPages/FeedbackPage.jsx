import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "bootstrap";
import "./FeedbackPage.css";
import DoubleButtonNavBar from "../../components/UI/DoubleButtonNavBar";
import { FaStar } from "react-icons/fa";
import axios from "axios";
import { useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import PaginationFeedback from "../../components/FeedbackForm/PaginationFeedback";
import SocialsFooter from "../../components/UI/SocialsFooter";

export default function FeedbackPage() {
  const { id } = useParams();
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [minRating, setMinRating] = useState(null);
  const [maxRating, setMaxRating] = useState(null);
  const [sortOption, setSortOption] = useState("sortReviews");

  const navigate = useNavigate();

  {
    /* Pagination Controls */
  }

  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 6; // Testing 6

  const fetchTutor = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3002/api/tutor/${id}`,
        {
          params: {
            sort: sortOption,
            feedbackPage: currentPage,
            feedbackLimit: resultsPerPage,
            minRating,
            maxRating,
          },
        }
      );
      setTutor(response.data);
    } catch (error) {
      console.error("Error fetching tutor feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchTutor();
  }, [id, currentPage, minRating, maxRating, sortOption]);

  useEffect(() => {
    if (!tutor) return;

    // Find all tooltip elements
    const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]'
    );

    // Initialize tooltips with hover only
    const tooltipInstances = [...tooltipTriggerList].map(
      (el) =>
        new Tooltip(el, {
          trigger: "hover", // prevent sticking
          placement: "top",
        })
    );

    // Destroy tooltips on unmount/re-render
    return () => {
      tooltipInstances.forEach((tooltip) => tooltip.dispose());
    };
  }, [tutor]);

  if (loading) return <div className="text-center my-5">Loading...</div>;
  if (!tutor)
    return <div className="text-center text-danger my-5">Tutor not found.</div>;

  {
    /* Logic for Feedback Chart */
  }

  const totalCount =
    tutor.rating_summary?.reduce((sum, r) => sum + r.count, 0) || 0;

  const data =
    tutor.rating_summary?.map((r) => ({
      rating: r.stars,
      count: r.count,
      percentage: totalCount ? ((r.count / totalCount) * 100).toFixed(0) : 0,
    })) || [];

  console.log("Rating Summary:", tutor.rating_summary);

  {
    /* Helper function to ensure correct anme format */
  }

  const capitalise = (name) => {
    if (!name) return "";

    return name
      .toLowerCase()
      .split(/[\s'-]/) // split on space, apostrophe, or hyphen
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(((match) => (name.includes(match) ? match : ""))("'")); // preserve punctuation
  };

  const fullName = `${tutor.tutor_first_name} ${tutor.tutor_second_name}`;
  const instruments = tutor.instruments ? tutor.instruments.split(", ") : [];

  console.log("Total Feedback:", tutor.feedbackTotal, "Limit:", resultsPerPage);

  {
    /* ScrollIntoView on page change */
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <main className="flex-grow-1">
        <div className="container py-4">
          <DoubleButtonNavBar />
          <div className="row g-4">
            {/* Tutor Card */}
            <div className="col-lg-7">
              <div className="card p-4 tutor-profile-card h-100">
                <div className="row">
                  <div className="col-md-4 text-center">
                    <div className="tutor-profile-photo mx-auto mb-4">
                      <img
                        src={`http://localhost:3002${tutor.tutor_image}`}
                        alt={fullName}
                        className="img-fluid rounded-circle border border-warning"
                        style={{
                          width: "220px",
                          height: "220px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <h4 className="fw-bold mt-2">£{tutor.tutor_price}/hr</h4>
                  </div>
                  <div className="col-md-8 d-flex flex-column justify-content-between">
                    <div>
                      <h1
                        className="h3 text-md-start text-center"
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate(`/tutor/${tutor.tutor_id}`)}
                      >
                        {fullName}
                      </h1>
                      {instruments.map((inst, index) => (
                        <span
                          key={index}
                          className="badge bg-secondary mb-2 me-1"
                        >
                          {inst}
                        </span>
                      ))}
                      <div className="mb-2">
                        {tutor.tutor_qualified === 1 && (
                          <span className="badge bg-warning text-dark me-1">
                            Qualified Teacher
                          </span>
                        )}
                        {tutor.tutor_sen === 1 && (
                          <span className="badge bg-warning text-dark me-1">
                            SEN Trained
                          </span>
                        )}
                        {tutor.tutor_dbs === 1 && (
                          <span className="badge bg-warning text-dark">
                            DBS Certified
                          </span>
                        )}
                      </div>
                      <ul className="list-unstyled mb-3">
                        <li
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            navigate(`/feedback/${tutor.tutor_id}`)
                          }
                        >
                          <i className="bi bi-star-fill svg-icon"></i>
                          <strong> {tutor.stats.avg_rating || "N/A"}</strong> (
                          {tutor.stats.review_count} reviews)
                        </li>
                        <li>
                          <i className="bi bi-clock-fill svg-icon"></i>{" "}
                          {tutor.stats.years_experience}+ years teaching
                          experience
                        </li>
                        <li>
                          <i className="bi bi-person-circle svg-icon"></i>{" "}
                          {tutor.stats.unique_students} Notely students
                        </li>
                      </ul>
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-notely-gold fw-bold"
                        onClick={() => navigate(`/booking/${tutor.tutor_id}`)}
                      >
                        Book Now
                      </button>
                      <button
                        className="btn btn-notely-outline-gold"
                        onClick={() =>
                          navigate(`/student/messages/${tutor.tutor_id}`)
                        }
                      >
                        Message
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feedback Chart */}
            <div className="col-lg-5">
              <div className="card p-4 pb-0 h-100">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <h3 className="fw-semibold mb-0">
                    {tutor.stats.avg_rating} out of 5
                  </h3>

                  {minRating !== null && (
                    <span
                      className="badge bg-secondary text-white"
                      role="button"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setMinRating(null);
                        setMaxRating(null);
                        setCurrentPage(1); // reset pagination too
                      }}
                    >
                      Clear Filter
                    </span>
                  )}
                </div>
                <h6 className="fw-semibold mb-3">
                  ({tutor.stats.review_count} reviews)
                </h6>
                {data.map((entry, index) => (
                  <div
                    key={index}
                    className="d-flex align-items-center mb-3"
                    role="button"
                    onClick={() => {
                      setMinRating(entry.rating);
                      setMaxRating(entry.rating);
                      setCurrentPage(1);
                    }}
                  >
                    {/* Stars */}
                    <div className="d-flex me-3" style={{ width: "100px" }}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <FaStar
                          key={i}
                          className="me-0"
                          style={{ fontSize: "1.5rem" }}
                          color={i < entry.rating ? "#ffc107" : "#e0e0e0"}
                        />
                      ))}
                    </div>

                    {/* Bar background */}
                    <div
                      className="flex-grow-1 position-relative rounded"
                      style={{ height: "23px", backgroundColor: "#e8e8e8" }}
                      data-bs-toggle="tooltip"
                      title={`${entry.count} out of ${totalCount} reviews`}
                    >
                      <div
                        className="bg-warning rounded-start"
                        style={{
                          width: `${entry.percentage}%`,
                          height: "100%",
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>

                    {/* Percentage */}
                    <div
                      className="ms-0 fw-semibold"
                      style={{ width: "60px", textAlign: "right" }}
                    >
                      <small>{entry.percentage}%</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Line Break and Sort Function */}
          <div className="container d-flex justify-content-between align-items-end flex-wrap mt-4 mb-2">
            <div>
              <h3 className="text-muted fw-semibold mb-1">
                {tutor.feedback.length > 0
                  ? `${tutor.feedbackTotal} Reviews`
                  : `No reviews available.`}
              </h3>
            </div>
            <div className="mt-2 mt-md-0">
              <div
                className="d-flex align-items-center"
                style={{ width: "284px" }}
              >
                <label
                  htmlFor="reviewSort"
                  className="form-label me-2 mb-0 visually-hidden"
                >
                  Sort Reviews
                </label>
                <div className="input-group notely-input-group w-100">
                  <span
                    className="input-group-text text-white border border-secondary rounded-start"
                    style={{
                      backgroundColor: "#8551E6",
                      fontWeight: 400,
                      borderRadius: "0.5rem 0 0 0.5rem",
                      height: "42px",
                    }}
                  >
                    <i className="bi bi-sort-down-alt"></i>
                  </span>
                  <select
                    id="reviewSort"
                    name="reviewSort"
                    className="form-select border border-secondary rounded-end"
                    value={sortOption}
                    onChange={(event) => {
                      setSortOption(event.target.value);
                      setCurrentPage(1); //Reset pagination
                    }}
                    style={{
                      height: "45px",
                      fontSize: "1rem",
                      fontWeight: 400,
                      padding: "0.25rem 0.75rem",
                      borderRadius: "0 0.5rem 0.5rem 0",
                    }}
                  >
                    <option value="sortReviews" disabled hidden>
                      Sort reviews...
                    </option>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="highest">Highest Rated</option>
                    <option value="lowest">Lowest Rated</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <hr className="container mb-4" />

          {/* Student Feedback Grid */}

          <div className="row mt-4">
            {tutor.feedback.map((fb, index) => (
              <div key={index} className="col-md-6 mb-4">
                <div className="card h-100 p-3 feedback-card">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0 fw-semibold fs-6">
                      {capitalise(fb.student_first_name)}{" "}
                      {capitalise(fb.student_last_name)}
                    </h6>
                    <small className="text-muted">
                      {formatDistanceToNow(new Date(fb.feedback_date), {
                        addSuffix: true,
                      })}
                    </small>
                  </div>

                  <div className="d-flex align-items-center mb-1 gap-1">
                    {[...Array(fb.feedback_score)].map((_, i) => (
                      <i
                        key={i}
                        className="bi bi-star-fill text-warning"
                        style={{ fontSize: "1rem" }}
                      />
                    ))}
                  </div>
                  <p className="mb-0">{fb.feedback_text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}

          {tutor.feedbackTotal > resultsPerPage && (
            <PaginationFeedback
              currentPage={currentPage}
              totalFeedback={tutor.feedbackTotal}
              feedbackPerPage={resultsPerPage}
              setCurrentPage={setCurrentPage}
            />
          )}
        </div>
      </main>

      {/* Footer at bottom if not enough content */}
      <SocialsFooter />
    </div>
  );
}
