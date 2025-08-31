import React, { useState, useEffect } from "react";
import axios from "axios";

export default function TutorRegisterStep3({
  formData,
  setFormData,
  onNext,
  onBack,
}) {
  const [availableInstruments, setAvailableInstruments] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [instrumentDropdownValue, setInstrumentDropdownValue] = useState("");

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/instruments/all`)
      .then((res) => {
        setAvailableInstruments(res.data.instruments);
      })
      .catch((err) => {
        console.error("Instrument fetch error:", err);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const parsedValue = [
      "tutor_dbs",
      "tutor_qualified",
      "tutor_sen",
      "tutor_gender",
    ].includes(name)
      ? parseInt(value)
      : value;

    if (type === "checkbox") {
      if (checked) {
        setFormData((prev) => ({
          ...prev,
          [name]: [...(prev[name] || []), value],
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: prev[name].filter((v) => v !== value),
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: parsedValue }));
    }
  };

  const handleInstrumentSelect = (e) => {
    const selected = e.target.value;
    const current = formData.tutor_instruments || [];

    if (!current.includes(selected) && current.length < 3) {
      setFormData((prev) => ({
        ...prev,
        tutor_instruments: [...current, selected],
      }));
      setInstrumentDropdownValue("");
    } else if (current.length >= 3) {
      alert("You can only select up to 3 instruments.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = {};

    if (!formData.tutor_instruments?.length)
      errors.tutor_instruments = "At least one instrument required.";
    if (!formData.tutor_level?.length)
      errors.tutor_level = "At least one level required.";
    if (!formData.tutor_teaching_start_date)
      errors.tutor_teaching_start_date = "Start date is required.";
    if (formData.tutor_dbs === undefined || formData.tutor_dbs === "")
      errors.tutor_dbs = "Please indicate if DBS checked.";
    if (
      formData.tutor_qualified === undefined ||
      formData.tutor_qualified === ""
    )
      errors.tutor_qualified = "Please indicate if you're a qualified teacher.";
    if (formData.tutor_sen === undefined || formData.tutor_sen === "")
      errors.tutor_sen = "Please indicate SEN experience.";
    if (formData.tutor_gender === undefined || formData.tutor_gender === "")
      errors.tutor_gender = "Please select your gender.";
    if (!formData.tutor_modality)
      errors.tutor_modality = "Please select lesson type.";
    if (!formData.tutor_price) errors.tutor_price = "Price is required.";

    setFormErrors(errors);
    if (Object.keys(errors).length === 0) onNext();
  };

  const notelyIconWrapper = (icon) => (
    <span className="input-group-text bg-purple text-white border border-secondary rounded-start">
      <i className={`bi ${icon}`}></i>
    </span>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="w-100"
      style={{ maxWidth: "550px" }}
    >
      {/* Instruments Dropdown */}
      <div className="mb-3">
        <label className="form-label">Select Up to 3 Instruments</label>
        <div className="input-group">
          {notelyIconWrapper("bi-music-note-list")}
          <select
            className="form-select border border-secondary rounded-end"
            onChange={handleInstrumentSelect}
            value={instrumentDropdownValue}
          >
            <option value="" disabled>
              Select an instrument
            </option>
            {availableInstruments
              .filter(
                (inst) => !formData.tutor_instruments?.includes(inst.instrument)
              )
              .map((inst, i) => (
                <option key={i} value={inst.instrument}>
                  {inst.instrument}
                </option>
              ))}
          </select>
        </div>
        <div className="mt-2 d-flex flex-wrap gap-2">
          {formData.tutor_instruments?.map((inst, i) => (
            <span key={i} className="badge bg-purple text-white">
              {inst}
              <i
                className="bi bi-x-circle-fill ms-1 cursor-pointer"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    tutor_instruments: prev.tutor_instruments.filter(
                      (_, idx) => idx !== i
                    ),
                  }))
                }
              ></i>
            </span>
          ))}
        </div>
        {formErrors.tutor_instruments && (
          <div className="text-danger small mt-1">
            {formErrors.tutor_instruments}
          </div>
        )}
      </div>

      {/* Level Checkboxes */}
      <div className="mb-4">
        <label className="form-label d-flex align-items-center gap-2">
          Level(s) You're Happy to Teach
          <i
            className="bi bi-info-circle-fill text-muted"
            data-hint="Beginner: Grade 1 - Grade 3. 
            Intermediate: Grade 4 - Grade 5 
            Advanced: High technical skill - Grades 6 – Grade 8 / Professional Performance."
            style={{ cursor: "help", fontSize: "1rem" }}
          ></i>
        </label>
        <div className="d-flex gap-3 flex-wrap">
          {[
            { label: "Beginner", value: "0" },
            { label: "Intermediate", value: "1" },
            { label: "Advanced", value: "2" },
          ].map(({ label, value }) => (
            <div key={value} className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id={`level-${value}`}
                name="tutor_level"
                value={value}
                onChange={handleChange}
                checked={formData.tutor_level?.includes(value)}
              />
              <label className="form-check-label" htmlFor={`level-${value}`}>
                {label}
              </label>
            </div>
          ))}
        </div>
        {formErrors.tutor_level && (
          <div className="text-danger small mt-1">{formErrors.tutor_level}</div>
        )}
      </div>

      {/* Start Date and Profile Attributes */}
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Teaching Start Date</label>
          <div className="input-group notely-input-group">
            {notelyIconWrapper("bi-calendar-event-fill")}
            <input
              type="date"
              name="tutor_teaching_start_date"
              className="form-control border border-secondary rounded-end"
              value={formData.tutor_teaching_start_date || ""}
              onChange={handleChange}
              style={{ height: "45px" }}
            />
          </div>
          {formErrors.tutor_teaching_start_date && (
            <div className="text-danger small mt-1">
              {formErrors.tutor_teaching_start_date}
            </div>
          )}
        </div>

        {/* Dropdowns: DBS, Qualified, SEN, Gender, Lesson Type */}
        {[
          {
            name: "tutor_dbs",
            label: "DBS Checked",
            icon: "bi-shield-lock-fill",
          },
          {
            name: "tutor_qualified",
            label: "Qualified Teacher",
            icon: "bi-award-fill",
          },
          { name: "tutor_sen", label: "SEN Experience", icon: "bi-eyeglasses" },
          {
            name: "tutor_gender",
            label: "Gender",
            icon: "bi-gender-ambiguous",
          },
          { name: "tutor_modality", label: "Lesson Type", icon: "bi-laptop" },
        ].map(({ name, label, icon }) => (
          <div key={name} className="col-md-6">
            <label className="form-label">{label}</label>
            <div className="input-group notely-input-group">
              {notelyIconWrapper(icon)}
              <select
                className="form-select border border-secondary rounded-end"
                name={name}
                value={formData[name] ?? ""}
                onChange={handleChange}
              >
                <option value="">Select...</option>

                {name === "tutor_gender"
                  ? [
                      { label: "Female", value: 0 },
                      { label: "Male", value: 1 },
                    ].map(({ label, value }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))
                  : name === "tutor_modality"
                  ? ["In-Person", "Online", "Hybrid"].map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))
                  : [
                      { label: "Yes", value: 1 },
                      { label: "No", value: 0 },
                    ].map(({ label, value }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
              </select>
            </div>
            {formErrors[name] && (
              <div className="text-danger small mt-1">{formErrors[name]}</div>
            )}
          </div>
        ))}
      </div>

      <div
        className="alert alert-warning mt-3"
        role="alert"
        style={{ fontSize: "0.85rem", lineHeight: "1.3", textAlign: "justify", backgroundColor: "#c09be7", border: "none", color: "white", padding: "0.75rem 1rem" }}
      >
        <strong>Verification requirement: </strong>
        If you select <em>Yes</em> for <strong>DBS Checked</strong>,{" "}
        <strong>Qualified Teacher</strong> or <strong>SEN Experience</strong>,
        you must upload supporting evidence in your <strong>Profile</strong>{" "}
        section of the dashboard to facilitate verification and account
        activation.
      </div>

      {/* Price Input */}
      <div className="mb-3 mt-3">
        <label className="form-label">Price per Hour (£)</label>
        <div className="input-group notely-input-group">
          {notelyIconWrapper("bi-cash-coin")}
          <input
            type="number"
            name="tutor_price"
            className="form-control border border-secondary rounded-end"
            value={formData.tutor_price || ""}
            onChange={handleChange}
            min="0"
            step="1"
          />
        </div>
        {formErrors.tutor_price && (
          <div className="text-danger small mt-1">{formErrors.tutor_price}</div>
        )}
        {formData.tutor_price && (
          <div className="mt-2 text-muted">
            Tutor Take Home (80%): £{(formData.tutor_price * 0.8).toFixed(2)} ||
            Notely Fee (20%): £{(formData.tutor_price * 0.2).toFixed(2)}
          </div>
        )}
      </div>

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
