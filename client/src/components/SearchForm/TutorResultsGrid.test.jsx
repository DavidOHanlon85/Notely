import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

// Mock the sibling TutorCard so we can count/inspect usage
vi.mock("./TutorCard", () => {
  return {
    default: ({ tutor }) => (
      <div data-testid="mock-tutor-card">{tutor.tutor_first_name} {tutor.tutor_second_name}</div>
    ),
  };
});

import TutorResultsGrid from "./TutorResultsGrid";

describe("TutorResultsGrid", () => {
  // Simple sample data with the fields TutorCard would normally expect
  const tutors = [
    {
      id: 1, 
      tutor_id: 1,
      tutor_first_name: "Sarah",
      tutor_second_name: "Palmer",
    },
    {
      id: 2,
      tutor_id: 2,
      tutor_first_name: "David",
      tutor_second_name: "Lee",
    },
    {
      id: 3,
      tutor_id: 3,
      tutor_first_name: "Amira",
      tutor_second_name: "Khan",
    },
  ];

  it("returns null (renders nothing) when tutors is empty or undefined", () => {
    const { container: c1 } = render(<TutorResultsGrid tutors={[]} />);
    expect(c1.firstChild).toBeNull();

    const { container: c2 } = render(<TutorResultsGrid tutors={null} />);
    expect(c2.firstChild).toBeNull();
  });

  it("renders a grid with one TutorCard per tutor", () => {
    render(<TutorResultsGrid tutors={tutors} />);

    // container and rows exist
    expect(screen.getByText(/Sarah Palmer/i)).toBeInTheDocument();
    expect(screen.getByText(/David Lee/i)).toBeInTheDocument();
    expect(screen.getByText(/Amira Khan/i)).toBeInTheDocument();

    // count of mocked TutorCard instances
    const cards = screen.getAllByTestId("mock-tutor-card");
    expect(cards).toHaveLength(3);
  });

  it("wraps TutorCards in column elements with expected classes", () => {
    const { container } = render(<TutorResultsGrid tutors={tutors} />);

    // there should be 3 .col elements (Bootstrap grid)
    const cols = container.querySelectorAll(".row .col.fade-in");
    expect(cols.length).toBe(3);

    // outer container classes present
    const outer = container.querySelector(".container.mt-5.px-3.pb-2");
    expect(outer).toBeTruthy();

    // row has the responsive classes
    const row = container.querySelector(
      ".row.row-cols-1.row-cols-md-2.row-cols-lg-3.g-4"
    );
    expect(row).toBeTruthy();
  });
});