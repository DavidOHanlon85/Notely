// components/SearchForm/SearchFormWrapper.jsx
import React from "react";

export default function SearchFormWrapper({ children, handleSearch }) {
  return (
    <form
      className="notely-search-form p-4 rounded"
      onSubmit={(e) => {
        e.preventDefault();
        handleSearch();
      }}
    >
      {children}
    </form>
  );
}