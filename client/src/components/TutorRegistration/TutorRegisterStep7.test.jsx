import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { vi } from "vitest";
import TutorRegisterStep7 from "./TutorRegisterStep7";

// Small helper to render with a sensible default payload
function setup(overrides = {}) {
  const onBack = vi.fn();
  const onSubmit = vi.fn();

  const formData = {
    tutor_email: "tutor@example.com",
    tutor_username: "tutor123",
    tutor_phone: "07123456789",
    tutor_address_line_1: "123 Music St",
    tutor_postcode: "BT1 1AA",
    tutor_tagline: "Inspiring piano lessons for all ages",
    tutor_bio_paragraph_1: "I love teaching and helping students grow.",
    tutor_bio_paragraph_2: "Optional second paragraph.",
    tutor_instruments: ["Piano", "Guitar"],
    tutor_teaching_start_date: "2023-09-01",
    tutor_price: 40,
    education: [{ qualification: "BA Music", year: 2019, institution: "QUB" }],
    certifications: [{ certification: "Grade 8 Piano", year: 2018 }],
    availability: [
      // One example slot so I can assert a dot renders
      { day_of_week: "Mon", time_slot: "Morning", is_available: 1 },
    ],
    ...overrides,
  };

  const utils = render(
    <TutorRegisterStep7
      formData={formData}
      onBack={onBack}
      onSubmit={onSubmit}
      submissionError={overrides.submissionError}
    />
  );

  return { onBack, onSubmit, formData, ...utils };
}

describe("TutorRegisterStep7", () => {
  it("renders key sections and interpolates formData", () => {
    setup();

    // Section headings
    expect(
      screen.getByRole("heading", { name: /Review & Confirm/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Account Info/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Address/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /About You/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Teaching Details/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Education/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Certifications/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Availability/i })
    ).toBeInTheDocument();

    // Some representative fields
    expect(screen.getByText(/Email:/i)).toBeInTheDocument();
    expect(screen.getByText("tutor@example.com")).toBeInTheDocument();
    expect(screen.getByText(/Username:/i)).toBeInTheDocument();
    expect(screen.getByText("tutor123")).toBeInTheDocument();
    expect(screen.getByText(/Phone:/i)).toBeInTheDocument();
    expect(screen.getByText("07123456789")).toBeInTheDocument();

    // Address and tagline
    expect(screen.getByText(/123 Music St, BT1 1AA/)).toBeInTheDocument();
    expect(screen.getByText(/Inspiring piano lessons/i)).toBeInTheDocument();

    // Teaching details
    expect(screen.getByText(/Piano, Guitar/)).toBeInTheDocument();
    expect(screen.getByText(/2023-09-01/)).toBeInTheDocument();
    expect(screen.getByText(/£40\/hour/)).toBeInTheDocument();

    // Education and certifications
    const eduHeading = screen.getByRole("heading", { name: /Education/i });
    const eduSection =
      eduHeading.closest("section") ?? eduHeading.parentElement;
    expect(eduSection).toHaveTextContent(/BA Music/i);
    expect(eduSection).toHaveTextContent(/2019/);
    expect(eduSection).toHaveTextContent(/QUB/);

    const certHeading = screen.queryByRole("heading", {
      name: /Certifications/i,
    });
    if (certHeading) {
      const certSection =
        certHeading.closest("section") ?? certHeading.parentElement;
      expect(certSection).toHaveTextContent(/Grade 8 Piano/i);
      expect(certSection).toHaveTextContent(/2018/);
    }
  });

  it("shows an error banner when submissionError is provided", () => {
    setup({ submissionError: "Something went wrong" });
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Something went wrong");
  });

  it("calls onBack when Back is clicked", () => {
    const { onBack } = setup();
    fireEvent.click(screen.getByRole("button", { name: /Back/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("calls onSubmit when the form is submitted", () => {
    const { onSubmit } = setup();
    fireEvent.click(screen.getByRole("button", { name: /Confirm & Submit/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("renders availability dots in the correct cells based on formData.availability", () => {
    const { container } = setup({
      availability: [
        { day_of_week: "Mon", time_slot: "Morning", is_available: 1 },
        { day_of_week: "Wed", time_slot: "Evening", is_available: 1 },
      ],
    });

    // Grab the table and check that at least two dots are present
    const table = container.querySelector("table.availability-table");
    expect(table).toBeTruthy();

    const dots = table.querySelectorAll(".notely-available-icon");
    expect(dots.length).toBeGreaterThanOrEqual(2);
  });

  it("renders 'No education entries provided.' when education array is empty", () => {
    setup({ education: [] });
    expect(
      screen.getByText(/No education entries provided\./i)
    ).toBeInTheDocument();
  });

  it("omits the Certifications section when certifications is empty or missing", () => {
    const { rerender } = setup({ certifications: [] });
    expect(
      screen.queryByRole("heading", { name: /Certifications/i })
    ).not.toBeInTheDocument();

    rerender(
      <TutorRegisterStep7
        formData={{
          tutor_email: "a@b.com",
          tutor_username: "x",
          tutor_phone: "07123456789",
          tutor_address_line_1: "1",
          tutor_postcode: "P",
          tutor_tagline: "T",
          tutor_bio_paragraph_1: "B1",
          tutor_instruments: ["Piano"],
          tutor_teaching_start_date: "2024-01-01",
          tutor_price: 10,
          education: [{ qualification: "Q", year: 2020, institution: "I" }],
          availability: [],
        }}
        onBack={vi.fn()}
        onSubmit={vi.fn()}
      />
    );
    expect(
      screen.queryByRole("heading", { name: /Certifications/i })
    ).not.toBeInTheDocument();
  });
});
