import React from "react";

export default function SearchSortField({ formData, handleChange }) {
  return (
    <div className="row mb-1 justify-content-end mt-2">
      <div className="col-md-3">
        <label htmlFor="sortBy" className="form-label">Sort By</label>
        <div className="input-group notely-input-group">
          <span className="input-group-text bg-purple text-white border border-secondary rounded-start">
            <i className="bi bi-sort-down-alt"></i>
          </span>
          <select
            id="sortBy"
            name="sortBy"
            value={formData.sortBy}
            onChange={handleChange}
            className="form-select border border-secondary rounded-end"
          >
            <option value="">Recommended</option>
            <option value="priceLowHigh">Price: Low to High</option>
            <option value="priceHighLow">Price: High to Low</option>
            <option value="experience">Experience</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>
    </div>
  );
}
