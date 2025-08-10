import React from "react";
import "./HomePageJourneySection.css";

export default function HomePageJourneySection() {
  return (
    <>
      <div className="container">
        <h2 className="text-center mb-2">Your Journey</h2>
        <hr className="mx-auto mt-4" style={{ width: "80px", opacity: 0.25 }} />

        <div className="row row-cols-1 row-cols-md-3 text-center py-3 notely-journey">
          <div className="col">
            <img
              src="/assets/images/JourneyImages/Pick.jpg"
              alt="Choose a tutor"
              className="step-img mb-3"
            />
            <h5 className="fw-semibold">Pick</h5>
            <p>
              Browse tutors by instrument, level, and SEN experience to find
              your perfect match.
            </p>
          </div>
          <div className="col">
            <img
              src="/assets/images/JourneyImages/Practice.jpg"
              alt="Book and learn"
              className="step-img mb-3"
            />
            <h5 className="fw-semibold">Practice</h5>
            <p>
              Book flexible sessions, message your tutor, and build consistent
              learning habits.
            </p>
          </div>
          <div className="col">
            <img
              src="/assets/images/JourneyImages/Perform.jpg"
              alt="Perform your music"
              className="step-img mb-3"
            />
            <h5 className="fw-semibold">Perform</h5>
            <p>
              Whether you're preparing for grades or playing for joy — you're
              ready to shine.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
