import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./SearchPage.css";
import SearchHero from "../components/SearchHero";
import DoubleButtonNavBar from "../components/DoubleButtonNavBar";
import TutorCard from "../components/TutorCard";
import axios from "axios";




export default function SearchPage() {

  

  {/* Controlling Search Result Header */}

  const [hasSearched, setHasSearched] = useState(false);

  const [formData, setFormData] = useState({
    instrument: "",
    level: "",
    tutorName: "",
    lessonType: "",
    price: "",
    city: "",
    qualified: "",
    gender: "",
    sen: "",
    dbs: "",
    sortBy: "",
  });

  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  { /* Fetch Distinct Values */ }

  const [instrumentOptions, setInstrumentOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try{
        const response = await axios.get("http://localhost:3002/api/tutors/distinct-fields");
        setInstrumentOptions(response.data.instruments.map(i => i.instrument));
        setCityOptions(response.data.cities.map(c => c.city));
      } catch (error) {
        console.error("Error fetching options:", error)
      }
    };
      fetchOptions();
    }, []);

  { /* NO longer needed? */ }
  const validateFields = () => {
    const errors = {};
    
    return errors;
  };

  const [tutors, setTutors] = useState([])

  const handleSearch = async () => {
    console.log("Searching...");
    console.log("Live formData in handleSearch:", formData);
    setHasSearched(true);
    const errors = validateFields();
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      try{
        const response = await axios.get("http://localhost:3002/api/tutors", {
          params: {
            instrument: formData.instrument,
            level: formData.level,
            tutorName: formData.tutorName,
            lessonType: formData.lessonType,
            price: formData.price,
            city: formData.city,
            qualified: formData.qualified,
            gender: formData.gender,
            sen: formData.sen,
            dbs: formData.dbs,
            sortBy: formData.sortBy,
          },
        });
        setTutors(response.data);
        
      } catch (error) {
        console.log("Error fetching tutors:", error)
      }
    }
  };

  {/* Listen to changes in formData and triggers handleSearch() only after the first button press sets hasSearched to true */ }



  useEffect(() => {
    if (!hasSearched) return;
  
    const debounced = setTimeout(() => {
      handleSearch();
    }, 300);
  
    return () => clearTimeout(debounced);
  }, [formData, hasSearched]);

 



  return (
    <div>
      <DoubleButtonNavBar />
      <SearchHero />

      <div className="container">
        <form className="notely-search-form p-4 rounded" onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}>
          {/* --- ROW 1 --- */}
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
                  className={`form-control border border-secondary rounded-end ${formErrors.instrument ? "is-invalid" : ""}`}
                />
                <datalist id="instrumentOptions">
                  {instrumentOptions.map((instrument, index) => (
                    <option key={index} value={instrument} />
                  ))}
                </datalist>
                <div className="invalid-feedback">Please enter an instrument.</div>
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
                  className="form-control border border-secondary rounded-end"
                />
              </div>
            </div>
          </div>

          {/* --- ROW 2 --- */}
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

            {/* Price */}
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
                  className="form-select border border-secondary rounded-end"
                >
                  <option value="">No Max</option>
                  {[20, 30, 40, 50, 60, 70, 80, 90, 100].map((p) => (
                    <option key={p} value={p}>{`£${p}`}</option>
                  ))}
                </select>
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
                  className="form-control border border-secondary rounded-end"
                />
                <datalist id="cityList">
                  {cityOptions.map((city, index) => (
                    <option key={index} value={city} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          {/* --- ROW 3 --- */}
          <div className="row g-3 mt-2">
            {/* Qualified */}
            <div className="col-md-3">
              <label className="form-label">Qualified Teacher</label>
              <div className="input-group notely-input-group">
                <span className="input-group-text bg-warning text-white border border-secondary rounded-start">
                  <i className="bi bi-award-fill"></i>
                </span>
                <select
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
              <label className="form-label">Tutor Gender</label>
              <div className="input-group notely-input-group">
                <span className="input-group-text bg-warning text-white border border-secondary rounded-start">
                  <i className="bi bi-gender-ambiguous"></i>
                </span>
                <select
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
              <label className="form-label">SEN Trained</label>
              <div className="input-group notely-input-group">
                <span className="input-group-text bg-warning text-white border border-secondary rounded-start">
                  <i className="bi bi-universal-access-circle"></i>
                </span>
                <select
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
              <label className="form-label">DBS Certified</label>
              <div className="input-group notely-input-group">
                <span className="input-group-text bg-warning text-white border border-secondary rounded-start">
                  <i className="bi bi-shield-lock-fill"></i>
                </span>
                <select
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

          {/* Submit Button */}
          <div className="col-12 d-flex justify-content-center mt-4 pt-4">
            <button type="submit" className="btn btn-purple rounded-pill px-5 py-2 fw-semibold text-white">
              Find Your Teacher!
            </button>
          </div>

          {/* Sort By */}
          <div className="row mb-1 justify-content-end mt-2">
            <div className="col-md-3">
              <label className="form-label">Sort By</label>
              <div className="input-group notely-input-group">
                <span className="input-group-text bg-purple text-white border border-secondary rounded-start">
                  <i className="bi bi-sort-down-alt"></i>
                </span>
                <select
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
        </form>
      </div>

    {/* Number of Search Results */}

    {hasSearched && (
  <div className="container mt-0 fade-in">
    {tutors.length > 0 ? (
      <>
        <h3 className="text-muted fw-semibold mb-1">{tutors.length} Tutors Found</h3>
        <hr className="mb-4" />
      </>
    ) : (
      <>
        <h3 className="text-muted fw-semibold mb-1">{tutors.length} tutors found — try adjusting your search.</h3>
        <hr className="mb-4" />
      </>
    )}
  </div>
)}

  {/* Dynamic Cards Start */}

  <div className="container mt-5 px-3 pb-5">
  <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
    {tutors.length > 0 &&
      tutors.map((tutor, index) => (
        <div className ="col fade-in" key={tutor.id}>
          <TutorCard tutor={tutor} />
          </div>
      ))}
  </div>
</div>

  {/* Dynamic Cards End */}

  </div>
  );
}