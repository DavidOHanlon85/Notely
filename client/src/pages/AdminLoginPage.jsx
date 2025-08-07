import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NotelyRectangle from "../assets/images/NotelyRectangle.png";
import heroImage from "../assets/images/LoginAndRegistration/StudentLogin.jpg";
import axios from "axios";
import "./AdminLoginPage.css";

export default function AdminLoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost:3002/api/admin/login",
        {
          identifier,
          password,
          rememberMe,
        },
        { withCredentials: true }
      );

      if (response.data && response.data.admin_id) {
        navigate(`/admin/dashboard`);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    }
  };

  return (
    <div className="admin-login-page container-fluid">
      <div className="row min-vh-100">
        {/* LEFT SIDE */}
        <div className="col-md-6 d-flex flex-column justify-content-center align-items-center form-section px-4">
          <img src={NotelyRectangle} alt="Notely Logo" className="notely-logo mb-3" />
          <h1 className="login-header pb-2">Admin Login</h1>

          {error && (
            <div className="alert alert-danger text-center" role="alert" style={{ maxWidth: "400px" }}>
              {error}
            </div>
          )}

          <form className="w-100" style={{ maxWidth: "400px" }} onSubmit={handleLogin}>
            {/* Username/Email */}
            <div className="mb-3">
              <div className="input-group admin-input-group">
                <span className="input-group-text bg-navy text-white border border-secondary rounded-start">
                  <i className="bi-person-fill"></i>
                </span>
                <input
                  type="text"
                  placeholder="Username or Email"
                  className="form-control border border-secondary rounded-end"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-3">
              <div className="input-group admin-input-group">
                <span className="input-group-text bg-navy text-white border border-secondary rounded-start">
                  <i className="bi-lock-fill"></i>
                </span>
                <input
                  type="password"
                  placeholder="Password"
                  className="form-control border border-secondary rounded-end"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="form-check">
                <input
                  type="checkbox"
                  id="rememberMe"
                  className="form-check-input"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <label htmlFor="rememberMe" className="form-check-label text-navy">
                  Remember Me
                </label>
              </div>
              <Link to="/admin/forgot-password" className="text-navy fw-semibold">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-notely-navy w-100 d-inline-flex align-items-center justify-content-center gap-2"
            >
              Login
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="currentColor"
              >
                <path d="M400-240q50 0 85-35t35-85v-280h120v-80H460v256q-14-8-29-12t-31-4q-50 0-85 35t-35 85q0 50 35 85t85 35Zm80 160q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z" />
              </svg>
            </button>
          </form>
        </div>

        {/* RIGHT SIDE */}
        <div className="col-md-6 d-none d-md-block p-0">
          <img
            src={heroImage}
            alt="Admin Login"
            className="img-fluid h-100 w-100 object-fit-cover"
          />
        </div>
      </div>
    </div>
  );
}