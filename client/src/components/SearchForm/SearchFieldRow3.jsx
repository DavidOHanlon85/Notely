import React from "react";

export default function SearchFieldRow3({ formData, handleChange }) {
  return (
    <div className="row g-3 mt-2">
      {/* Qualified Teacher */}
      <div className="col-md-3">
        <label htmlFor="qualified" className="form-label">Qualified Teacher</label>
        <div className="input-group notely-input-group">
          <span className="input-group-text bg-warning text-white border border-secondary rounded-start">
            <i className="bi bi-award-fill"></i>
          </span>
          <select
            id="qualified"
            name="qualified"
            value={formData.qualified}
            onChange={handleChange}
            className="form-select border border-secondary rounded-end"
          >
            <option value="">Either</option>
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select>
        </div>
      </div>

      {/* Gender */}
      <div className="col-md-3">
        <label htmlFor="gender" className="form-label">Tutor Gender</label>
        <div className="input-group notely-input-group">
          <span className="input-group-text bg-warning text-white border border-secondary rounded-start">
            <i className="bi bi-gender-ambiguous"></i>
          </span>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="form-select border border-secondary rounded-end"
          >
            <option value="">Any</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </div>
      </div>

      {/* SEN */}
      <div className="col-md-3">
        <label htmlFor="sen" className="form-label">SEN Trained</label>
        <div className="input-group notely-input-group">
          <span className="input-group-text bg-warning text-white border border-secondary rounded-start">
            <i className="bi bi-universal-access-circle"></i>
          </span>
          <select
            id="sen"
            name="sen"
            value={formData.sen}
            onChange={handleChange}
            className="form-select border border-secondary rounded-end"
          >
            <option value="">Either</option>
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select>
        </div>
      </div>

      {/* DBS */}
      <div className="col-md-3">
        <label htmlFor="dbs" className="form-label">DBS Certified</label>
        <div className="input-group notely-input-group">
          <span className="input-group-text bg-warning text-white border border-secondary rounded-start">
            <i className="bi bi-shield-lock-fill"></i>
          </span>
          <select
            id="dbs"
            name="dbs"
            value={formData.dbs}
            onChange={handleChange}
            className="form-select border border-secondary rounded-end"
          >
            <option value="">Either</option>
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select>
        </div>
      </div>
    </div>
  );
}
