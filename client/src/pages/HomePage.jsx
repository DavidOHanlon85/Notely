import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";
import NotelyRectangle from "../assets/images/NotelyRectangle.png";
import TestimonialCarousel from "../components/TestimonialCarousel";
import DoubleButtonNavBar from "../components/DoubleButtonNavBar";
import ExploreTutorsButton from "../components/UI/ExploreTutorsButton";

export default function HomePage() {
  const [activeBtn, setActiveBtns] = useState([]);

  const buttons = [
    "Lessons",
    "Practice",
    "Grading",
    "Certification",
    "Mastery",
  ];

  const instruments = [
    { name: "Guitar", icon: "../assets/images/svg/Guitar.svg" },
    { name: "Piano", icon: "../assets/images/svg/Piano.svg" },
    { name: "Violin", icon: "../assets/images/svg/Violin.svg" },
    { name: "Drums", icon: "../assets/images/svg/Drums.svg" },
    { name: "Saxophone", icon: "../assets/images/svg/Saxophone.svg" },
    { name: "Voice", icon: "../assets/images/svg/Voice.svg" },
  ];

  const handleButtonClick = (btn) => {
    setActiveBtns(
      (prev) =>
        prev.includes(btn)
          ? prev.filter((b) => b !== btn) // remove it
          : [...prev, btn] // add it
    );
  };

  return (
    <div>
      {/* Home Page Navigation Bar */}
        <DoubleButtonNavBar />


      {/* Home Page Hero*/}

      <div className="container">
        <div className="px-4 py-1 pt-1 my-3 text-center">
          <img
            className="d-block mx-auto mb-4"
            src={NotelyRectangle}
            alt="Notely Logo"
            width="300"
            height="85"
          ></img>

          {/* Header and Copy Text */}

          <h1 className="display-5 text-body-emphasis">
            Matching Talent with Teachers -{" "}
          </h1>
          <h1 className="display-5 text-body-emphasis">One Note at a Time.</h1>

          <div className="col-lg-6 mx-auto">
            <p className="lead mb-4">
              In a world where anyone can stream a symphony, Notely helps you
              learn to play one. We bridge the gap between talent and
              opportunity — giving learners of all ages access to expert music
              tuition, anywhere, anytime.
            </p>
          </div>

          {/* Hero Button Row */}

          <div className="hero-button-row">
            {buttons.map((btn, index) => (
              <button
                key={index}
                className={`btn btn-notely-outline ${
                  activeBtn.includes(btn) ? "btn-notely-active" : ""
                }`}
                onClick={() => handleButtonClick(btn)}
              >
                {btn}
              </button>
            ))}
          </div>

          {/* Our Tutors Button */}
          <div className="d-grid gap-2 mt-4 d-sm-flex justify-content-sm-center pt-2">
            <ExploreTutorsButton />
          </div>

          <div className="pt-4">
            <p>Only 1 in 4 tutors meet Notely's standards!</p>
          </div>

          {/* Clickable Instrument Bar */}

          <div className="instrument-section py-2">
            <div className="container">
              <div className="d-flex flex-wrap justify-content-center gap-4">
                {instruments.map((inst, index) => (
                  <div key={index} className="instrument-tile text-center">
                    <div className="instrument-icon-wrapper mb-2">
                      <img
                        src={inst.icon}
                        alt={inst.name}
                        className="instrument-icon"
                      />
                    </div>
                    <div className="instrument-label">{inst.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Bar */}

      <div className="container px-4 py-5">
        <h2 className="pb-2 border-bottom">Why Choose Notely?</h2>
        <div className="row row-cols-1 row-cols-md-2 align-items-md-center g-5 py-3">
          {/* Left column */}
          <div className="col d-flex flex-column gap-2 align-items-center align-items-md-start text-center text-md-start">
            <h2 className="fw-bold text-body-emphasis">
              Music Tuition, Made for the Modern Learner
            </h2>
            <p className="text-body-secondary">
              Whether you’re picking up your first instrument or prepping for
              grade exams, Notely connects you with verified tutors who teach
              the way you learn best — online, in-person, or hybrid.
              <br />
              <br />
              Built for musicians. Trusted by parents. Loved by learners.
            </p>
            <ExploreTutorsButton />
          </div>

          {/* Right column */}
          <div className="col">
            <div className="row row-cols-1 row-cols-sm-2 g-4">
              <div className="col d-flex flex-column gap-2">
                <div className="feature-icon-small d-inline-flex align-items-center justify-content-center text-bg-notely-gold bg-gradient fs-4 rounded-3">
                  <img
                    src={"../assets/images/svg/Education.svg"}
                    alt="Education Icon"
                    className="feature-icon"
                  />
                </div>
                <h4 className="fw-semibold mb-0 text-body-emphasis">
                  Verified Tutors
                </h4>
                <h6>Trust Built In</h6>
                <p className="text-body-secondary">
                  All tutors are DBS-checked and verifed for qualifications and
                  experience.
                </p>
              </div>

              <div className="col d-flex flex-column gap-2">
                <div className="feature-icon-small d-inline-flex align-items-center justify-content-center text-bg-notely-gold bg-gradient fs-4 rounded-3">
                  <img
                    src={"../assets/images/svg/MusicNote.svg"}
                    alt="Education Icon"
                    className="feature-icon"
                  />
                </div>
                <h4 className="fw-semibold mb-0 text-body-emphasis">
                  Music-First Design
                </h4>
                <h6>Built for musicians</h6>
                <p className="text-body-secondary">
                  Designed exclusively for music learners — from instruments to
                  grading.
                </p>
              </div>

              <div className="col d-flex flex-column gap-2">
                <div className="feature-icon-small d-inline-flex align-items-center justify-content-center text-bg-notely-gold bg-gradient fs-4 rounded-3">
                  <img
                    src={"../assets/images/svg/Inclusive.svg"}
                    alt="Inclusion Icon"
                    className="feature-icon"
                  />
                </div>
                <h4 className="fw-semibold mb-0 text-body-emphasis">
                  SEN-Friendly{" "}
                </h4>
                <h6>Learning for everyone</h6>
                <p className="text-body-secondary">
                  Find tutors with expertise in neurodiverse and inclusive
                  teaching.
                </p>
              </div>

              <div className="col d-flex flex-column gap-2">
                <div className="feature-icon-small d-inline-flex align-items-center justify-content-center text-bg-notely-gold bg-gradient fs-4 rounded-3">
                  <img
                    src={"../assets/images/svg/Calendar.svg"}
                    alt="Calendar Icon"
                    className="feature-icon"
                  />
                </div>
                <h4 className="fw-semibold mb-0 text-body-emphasis">
                  Effortless Booking
                </h4>
                <h6>Plan with ease</h6>
                <p className="text-body-secondary">
                  Manage lessons, schedules, and rescheduling in just a few
                  clicks.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Your Journey Section */}

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

        {/* Testimonial Carousel */}

        <TestimonialCarousel />

        {/* Footer */}

        <footer className="d-flex flex-wrap justify-content-between align-items-center py-3 my-34 border-top container">
          {/* Logo section */}
          <div className="col-md-4 d-flex align-items-center">
            <Link
              to="/"
              className="mb-3 me-2 mb-md-0 text-body-secondary text-decoration-none lh-1"
            >
              <img
                src={NotelyRectangle}
                alt="Notely Logo"
                width="175"
                height="50"
              />
            </Link>
          </div>

          {/* Social icons */}
          <ul className="nav col-md-4 justify-content-end list-unstyled d-flex">
            <li className="ms-3">
              <a
                href="https://www.twitter.com"
                className="text-body-secondary"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i
                  className="bi notely-purple bi-twitter"
                  style={{ fontSize: "2.2rem" }}
                ></i>
              </a>
            </li>
            <li className="ms-3">
              <a
                href="https://www.instagram.com"
                className="text-body-secondary"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i
                  className="bi notely-purple bi-instagram"
                  style={{ fontSize: "2.2rem" }}
                ></i>
              </a>
            </li>
            <li className="ms-3">
              <a
                href="https://www.facebook.com"
                className="text-body-secondary"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i
                  className="bi notely-purple bi-facebook"
                  style={{ fontSize: "2.2rem" }}
                ></i>
              </a>
            </li>
          </ul>
        </footer>

      </div>
    </div>
  );
}
