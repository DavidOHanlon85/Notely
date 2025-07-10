import React from "react";
import NotelyRectangle from "../assets/images/NotelyRectangle.png";

export default function SearchHero() {
  return (
    <div>
      {/* Logo */}
      <section className="search-hero text-center pt-2 pb-2">
        <div className="container">
          <img
            src={NotelyRectangle}
            alt="Notely Logo"
            width="240"
            className="mb-3 pb-2"
          />

          {/* Copy */}
          <h1 className="display-4 fw-bold text-body-emphasis">
            Find Your Music Tutor
          </h1>
          <p className="fs-5 text-muted mt-3">
            Learn at your pace, your style — online or in-person.
          </p>
        </div>
      </section>
    </div>
  );
}
