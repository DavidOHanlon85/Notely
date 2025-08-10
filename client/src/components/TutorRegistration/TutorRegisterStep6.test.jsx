import React, { useState } from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { vi } from "vitest";
import TutorRegisterStep6 from "./TutorRegisterStep6";

/**
 * Simple harness so I can mutate formData (like the parent would)
 * and read it back to assert results without changing the component.
 */
function Harness({ initial = {}, onNext = vi.fn(), onBack = vi.fn() }) {
  const [data, setData] = useState({
    availability: [], // default empty
    ...initial,
  });

  return (
    <>
      <TutorRegisterStep6
        formData={data}
        setFormData={setData}
        onNext={onNext}
        onBack={onBack}
      />
      {/* Let me inspect availability after submit */}
      <pre data-testid="availability-json">
        {JSON.stringify(data.availability || [])}
      </pre>
    </>
  );
}

describe("TutorRegisterStep6", () => {
  it("renders the availability grid with expected day and slot headers", () => {
    render(<Harness />);

    // Day headers
    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach((day) => {
      expect(screen.getByRole("columnheader", { name: day })).toBeInTheDocument();
    });

    // Slot labels (left-most column in tbody)
    ["Morning", "Afternoon", "After School", "Evening"].forEach((slot) => {
      expect(screen.getByText(slot)).toBeInTheDocument();
    });
  });

  it("toggles a cell selection when clicked (adds/removes selected class)", () => {
    render(<Harness />);

    // Grab the "Morning" row
    const morningRow = screen.getByText("Morning").closest("tr");
    const cells = within(morningRow).getAllByRole("cell");
    // cells[0] = the label cell, cells[1] = Mon cell (first clickable)
    const monCell = cells[1];

    // Initially unselected
    let icon = monCell.querySelector("span.notely-available-icon");
    expect(icon).toBeInTheDocument();
    expect(icon.className).toMatch(/unselected/);

    // Click to select
    fireEvent.click(monCell);
    icon = monCell.querySelector("span.notely-available-icon");
    expect(icon.className).toMatch(/selected/);

    // Click again to unselect
    fireEvent.click(monCell);
    icon = monCell.querySelector("span.notely-available-icon");
    expect(icon.className).toMatch(/unselected/);
  });

  it("shows an error if Finish is clicked with no slots selected", () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: /Finish/i }));
    expect(
      screen.getByText(/Please select at least one availability slot\./i)
    ).toBeInTheDocument();
  });

  it("submits when at least one slot is selected, updates formData, and calls onNext", () => {
    const onNext = vi.fn();
    render(<Harness onNext={onNext} />);

    // Select Morning/Mon and Evening/Fri to prove multiple entries
    const getClickableCell = (slotLabel, dayIndex /* Mon=0 ... Sun=6 */) => {
      const row = screen.getByText(slotLabel).closest("tr");
      const cells = within(row).getAllByRole("cell");
      // index 0 is the label cell; index 1..7 are Mon..Sun respectively
      return cells[1 + dayIndex];
    };

    fireEvent.click(getClickableCell("Morning", 0)); // Mon / Morning
    fireEvent.click(getClickableCell("Evening", 4)); // Fri / Evening

    fireEvent.click(screen.getByRole("button", { name: /Finish/i }));

    // onNext called
    expect(onNext).toHaveBeenCalledTimes(1);

    // formData.availability populated with chosen slots
    const availability = JSON.parse(
      screen.getByTestId("availability-json").textContent
    );
    // Expect two entries (day_of_week/time_slot pairs)
    expect(availability.length).toBe(2);

    // Check the shape of what we store (order isn't critical, so I just assert any match)
    const hasMorningMon = availability.some(
      (a) => a.day_of_week === "Mon" && a.time_slot === "Morning" && a.is_available === 1
    );
    const hasEveningFri = availability.some(
      (a) => a.day_of_week === "Fri" && a.time_slot === "Evening" && a.is_available === 1
    );
    expect(hasMorningMon).toBe(true);
    expect(hasEveningFri).toBe(true);
  });

  it("restores initial availability from formData when provided", () => {
    // Preload one slot so we can assert it's shown as selected on render
    const initial = {
      availability: [
        { day_of_week: "Wed", time_slot: "Afternoon", is_available: 1 },
      ],
    };

    render(<Harness initial={initial} />);

    const afternoonRow = screen.getByText("Afternoon").closest("tr");
    const cells = within(afternoonRow).getAllByRole("cell");
    // Wed is the 3rd day => index 1 (Mon) + 2 (Tue) + 1 = 3
    const wedCell = cells[1 + 2]; // label at 0, Mon=1, Tue=2, Wed=3
    const icon = wedCell.querySelector("span.notely-available-icon");
    expect(icon.className).toMatch(/selected/);
  });
});