import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import SearchFormWrapper from "./SearchFormWrapper";

describe("SearchFormWrapper", () => {
  it("renders children", () => {
    const mockHandleSearch = vi.fn();

    render(
      <SearchFormWrapper handleSearch={mockHandleSearch}>
        <div data-testid="child">Child content</div>
      </SearchFormWrapper>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("calls handleSearch when the form is submitted via submit button", () => {
    const mockHandleSearch = vi.fn();

    render(
      <SearchFormWrapper handleSearch={mockHandleSearch}>
        {/* Any child content */}
        <button type="submit">Search</button>
      </SearchFormWrapper>
    );

    fireEvent.click(screen.getByRole("button", { name: /search/i }));
    expect(mockHandleSearch).toHaveBeenCalledTimes(1);
  });

  it("calls handleSearch when the form is submitted programmatically", () => {
    const mockHandleSearch = vi.fn();
  
    const { container } = render(
      <SearchFormWrapper handleSearch={mockHandleSearch}>
        <input placeholder="type and press enter" />
      </SearchFormWrapper>
    );
  
    const form = container.querySelector("form");
    fireEvent.submit(form);
  
    expect(mockHandleSearch).toHaveBeenCalledTimes(1);
  });
});