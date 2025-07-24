import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NotelyRectangle from "../assets/images/NotelyRectangle.png";
import heroImage from "../assets/images/LoginAndRegistration/StudentLogin.jpg";
import axios from "axios";
import "./TutorLoginPage.css";

export default function TutorLoginPage() {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    rememberMe: false,
  });

  const [formErrors, setFormErrors] = useState({});
  const [serverMessage, setServerMessage] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const validate = () => {
    const errors = {};

    if (!formData.identifier.trim()) {
      errors.identifier = "Email or username is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.identifier) &&
      !/^[a-zA-Z0-9_]+$/.test(formData.identifier)
    ) {
      errors.identifier = "Enter a valid email or username.";
    }

    if (!formData.password) {
      errors.password = "Password is required.";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setServerMessage(null);

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3002/api/tutor/login",
        {
          identifier: formData.identifier,
          password: formData.password,
          rememberMe: formData.rememberMe,
        },
        { withCredentials: true }
      );

      if (response.data.status === "success") {
        const tutorId = response.data.tutor_id;
        navigate(`/tutor/dashboard/${tutorId}`);
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        setServerMessage({ type: "error", text: error.response.data.message });
      } else {
        setServerMessage({
          type: "error",
          text: "Something went wrong. Please try again.",
        });
      }
    }
  };

  return (
    <div className="login-page tutor-login-page container-fluid">
      <div className="row min-vh-100">
        {/* LEFT: Form */}
        <div className="col-md-6 d-flex flex-column justify-content-center align-items-center form-section px-4">
          <img src={NotelyRectangle} alt="Notely Logo" className="notely-logo mb-3" />
          <h1 className="login-header pb-1">Tutor Login</h1>

          {serverMessage && serverMessage.type === "error" && (
            <div className="alert alert-danger text-center mb-4" style={{ maxWidth: "400px" }}>
              {serverMessage.text}
            </div>
          )}

          <form style={{ maxWidth: "400px" }} className="w-100" onSubmit={handleSubmit}>
            <div className="mb-3">
              <div className="input-group notely-input-group">
                <span className="input-group-text">
                  <i className="bi-person-vcard-fill"></i>
                </span>
                <input
                  type="text"
                  name="identifier"
                  placeholder="Email or Username"
                  className="form-control"
                  value={formData.identifier}
                  onChange={handleChange}
                />
              </div>
              {formErrors.identifier && (
                <div className="text-danger small mt-1">{formErrors.identifier}</div>
              )}
            </div>

            <div className="mb-3">
              <div className="input-group notely-input-group">
                <span className="input-group-text">
                  <i className="bi-shield-lock-fill"></i>
                </span>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              {formErrors.password && (
                <div className="text-danger small mt-1">{formErrors.password}</div>
              )}
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  id="rememberMe"
                />
                <label className="form-check-label" htmlFor="rememberMe">
                  Remember me
                </label>
              </div>
              <Link to="/tutor/forgot-password" className="fw-semibold">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-notely-purple w-100 d-inline-flex align-items-center justify-content-center gap-2"
            >
              Log In
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
              Don’t have an account?
              <br />
              <Link to="/tutor/register" className="fw-semibold">
                Register
              </Link>
            </p>
          </form>
        </div>

        {/* RIGHT: Hero Image */}
        <div className="col-md-6 d-none d-md-block p-0">
          <img
            src={heroImage}
            alt="Tutor with instrument"
            className="img-fluid h-100 w-100 object-fit-cover"
          />
        </div>
      </div>
    </div>
  );
}