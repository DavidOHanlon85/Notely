import { render, screen } from "@testing-library/react";
import React from "react";
import SearchResultsHeader from "./SearchResultsHeader";

// Helper to render with minimal props
const setup = (override = {}) => {
  const props = {
    hasSearched: true,
    tutors: [],
    totalTutors: 0,
    ...override,
  };
  const utils = render(<SearchResultsHeader {...props} />);
  return { ...utils, props };
};

describe("SearchResultsHeader", () => {
  // Renders nothing until a search has been performed
  it("returns null when hasSearched is false", () => {
    const { container } = render(
      <SearchResultsHeader hasSearched={false} tutors={[]} totalTutors={0} />
    );
    expect(container.firstChild).toBeNull();
  });

  // Shows the pluralised 'Tutors Found' message when there are results
  it("shows '<total> Tutors Found' when tutors are present", () => {
    setup({ tutors: [{ id: 1 }], totalTutors: 5 });
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "5 Tutors Found"
    );
  });

  // Shows the fallback guidance when there are zero results
  it("shows guidance message when no tutors are found", () => {
    setup({ tutors: [], totalTutors: 0 });
    expect(
      screen.getByText(/0 tutors found — try adjusting your search\./i)
    ).toBeInTheDocument();
  });

  // Includes the horizontal rule when visible
  it("renders an <hr> when visible", () => {
    const { container } = setup({ tutors: [{ id: 1 }], totalTutors: 1 });
    expect(container.querySelector("hr.mb-4")).toBeTruthy();
  });

  // Keeps container wrapper and classes for styling
  it("wraps content in the expected container and classes", () => {
    const { container } = setup({ tutors: [{ id: 1 }], totalTutors: 1 });
    const wrapper = container.querySelector(".container.mt-0.fade-in");
    expect(wrapper).toBeTruthy();
  });
});