import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NotelyRectangle from "../../assets/images/NotelyRectangle.png";
import heroImage from "../../assets/images/LoginAndRegistration/StudentLogin.jpg";
import axios from 'axios';
import "./StudentLoginPage.css";

export default function StudentLoginPage() {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    rememberMe: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const [formErrors, setFormErrors] = useState({});
  const [serverMessage, setServerMessage] = useState(null);

  // Client Side Validation

  const validate = () => {
    const errors = {};

    // Identifier: must be a valid email or username
    if (!formData.identifier.trim()) {
      errors.identifier = "Email or username is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.identifier) &&
      !/^[a-zA-Z0-9_]+$/.test(formData.identifier)
    ) {
      errors.identifier = "Enter a valid email or username.";
    }

    // Password: must meet complexity requirements
    if (!formData.password) {
      errors.password = "Password is required.";
    } 

    return errors;
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setServerMessage(null);

    // Run client-side validation
    const errors = validate(); 
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors); // show feedback in UI
      return; // stop submission if client-side invalid
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/student/login`,
        {
          identifier: formData.identifier,
          password: formData.password,
          rememberMe: formData.rememberMe,
        },
        {
          withCredentials: true, 
        }
      );

      if (response.data.status === "success") {

        console.log("Login response:", response.data);
        // Store session/token or handle rememberMe - to be added
        if (response.data.status === "success") {

          console.log(response.data.status)
          const studentId = response.data.student_id;
          navigate(`/student/dashboard`);
        }
      }
    } catch (error) {

      if (error.response?.data?.errors) {
        // Field-specific validation errors
        setFormErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        // Specific backend message — like incorrect password or account not found
        setServerMessage({
          type: "error",
          text: error.response.data.message,
        });
      } else {
        // Final fallback
        setServerMessage({
          type: "error",
          text: "Something went wrong. Please try again.",
        });
      }
    }
  };

  return (
    <div className="login-page container-fluid">
      <div className="row min-vh-100">
        {/* LEFT SIDE: Form */}
        <div className="col-md-6 d-flex flex-column justify-content-center align-items-center form-section px-4">
          <img
            src={NotelyRectangle}
            alt="Notely Logo"
            className="notely-logo mb-3"
          />
          <h1 className="login-header pb-1">Student Login</h1>

          {serverMessage && serverMessage.type === "error" && (
            <div
              className="alert alert-danger text-center mb-4"
              role="alert"
              style={{ maxWidth: "400px" }}
            >
              {serverMessage.text}
            </div>
          )}

          <form
            className="w-100"
            style={{ maxWidth: "400px" }}
            onSubmit={handleSubmit}
          >
            <div className="mb-3">
              <div className="input-group notely-input-group">
                <span className="input-group-text bg-warning text-white border border-secondary rounded-start">
                  <i className="bi-person-vcard-fill"></i>
                </span>
                <input
                  type="text"
                  name="identifier"
                  placeholder="Email or Username"
                  className="form-control border border-secondary rounded-end"
                  value={formData.identifier}
                  onChange={handleChange}
                />
              </div>
              {formErrors.identifier && (
                <div className="text-danger small mt-1">
                  {formErrors.identifier}
                </div>
              )}
            </div>

            <div className="mb-3">
              <div className="input-group notely-input-group ">
                <span className="input-group-text bg-warning text-white border border-secondary rounded-start">
                  <i className="bi-shield-lock-fill"></i>
                </span>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="form-control border border-secondary rounded-end"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              {formErrors.password && (
                <div className="text-danger small mt-1">
                  {formErrors.password}
                </div>
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
              <Link to="/student/forgot-password" className="text-warning fw-semibold">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-notely-gold w-100 d-inline-flex align-items-center justify-content-center gap-2"
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
              <Link to="/student/register" className="text-warning fw-semibold">
                Register
              </Link>
            </p>
          </form>
        </div>

        {/* RIGHT SIDE: Hero Image */}
        <div className="col-md-6 d-none d-md-block p-0">
          <img
            src={heroImage}
            alt="Student with guitar"
            className="img-fluid h-100 w-100 object-fit-cover"
          />
        </div>
      </div>
    </div>
  );
}
