// components/SearchForm/SearchFormWrapper.jsx
import React from "react";

export default function SearchFormWrapper({ children, handleSearch }) {
  return (
    <form
      className="notely-search-form px-4 py-2 rounded"
      onSubmit={(e) => {
        e.preventDefault();
        handleSearch();
      }}
    >
      {children}
    </form>
  );
}