import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import DoubleButtonNavBar from "../components/UI/DoubleButtonNavBar";
import SocialsFooter from "../components/UI/SocialsFooter";
import NotelyRectangle from "../assets/images/NotelyRectangle.png";

export default function LeaveFeedbackPage() {
  const { booking_id } = useParams();
  const navigate = useNavigate();

  const [tutor, setTutor] = useState(null);
  const [form, setForm] = useState({ feedback_text: "", feedback_score: 5 });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchBookingInfo = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3002/api/booking/${booking_id}/details`,
          {
            withCredentials: true,
          }
        );
        setTutor(response.data.tutor);
      } catch (err) {
        console.error("Error fetching booking info:", err);
      }
    };
    fetchBookingInfo();
  }, [booking_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Form submitted");
    const newErrors = {};

    if (!form.feedback_score) {
      newErrors.feedback_score = "Please select a score.";
    }
    if (!form.feedback_text || form.feedback_text.trim().length < 10) {
      newErrors.feedback_text =
        "Please enter at least 10 characters of feedback.";
    }
    if (!tutor?.tutor_id) {
      newErrors.tutor = "Tutor information not loaded.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      console.log("Sending payload:", {
        ...form,
        tutor_id: tutor.tutor_id,
        feedback_date: new Date().toISOString().split("T")[0],
        booking_id,
      });

      await axios.post(
        "http://localhost:3002/api/feedback",
        {
          ...form,
          tutor_id: tutor.tutor_id,
          feedback_date: new Date().toISOString().split("T")[0],
          booking_id,
        },
        { withCredentials: true }
      );

      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting feedback:", err);
      if (err.response) {
        console.log("Response error:", err.response.data);

        if (err.response.status === 409) {
          setErrors({
            general: "You’ve already submitted feedback for this lesson.",
          });
        } else {
          setErrors({
            general: "An unexpected error occurred. Please try again.",
          });
        }
      }
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <DoubleButtonNavBar />
      <main className="flex-fill d-flex align-items-center justify-content-center">
        <div className="container px-4 py-5 text-center">
          <img
            className="d-block mx-auto mb-4"
            src={NotelyRectangle}
            alt="Notely Logo"
            width="260"
            height="75"
          />

          <h1 className="display-4 text-body-emphasis mt-2 mb-3">
            {submitted ? "Feedback Submitted" : "Leave Feedback"}
          </h1>

          {!submitted ? (
            <>
              <h2 className="fs-5 text-muted mb-4">
                For your lesson with{" "}
                <strong>
                  {tutor
                    ? `${tutor.tutor_first_name} ${tutor.tutor_second_name}`
                    : "your tutor"}
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
                className="mx-auto text-start"
                style={{ maxWidth: "600px" }}
              >
                {/* Score selection */}
                <div className="mb-4 text-center">
                  <label className="form-label fw-bold d-block mb-2">
                    Performance Score
                  </label>
                  <div className="d-flex justify-content-center gap-2 mb-2">
                    {[5, 4, 3, 2, 1].map((score) => (
                      <button
                        key={score}
                        type="button"
                        className={`btn border ${
                          form.feedback_score === score
                            ? "btn-notely-gold"
                            : "btn-outline-secondary"
                        }`}
                        onClick={() =>
                          setForm({ ...form, feedback_score: score })
                        }
                      >
                        {score}★
                      </button>
                    ))}
                  </div>
                  {errors.feedback_score && (
                    <div className="text-danger text-center mt-1 small">
                      {errors.feedback_score}
                    </div>
                  )}
                </div>

                {/* Textarea */}
                <div className="mb-4">
                  <label htmlFor="feedback_text" className="form-label fw-bold">
                    Your Feedback
                  </label>
                  <textarea
                    id="feedback_text"
                    className="form-control"
                    rows="6"
                    style={{ minHeight: "150px" }}
                    maxLength="180"
                    value={form.feedback_text}
                    onChange={(e) =>
                      setForm({ ...form, feedback_text: e.target.value })
                    }
                    required
                  />
                  {errors.feedback_text && (
                    <div className="text-danger mt-1 small">
                      {errors.feedback_text}
                    </div>
                  )}
                </div>

                {/* Submit */}
                <div className="text-center">
                  <button type="submit" className="btn btn-notely-gold px-4">
                    Submit Feedback
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <p className="lead mb-4">
                Thanks for your feedback — your input helps us keep Notely
                tutors exceptional.
              </p>
              <div className="row justify-content-center gy-2 gx-3">
                <div className="col-12 col-sm-auto">
                  <Link
                    to="/student/dashboard"
                    className="btn btn-notely-gold w-100"
                  >
                    View Dashboard
                  </Link>
                </div>
                <div className="col-12 col-sm-auto">
                  <Link
                    to="/tutors"
                    className="btn btn-notely-outline-light w-100"
                  >
                    Book Another Lesson
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
