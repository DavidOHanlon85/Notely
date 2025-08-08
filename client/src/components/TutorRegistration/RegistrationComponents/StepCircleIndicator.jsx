import React from "react";
import "./StepCircleIndicator.css";

export default function StepCircleIndicator({ currentStep, totalSteps, onStepClick }) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="step-indicator mb-3 d-flex justify-content-center gap-3">
      {steps.map((step) => (
        <div
          key={step}
          className={`step-circle ${step <= currentStep ? "active" : ""} ${step < currentStep ? "clickable" : ""}`}
          onClick={() => step < currentStep && onStepClick(step)}
        >
          {step}
        </div>
      ))}
    </div>
  );
}