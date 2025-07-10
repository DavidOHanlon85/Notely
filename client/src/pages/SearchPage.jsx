import React, { useState, useEffect, useRef } from "react";

{
  /* API calls and helpers */
}
import { validateSearchForm } from "../utils/helpers/validateSearchForm";
import {
  fetchTutors,
  fetchDistinctFields,
} from "../services/api/tutorServices";

{
  /* Component Imports */
}
import SearchHero from "../components/SearchHero";
import DoubleButtonNavBar from "../components/DoubleButtonNavBar";
import SearchFormWrapper from "../components/SearchForm/SearchFormWrapper";
import SearchFieldTopRow from "../components/SearchForm/SearchFieldTopRow";
import SearchFieldMoreFilters from "../components/SearchForm/SearchFieldMoreFilters";
import SearchSubmitButton from "../components/SearchForm/SearchSubmitButton";
import SearchSortField from "../components/SearchForm/SearchSortField";
import Pagination from "../components/SearchForm/Pagination";
import TutorResultsGrid from "../components/SearchForm/TutorResultsGrid";
import SearchResultsHeader from "../components/SearchForm/SearchResultsHeader";
import SocialsFooter from "../components/SocialsFooter";

{
  /* CSS Imports */
}
import "./SearchPage.css";

export default function SearchPage() {
  {
    /* Search State Management */
  }

  const [hasSearched, setHasSearched] = useState(false); // Controls when search has been triggered

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
  const [instrumentOptions, setInstrumentOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [tutors, setTutors] = useState([]);
  const [totalTutors, setTotalTutors] = useState(0);

  const resultsPerPage = 9; // Display limit
  const previousFormDataRef = useRef(formData); // For detecting filter changes

  {
    /* Input Handling */
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  {
    /* API Calls + Client Side Validation */
  }

  const handleSearch = async () => {
    console.log("Searching with:", formData);
    setHasSearched(true);

    const errors = validateSearchForm(formData, instrumentOptions, cityOptions);
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      try {
        const response = await fetchTutors({
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
          page: currentPage,
          limit: resultsPerPage,
        });

        setTutors(response.tutors);
        setTotalTutors(response.totalTutors);
      } catch (error) {
        console.error("Error fetching tutors:", error);
      }
    }
  };

  {
    /* Effects - Data Fetching and Sync */
  }

  {
    /* Fetch dropdown options (once on mount) */
  }
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetchDistinctFields();
        setInstrumentOptions(
          response?.instruments
            ?.filter((i) => i.instrument_active === 1)
            .map((i) => i.instrument) || []
        );
        setCityOptions(response?.cities?.map((c) => c.city) || []);
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };

    fetchOptions();
  }, []);

  {
    /* Handle page change by re-firing search */
  }
  useEffect(() => {
    if (hasSearched) handleSearch();
    // eslint-disable-next-line
  }, [currentPage]);

  {
    /* Reset to page 1 if filters change */
  }
  useEffect(() => {
    const prev = previousFormDataRef.current;
    const hasChanged = JSON.stringify(prev) !== JSON.stringify(formData);

    if (hasSearched && hasChanged) {
      setCurrentPage(1);
    }

    previousFormDataRef.current = formData;
  }, [formData, hasSearched]);

  {
    /* Debounce search to reduce spam requests */
  }
  useEffect(() => {
    if (!hasSearched) return;

    const debounce = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(debounce);
  }, [formData, currentPage, hasSearched]);

  {
    /* More filters handling */
  }

  const [showMoreFilters, setShowMoreFilters] = useState(false);

  return (
    <div>
      <DoubleButtonNavBar />
      <SearchHero />

      <div className="container search-section-bg">
        <div className="search-glass-card">
          <SearchFormWrapper handleSearch={handleSearch}>
            {/* More Filters Toggle Button */}
            <div className="d-flex justify-content-end mb-2">
              <button
                type="button" //Preventing auto-search
                className="btn btn-notely-purple d-flex align-items-center gap-2"
                onClick={() => setShowMoreFilters((prev) => !prev)}
              >
                More Filters
                <i
                  className={`bi bi-chevron-${showMoreFilters ? "up" : "down"}`}
                  style={{ transition: "transform 0.3s ease" }}
                ></i>
              </button>
            </div>

            <SearchFieldTopRow
              formData={formData}
              formErrors={formErrors}
              instrumentOptions={instrumentOptions}
              cityOptions={cityOptions}
              handleChange={handleChange}
              hasSearched={hasSearched}
            />

            {/* Conditional Filters Section */}
            {showMoreFilters && (
              <SearchFieldMoreFilters
                formData={formData}
                handleChange={handleChange}
              />
            )}

            <SearchSubmitButton />
          </SearchFormWrapper>
        </div>
      </div>

      {/* Number of Search Results */}

      {hasSearched && (
        <div className="container d-flex justify-content-between align-items-end flex-wrap mt-5 mb-2">
          {/* Tutors Count */}
          <div>
            <h3 className="text-muted fw-semibold mb-1">
              {tutors.length > 0
                ? `${totalTutors} Tutors Found`
                : `${totalTutors} tutors found — try adjusting your search.`}
            </h3>
          </div>

          {/* Sort Dropdown */}
          <div className="mt-2 mt-md-0">
            <SearchSortField formData={formData} handleChange={handleChange} />
          </div>
        </div>
      )}
      {hasSearched && <hr className="container mb-4" />}

      {/* Dynamic Cards Start */}

      <TutorResultsGrid tutors={tutors} />

      {/* Pagination Controls */}

      {hasSearched && (
        <Pagination
          currentPage={currentPage}
          totalTutors={totalTutors}
          resultsPerPage={resultsPerPage}
          setCurrentPage={setCurrentPage}
        />
      )}

      {hasSearched && <SocialsFooter />}
    </div>
  );
}
