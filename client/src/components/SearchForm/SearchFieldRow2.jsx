import React from "react";

export default function SearchFieldRow2({
  formData,
  formErrors,
  handleChange,
  instrumentOptions,
  cityOptions,
  hasSearched,
}) {
  return (
    <div className="row g-3 justify-content-center mt-2">
      {/* Lesson Type */}
      <div className="col-md-4">
        <label className="form-label">Lesson Type</label>
        <div className="input-group notely-input-group">
          <span className="input-group-text bg-warning text-white border border-secondary rounded-start">
            <i className="bi bi-laptop"></i>
          </span>
          <select
            name="lessonType"
            value={formData.lessonType}
            onChange={handleChange}
            className="form-select border border-secondary rounded-end"
          >
            <option value="">Select</option>
            <option value="Online">Online</option>
            <option value="In-Person">In-Person</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>
      </div>

      {/* Max Price */}
      <div className="col-md-4">
        <label className="form-label">Max Price</label>
        <div className="input-group notely-input-group">
          <span className="input-group-text bg-warning text-white border border-secondary rounded-start">
            <i className="bi bi-currency-pound"></i>
          </span>
          <select
            name="price"
            value={formData.price}
            onChange={handleChange}
            className={`form-select border border-secondary rounded-end ${
              formErrors.price ? "is-invalid" : ""
            }`}
          >
            <option value="">No Max</option>
            {[20, 30, 40, 50, 60, 70, 80, 90, 100].map((p) => (
              <option key={p} value={p}>{`£${p}`}</option>
            ))}
          </select>
          {formErrors.price && (
            <div className="invalid-feedback">{formErrors.price}</div>
          )}
        </div>
      </div>

      {/* City */}
      <div className="col-md-4">
        <label className="form-label">City</label>
        <div className="input-group notely-input-group">
          <span className="input-group-text bg-warning text-white border border-secondary rounded-start">
            <i className="bi bi-geo-alt-fill"></i>
          </span>
          <input
            list="cityList"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="e.g. Belfast"
            className={`form-control border border-secondary rounded-end ${
              hasSearched && formErrors.city ? "is-invalid" : ""
            }`}
          />
          <datalist id="cityList">
            {cityOptions.map((city, index) => (
              <option key={index} value={city} />
            ))}
          </datalist>
          {formErrors.city && (
            <div className="invalid-feedback">{formErrors.city}</div>
          )}
        </div>
      </div>
    </div>
  );
}
