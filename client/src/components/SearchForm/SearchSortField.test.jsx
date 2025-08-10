import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import SearchSortField from "./SearchSortField";

// Small helper to render with sensible defaults
const setup = (override = {}) => {
  const handleChange = vi.fn();
  const formData = { sortBy: "", ...override.formData };

  const utils = render(
    <SearchSortField formData={formData} handleChange={handleChange} />
  );

  const select = screen.getByRole("combobox"); // only one combobox in this component
  return { ...utils, select, handleChange };
};

describe("SearchSortField", () => {
  it("renders the select with all expected options", () => {
    const { select } = setup();

    const options = screen.getAllByRole("option");
    const optionTexts = options.map((o) => o.textContent?.trim());
    const optionValues = options.map((o) => o.getAttribute("value"));

    expect(select).toBeInTheDocument();
    expect(optionTexts).toEqual([
      "Sort by...",
      "Price: Low to High",
      "Price: High to Low",
      "Rating: High to Low",
      "Experience: High to Low",
      "Reviews: High to Low",
    ]);
    expect(optionValues).toEqual([
      "",
      "priceLowHigh",
      "priceHighLow",
      "ratingHighLow",
      "experienceHighLow",
      "reviewsHighLow",
    ]);
  });

  it("shows the disabled placeholder when sortBy is empty", () => {
    setup({ formData: { sortBy: "" } });

    const placeholder = screen.getByRole("option", { name: /sort by\.\.\./i });
    expect(placeholder).toBeDisabled();

    // With empty sortBy, the placeholder should be selected
    const select = screen.getByRole("combobox");
    expect(select).toHaveDisplayValue("Sort by...");
  });

  it("reflects a provided sortBy value", () => {
    const { select } = setup({ formData: { sortBy: "ratingHighLow" } });
    expect(select).toHaveValue("ratingHighLow");
    expect(select).toHaveDisplayValue("Rating: High to Low");
  });

  it("calls handleChange when the selection changes", () => {
    const { select, handleChange } = setup();

    fireEvent.change(select, {
      target: { name: "sortBy", value: "priceLowHigh" },
    });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});