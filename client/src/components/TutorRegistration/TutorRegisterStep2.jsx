import React, { useState, useEffect, useRef } from "react";
import "./TutorRegister.css";

export default function TutorRegisterStep2({ formData, setFormData, onNext, onBack }) {
  const [formErrors, setFormErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const imageObjectUrl = useRef(null);

  useEffect(() => {
    if (formData.tutor_image) {
      const objectUrl = URL.createObjectURL(formData.tutor_image);
      imageObjectUrl.current = objectUrl;
      setImagePreview(objectUrl);
    }

    return () => {
      if (imageObjectUrl.current) {
        URL.revokeObjectURL(imageObjectUrl.current);
        imageObjectUrl.current = null;
      }
    };
  }, [formData.tutor_image]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "tutor_image") {
      const file = files[0];
      if (file) {
        if (imageObjectUrl.current) {
          URL.revokeObjectURL(imageObjectUrl.current);
        }
        const newUrl = URL.createObjectURL(file);
        imageObjectUrl.current = newUrl;
        setImagePreview(newUrl);
        setFormData((prev) => ({ ...prev, [name]: file }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.tutor_address_line_1?.trim())
      errors.tutor_address_line_1 = "Address Line 1 is required.";
    if (!formData.tutor_city?.trim()) errors.tutor_city = "City is required.";
    if (!formData.tutor_postcode?.trim())
      errors.tutor_postcode = "Postcode is required.";
    if (!formData.tutor_country?.trim())
      errors.tutor_country = "Country is required.";
    if (!formData.tutor_image)
      errors.tutor_image = "Profile image is required.";
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
    } else {
      setFormErrors({});
      onNext();
    }
  };

  return (
    <form
      className="w-100"
      style={{ maxWidth: "450px" }}
      onSubmit={handleSubmit}
      encType="multipart/form-data"
    >
      {/* Address Fields */}
      {[
        {
          name: "tutor_address_line_1",
          placeholder: "Studio Address Line 1",
          icon: "bi-geo-alt-fill",
        },
        {
          name: "tutor_address_line_2",
          placeholder: "Studio Address Line 2 (optional)",
          icon: "bi-geo",
        },
        {
          name: "tutor_city",
          placeholder: "City",
          icon: "bi-buildings",
        },
        {
          name: "tutor_postcode",
          placeholder: "Postcode",
          icon: "bi-mailbox2",
        },
        {
          name: "tutor_country",
          placeholder: "Country",
          icon: "bi-globe2",
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

      {/* Profile Photo */}
      <div className="mb-4">
        <label className="form-label">Upload Profile Photo</label>
        <div className="input-group notely-input-group">
          <span
            className="input-group-text bg-purple text-white border border-secondary rounded-start"
            style={{
              height: "38px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <i className="bi bi-image-fill"></i>
          </span>
          <input
            type="file"
            name="tutor_image"
            className="form-control border border-secondary rounded-end"
            accept="image/*"
            onChange={handleChange}
            style={{ height: "45px", lineHeight: "2", paddingTop: "6px" }}
          />
        </div>
        {formErrors.tutor_image && (
          <div className="text-danger small mt-1">
            {formErrors.tutor_image}
          </div>
        )}
      </div>

      {imagePreview && (
        <div className="text-center mt-3">
          <img src={imagePreview} alt="Preview" className="profile-preview" />
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="d-flex justify-content-between mt-4">
        <button
          type="button"
          className="btn btn-notely-purple d-inline-flex align-items-center"
          onClick={onBack}
        >
          <i className="bi bi-arrow-left-circle-fill me-2"></i> Back
        </button>
        <button
          type="submit"
          className="btn btn-notely-purple d-inline-flex align-items-center gap-2"
        >
          Continue <i className="bi bi-arrow-right-circle-fill"></i>
        </button>
      </div>
    </form>
  );
}