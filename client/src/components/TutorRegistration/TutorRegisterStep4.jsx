import React, { useState, useEffect } from "react";
import "./TutorRegister.css";

export default function TutorRegisterStep4({ formData, setFormData, onNext, onBack }) {
  const [newQualification, setNewQualification] = useState("");
  const [newQualificationYear, setNewQualificationYear] = useState("");
  const [newInstitution, setNewInstitution] = useState("");

  const [newCertification, setNewCertification] = useState("");
  const [newCertificationYear, setNewCertificationYear] = useState("");

  const [formErrors, setFormErrors] = useState({});

  const education = formData.education || [];
  const certifications = formData.certifications || [];

  const updateFormField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddEducation = () => {
    if (newQualification && newQualificationYear && newInstitution) {
      updateFormField("education", [
        ...education,
        {
          qualification: newQualification,
          year: newQualificationYear,
          institution: newInstitution,
        },
      ]);
      setNewQualification("");
      setNewQualificationYear("");
      setNewInstitution("");
    }
  };

  const handleAddCertification = () => {
    if (newCertification && newCertificationYear) {
      updateFormField("certifications", [
        ...certifications,
        { certification: newCertification, year: newCertificationYear },
      ]);
      setNewCertification("");
      setNewCertificationYear("");
    }
  };

  const removeEducation = (index) => {
    updateFormField("education", education.filter((_, i) => i !== index));
  };

  const removeCertification = (index) => {
    updateFormField("certifications", certifications.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const errors = {};

    // Education validation
    if (!education.length) {
      errors.education = "At least one education entry is required.";
    } else {
      education.forEach((edu, i) => {
        if (!edu.qualification)
          errors[`education_${i}_qualification`] = "Qualification required.";
        if (!edu.institution)
          errors[`education_${i}_institution`] = "Institution required.";
        if (!edu.year || edu.year < 1950 || edu.year > new Date().getFullYear()) {
          errors[`education_${i}_year`] = "Valid year required.";
        }
      });
    }

    // Certification validation
    certifications.forEach((cert, i) => {
      if (!cert.certification)
        errors[`certification_${i}_name`] = "Certification name required.";
      if (!cert.year || cert.year < 1950 || cert.year > new Date().getFullYear()) {
        errors[`certification_${i}_year`] = "Valid year required.";
      }
    });

    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-100" style={{ maxWidth: "550px" }}>
      <h4 className="mb-3">Education</h4>

      {formErrors.education && (
        <div className="text-danger mb-2">{formErrors.education}</div>
      )}

      {/* Education Inputs */}
      <div className="row mb-2 align-items-center">
        <div className="col-8">
          <div className="input-group notely-input-group">
            <span className="input-group-text bg-purple text-white">
              <i className="bi bi-mortarboard-fill"></i>
            </span>
            <input
              type="text"
              placeholder="Qualification (e.g. BA Music)"
              className="form-control"
              value={newQualification}
              onChange={(e) => setNewQualification(e.target.value)}
            />
          </div>
        </div>
        <div className="col-4">
          <div className="input-group notely-input-group">
            <span className="input-group-text bg-purple text-white">
              <i className="bi bi-calendar"></i>
            </span>
            <input
              type="number"
              placeholder="Year"
              className="form-control"
              min="1950"
              max={new Date().getFullYear()}
              value={newQualificationYear}
              onChange={(e) => setNewQualificationYear(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="row mb-2 align-items-center">
        <div className="col-8">
          <div className="input-group notely-input-group">
            <span className="input-group-text bg-purple text-white">
              <i className="bi bi-building"></i>
            </span>
            <input
              type="text"
              placeholder="Institution"
              className="form-control"
              value={newInstitution}
              onChange={(e) => setNewInstitution(e.target.value)}
            />
          </div>
        </div>
        <div className="col-4 text-end">
          <button
            type="button"
            className="btn btn-notely-purple w-100"
            onClick={handleAddEducation}
            style={{
              backgroundColor: "#ffc107",
              color: "#000",
              border: "none",
              fontWeight: "600",
            }}
          >
            + Add Education
          </button>
        </div>
      </div>

      {/* Education List */}
      <ul className="list-group mb-4">
        {education.map((edu, index) => (
          <li
            key={index}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <span>
              <strong>{edu.qualification}</strong> ({edu.year}) – {edu.institution}
            </span>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={() => removeEducation(index)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <h4 className="mb-3">Certifications</h4>

      {/* Certification Error */}
      {certifications.length > 0 && (
        <>
          {formErrors[`certification_${certifications.length - 1}_name`] && (
            <div className="text-danger mb-1">
              {formErrors[`certification_${certifications.length - 1}_name`]}
            </div>
          )}
          {formErrors[`certification_${certifications.length - 1}_year`] && (
            <div className="text-danger mb-2">
              {formErrors[`certification_${certifications.length - 1}_year`]}
            </div>
          )}
        </>
      )}

      <div className="row mb-1 align-items-center">
        <div className="col-8">
          <div className="input-group notely-input-group">
            <span className="input-group-text bg-purple text-white">
              <i className="bi bi-award"></i>
            </span>
            <input
              type="text"
              placeholder="Certification (e.g. Grade 8 Piano)"
              className="form-control"
              value={newCertification}
              onChange={(e) => setNewCertification(e.target.value)}
            />
          </div>
        </div>
        <div className="col-4">
          <div className="input-group notely-input-group">
            <span className="input-group-text bg-purple text-white">
              <i className="bi bi-calendar"></i>
            </span>
            <input
              type="number"
              placeholder="Year"
              className="form-control"
              min="1950"
              max={new Date().getFullYear()}
              value={newCertificationYear}
              onChange={(e) => setNewCertificationYear(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="text-end mb-2">
        <button
          type="button"
          className="btn btn-notely-purple mt-1"
          onClick={handleAddCertification}
          style={{
            backgroundColor: "#ffc107",
            color: "#000",
            border: "none",
            fontWeight: "600",
          }}
        >
          + Add Certification
        </button>
      </div>

      {/* Certification List */}
      <ul className="list-group mb-4">
        {certifications.map((cert, index) => (
          <li
            key={index}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            {cert.certification} ({cert.year})
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={() => removeCertification(index)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      {/* Nav Buttons */}
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