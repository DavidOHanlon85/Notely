import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import SearchFieldTopRow from "./SearchFieldTopRow";

/**
 * Helper to render the component with minimal boilerplate.
 * We keep selectors tied to name/placeholder so we don't need label associations.
 */
const setup = (overrideProps = {}) => {
  const handleChange = vi.fn();

  const props = {
    formData: {
      instrument: "",
      level: "",
      price: "",
      city: "",
    },
    formErrors: {},
    instrumentOptions: ["Piano", "Guitar", "Violin"],
    cityOptions: ["Belfast", "Dublin", "Glasgow"],
    handleChange,
    hasSearched: false,
    ...overrideProps,
  };

  const utils = render(<SearchFieldTopRow {...props} />);
  return { ...utils, props, handleChange };
};

/**
 * Utility: find a select element by its "name" attribute.
 * This avoids brittle index-based getAllByRole usage.
 */
const getSelectByName = (name) => {
  const selects = screen.getAllByRole("combobox");
  const match = selects.find((el) => el.getAttribute("name") === name);
  if (!match) {
    throw new Error(`Select with name="${name}" not found`);
  }
  return match;
};

describe("SearchFieldTopRow", () => {
  it("renders instrument datalist and city datalist options", () => {
    setup();

    // Instrument input uses placeholder, not an associated label.
    const instrumentInput = screen.getByPlaceholderText(/e\.g\. Piano/i);
    expect(instrumentInput).toBeInTheDocument();

    // City input uses placeholder as well.
    const cityInput = screen.getByPlaceholderText(/e\.g\. Belfast/i);
    expect(cityInput).toBeInTheDocument();

    // The datalist itself is not directly queryable via roles;
    // we assert the input exists and let other tests cover change events.
  });

  it("calls handleChange when user updates fields", () => {
    const { handleChange } = setup();

    // Instrument (text input with datalist)
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Piano/i), {
      target: { name: "instrument", value: "Piano" },
    });

    // Level (select)
    fireEvent.change(getSelectByName("level"), {
      target: { name: "level", value: "beginner" },
    });

    // Max Price (select)
    fireEvent.change(getSelectByName("price"), {
      target: { name: "price", value: "60" },
    });

    // City (text input with datalist)
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Belfast/i), {
      target: { name: "city", value: "Belfast" },
    });

    expect(handleChange).toHaveBeenCalledTimes(4);
  });

  it("renders expected options for level and max price", () => {
    setup();

    const level = getSelectByName("level");
    const levelValues = Array.from(level.querySelectorAll("option")).map(
      (o) => o.value
    );
    expect(levelValues).toEqual(["", "beginner", "intermediate", "advanced"]);

    const price = getSelectByName("price");
    const priceValues = Array.from(price.querySelectorAll("option")).map(
      (o) => o.value
    );
    expect(priceValues).toEqual([
      "",
      "20",
      "30",
      "40",
      "50",
      "60",
      "70",
      "80",
      "90",
      "100",
    ]);
  });

  it("applies error class to instrument when formErrors.instrument is present", () => {
    setup({ formErrors: { instrument: "Required" } });

    const instrumentInput = screen.getByPlaceholderText(/e\.g\. Piano/i);
    expect(instrumentInput.className).toMatch(/is-invalid/);
  });

  it("applies error class to city only when hasSearched and formErrors.city are present", () => {
    // Not searched yet => no invalid class
    setup({ formErrors: { city: "Invalid" }, hasSearched: false });
    const cityInput1 = screen.getByPlaceholderText(/e\.g\. Belfast/i);
    expect(cityInput1.className).not.toMatch(/is-invalid/);

    // Now with hasSearched => should add invalid class
    render(
      <SearchFieldTopRow
        formData={{ instrument: "", level: "", price: "", city: "" }}
        formErrors={{ city: "Invalid" }}
        instrumentOptions={["Piano"]}
        cityOptions={["Belfast"]}
        handleChange={vi.fn()}
        hasSearched
      />
    );
    const cityInput2 = screen.getAllByPlaceholderText(/e\.g\. Belfast/i)[1];
    expect(cityInput2.className).toMatch(/is-invalid/);
  });
});