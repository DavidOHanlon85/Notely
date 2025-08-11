import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import DoubleButtonNavBar from "../../components/UI/DoubleButtonNavBar";
import SocialsFooter from "../../components/UI/SocialsFooter";
import NotelyRectangle from "../../assets/images/NotelyRectangle.png";
import "./JoinPage.css";

export default function JoinPage() {
  const { booking_id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3002/api/booking/${booking_id}`,
          { withCredentials: true }
        );
        setBooking(res.data);
      } catch (err) {
        console.error("Failed to fetch booking", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [booking_id]);

  if (loading) return <div className="loading">Loading your class...</div>;
  if (error || !booking) return <div className="error">Booking not found or you don’t have permission to access this class.</div>;

  const roomURL =
    booking.booking_link || `https://meet.jit.si/notely-class-${booking_id}`;

  const formattedDate = new Date(booking.booking_date).toLocaleDateString(
    "en-GB",
    {
      weekday: "short",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  const formattedTime = booking.booking_time?.slice(0, 5) || "";

  return (
    <div className="d-flex flex-column min-vh-100">
      <DoubleButtonNavBar />

      <main className="flex-fill d-flex align-items-center justify-content-center">
        <div className="container px-4 py-2 text-center">
          <img
            className="d-block mx-auto mb-4"
            src={NotelyRectangle}
            alt="Notely Logo"
            width="260"
            height="75"
          />

          <h1 className="display-4 text-body-emphasis mt-2">
            Join Your Lesson
          </h1>
          <h2 className="fs-2 text-body-emphasis mb-3">
            Welcome back to Notely.
          </h2>

          <div className="mx-auto mb-4" style={{ maxWidth: "600px" }}>
            <p className="lead">
              You’re about to join a lesson between{" "}
              <strong>{booking.student_name || "a student"}</strong> and{" "}
              <strong>{booking.tutor_name || "a tutor"}</strong> on{" "}
              <strong>{formattedDate}</strong> at{" "}
              <strong>{formattedTime}</strong>.
            </p>
            <p className="text-muted">
              Please ensure your camera and mic are enabled.
            </p>
          </div>

          <div className="jitsi-embed-wrapper mx-auto mb-4">
            <iframe
              src={roomURL}
              allow="camera; microphone; fullscreen; display-capture"
              width="100%"
              height="600"
              style={{ border: "none", borderRadius: "1rem" }}
              title="Notely Jitsi Meeting"
            ></iframe>
          </div>

          <p className="text-muted">
            Having trouble? Refresh the page or check your browser settings.
          </p>
        </div>
      </main>

      <SocialsFooter />
    </div>
  );
}