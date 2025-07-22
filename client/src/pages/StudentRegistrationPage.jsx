import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NotelyRectangle from "../assets/images/NotelyRectangle.png";
import heroImage from "../assets/images/student-guitar.jpg";
import axios from "axios";
import "./StudentRegistrationPage.css";

export default function StudentRegistrationPage() {
  const [formData, setFormData] = useState({
    student_first_name: "",
    student_last_name: "",
    student_username: "",
    student_email: "",
    student_phone: "",
    student_password: "",
    confirmPassword: "",
  });

  const [formErrors, setFormErrors] = useState({});

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const validate = () => {
    const errors = {};

    if (!formData.student_first_name.trim()) {
      errors.student_first_name = "First name is required.";
    } else if (formData.student_first_name.length > 35) {
      errors.student_first_name = "First name cannot exceed 35 characters.";
    }

    if (!formData.student_last_name.trim()) {
      errors.student_last_name = "Last name is required.";
    } else if (formData.student_last_name.length > 35) {
      errors.student_last_name = "Last name cannot exceed 35 characters.";
    }

    if (!formData.student_username.trim()) {
      errors.student_username = "Username is required.";
    } else if (formData.student_username.length > 30) {
      errors.student_username = "Username cannot exceed 30 characters.";
    }

    if (!formData.student_email.trim()) {
      errors.student_email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.student_email)) {
      errors.student_email = "Invalid email format.";
    }

    if (!formData.student_phone.trim()) {
      errors.student_phone = "Phone number is required.";
    } else if (!/^\d{11}$/.test(formData.student_phone)) {
      errors.student_phone = "Phone number must be exactly 11 digits.";
    }

    if (!formData.student_password) {
      errors.student_password = "Password is required.";
    } else if (
      formData.student_password.length < 8 ||
      !/[A-Z]/.test(formData.student_password) ||
      !/[a-z]/.test(formData.student_password) ||
      !/[0-9]/.test(formData.student_password) ||
      !/[!@#$%^&*]/.test(formData.student_password)
    ) {
      errors.student_password =
        "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.";
    }

    if (formData.student_password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    return errors;
  };

  const [serverMessage, setServerMessage] = useState(null);
  const [showToast, setShowToast] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    setFormErrors(errors);
    setServerMessage(null); // Reset server messages

    if (Object.keys(errors).length === 0) {
      try {
        const response = await axios.post(
          "http://localhost:3002/api/student/register",
          formData
        );

        if (response.data.status === "success") {
          setShowToast(true);
          setTimeout(() => {
            navigate("/login");
          }, 2500); // 2.5 second delay
        }
      } catch (error) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.errors
        ) {
          // Field-specific validation errors
          setFormErrors(error.response.data.errors);
        } else if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          // General backend message (e.g., rate limiting)
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
    }
  };

  const fields = [
    {
      name: "student_first_name",
      placeholder: "First Name",
      icon: "bi-person-circle",
    },
    {
      name: "student_last_name",
      placeholder: "Last Name",
      icon: "bi-person-circle",
    },
    {
      name: "student_username",
      placeholder: "Username",
      icon: "bi-person-vcard-fill",
    },
    {
      name: "student_email",
      placeholder: "Email",
      icon: "bi-envelope-at-fill",
      type: "email",
    },
    { name: "student_phone", placeholder: "Phone", icon: "bi-telephone-fill" },
    {
      name: "student_password",
      placeholder: "Password",
      icon: "bi-shield-lock-fill",
      type: "password",
    },
    {
      name: "confirmPassword",
      placeholder: "Confirm Password",
      icon: "bi-shield-lock-fill",
      type: "password",
    },
  ];

  return (
    <div className="register-page container-fluid">
      <div className="row min-vh-100">
        {/* LEFT SIDE: Form */}
        <div className="col-md-6 d-flex flex-column justify-content-center align-items-center form-section px-4">
          <img
            src={NotelyRectangle}
            alt="Notely Logo"
            className="notely-logo mb-3"
          />
          <h1 className="register-header">Student Registration</h1>

          {/* Validation issues on server side */}
          {serverMessage && serverMessage.type === "error" && (
            <div
              className="alert alert-danger text-center w-100"
              role="alert"
              style={{ maxWidth: "400px" }}
            >
              {serverMessage.text}
            </div>
          )}

          {/* Toast Component */}

          {showToast && (
            <div
              className="toast-container position-fixed top-0 end-0 p-3"
              style={{ zIndex: 1055 }}
            >
              <div
                className="toast toast-notely show d-flex align-items-center"
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
              >
                <div className="toast-body text-dark fw-semibold d-flex align-items-center gap-2">
                  🎵 Registration successful! Redirecting to login... 
                </div>
                <button
                  type="button"
                  className="btn-close me-2 m-auto"
                  aria-label="Close"
                  onClick={() => setShowToast(false)}
                ></button>
              </div>
            </div>
          )}


          <form
            className="w-100"
            style={{ maxWidth: "400px" }}
            onSubmit={handleSubmit}
            noValidate
          >
            {fields.map(({ name, placeholder, icon, type = "text" }) => (
              <div className="mb-3" key={name}>
                <label className="form-label visually-hidden" htmlFor={name}>
                  {placeholder}
                </label>
                <div className="input-group notely-input-group">
                  <span className="input-group-text bg-warning text-white border border-secondary rounded-start">
                    <i className={`bi ${icon}`}></i>
                  </span>
                  <input
                    type={type}
                    name={name}
                    id={name}
                    value={formData[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    maxLength={
                      name === "student_first_name" ||
                      name === "student_last_name"
                        ? 35
                        : name === "student_username"
                        ? 30
                        : name === "student_phone"
                        ? 11
                        : undefined
                    }
                    className={`form-control border border-secondary rounded-end ${
                      formErrors[name] ? "is-invalid" : ""
                    }`}
                  />
                  {formErrors[name] && (
                    <div className="invalid-feedback text-start">
                      {formErrors[name]}
                    </div>
                  )}
                </div>
              </div>
            ))}

            <button
              type="submit"
              className="btn btn-notely-gold w-100 d-inline-flex align-items-center justify-content-center gap-2 mt-2"
            >
              Register
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
              Already have an account?
              <br />
              <Link to="/login">Login</Link>
            </p>
          </form>
        </div>

        {/* RIGHT SIDE: Image */}
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
