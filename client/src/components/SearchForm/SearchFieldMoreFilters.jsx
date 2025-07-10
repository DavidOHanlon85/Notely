import React from "react";

export default function SearchFieldMoreFilters({ formData, handleChange }) {
  return (
    <div className="row g-3 mt-0 justify-content-center">

      {/* Lesson Type */}
      <div className="col-md-3">
        <label htmlFor="lessonType" className="form-label">Lesson Type</label>
        <div className="input-group notely-input-group">
          <span className="input-group-text bg-warning text-white border border-secondary rounded-start">
            <i className="bi bi-laptop"></i>
          </span>
          <select
            id="lessonType"
            name="lessonType"
            value={formData.lessonType}
            onChange={handleChange}
            className="form-select border border-secondary rounded-end"
          >
            <option value="">Any</option>
            <option value="Online">Online</option>
            <option value="In-Person">In-Person</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>
      </div>

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

      {/* SEN Trained */}
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

      {/* Tutor Name */}
      <div className="col-md-3">
        <label htmlFor="tutorName" className="form-label">Tutor Name</label>
        <div className="input-group notely-input-group">
          <span className="input-group-text bg-warning text-white border border-secondary rounded-start">
            <i className="bi bi-person-circle"></i>
          </span>
          <input
            type="text"
            id="tutorName"
            name="tutorName"
            value={formData.tutorName}
            onChange={handleChange}
            placeholder="e.g. Sarah Palmer"
            className="form-control border border-secondary rounded-end"
          />
        </div>
      </div>

      {/* Tutor Gender */}
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
            <option value="0">Female</option>
            <option value="1">Male</option>
          </select>
        </div>
      </div>

      {/* DBS Certified */}
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