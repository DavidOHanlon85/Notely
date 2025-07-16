import React from 'react';
import { useSearchParams } from "react-router-dom";

const BookingSuccess = () => {
  const [params] = useSearchParams();

  const tutorId = params.get("tutor_id");
  const date = params.get("booking_date");
  const time = params.get("booking_time");

  new Date(date).toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })

  return (
    <div className="container mt-5 text-center">
      <h2 className="mb-4">✅ Booking Confirmed!</h2>
      <p>
        Your lesson with <strong>Tutor #{tutorId}</strong> has been successfully booked.
      </p>
      <p>
        <strong>Date:</strong> {date} <br />
        <strong>Time:</strong> {time}
      </p>
      <p className="mt-3">A confirmation email will be sent shortly.</p>
      <a className="btn btn-primary mt-4" href="/">Return to Homepage</a>
    </div>
  );
};

export default BookingSuccess;