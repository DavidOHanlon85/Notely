import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import Pagination from "./Pagination";

describe("Pagination", () => {
  const setup = (props = {}) => {
    const defaultProps = {
      currentPage: 1,
      totalTutors: 25,
      resultsPerPage: 10,
      setCurrentPage: vi.fn(),
    };
    const allProps = { ...defaultProps, ...props };
    const utils = render(<Pagination {...allProps} />);
    return { ...utils, props: allProps };
  };

  // Renders nothing when one or fewer pages are needed
  it("returns null when total pages <= 1", () => {
    const { container: c1 } = setup({ totalTutors: 0, resultsPerPage: 10 }); // 0 pages => null
    expect(c1.firstChild).toBeNull();

    const { container: c2 } = setup({ totalTutors: 10, resultsPerPage: 10 }); // 1 page => null
    expect(c2.firstChild).toBeNull();
  });

  // Renders correct number of dots
  it("renders the correct number of dots", () => {
    // 25 tutors @ 10 per page => 3 pages (ceil)
    setup({ totalTutors: 25, resultsPerPage: 10 });
    const dots = screen.getAllByRole("button").filter(btn =>
      btn.className.includes("notely-dot")
    );
    expect(dots.length).toBe(3);
  });

  // Highlights the active page dot
  it("marks the current page as active", () => {
    setup({ currentPage: 2, totalTutors: 25, resultsPerPage: 10 });
    const dots = screen.getAllByRole("button").filter(btn =>
      btn.className.includes("notely-dot")
    );
    // Dot index 1 corresponds to page 2
    expect(dots[1].className).toContain("active");
  });

  // Shows Previous only when currentPage > 1
  it("shows Previous arrow only when not on the first page", () => {
    const { rerender, props } = setup({ currentPage: 1 });
    // Only dots present on page 1
    let arrows = screen.queryAllByRole("button").filter(btn =>
      btn.className.includes("notely-arrow-btn")
    );
    expect(arrows.length).toBe(1);

    rerender(<Pagination {...props} currentPage={2} />);
    arrows = screen.queryAllByRole("button").filter(btn =>
      btn.className.includes("notely-arrow-btn")
    );
    // On page 2 both Prev and Next should render (given >2 pages)
    expect(arrows.length).toBe(2);
  });

  // Shows Next only when currentPage < totalPages
  it("shows Next arrow only when not on the last page", () => {
    // 3 pages total here
    const { rerender, props } = setup({ currentPage: 3, totalTutors: 25, resultsPerPage: 10 });
    let arrows = screen.queryAllByRole("button").filter(btn =>
      btn.className.includes("notely-arrow-btn")
    );
    // On last page only Prev should be visible
    expect(arrows.length).toBe(1);

    rerender(<Pagination {...props} currentPage={2} />);
    arrows = screen.queryAllByRole("button").filter(btn =>
      btn.className.includes("notely-arrow-btn")
    );
    // On a middle page both arrows are visible
    expect(arrows.length).toBe(2);
  });

  // Clicking a dot navigates to that page
  it("invokes setCurrentPage with the clicked dot index", () => {
    const setCurrentPage = vi.fn();
    setup({ totalTutors: 25, resultsPerPage: 10, setCurrentPage });
    const dots = screen.getAllByRole("button").filter(btn =>
      btn.className.includes("notely-dot")
    );
    // Click third dot (page 3)
    fireEvent.click(dots[2]);
    expect(setCurrentPage).toHaveBeenCalledWith(3);
  });

  // Clicking arrows navigates correctly
  it("handles Previous and Next arrow clicks", () => {
    const setCurrentPage = vi.fn();
    // Start at page 2 of 3
    setup({ currentPage: 2, totalTutors: 25, resultsPerPage: 10, setCurrentPage });

    const arrows = screen.getAllByRole("button").filter(btn =>
      btn.className.includes("notely-arrow-btn")
    );

    // arrows[0] = Prev, arrows[1] = Next
    fireEvent.click(arrows[0]);
    expect(setCurrentPage).toHaveBeenCalledWith(1);

    fireEvent.click(arrows[1]);
    expect(setCurrentPage).toHaveBeenCalledWith(3);
  });
});