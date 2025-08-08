import React from "react";
import "./TutorJourneySection.css";

export default function TutorJourneySection() {
  return (
    <div className="container tutor-journey">
      <h2 className="text-center mb-2">Your Journey</h2>
      <hr className="mx-auto mt-4" style={{ width: "80px", opacity: 0.25 }} />

      <div className="row row-cols-1 row-cols-md-3 text-center py-4">
        <div className="col">
          <img
            src="/assets/images/JourneyImages/Apply.jpg"
            alt="Apply to teach"
            className="step-img mb-3"
          />
          <h5 className="fw-semibold">Apply</h5>
          <p>
            Submit your application with proof of qualifications, ID, and DBS.
            Only 1 in 4 tutors are accepted.
          </p>
        </div>
        <div className="col">
          <img
            src="/assets/images/JourneyImages/Approve.jpg"
            alt="Approval process"
            className="step-img mb-3"
          />
          <h5 className="fw-semibold">Approve</h5>
          <p>
            Our team verifies your credentials and experience, ensuring you
            meet Notely’s high standards.
          </p>
        </div>
        <div className="col">
          <img
            src="/assets/images/JourneyImages/Advertise.jpg"
            alt="Advertise your services"
            className="step-img mb-3"
          />
          <h5 className="fw-semibold">Advertise</h5>
          <p>
            Your profile goes live. Start getting bookings from verified
            students right away.
          </p>
        </div>
      </div>
    </div>
  );
}