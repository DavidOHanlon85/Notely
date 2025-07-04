import axios from "axios";

const API_BASE_URL = "http://localhost:3002/api/tutors";

// Fetch all information from tutor table
export const fetchTutors = async (params) => {
  const response = await axios.get(API_BASE_URL, { params });
  return response.data;
};

// Fetch all distinct values for instrument and city search filters
export const fetchDistinctFields = async () => {
  const response = await axios.get(`${API_BASE_URL}/distinct-fields`);
  return response.data;
};