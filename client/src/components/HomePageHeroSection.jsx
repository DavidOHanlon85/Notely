import React, { useState } from "react";
import NotelyRectangle from "../assets/images/NotelyRectangle.png";
import ExploreTutorsButton from "./UI/ExploreTutorsButton";
import "./HomePageHeroSection.css";

const buttons = ["Lessons", "Practice", "Grading", "Certification", "Mastery"];

const instruments = [
  { name: "Guitar", icon: "../assets/images/svg/Guitar.svg" },
  { name: "Piano", icon: "../assets/images/svg/Piano.svg" },
  { name: "Violin", icon: "../assets/images/svg/Violin.svg" },
  { name: "Drums", icon: "../assets/images/svg/Drums.svg" },
  { name: "Saxophone", icon: "../assets/images/svg/Saxophone.svg" },
  { name: "Voice", icon: "../assets/images/svg/Voice.svg" },
];

export default function HomePageHeroSection() {
  const [activeBtn, setActiveBtns] = useState([]);

  const handleButtonClick = (btn) => {
    setActiveBtns((prev) =>
      prev.includes(btn) ? prev.filter((b) => b !== btn) : [...prev, btn]
    );
  };

  return (
    <div className="container">
      <div className="px-4 py-1 pt-1 my-3 text-center">
        <img
          className="d-block mx-auto mb-4"
          src={NotelyRectangle}
          alt="Notely Logo"
          width="300"
          height="85"
        />

        <h1 className="display-5 text-body-emphasis">
          Matching Talent with Teachers -
        </h1>
        <h1 className="display-5 text-body-emphasis">One Note at a Time.</h1>

        <div className="col-lg-6 mx-auto">
          <p className="lead mb-4">
            In a world where anyone can stream a symphony, Notely helps you
            learn to play one. We bridge the gap between talent and opportunity
            — giving learners of all ages access to expert music tuition,
            anywhere, anytime.
          </p>
        </div>

        {/* Button row */}
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

        {/* Explore Button */}
        <div className="d-grid gap-2 mt-4 d-sm-flex justify-content-sm-center pt-2">
          <ExploreTutorsButton />
        </div>

        <div className="pt-4">
          <p>Only 1 in 4 tutors meet Notely's standards!</p>
        </div>

        {/* Instrument Section */}
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
  );
}
