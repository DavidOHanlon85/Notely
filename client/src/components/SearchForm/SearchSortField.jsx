export default function SearchSortField({ formData, handleChange }) {
  return (
    <div className="d-flex align-items-center">
      <label htmlFor="sortBy" className="form-label me-2 mb-0"></label>
      <div className="input-group notely-input-group">
        <span
          className="input-group-text text-white border border-secondary rounded-start"
          style={{
            backgroundColor: "#a259ff", // Notely purple
            fontWeight: "600",
            borderRadius: "0.5rem 0 0 0.5rem"
          }}
        >
          <i className="bi bi-sort-down-alt"></i>
        </span>
        <select
          id="sortBy"
          name="sortBy"
          value={formData.sortBy}
          onChange={handleChange}
          className="form-select border border-secondary rounded-end"
        >
          <option value="" disabled>
            Select a sort option...
          </option>
          <option value="priceLowHigh">Price: Low to High</option>
          <option value="priceHighLow">Price: High to Low</option>
          <option value="ratingHighLow">Rating: High to Low</option>
          <option value="experienceHighLow">Experience: High to Low</option>
          <option value="reviewsHighLow">Reviews: High to Low</option>
        </select>
      </div>
    </div>
  );
}
