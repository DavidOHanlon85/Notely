import React, { useState } from "react";
import "./TutorRegister.css";

export default function TutorRegisterStep1({ formData, setFormData, onNext }) {
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validate = () => {
    const errors = {};
    const {
      tutor_first_name,
      tutor_second_name,
      tutor_username,
      tutor_email,
      tutor_phone,
      tutor_password,
      confirmPassword,
    } = formData;

    if (!tutor_first_name.trim())
      errors.tutor_first_name = "First name is required.";
    if (!tutor_second_name.trim())
      errors.tutor_second_name = "Last name is required.";
    if (!tutor_username.trim()) errors.tutor_username = "Username is required.";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tutor_email))
      errors.tutor_email = "Valid email is required.";

    if (!/^\+?[0-9\s().-]{7,20}$/.test(tutor_phone)) {
      errors.tutor_phone = "Valid phone number required.";
    } else {
      const digitsOnly = tutor_phone.replace(/\D/g, "");
      if (digitsOnly.length !== 11) {
        errors.tutor_phone = "Phone number must be exactly 11 digits.";
      }
    }

    if ((tutor_password || "").length < 8)
      errors.tutor_password = "Password must be at least 8 characters.";
    if (tutor_password !== confirmPassword)
      errors.confirmPassword = "Passwords do not match.";

    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
    } else {
      setFormErrors({});
      onNext(); // formData already held in parent
    }
  };

  return (
    <form
      className="w-100"
      style={{ maxWidth: "450px" }}
      onSubmit={handleSubmit}
    >
      {[
        {
          name: "tutor_first_name",
          placeholder: "First Name",
          icon: "bi-person-fill",
        },
        {
          name: "tutor_second_name",
          placeholder: "Last Name",
          icon: "bi-person",
        },
        {
          name: "tutor_username",
          placeholder: "Username",
          icon: "bi-person-badge",
        },
        {
          name: "tutor_email",
          placeholder: "Email",
          icon: "bi-envelope-fill",
        },
        {
          name: "tutor_phone",
          placeholder: "Phone Number",
          icon: "bi-telephone-fill",
        },
      ].map(({ name, placeholder, icon }) => (
        <div className="mb-3" key={name}>
          <div className="input-group notely-input-group">
            <span className="input-group-text bg-purple text-white border border-secondary rounded-start">
              <i className={`bi ${icon}`}></i>
            </span>
            <input
              type="text"
              name={name}
              placeholder={placeholder}
              className="form-control border border-secondary rounded-end"
              value={formData[name] || ""}
              onChange={handleChange}
            />
          </div>
          {formErrors[name] && (
            <div className="text-danger small mt-1">{formErrors[name]}</div>
          )}
        </div>
      ))}

      {/* PASSWORD FIELDS */}
      {["tutor_password", "confirmPassword"].map((name, index) => (
        <div className="mb-3" key={name}>
          <div className="input-group notely-input-group">
            <span className="input-group-text bg-purple text-white border border-secondary rounded-start">
              <i className="bi bi-shield-lock-fill"></i>
            </span>
            <input
              type="password"
              name={name}
              placeholder={index === 0 ? "Password" : "Confirm Password"}
              className="form-control border border-secondary rounded-end"
              value={formData[name] || ""}
              onChange={handleChange}
            />
          </div>
          {formErrors[name] && (
            <div className="text-danger small mt-1">{formErrors[name]}</div>
          )}
        </div>
      ))}

      <button
        type="submit"
        className="btn btn-notely-purple w-100 d-inline-flex align-items-center justify-content-center gap-2"
      >
        Continue <i className="bi bi-arrow-right-circle-fill"></i>
      </button>
    </form>
  );
}
