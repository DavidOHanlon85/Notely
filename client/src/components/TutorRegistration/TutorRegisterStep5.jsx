import React, { useState, useEffect } from "react";
import "./TutorRegister.css";

export default function TutorRegisterStep5({ formData, setFormData, onNext, onBack }) {
  const [tagline, setTagline] = useState(formData.tutor_tagline || "");
  const [bio1, setBio1] = useState(formData.tutor_bio_paragraph_1 || "");
  const [bio2, setBio2] = useState(formData.tutor_bio_paragraph_2 || "");
  const [formErrors, setFormErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = {};

    if (!tagline.trim()) {
      errors.tutor_tagline = "Tagline is required.";
    } else if (tagline.trim().length > 45) {
      errors.tutor_tagline = "Tagline must be 45 characters or less.";
    }

    if (!bio1.trim()) {
      errors.tutor_bio_paragraph_1 = "First paragraph is required.";
    } else if (bio1.trim().length > 500) {
      errors.tutor_bio_paragraph_1 = "First paragraph must be 500 characters or less.";
    }

    if (bio2.trim().length > 500) {
      errors.tutor_bio_paragraph_2 = "Second paragraph must be 500 characters or less.";
    }

    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      setFormData((prev) => ({
        ...prev,
        tutor_tagline: tagline.trim(),
        tutor_bio_paragraph_1: bio1.trim(),
        tutor_bio_paragraph_2: bio2.trim(),
      }));
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-100" style={{ maxWidth: "550px" }}>
      <h4 className="mb-3">About You</h4>

      {/* Tagline */}
      <div className="mb-4">
        <label className="form-label fw-bold">Tagline (max 45 characters)</label>
        <div className="input-group notely-input-group">
          <span className="input-group-text bg-purple text-white">
            <i className="bi bi-quote"></i>
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="E.g. Inspiring piano lessons for all ages"
            maxLength="45"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
          />
        </div>
        {formErrors.tutor_tagline && (
          <div className="text-danger mt-1">{formErrors.tutor_tagline}</div>
        )}
      </div>

      {/* Bio Paragraph 1 */}
      <div className="mb-4">
        <label className="form-label fw-bold">Bio – Paragraph 1 (max 500 characters)</label>
        <textarea
          className="form-control"
          rows="4"
          maxLength="500"
          placeholder="Tell students about your teaching style, experience, or philosophy..."
          value={bio1}
          onChange={(e) => setBio1(e.target.value)}
          style={{ minHeight: "120px" }}
        ></textarea>
        <small className="text-muted">{bio1.length}/500</small>
        {formErrors.tutor_bio_paragraph_1 && (
          <div className="text-danger mt-1">{formErrors.tutor_bio_paragraph_1}</div>
        )}
      </div>

      {/* Bio Paragraph 2 */}
      <div className="mb-4">
        <label className="form-label fw-bold">Bio – Paragraph 2 (optional, max 500 characters)</label>
        <textarea
          className="form-control"
          rows="4"
          maxLength="500"
          placeholder="Add more detail: musical journey, notable students, or personal touch..."
          value={bio2}
          onChange={(e) => setBio2(e.target.value)}
          style={{ minHeight: "120px" }}
        ></textarea>
        <small className="text-muted">{bio2.length}/500</small>
        {formErrors.tutor_bio_paragraph_2 && (
          <div className="text-danger mt-1">{formErrors.tutor_bio_paragraph_2}</div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="d-flex justify-content-between">
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