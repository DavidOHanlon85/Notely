import { useState, useEffect, useRef } from "react";
import { fetchTutors, fetchDistinctFields } from "../services/api/tutorServices";

export function useTutorSearch(resultsPerPage = 9) {
  // -------------------- State --------------------
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
  const [instrumentOptions, setInstrumentOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [tutors, setTutors] = useState([]);
  const [totalTutors, setTotalTutors] = useState(0);

  const previousFormDataRef = useRef(formData);

  // -------------------- Validation --------------------
  const validateFields = () => {
    const errors = {};

    if (formData.tutorName && !/^[a-zA-Z\s]+$/.test(formData.tutorName)) {
      errors.tutorName = "Name should only contain letters.";
    }

    if (formData.price && isNaN(Number(formData.price))) {
      errors.price = "Price must be a number.";
    }

    if (formData.instrument && !instrumentOptions.includes(formData.instrument)) {
      errors.instrument = "Please select a valid instrument.";
    }

    if (formData.city && !cityOptions.includes(formData.city)) {
      errors.city = "Please select a valid city from the list.";
    }

    return errors;
  };

  // -------------------- Handlers --------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async () => {
    setHasSearched(true);
    const errors = validateFields();
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      try {
        const response = await fetchTutors({
          ...formData,
          page: currentPage,
          limit: resultsPerPage,
        });

        setTutors(response.tutors);
        setTotalTutors(response.totalTutors);
      } catch (err) {
        console.error("Error fetching tutors:", err);
      }
    }
  };

  // -------------------- Effects --------------------

  // Fetch dropdown options on first render
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetchDistinctFields();
        setInstrumentOptions(response?.instruments?.map(i => i.instrument) || []);
        setCityOptions(response?.cities?.map(c => c.city) || []);
      } catch (err) {
        console.error("Option fetch failed", err);
      }
    };

    fetchOptions();
  }, []);

  // Trigger immediate search on page change
  useEffect(() => {
    if (hasSearched) {
      handleSearch();
    }
    // eslint-disable-next-line
  }, [currentPage]);

  // Reset to page 1 when form data changes
  useEffect(() => {
    const prev = previousFormDataRef.current;
    const hasChanged = JSON.stringify(prev) !== JSON.stringify(formData);

    if (hasSearched && hasChanged) {
      setCurrentPage(1);
    }

    previousFormDataRef.current = formData;
  }, [formData, hasSearched]);

  // Debounced search for form data updates only
  useEffect(() => {
    if (!hasSearched) return;

    const timeout = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(timeout);
  }, [formData]);

  // -------------------- Return --------------------
  return {
    formData,
    setFormData,
    handleChange,
    formErrors,
    instrumentOptions,
    cityOptions,
    handleSearch,
    hasSearched,
    tutors,
    totalTutors,
    currentPage,
    setCurrentPage,
  };
}