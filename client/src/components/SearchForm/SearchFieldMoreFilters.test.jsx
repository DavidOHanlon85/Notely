import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { vi } from "vitest";
import SearchFieldMoreFilters from "./SearchFieldMoreFilters";

describe("SearchFieldMoreFilters", () => {
  const baseFormData = {
    lessonType: "",
    qualified: "",
    sen: "",
    tutorName: "",
    gender: "",
    dbs: "",
  };

  const setup = (overrides = {}) => {
    const handleChange = vi.fn();
    const formData = { ...baseFormData, ...overrides };
    render(<SearchFieldMoreFilters formData={formData} handleChange={handleChange} />);
    return { handleChange, formData };
  };

  // Renders all fields with correct labels
  it("renders all fields and labels", () => {
    setup();

    // Labels
    expect(screen.getByLabelText(/Lesson Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Qualified Teacher/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/SEN Trained/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tutor Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tutor Gender/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/DBS Certified/i)).toBeInTheDocument();
  });

  // Selects contain expected options
  it("renders expected options for selects", () => {
    setup();

    const lessonType = screen.getByLabelText(/Lesson Type/i);
    expect(within(lessonType).getByRole("option", { name: "Any" })).toBeInTheDocument();
    expect(within(lessonType).getByRole("option", { name: "Online" })).toBeInTheDocument();
    expect(within(lessonType).getByRole("option", { name: "In-Person" })).toBeInTheDocument();
    expect(within(lessonType).getByRole("option", { name: "Hybrid" })).toBeInTheDocument();

    const qualified = screen.getByLabelText(/Qualified Teacher/i);
    expect(within(qualified).getByRole("option", { name: "Either" })).toBeInTheDocument();
    expect(within(qualified).getByRole("option", { name: "Yes" })).toBeInTheDocument();
    expect(within(qualified).getByRole("option", { name: "No" })).toBeInTheDocument();

    const sen = screen.getByLabelText(/SEN Trained/i);
    expect(within(sen).getByRole("option", { name: "Either" })).toBeInTheDocument();
    expect(within(sen).getByRole("option", { name: "Yes" })).toBeInTheDocument();
    expect(within(sen).getByRole("option", { name: "No" })).toBeInTheDocument();

    const gender = screen.getByLabelText(/Tutor Gender/i);
    expect(within(gender).getByRole("option", { name: "Any" })).toBeInTheDocument();
    expect(within(gender).getByRole("option", { name: "Female" })).toBeInTheDocument();
    expect(within(gender).getByRole("option", { name: "Male" })).toBeInTheDocument();

    const dbs = screen.getByLabelText(/DBS Certified/i);
    expect(within(dbs).getByRole("option", { name: "Either" })).toBeInTheDocument();
    expect(within(dbs).getByRole("option", { name: "Yes" })).toBeInTheDocument();
    expect(within(dbs).getByRole("option", { name: "No" })).toBeInTheDocument();
  });

  // Controlled values show up correctly
  it("reflects controlled values from formData", () => {
    setup({
      lessonType: "Online",
      qualified: "1",
      sen: "0",
      tutorName: "Sarah Palmer",
      gender: "0",
      dbs: "1",
    });

    expect(screen.getByLabelText(/Lesson Type/i)).toHaveValue("Online");
    expect(screen.getByLabelText(/Qualified Teacher/i)).toHaveValue("1");
    expect(screen.getByLabelText(/SEN Trained/i)).toHaveValue("0");
    expect(screen.getByLabelText(/Tutor Name/i)).toHaveValue("Sarah Palmer");
    expect(screen.getByLabelText(/Tutor Gender/i)).toHaveValue("0");
    expect(screen.getByLabelText(/DBS Certified/i)).toHaveValue("1");
  });

  // Calls handleChange for selects and text input
  it("calls handleChange when fields are updated", () => {
    const { handleChange } = setup();

    fireEvent.change(screen.getByLabelText(/Lesson Type/i), {
      target: { name: "lessonType", value: "Hybrid" },
    });
    fireEvent.change(screen.getByLabelText(/Qualified Teacher/i), {
      target: { name: "qualified", value: "1" },
    });
    fireEvent.change(screen.getByLabelText(/SEN Trained/i), {
      target: { name: "sen", value: "0" },
    });
    fireEvent.change(screen.getByLabelText(/Tutor Name/i), {
      target: { name: "tutorName", value: "John" },
    });
    fireEvent.change(screen.getByLabelText(/Tutor Gender/i), {
      target: { name: "gender", value: "1" },
    });
    fireEvent.change(screen.getByLabelText(/DBS Certified/i), {
      target: { name: "dbs", value: "1" },
    });

    expect(handleChange).toHaveBeenCalledTimes(6);
  });

  // Placeholder text is correct
  it("shows expected placeholder for tutor name", () => {
    setup();
    expect(screen.getByPlaceholderText(/e\.g\. Sarah Palmer/i)).toBeInTheDocument();
  });
});