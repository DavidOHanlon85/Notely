import React from "react";
import "./ProgressBar.css"; // optional scoped styles

export default function ProgressBar({ currentStep, totalSteps }) {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className="progress-container mb-3 mt-2">
      <div className="progress-bar-fill" style={{ width: `${percentage}%` }}></div>
    </div>
  );
}