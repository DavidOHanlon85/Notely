import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { registerLocale } from "react-datepicker";
import enGB from "date-fns/locale/en-GB";
import DoubleButtonNavBar from "../../components/UI/DoubleButtonNavBar";
import "./TutorBookingPage.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function TutorBookingPage() {
  const { id } = useParams();
  const [tutor, setTutor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [highlightedDates, setHighlightedDates] = useState([]);
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [studentId, setStudentId] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  // gate UI until we know auth status
  const [authChecked, setAuthChecked] = useState(false);

  registerLocale("en-GB", enGB);

  {
    /* Require Student Login */
  }

  useEffect(() => {
    const checkStudent = async () => {
      try {
        const { data: me } = await axios.get(
          "http://localhost:3002/api/student/me",
          {
            withCredentials: true,
          }
        );
        setStudentId(me.student_id);
        setAuthChecked(true); // OK to proceed
      } catch {
        const next = encodeURIComponent(location.pathname + location.search);
        navigate(`/student/login?next=${next}`, { replace: true });
      }
    };
    checkStudent();
  }, [navigate, location.pathname, location.search]);

  {
    /* Availability Information - extracted fetchAvailability to use post booking */
  }

  const fetchAvailability = async () => {
    if (!selectedDate || !id) return;

    try {
      const response = await axios.get(
        "http://localhost:3002/api/booking/availability",
        {
          params: {
            tutor_id: id,
            date: selectedDate.toLocaleDateString("en-CA"), // YYYY-MM-DD
            t: new Date().getTime(), // cache-buster
          },
        }
      );
      setAvailableSlots(response.data.available_slots || []);
      setSelectedSlot(null);
    } catch (error) {
      console.log("Error fetching availability:", error);
      setAvailableSlots([]);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [selectedDate, id]);

  {
    /* Tutor Information */
  }

  useEffect(() => {
    const fetchTutor = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3002/api/tutor/${id}`
        );
        setTutor(response.data);
      } catch (error) {
        console.error("Error fetching tutor:", error);
      }
    };

    if (authChecked) fetchTutor();
  }, [id, authChecked]);

  {
    /* Calender Availability Highlights - fetchAvailableDates extracted to use after booking */
  }

  const fetchAvailableDates = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3002/api/booking/available-dates",
        {
          params: {
            tutor_id: id,
            t: new Date().getTime(), // cache-busting param
          },
        }
      );

      const dates = response.data.available_dates.map(
        (dateStr) => new Date(dateStr)
      );
      setHighlightedDates(dates);
    } catch (err) {
      console.error("Error fetching available dates:", err);
    }
  };

  // Run once on load or when tutor id changes
  useEffect(() => {
    if (id && authChecked) {
      fetchAvailableDates();
    }
  }, [id, authChecked]);

  if (!authChecked) return null; // wait for auth result first
  if (!tutor) return <div className="text-center mt-5">Loading...</div>;

  const fullName = `${tutor.tutor_first_name} ${tutor.tutor_second_name}`;
  const instruments = tutor.instruments ? tutor.instruments.split(", ") : [];

  {
    /* Format Button Times */
  }

  const formatTime = (timeStr) => {
    const [hour, minute] = timeStr.split(":");
    const date = new Date();
    date.setHours(parseInt(hour), parseInt(minute));
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  {
    /* Confirming Booking - Removed to allow Stripe web hook - maintained as fallback*/
  }

  /*   const handleConfirmBooking = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3002/api/booking/create",
        {
          tutor_id: id,
          student_id: 1, // TEMP: Replace with logged-in user later when JWT is set up
          booking_date: selectedDate.toLocaleDateString("en-CA"),
          booking_time: selectedSlot,
          booking_notes: bookingNotes,
        }
      );

      setBookingSuccess(true);
      setBookingNotes("");
      setSelectedSlot(null);

      // Refresh available dates after booking
      await fetchAvailableDates();
      await fetchAvailability();
    } catch (err) {
      console.error("Booking error:", err);
      alert("Failed to book. Try again.");
    }
  }; */

  {
    /* Stripe Additions */
  }

  const handleConfirmBooking = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3002/api/create-checkout-session",
        {
          tutor_id: parseInt(id), // from URL param
          student_id: studentId,
          booking_date: selectedDate.toLocaleDateString("en-CA"), // format: YYYY-MM-DD
          booking_time: selectedSlot,
          booking_notes: bookingNotes.trim(),
          return_url: window.location.href,
        },
        { withCredentials: true }
      );

      window.location.href = response.data.url;
    } catch (err) {
      console.error("Error creating checkout session:", err);
      alert("Failed to initiate payment. Please try again.");
    }
  };

  return (
    <div className="container py-4">
      <DoubleButtonNavBar />

      {/* Centered Tutor Profile Card */}
      <div className="row justify-content-center">
        <div className="col-lg-7">
          {/* Tutor Card */}
          <div className="card p-4 tutor-profile-card mb-3">
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
                  <h1 className="h3 text-md-start text-center">
                    <Link
                      to={`/tutor/${id}`}
                      className="text-dark text-decoration-none"
                    >
                      {fullName}
                    </Link>
                  </h1>
                  {instruments.map((inst, index) => (
                    <span key={index} className="badge bg-secondary mb-2 me-1">
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
                    <Link
                      to={`/feedback/${tutor.tutor_id}`}
                      className="text-decoration-none"
                      style={{ color: "inherit" }}
                    >
                      <li>
                        <i className="bi bi-star-fill svg-icon"
                        style={{ fontSize: "1.3rem", color: "#F7B52D" }}></i>
                        <strong>{tutor.stats.avg_rating || "N/A"}</strong> (
                        {tutor.stats.review_count} reviews)
                      </li>
                    </Link>
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
                <div className="d-flex gap-2">
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-notely-gold fw-bold"
                      onClick={() => navigate(`/booking/${id}`)}
                    >
                      Book Now
                    </button>
                    <button
                      className="btn btn-notely-outline-gold"
                      onClick={() => navigate(`/student/messages/${id}`)}
                    >
                      Message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Success Message */}

          {bookingSuccess && (
            <div className="alert alert-success text-center fw-semibold mb-3">
              Booking confirmed! We will email you details shortly.
            </div>
          )}

          {/* Calendar */}
          <div className="card px-3 py-4 mb-4">
            <h4 className="text-center mb-3">Choose a Date</h4>
            <div className="text-center">
              <div className="d-inline-block">
                <DatePicker
                  locale="en-GB"
                  selected={selectedDate}
                  onChange={(date) => {
                    console.log("Clicked date:", date.toDateString());
                    console.log(
                      "Weekday (en-GB):",
                      date.toLocaleDateString("en-GB", { weekday: "short" })
                    );
                    setSelectedDate(date);
                  }}
                  inline
                  minDate={new Date()}
                  highlightDates={highlightedDates}
                  dayClassName={(date) => {
                    const isAvailable = highlightedDates.some(
                      (d) => d.toDateString() === date.toDateString()
                    );
                    const isSelected =
                      selectedDate &&
                      selectedDate.toDateString() === date.toDateString();

                    if (isSelected) return "notely-selected-date";
                    if (isAvailable) return "notely-available-date";
                    return undefined;
                  }}
                />
              </div>
            </div>
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div className="card px-3 py-4 mb-4">
              <h4 className="text-center mb-3">
                Select a Time Slot for{" "}
                {selectedDate.toLocaleDateString("en-GB")}
              </h4>

              {availableSlots.length === 0 ? (
                <p className="text-muted">
                  No available time slots on this date.
                </p>
              ) : (
                <div className="row justify-content-center px-4">
                  {availableSlots.map((slot, index) => (
                    <div
                      key={index}
                      className="time-slot-col mb-3 px-1 d-flex justify-content-center"
                    >
                      <button
                        className={`btn w-100 ${
                          selectedSlot === slot
                            ? "btn-notely-gold-1"
                            : "btn-outline-secondary-1"
                        }`}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {formatTime(slot)}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Confirm Booking Section */}
          {selectedDate && selectedSlot && (
            <div className="card p-4 mb-4">
              <h4 className="mb-3 text-center">Confirm Your Booking</h4>

              <p>
                <strong>Date:</strong>{" "}
                {selectedDate.toLocaleDateString("en-GB")}
              </p>
              <p>
                <strong>Time:</strong> {formatTime(selectedSlot)}
              </p>

              <div className="mb-3">
                <label htmlFor="bookingNotes" className="form-label">
                  <strong>Booking Notes</strong> (optional):
                </label>
                <textarea
                  id="bookingNotes"
                  className={`form-control ${
                    bookingNotes.length > 200 ? "is-invalid" : ""
                  }`}
                  rows="3"
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  maxLength="200"
                  placeholder="E.g. Looking for help with Grade 5 theory..."
                  style={{ minHeight: "120px" }}
                />

                {/* Right-aligned character counter */}
                <div className="d-flex justify-content-end">
                  <small className="form-text text-muted">
                    {bookingNotes.length}/200 characters
                  </small>
                </div>

                {/* Bootstrap error message - Fail safe as theoretically max length should stop student going beyond 200 characters */}
                {bookingNotes.length > 200 && (
                  <div className="invalid-feedback d-block">
                    Booking notes must be 200 characters or fewer.
                  </div>
                )}
              </div>

              <button
                className="btn btn-notely-gold fw-bold"
                onClick={handleConfirmBooking}
              >
                Confirm Booking
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
