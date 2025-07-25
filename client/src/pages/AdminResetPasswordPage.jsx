import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NotelyRectangle from "../assets/images/NotelyRectangle.png";
import heroImage from "../assets/images/LoginAndRegistration/StudentResetPassword.jpg"; // Replace with admin-specific image if available
import axios from "axios";

import "./AdminResetPasswordPage.css";

export default function AdminResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [serverMessage, setServerMessage] = useState(null);

  const validate = () => {
    const errors = {};
    const { password, confirmPassword } = formData;

    if (!password) {
      errors.password = "Password is required.";
    } else if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[!@#$%^&*]/.test(password)
    ) {
      errors.password =
        "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
        `http://localhost:3002/api/admin/reset-password/${token}`,
        {
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }
      );

      if (response.data.status === "success") {
        setServerMessage({ type: "success", text: response.data.message });
        setTimeout(() => navigate("/admin/login"), 1000);
      }
    } catch (error) {
      setServerMessage({
        type: "danger",
        text:
          error.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <div className="login-page admin-reset-page container-fluid">
      <div className="row min-vh-100">
        {/* LEFT SIDE */}
        <div className="col-md-6 d-flex flex-column justify-content-center align-items-center form-section px-4">
          <img
            src={NotelyRectangle}
            alt="Notely Logo"
            className="notely-logo mb-3"
          />
          <h1 className="login-header pb-2">Set New Password</h1>

          {serverMessage && (
            <div
              className={`alert alert-${serverMessage.type} text-center mb-4`}
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
            {/* New Password */}
            <div className="mb-3">
              <div className="input-group admin-input-group">
                <span className="input-group-text bg-navy text-white border border-secondary rounded-start">
                  <i className="bi-shield-lock-fill"></i>
                </span>
                <input
                  type="password"
                  name="password"
                  placeholder="New Password"
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

            {/* Confirm Password */}
            <div className="mb-3">
              <div className="input-group admin-input-group">
                <span className="input-group-text bg-navy text-white border border-secondary rounded-start">
                  <i className="bi-shield-lock-fill"></i>
                </span>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  className="form-control border border-secondary rounded-end"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
              {formErrors.confirmPassword && (
                <div className="text-danger small mt-1">
                  {formErrors.confirmPassword}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-notely-navy w-100 d-inline-flex align-items-center justify-content-center gap-2"
            >
              Reset Password
              <i className="bi bi-check-circle-fill"></i>
            </button>
          </form>
        </div>

        {/* RIGHT SIDE */}
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
