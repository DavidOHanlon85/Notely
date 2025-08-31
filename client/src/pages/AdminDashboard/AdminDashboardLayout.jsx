import React, { useEffect, useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminDashboardLayout.css";
import {
  FaBars,
  FaHome,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaSignOutAlt,
} from "react-icons/fa";
import NotelyRectangle from "../../assets/images/NotelyRectangle.png";

export default function AdminDashboardLayout() {
  const [isExpanded, setIsExpanded] = useState(true);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsExpanded((prev) => !prev);

  {/* Handle log out */}

  const handleLogout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/logout`, {}, { withCredentials: true });
      navigate("/admin/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  {/* Check Auth */}

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/me`, {
          withCredentials: true,
        });
      } catch (err) {
        console.warn("Admin not authenticated.");
        navigate("/admin/login");
      }
    };

    checkAuth();
  }, []);

  return (
    <div className="admin-wrapper d-flex flex-grow-1">
      <aside className={isExpanded ? "admin-sidebar expand" : "admin-sidebar"}>
        <div className="d-flex">
          <button className="toggle-btn" onClick={toggleSidebar}>
            <FaBars size={24} />
          </button>
          <div className="sidebar-logo">
            <Link to="/admin/dashboard" className="notely-logo-link d-flex align-items-center">
              <span className="notely-brand-text me-2">Notely</span>
              <svg xmlns="http://www.w3.org/2000/svg" height="30" viewBox="0 -960 960 960" width="30" fill="white">
                <path d="M400-240q50 0 85-35t35-85v-280h120v-80H460v256q-14-8-29-12t-31-4q-50 0-85 35t-35 85q0 50 35 85t85 35Zm80 160q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z" />
              </svg>
            </Link>
          </div>
        </div>

        <ul className="sidebar-nav">
          <li className="sidebar-item">
            <Link to="/admin/dashboard" className="sidebar-link">
              <FaHome className="sidebar-icon" size={24}/>
              <span>Overview</span>
            </Link>
          </li>
          <li className="sidebar-item">
            <Link to="tutors" className="sidebar-link">
              <FaChalkboardTeacher className="sidebar-icon" size={24}/>
              <span>Tutors</span>
            </Link>
          </li>
          <li className="sidebar-item">
            <Link to="students" className="sidebar-link">
              <FaUserGraduate className="sidebar-icon" size={24} />
              <span>Students</span>
            </Link>
          </li>
        </ul>

        <div className="sidebar-item mb-2">
          <Link to="#" className="sidebar-link" onClick={(e) => {
            e.preventDefault();
            handleLogout();
          }}>
            <FaSignOutAlt className="sidebar-icon" size={24}/>
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      <main className="admin-main">
        <header className="d-flex flex-wrap align-items-center justify-content-between py-3 mb-3 border-bottom">
          <div className="col-12 col-md-3 mb-2 mb-md-0 text-center text-md-start">
            <img src={NotelyRectangle} alt="Notely Logo" width="175" height="50" />
          </div>
          <div className="col-12 col-md-3 d-flex justify-content-center justify-content-md-end gap-2">
            <Link to="/" className="btn btn-notely-outline">Home</Link>
            <Link to="/tutors" className="btn btn-notely-primary">Tutors</Link>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}