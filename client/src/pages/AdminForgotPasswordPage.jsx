import React, { useState } from "react";
import { Link } from "react-router-dom";
import NotelyRectangle from "../assets/images/NotelyRectangle.png";
import heroImage from "../assets/images/LoginAndRegistration/StudentForgotPassword.jpg";
import axios from "axios";

import "./AdminForgotPasswordPage.css";

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");
  const [serverMessage, setServerMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setServerMessage(null);

    if (!email.trim()) {
      setFormError("Email is required.");
      return;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3002/api/admin/forgot-password",
        { email },
        { withCredentials: true }
      );

      if (response.data.status === "success") {
        setServerMessage({
          type: "success",
          text: response.data.message,
        });
      }
    } catch (error) {
      setServerMessage({
        type: "danger",
        text: error.response?.data?.message ||
          "Something went wrong. Please try again."
      });
    }
  };

  return (
    <div className="admin-login-page container-fluid">
      <div className="row min-vh-100">
        {/* LEFT: Form */}
        <div className="col-md-6 d-flex flex-column justify-content-center align-items-center form-section px-4">
          <img src={NotelyRectangle} alt="Notely Logo" className="notely-logo mb-3" />
          <h1 className="login-header pb-2">Reset Your Password</h1>

          {serverMessage && (
            <div
              className={`alert alert-${serverMessage.type} text-center mb-4`}
              role="alert"
              style={{ maxWidth: "400px" }}
            >
              {serverMessage.text}
            </div>
          )}

          <form className="w-100" style={{ maxWidth: "400px" }} onSubmit={handleSubmit}>
            <div className="mb-3">
              <div className="input-group admin-input-group">
                <span className="input-group-text bg-navy text-white border border-secondary rounded-start">
                  <i className="bi-envelope-at-fill"></i>
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="form-control border border-secondary rounded-end"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {formError && <div className="text-danger small mt-1">{formError}</div>}
            </div>

            <button
              type="submit"
              className="btn btn-notely-navy w-100 d-inline-flex align-items-center justify-content-center gap-2"
            >
              Send Reset Link
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

            <p className="text-center mt-3">
              <Link to="/admin/login" className="text-navy fw-semibold">
                Back to Login
              </Link>
            </p>
          </form>
        </div>

        {/* RIGHT: Image */}
        <div className="col-md-6 d-none d-md-block p-0">
          <img
            src={heroImage}
            alt="Reset Password"
            className="img-fluid h-100 w-100 object-fit-cover"
          />
        </div>
      </div>
    </div>
  );
}