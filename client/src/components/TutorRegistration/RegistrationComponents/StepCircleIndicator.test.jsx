import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import StepCircleIndicator from "./StepCircleIndicator";

describe("StepCircleIndicator", () => {
  // I’m checking it renders the right number of circles with the right labels
  it("renders totalSteps circles labeled 1..N", () => {
    render(<StepCircleIndicator currentStep={2} totalSteps={5} onStepClick={() => {}} />);
    const circles = Array.from({ length: 5 }, (_, i) => screen.getByText(String(i + 1)));
    expect(circles).toHaveLength(5);
  });

  // I’m asserting classes for active vs inactive states
  it("marks circles <= currentStep as active", () => {
    const { container } = render(
      <StepCircleIndicator currentStep={3} totalSteps={5} onStepClick={() => {}} />
    );
    const nodes = container.querySelectorAll(".step-circle");
    // Steps 1..3 should be active; 4..5 not active
    [...nodes].forEach((node, idx) => {
      const step = idx + 1;
      const isActive = node.classList.contains("active");
      expect(isActive).toBe(step <= 3);
    });
  });

  // I’m checking only steps strictly less than current are clickable
  it("applies 'clickable' only to steps before currentStep", () => {
    const { container } = render(
      <StepCircleIndicator currentStep={3} totalSteps={5} onStepClick={() => {}} />
    );
    const nodes = container.querySelectorAll(".step-circle");
    [...nodes].forEach((node, idx) => {
      const step = idx + 1;
      const isClickable = node.classList.contains("clickable");
      expect(isClickable).toBe(step < 3);
    });
  });

  // I’m verifying onStepClick fires when clicking a previous step
  it("calls onStepClick when a previous step is clicked", () => {
    const onStepClick = vi.fn();
    render(<StepCircleIndicator currentStep={4} totalSteps={5} onStepClick={onStepClick} />);

    fireEvent.click(screen.getByText("2")); // step 2 is < currentStep
    expect(onStepClick).toHaveBeenCalledTimes(1);
    expect(onStepClick).toHaveBeenCalledWith(2);
  });

  // I’m ensuring clicking current step does nothing
  it("does not call onStepClick when clicking the current step", () => {
    const onStepClick = vi.fn();
    render(<StepCircleIndicator currentStep={3} totalSteps={5} onStepClick={onStepClick} />);

    fireEvent.click(screen.getByText("3")); // current step
    expect(onStepClick).not.toHaveBeenCalled();
  });

  // I’m ensuring clicking a future step does nothing
  it("does not call onStepClick when clicking a future step", () => {
    const onStepClick = vi.fn();
    render(<StepCircleIndicator currentStep={2} totalSteps={5} onStepClick={onStepClick} />);

    fireEvent.click(screen.getByText("5")); // future step
    expect(onStepClick).not.toHaveBeenCalled();
  });
});