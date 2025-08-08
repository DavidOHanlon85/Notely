import React from "react";
import { Link } from "react-router-dom";
import "./TutorFeaturesSection.css";

export default function TutorFeaturesSection() {
  return (
    <div className="container px-4 py-5 tutor-features">
      <h2 className="pb-2 border-bottom">Why Teach on Notely?</h2>

      <div className="row row-cols-1 row-cols-md-2 align-items-md-center g-5 py-3">
        {/* Left Column */}
        <div className="col d-flex flex-column gap-2 align-items-center align-items-md-start text-center text-md-start">
          <h2 className="fw-bold text-body-emphasis">
            Grow your teaching — without the admin.
          </h2>
          <p className="text-body-secondary">
            Notely connects you with verified students and automates the boring bits:
            payouts, reminders, and scheduling. You focus on great lessons — we handle
            everything around them.
          </p>

          <Link to="/tutor/register" className="btn btn-notely-purple">
            Apply to Teach
          </Link>
        </div>

        {/* Right Column */}
        <div className="col">
          <div className="row row-cols-1 row-cols-sm-2 g-4">
            {[
              {
                title: "Instant Stripe Payouts",
                subtitle: "Get paid on time",
                icon: "Wallet.svg",
                text:
                  "Integrated Stripe payouts with a clear ledger — no chasing invoices or waiting around.",
              },
              {
                title: "Smart Scheduling",
                subtitle: "You’re in control",
                icon: "CalendarWhite.svg",
                text:
                  "Custom availability, buffer times, and blackout dates. Students can only book when you’re free.",
              },
              {
                title: "Built‑in Video",
                subtitle: "Turn up, teach",
                icon: "Video.svg",
                text:
                  "Secure video rooms generated per lesson plus automated email reminders for both sides.",
              },
              {
                title: "CRM & Messaging",
                subtitle: "Stay organised",
                icon: "Chat.svg",
                text:
                  "Keep conversations, notes, and booking history in one place — tidy and searchable.",
              },
            ].map((feature, index) => (
              <div className="col d-flex flex-column gap-2 tutor-feature" key={index}>
                <div className="feature-icon-small d-inline-flex align-items-center justify-content-center rounded-3">
                  <img
                    src={`../assets/images/svg/${feature.icon}`}
                    alt={`${feature.title} Icon`}
                    className="feature-icon"
                  />
                </div>
                <h4 className="fw-semibold mb-0 text-body-emphasis">
                  {feature.title}
                </h4>
                <h6 className="text-muted m-0">{feature.subtitle}</h6>
                <p className="text-body-secondary m-0">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}