import React from "react";
import ExploreTutorsButton from "./UI/ExploreTutorsButton";
import "./HomePageFeaturesSection.css";

export default function HomePageFeaturesSection() {
  return (
    <div className="container px-4 py-5">
      <h2 className="pb-2 border-bottom">Why Choose Notely?</h2>
      <div className="row row-cols-1 row-cols-md-2 align-items-md-center g-5 py-3">
        {/* Left Column */}
        <div className="col d-flex flex-column gap-2 align-items-center align-items-md-start text-center text-md-start">
          <h2 className="fw-bold text-body-emphasis">
            Music Tuition, Made for the Modern Learner
          </h2>
          <p className="text-body-secondary">
            Whether you’re picking up your first instrument or prepping for
            grade exams, Notely connects you with verified tutors who teach the
            way you learn best — online, in-person, or hybrid.
            <br />
            <br />
            Built for musicians. Trusted by parents. Loved by learners.
          </p>
          <ExploreTutorsButton />
        </div>

        {/* Right Column */}
        <div className="col">
          <div className="row row-cols-1 row-cols-sm-2 g-4">
            {[
              {
                title: "Verified Tutors",
                subtitle: "Trust Built In",
                icon: "Education.svg",
                text: "All tutors are DBS-checked and verified for qualifications and experience.",
              },
              {
                title: "Music-First Design",
                subtitle: "Built for musicians",
                icon: "MusicNote.svg",
                text: "Designed exclusively for music learners — from instruments to grading.",
              },
              {
                title: "SEN-Friendly",
                subtitle: "Learning for everyone",
                icon: "Inclusive.svg",
                text: "Find tutors with expertise in neurodiverse and inclusive teaching.",
              },
              {
                title: "Effortless Booking",
                subtitle: "Plan with ease",
                icon: "Calendar.svg",
                text: "Manage lessons, schedules, and rescheduling in just a few clicks.",
              },
            ].map((feature, index) => (
              <div className="col d-flex flex-column gap-2" key={index}>
                <div className="feature-icon-small d-inline-flex align-items-center justify-content-center text-bg-notely-gold bg-gradient fs-4 rounded-3">
                  <img
                    src={`../assets/images/svg/${feature.icon}`}
                    alt={`${feature.title} Icon`}
                    className="feature-icon"
                  />
                </div>
                <h4 className="fw-semibold mb-0 text-body-emphasis">
                  {feature.title}
                </h4>
                <h6>{feature.subtitle}</h6>
                <p className="text-body-secondary">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
