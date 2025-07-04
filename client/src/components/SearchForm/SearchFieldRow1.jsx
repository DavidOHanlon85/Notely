import React from "react";

export default function SearchFieldRow1({
  formData,
  formErrors,
  instrumentOptions,
  handleChange,
  hasSearched,
}) {
  return (
    <div className="row g-3 justify-content-center">
      {/* Instrument */}
      <div className="col-md-4">
        <label className="form-label">Instrument</label>
        <div className="input-group notely-input-group">
          <span className="input-group-text bg-warning text-white border border-secondary rounded-start">
            <i className="bi bi-music-note-list"></i>
          </span>
          <input
            list="instrumentOptions"
            name="instrument"
            value={formData.instrument}
            onChange={handleChange}
            placeholder="e.g. Piano"
            className={`form-control border border-secondary rounded-end ${
              formErrors.instrument ? "is-invalid" : ""
            }`}
          />
          <datalist id="instrumentOptions">
            {instrumentOptions.map((instrument, index) => (
              <option key={index} value={instrument} />
            ))}
          </datalist>
          {formErrors.instrument && (
            <div className="invalid-feedback">{formErrors.instrument}</div>
          )}
        </div>
      </div>

      {/* Level */}
      <div className="col-md-4">
        <label className="form-label">Level</label>
        <div className="input-group notely-input-group">
          <span className="input-group-text bg-warning text-white border border-secondary rounded-start">
            <i className="bi bi-bar-chart-line-fill"></i>
          </span>
          <select
            name="level"
            value={formData.level}
            onChange={handleChange}
            className="form-select border border-secondary rounded-end"
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Tutor Name */}
      <div className="col-md-4">
        <label className="form-label">Tutor Name</label>
        <div className="input-group notely-input-group">
          <span className="input-group-text bg-warning text-white border border-secondary rounded-start">
            <i className="bi bi-person-circle"></i>
          </span>
          <input
            type="text"
            name="tutorName"
            value={formData.tutorName}
            onChange={handleChange}
            placeholder="e.g. Sarah Palmer"
            className={`form-control border border-secondary rounded-end ${
              formErrors.tutorName ? "is-invalid" : ""
            }`}
          />
          {formErrors.tutorName && (
            <div className="invalid-feedback">{formErrors.tutorName}</div>
          )}
        </div>
      </div>
    </div>
  );
}
