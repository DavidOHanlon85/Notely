import React, { useEffect, useState } from "react";
import { data, useParams } from "react-router-dom";
import axios from "axios";
import DoubleButtonNavBar from "../components/DoubleButtonNavBar";
import SocialsFooter from "../components/SocialsFooter";
import "./StaticProfilePage.css";

export default function StaticProfilePage() {
  {
    /* Helper Method to formatAvailability */
  }

  const formatAvailability = (rows) => {
    const slots = ["Morning", "Afternoon", "After School", "Evening"];
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const result = {};
    for (let slot of slots) {
      result[slot] = days.map((day) => {
        const match = rows.find(
          (row) => row.time_slot === slot && row.day_of_week === day
        );
        return match ? match.is_available === 1 : false;
      });
    }
    return result;
  };

  {
    /* Axios Request */
  }

  const { id } = useParams();
  const [tutor, setTutor] = useState(null);

  useEffect(() => {
    const fetchTutor = async () => {
      try {
        const response = await axios.get(`http://localhost:3002/api/tutor/${id}`, {
          params: {
            feedbackLimit: 5,
            feedbackPage: 1,
            sort: "newest",
          },
        });
  
        console.log("Tutor profile response:", response.data);
        setTutor(response.data);
      } catch (error) {
        console.error("Error fetching tutor profile:", error.response?.data || error.message);
      }
    };
  
    if (id) fetchTutor();
  }, [id]);

  if (!tutor) return <div className="container py-5">Loading...</div>;

  const fullName = `${tutor.tutor_first_name} ${tutor.tutor_second_name}`;
  const instruments = tutor.instruments?.split(", ") || [];
  const mapQuery = encodeURIComponent(
    `${tutor.tutor_address_line_1}, ${tutor.tutor_city} ${tutor.tutor_postcode}`
  );

  return (
    <div className="container py-4">
      <DoubleButtonNavBar />

      <div className="row">
        {/* Left Panel */}
        <div className="col-lg-7">
          <div className="card p-4 tutor-profile-card">
            <div className="row">
              {/* Profile Image and Price */}
              <div className="col-md-4 text-center">
                <div className="tutor-profile-photo mx-auto mb-4">
                  <img
                    src={tutor.tutor_image}
                    alt={fullName}
                    className="img-fluid rounded-circle border border-warning"
                    style={{
                      width: "220px",
                      height: "220px",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <h4 className="fw-bold mt-2"> £{tutor.tutor_price}/hr </h4>
              </div>

              {/* Information Section */}
              <div className="col-md-8 d-flex flex-column justify-content-between">
                <div>
                  <h1 className="h3 text-md-start text-center">{fullName}</h1>
                  {instruments.map((inst, index) => (
                    <span key={index} className="badge bg-secondary mb-2 me-1">
                      {inst}
                    </span>
                  ))}

                  {/* Qualification Badges */}
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

                  {/* Stats */}
                  <ul className="list-unstyled mb-3">
                    <li>
                      <i className="bi bi-star-fill svg-icon"></i>
                      <strong> {tutor.stats.avg_rating || "N/A"}</strong> (
                      {tutor.stats.review_count} reviews)
                    </li>
                    <li>
                      <i className="bi bi-clock-fill svg-icon"></i>{" "}
                      {tutor.stats.years_experience}+ years teaching experience
                    </li>
                    <li>
                      <i className="bi bi-person-circle svg-icon"></i>{" "}
                      {tutor.stats.unique_students} Notely students
                    </li>
                  </ul>
                </div>

                {/* CTAs */}
                <div className="d-flex gap-2">
                  <button className="btn btn-notely-gold fw-bold">
                    Book Now
                  </button>
                  <button className="btn btn-notely-outline-gold">
                    Message
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="card p-4 mt-4">
            <h2 className="h5 mb-3">About {tutor.tutor_first_name}</h2>
            <p>{tutor.tutor_bio_paragraph_1}</p>

            <p>{tutor.tutor_bio_paragraph_2}</p>
          </div>

          {/* Availability Section */}

          <div className="card p-4 mt-4">
            <h2 className="h5 mb-3">Availability</h2>
            <div className="table-responsive">
              <table className="table text-center align-middle availability-table">
                <thead>
                  <tr>
                    <th></th>
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                      (day) => (
                        <th key={day}>{day}</th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(tutor.availability).map(([slot, values]) => (
                    <tr key={slot}>
                      <td className="text-start fw-medium">{slot}</td>
                      {values.map((available, index) => (
                        <td key={index}>
                          {available && (
                            <span className="notely-available-icon" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="col-lg-5">
          {/* Education */}
          <div className="card p-4 mb-4 mt-lg-0 mt-4">
            <h2 className="h5 mb-3">Education</h2>
            <ul className="list-unstyled mb-0">
              {tutor.education.map((degree, index) => (
                <li
                  className="mb-2 d-inline-flex align-items-start"
                  key={index}
                >
                  <img
                    src="../assets/images/svg/Degree.svg"
                    alt="Degree Icon"
                    className="notely-icon me-2 mt-0"
                  />
                  <span className="text-justify">
                    <strong>{degree.degree}</strong>, {degree.institution} (
                    {degree.year})
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Certifications */}
          <div className="card p-4 mb-4">
            <h2 className="h5 mb-3">Certifications</h2>
            <ul className="list-unstyled mb-0">
              {tutor.certifications.map((cert, idx) => (
                <li className="d-flex align-items-start gap-2 mb-2" key={idx}>
                  <img
                    className="notely-icon mt-0"
                    src="../assets/images/svg/Certificate.svg"
                    alt="Certificate Icon"
                  />
                  <span className="justify-text">
                    <strong>{cert.name}</strong> ({cert.year})
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Student Feedback - safegaurded against no feedback */}
          <div className="card p-4">
            <h2 className="h5 mb-0">Student Feedback</h2>

            <div
              id="carouselStudentFeedback"
              className="carousel slide"
              data-bs-ride="carousel"
            >
              {Array.isArray(tutor.feedback) && tutor.feedback.length > 0 ? (
                <>
                  {/* Indicators */}
                  <div className="carousel-indicators mb-0">
                    {tutor.feedback.map((_, index) => (
                      <button
                        type="button"
                        key={index}
                        data-bs-target="#carouselStudentFeedback"
                        data-bs-slide-to={index}
                        className={index === 0 ? "active" : ""}
                        aria-current={index === 0 ? "true" : undefined}
                        aria-label={`Slide ${index + 1}`}
                      ></button>
                    ))}
                  </div>

                  {/* Carousel Items */}
                  <div className="carousel-inner">
                    {tutor.feedback.map((item, index) => (
                      <div
                        className={`carousel-item ${
                          index === 0 ? "active" : ""
                        }`}
                        key={index}
                      >
                        <div className="bg-light p-3 rounded text-center">
                          <blockquote className="blockquote mb-3">
                            <p className="fs-6 text-justify">
                              “{item.feedback_text}”
                            </p>
                          </blockquote>
                          <figcaption className="blockquote-footer">
                            <strong>{item.student_name}</strong>,{" "}
                            <cite>Notely student</cite>
                          </figcaption>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Controls */}
                  <button
                    className="carousel-control-prev"
                    type="button"
                    data-bs-target="#carouselStudentFeedback"
                    data-bs-slide="prev"
                  >
                    <span
                      className="carousel-control-prev-icon"
                      aria-hidden="true"
                    ></span>
                    <span className="visually-hidden">Previous</span>
                  </button>
                  <button
                    className="carousel-control-next"
                    type="button"
                    data-bs-target="#carouselStudentFeedback"
                    data-bs-slide="next"
                  >
                    <span
                      className="carousel-control-next-icon"
                      aria-hidden="true"
                    ></span>
                    <span className="visually-hidden">Next</span>
                  </button>
                </>
              ) : (
                <div className="text-center py-3">
                  <p className="text-muted fst-italic">
                    This tutor has not yet received feedback.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Google Location */}

          <div className="card p-4 mt-4">
            <h2 className="h5 mb-4">My Studio</h2>
            <div className="ratio ratio-16x9">
              <iframe
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                allowFullScreen="My Studio Location"
                loading="lazy"
                title="Tutor Location"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <SocialsFooter />
      </div>



      
    </div>
  );
}
