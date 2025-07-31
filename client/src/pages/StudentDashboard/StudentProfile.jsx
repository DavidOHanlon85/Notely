import React, { useEffect, useState } from "react";
import NotelyRectangle from "../../assets/images/NotelyRectangle.png";
import "./StudentProfile.css";

export default function StudentProfilePage() {
  const [formData, setFormData] = useState({
    student_first_name: "",
    student_last_name: "",
    student_username: "",
    student_email: "",
    student_phone: ""
  });

  const [formErrors, setFormErrors] = useState({});
  const [serverMessage, setServerMessage] = useState(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // Simulated fetch to prepopulate (replace with actual GET request later)
    const fetchData = async () => {
      const response = {
        student_first_name: "David",
        student_last_name: "O'Hanlon",
        student_username: "daveydev",
        student_email: "david@example.com",
        student_phone: "07123456789"
      };
      setFormData(response);
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Replace with PATCH later
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const fields = [
    {
      name: "student_first_name",
      placeholder: "First Name",
      icon: "bi-person-circle"
    },
    {
      name: "student_last_name",
      placeholder: "Last Name",
      icon: "bi-person-circle"
    },
    {
      name: "student_username",
      placeholder: "Username",
      icon: "bi-person-vcard-fill"
    },
    {
      name: "student_email",
      placeholder: "Email",
      icon: "bi-envelope-at-fill",
      type: "email"
    },
    {
      name: "student_phone",
      placeholder: "Phone",
      icon: "bi-telephone-fill"
    }
  ];

  return (
    <div className="register-page container d-flex flex-column align-items-center justify-content-center py-5">
      <img
        src={NotelyRectangle}
        alt="Notely Logo"
        className="notely-logo mb-3"
      />
      <h1 className="register-header">Update Your Profile</h1>

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
              ✅ Profile updated successfully!
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
          Update Profile
        </button>
      </form>
    </div>
  );
}