import React from "react";
import { Link } from "react-router-dom";
import NotelyRectangle from "../../assets/images/NotelyRectangle.png";
import "./SocialsFooter.css";

export default function Footer() {
  return (
    <footer className="d-flex flex-wrap justify-content-between align-items-center py-4 my-34 border-top container mt-0">
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
  );
}
