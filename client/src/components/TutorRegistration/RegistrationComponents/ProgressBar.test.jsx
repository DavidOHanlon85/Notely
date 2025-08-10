import { render } from "@testing-library/react";
import React from "react";
import ProgressBar from "./ProgressBar";

describe("ProgressBar", () => {
  // I’m asserting the DOM structure we rely on exists
  it("renders the container and fill elements", () => {
    const { container } = render(<ProgressBar currentStep={1} totalSteps={4} />);
    expect(container.querySelector(".progress-container")).toBeInTheDocument();
    expect(container.querySelector(".progress-bar-fill")).toBeInTheDocument();
  });

  // I’m checking the width maths: (currentStep / totalSteps) * 100
  it("sets width based on currentStep / totalSteps", () => {
    const { container } = render(<ProgressBar currentStep={1} totalSteps={4} />);
    const fill = container.querySelector(".progress-bar-fill");
    const widthPct = parseFloat(fill.style.width); // strip the '%' and parse
    expect(widthPct).toBeCloseTo(25, 3);
  });

  // I’m covering a non-integer percentage (1/3) without relying on exact string formatting
  it("handles fractional percentages", () => {
    const { container } = render(<ProgressBar currentStep={1} totalSteps={3} />);
    const fill = container.querySelector(".progress-bar-fill");
    const widthPct = parseFloat(fill.style.width);
    expect(widthPct).toBeCloseTo(33.333, 2);
  });

  // I’m verifying it updates correctly when props change
  it("updates width when props change", () => {
    const { container, rerender } = render(
      <ProgressBar currentStep={2} totalSteps={5} />
    );
    let fill = container.querySelector(".progress-bar-fill");
    expect(parseFloat(fill.style.width)).toBeCloseTo(40, 3);

    rerender(<ProgressBar currentStep={5} totalSteps={5} />);
    fill = container.querySelector(".progress-bar-fill");
    expect(parseFloat(fill.style.width)).toBeCloseTo(100, 3);
  });
});