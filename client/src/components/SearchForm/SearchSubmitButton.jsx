import React from "react";
import "./SearchSubmitButton.css"

export default function SearchSubmitButton() {
  return (
    <div className="col-12 d-flex justify-content-center mt-4 pt-3">
      <button
        type="submit"
        className="btn btn-notely-primary btn-notely-cta"
      >
        Find Your Music Tutor
      </button>
    </div>
  );
}
