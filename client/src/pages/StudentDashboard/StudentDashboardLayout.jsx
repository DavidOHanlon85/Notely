// src/pages/StudentDashboardLayout.jsx
import React, { useState, useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./StudentDashboardLayout.css";
import {
  FaBars,
  FaHome,
  FaBook,
  FaStar,
  FaUser,
  FaCommentDots,
  FaSignOutAlt,
} from "react-icons/fa";
import Header from "../../components/DoubleButtonNavBar";
import NotelyRectangle from "../../assets/images/NotelyRectangle.png";

export default function StudentDashboardLayout() {
  const [isExpanded, setIsExpanded] = useState(true);

  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const handleLogout = async () => {
    try {
      console.log("Submitted")
      await axios.post(
        "http://localhost:3002/api/student/logout",
        {},
        { withCredentials: true }
      );
      navigate("/student/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };
  
  // Protect Dashboard Path - Routes to student/login

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get("http://localhost:3002/api/student/me", {
          withCredentials: true,
        });
      } catch (err) {
        console.warn("Not authenticated, redirecting to login...");
        navigate("/student/login");
      }
    };
  
    checkAuth();
  }, []);

  return (
    <div className="wrapper d-flex flex-grow-1">
      <aside
        id="sidebar"
        className={isExpanded ? "expand student-sidebar" : "student-sidebar"}
      >
        <div className="d-flex">
          <button className="toggle-btn" onClick={toggleSidebar}>
            <FaBars color="black" size={24} />
          </button>
          <div className="sidebar-logo px-0">
            <Link
              to="/student/dashboard"
              className="notely-logo-link d-flex align-items-center"
            >
              <span className="notely-brand-text">Notely</span>
              <svg
                className="ms-2"
                xmlns="http://www.w3.org/2000/svg"
                height="30px"
                viewBox="0 -960 960 960"
                width="30px"
                fill="currentColor"
              >
                <path d="M400-240q50 0 85-35t35-85v-280h120v-80H460v256q-14-8-29-12t-31-4q-50 0-85 35t-35 85q0 50 35 85t85 35Zm80 160q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z" />
              </svg>
            </Link>
          </div>
        </div>

        <ul className="sidebar-nav">
          <li className="sidebar-item">
            <Link to="/student/dashboard" className="sidebar-link">
              <FaHome className="sidebar-icon" size={24} />
              <span>Dashboard</span>
            </Link>
          </li>
          <li className="sidebar-item">
            <Link to="bookings" className="sidebar-link">
              <FaBook className="sidebar-icon" size={24} />
              <span>Bookings</span>
            </Link>
          </li>
          <li className="sidebar-item">
            <Link to="feedback" className="sidebar-link">
              <FaStar className="sidebar-icon" size={24} />
              <span>Feedback</span>
            </Link>
          </li>
          <li className="sidebar-item">
            <Link to="messages" className="sidebar-link">
              <FaCommentDots className="sidebar-icon" size={24} />
              <span>Messages</span>
            </Link>
          </li>
          <li className="sidebar-item">
            <Link to="profile" className="sidebar-link">
              <FaUser className="sidebar-icon" size={24} />
              <span>Profile</span>
            </Link>
          </li>
        </ul>

        <div className="sidebar-item mb-2">
          <Link
            to="#"
            className="sidebar-link"
            onClick={(e) => {
              e.preventDefault(); // Prevent default navigation
              handleLogout();
            }}
          >
            <FaSignOutAlt className="sidebar-icon" size={24} />
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      <main className="main">
        {/* Header */}
        <header className="d-flex flex-wrap align-items-center justify-content-between py-3 mb-3 border-bottom">
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
            <Link to="/" className="btn btn-notely-outline me-2">
              Home
            </Link>

            <Link to="/tutors" className="btn btn-notely-primary">
              Tutors
            </Link>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
