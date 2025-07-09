import React from "react";
import { Link } from "react-router-dom";
import NotelyRectangle from "../assets/images/NotelyRectangle.png";
import "./DoubleButtonNavBar.css";

export default function DoubleButtonNavBar() {
  return (
    <div>
      <div className="container">


        {/* Logo section */}
        <header className="d-flex flex-wrap align-items-center justify-content-between py-4 mb-4 border-bottom">
          <div className="col-12 col-md-3 mb-2 mb-md-0 text-center text-md-start">
            <img
              src={NotelyRectangle}
              alt="Notely Logo"
              width="175"
              height="50"
            ></img>
          </div>

          {/* Buttons and Links Section */}

          <div className="col-12 col-md-3 d-flex justify-content-center justify-content-md-end gap-2">
            <Link to="/login" className="btn btn-notely-outline me-2">
              Login
            </Link>

            <Link to="/register" className="btn btn-notely-primary">
              Register
            </Link>
          </div>
        </header>
      </div>
    </div>
  );
}
