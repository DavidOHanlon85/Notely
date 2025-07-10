import React from "react";

export default function SearchFieldTopRow({
  formData,
  formErrors,
  instrumentOptions,
  cityOptions,
  handleChange,
  hasSearched,
}) {
  return (
    <div className="row g-3 justify-content-center pb-0">
      {/* Instrument */}
      <div className="col-md-3">
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
        </div>
      </div>

      {/* Level */}
      <div className="col-md-3">
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

      {/* Max Price */}
      <div className="col-md-3">
        <label className="form-label">Max Price</label>
        <div className="input-group notely-input-group">
          <span className="input-group-text bg-warning text-white border border-secondary rounded-start">
            <i className="bi bi-currency-pound"></i>
          </span>
          <select
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="form-select border border-secondary rounded-end"
          >
            <option value="">No Max</option>
            {[20,30,40,50,60,70,80,90,100].map((p) => (
              <option key={p} value={p}>{`£${p}`}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Location */}
      <div className="col-md-3">
        <label className="form-label">Location</label>
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
        </div>
      </div>
    </div>
  );
}