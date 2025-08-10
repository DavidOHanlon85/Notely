import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import DoubleButtonNavBar from "../components/UI/DoubleButtonNavBar";
import SocialsFooter from "../components/UI/SocialsFooter";
import NotelyRectangle from "../assets/images/NotelyRectangle.png";
import "./TutorFeedbackPage.css";

export default function TutorLeaveFeedbackPage() {
  const { booking_id } = useParams();
  const navigate = useNavigate();

  const [tutor, setTutor] = useState(null);
  const [form, setForm] = useState({
    performance_score: 5,
    homework: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [student, setStudent] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchBookingInfo = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3002/api/tutor/booking/${booking_id}/details`,
          { withCredentials: true }
        );
        setTutor(response.data.tutor);
        setStudent(response.data.student);
      } catch (err) {
        console.error("Error fetching booking info:", err);
      }
    };
    fetchBookingInfo();
  }, [booking_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!form.performance_score) {
      newErrors.performance_score = "Please select a score.";
    }
    if (!form.notes || form.notes.trim().length < 5) {
      newErrors.notes = "Please enter at least 5 characters in Notes.";
    }
    if (!form.homework || form.homework.trim().length < 3) {
      newErrors.homework = "Please enter homework instructions.";
    }

    if (!tutor?.tutor_id) {
      newErrors.tutor = "Tutor information not loaded.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await axios.post(
        "http://localhost:3002/api/tutor/feedback",
        {
          ...form,
          tutor_id: tutor.tutor_id,
          booking_id,
          feedback_date: new Date().toISOString().split("T")[0],
        },
        { withCredentials: true }
      );
      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting feedback:", err);
      setErrors({
        general:
          err.response?.status === 409
            ? "You’ve already submitted feedback for this lesson."
            : "An unexpected error occurred. Please try again.",
      });
    }
  };

  return (
    <div className="tutor-feedback-page d-flex flex-column min-vh-100">
      <DoubleButtonNavBar />
      <main className="flex-fill d-flex align-items-center justify-content-center">
        <div className="container px-4 py-1 text-center">
          <img
            className="d-block mx-auto mb-4"
            src={NotelyRectangle}
            alt="Notely Logo"
            width="260"
            height="75"
          />
          <h1 className="display-4 mt-2 mb-3">
            {submitted ? "Feedback Submitted" : "Leave Feedback"}
          </h1>

          {!submitted ? (
            <>
              <h2 className="fs-5 text-muted mb-4">
                For your lesson with{" "}
                <strong>
                  {tutor
                    ? `${student.student_first_name} ${student.student_last_name}`
                    : "your student"}
                </strong>
              </h2>

              {errors.general && (
                <div
                  className="alert alert-danger mt-3 text-center"
                  role="alert"
                >
                  {errors.general}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="tutor-feedback-form mx-auto text-start"
              >
                {/* Score */}
                <div className="mb-4 text-center">
                  <label className="tutor-feedback-label d-block mb-2">
                    Performance Score
                  </label>
                  <div className="d-flex justify-content-center gap-2 mb-2">
                    {[5, 4, 3, 2, 1].map((score) => (
                      <button
                        key={score}
                        type="button"
                        className={`btn border ${
                          form.performance_score === score
                            ? "btn-notely-purple"
                            : "btn-outline-secondary"
                        }`}
                        onClick={() =>
                          setForm({ ...form, performance_score: score })
                        }
                      >
                        {score}★
                      </button>
                    ))}
                  </div>
                  {errors.performance_score && (
                    <div className="text-danger text-center mt-1 small">
                      {errors.performance_score}
                    </div>
                  )}
                </div>

                {/* Homework */}
                <div className="mb-4">
                  <label htmlFor="homework" className="tutor-feedback-label">
                    Homework Task
                  </label>
                  <input
                    id="homework"
                    type="text"
                    className="form-control"
                    maxLength="50"
                    value={form.homework}
                    onChange={(e) =>
                      setForm({ ...form, homework: e.target.value })
                    }
                    required
                  />
                  {errors.homework && (
                    <div className="text-danger mt-1 small">
                      {errors.homework}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="mb-4">
                  <label htmlFor="notes" className="tutor-feedback-label">
                    Additional Notes
                  </label>
                  <textarea
                    id="notes"
                    className="form-control"
                    rows="4"
                    maxLength="50"
                    value={form.notes}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                    required
                  />
                  {errors.notes && (
                    <div className="text-danger mt-1 small">{errors.notes}</div>
                  )}
                </div>

                <div className="text-center">
                  <button type="submit" className="feedback-submit">
                    Submit Feedback
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <p className="lead mb-4 mt-4">
                Thanks for your feedback — your input helps us keep Notely
                tutors exceptional.
              </p>
              <div className="row justify-content-center gy-2 gx-3 mt-3">
                <div className="col-12 col-sm-auto">
                  <Link
                    to="/tutor/dashboard"
                    className="btn-1 btn-notely-outline w-100 fw-semibold"
                  >
                    View Dashboard
                  </Link>
                </div>
                <div className="col-12 col-sm-auto">
                  <Link
                    to="/"
                    className="btn-1 btn-notely-outline w-100 fw-semibold"
                  >
                    Home
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <SocialsFooter />
    </div>
  );
}
