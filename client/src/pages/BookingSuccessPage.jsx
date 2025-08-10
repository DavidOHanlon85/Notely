import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./BookingSuccessPage.css";
import DoubleButtonNavBar from "../components/UI/DoubleButtonNavBar";
import NotelyRectangle from "../assets/images/NotelyRectangle.png";
import SocialsFooter from "../components/UI/SocialsFooter";
import axios from "axios";
import { fetchTutors } from "../services/api/tutorServices";

export default function BookingSuccessPage() {
  const [searchParams] = useSearchParams();
  const tutorId = searchParams.get("tutor_id");
  const bookingDate = searchParams.get("booking_date");
  const bookingTime = searchParams.get("booking_time");
  const [tutor, setTutor] = useState(null);

  useEffect(() => {
    const fetchTutor = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3002/api/tutor/${tutorId}`
        );

        setTutor(response.data);
      } catch (error) {
        console.log("Error fetching tutor details:", error);
      }
    };

    if (tutorId) {
      fetchTutor();
    }
  }, [tutorId]);

  console.log(tutor);

  {
    /* Formatting Date Helper */
  }

  const formattedDate = bookingDate
    ? new Date(bookingDate).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  {
    /* Formatting Date Helper */
  }

  const formattedTime = bookingTime
    ? (() => {
        const [hour, minute] = bookingTime.split(":");
        return `${hour}:${minute}`;
      })()
    : "";

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Navbar */}
      <DoubleButtonNavBar />

      {/* Main Content */}
      <main className="flex-fill d-flex align-items-center justify-content-center">
        <div className="container px-4 py-5 text-center">
          {/* Logo */}
          <img
            className="d-block mx-auto mb-4"
            src={NotelyRectangle}
            alt="Notely Logo"
            width="260"
            height="75"
          />

          {/* Headings */}
          <h1 className="display-4 text-body-emphasis mt-2 bb-3">
            Booking Confirmed
          </h1>
          <h2 className="fs-2 text-body-emphasis mb-3">You're all set.</h2>

          {/* Confirmation Text */}
          <div className="mx-auto mb-4" style={{ maxWidth: "600px" }}>
            <p className="lead">
              Your lesson with{" "}
              <strong>
                {tutor
                  ? `${tutor.tutor_first_name} ${tutor.tutor_second_name}`
                  : `Tutor #${tutorId}`}
              </strong>{" "}
              has been successfully booked for <strong>{formattedDate}</strong> at{" "}
              <strong>{formattedTime}</strong>.
            </p>
            <p className="lead">
              You’ll receive an email confirmation shortly.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="row justify-content-center gy-2 gx-3">
            <div className="col-12 col-sm-auto">
              <Link
                to="/"
                className="btn btn-notely-gold w-100 d-inline-flex justify-content-center align-items-center gap-2"
              >
                <span>View My Bookings</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="20px"
                  viewBox="0 -960 960 960"
                  width="20px"
                  fill="currentColor"
                >
                  <path d="M400-240q50 0 85-35t35-85v-280h120v-80H460v256q-14-8-29-12t-31-4q-50 0-85 35t-35 85q0 50 35 85t85 35Zm80 160q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z" />
                </svg>
              </Link>
            </div>
            <div className="col-12 col-sm-auto">
              <Link
                to="/tutors"
                className="btn btn-notely-outline-light w-100 d-inline-flex justify-content-center align-items-center gap-2"
              >
                <span>
                  <strong>Book Another Lesson</strong>
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="20px"
                  viewBox="0 -960 960 960"
                  width="20px"
                  fill="currentColor"
                >
                  <path d="M400-240q50 0 85-35t35-85v-280h120v-80H460v256q-14-8-29-12t-31-4q-50 0-85 35t-35 85q0 50 35 85t85 35Zm80 160q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Thank You Text */}
          <div className="pt-4">
            <p className="text-muted">
              Thank you for using Notely — your path to musical mastery starts
              here.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <SocialsFooter />
    </div>
  );
}
