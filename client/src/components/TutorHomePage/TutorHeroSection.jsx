import React, { useState } from "react";
import { Link } from "react-router-dom";
import NotelyRectangle from "../../assets/images/NotelyRectangle.png";
import "./TutorHeroSection.css";

const buttons = [
  "Stripe Payouts",
  "Built‑in Video",
  "CRM & Messaging",
];

export default function TutorHeroSection() {
  const [active, setActive] = useState([]);

  const toggle = (label) =>
    setActive((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );

  return (
    <section className="tutor-hero container">
      <div className="px-4 py-1 pt-1 my-3 text-center">
        <img
          className="d-block mx-auto mb-4"
          src={NotelyRectangle}
          alt="Notely Logo"
          width="300"
          height="85"
        />

        <h1 className="tutor-hero-heading">
          Teach Music.
        </h1>
        <h1 className="tutor-hero-heading">Get Paid. Stay Booked.</h1>

        {/* Match student hero width + hard cap */}
        <div className="col-lg-6 mx-auto tutor-hero-copy">
          <p className="lead mb-4 tutor-hero-lead">
            Notely helps tutors grow with verified students, automated admin,
            and instant payouts via Stripe. 
          </p>
        </div>

        {/* Feature chips */}
        <div className="tutor-hero-button-row">
          {buttons.map((label) => (
            <button
              key={label}
              className={`btn tutor-btn-outline ${
                active.includes(label) ? "tutor-btn-active" : ""
              }`}
              onClick={() => toggle(label)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>

        {/* CTAs */}
        <div className="tutor-cta-wrapper mt-3 pt-2">
          <Link to="/tutor/register" className="tutor-btn-gold">
            Apply to Teach{" "}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="30px"
              fill="currentColor"
            >
              <path d="M400-240q50 0 85-35t35-85v-280h120v-80H460v256q-14-8-29-12t-31-4q-50 0-85 35t-35 85q0 50 35 85t85 35Zm80 160q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
