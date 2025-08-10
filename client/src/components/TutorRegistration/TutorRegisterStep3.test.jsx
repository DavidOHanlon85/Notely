import React, { useState } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import TutorRegisterStep3 from "./TutorRegisterStep3";

// Mock axios.get for instruments API
vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
  },
}));
import axios from "axios";

// Silence and assert window.alert where needed
const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

// Simple harness so I can mutate formData like the parent and assert it
function Harness({ initial = {}, onNext = vi.fn(), onBack = vi.fn() }) {
  const [data, setData] = useState({
    tutor_instruments: [],
    tutor_level: [],
    tutor_teaching_start_date: "",
    tutor_dbs: "",
    tutor_qualified: "",
    tutor_sen: "",
    tutor_gender: "",
    tutor_modality: "",
    tutor_price: "",
    ...initial,
  });

  return (
    <>
      <TutorRegisterStep3
        formData={data}
        setFormData={setData}
        onNext={onNext}
        onBack={onBack}
      />
      <pre data-testid="form-json">{JSON.stringify(data)}</pre>
    </>
  );
}

describe("TutorRegisterStep3", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValueOnce({
      data: {
        instruments: [
          { instrument: "Piano" },
          { instrument: "Guitar" },
          { instrument: "Violin" },
          { instrument: "Drums" },
        ],
      },
    });
  });

  it("renders instrument dropdown, loads options from API, and enforces max 3 selections", async () => {
    render(<Harness />);

    // Wait until the dropdown options are populated from the API
    const selects = await screen.findAllByRole("combobox");
    // Instrument dropdown is the first select rendered in the form
    const instrumentSelect = selects[0];

    // Select 3 instruments in a row
    fireEvent.change(instrumentSelect, { target: { value: "Piano" } });
    fireEvent.change(instrumentSelect, { target: { value: "Guitar" } });
    fireEvent.change(instrumentSelect, { target: { value: "Violin" } });

    // I expect badges for the 3 selected instruments
    expect(screen.getByText("Piano")).toBeInTheDocument();
    expect(screen.getByText("Guitar")).toBeInTheDocument();
    expect(screen.getByText("Violin")).toBeInTheDocument();

    // Try to add a 4th instrument -> should trigger alert
    fireEvent.change(instrumentSelect, { target: { value: "Drums" } });
    expect(alertSpy).toHaveBeenCalledTimes(1);
  });

  it("allows toggling levels via checkboxes and reflects changes in formData", async () => {
    render(<Harness />);

    // The three level checkboxes have these labels
    const beginner = await screen.findByLabelText("Beginner");
    const intermediate = screen.getByLabelText("Intermediate");

    fireEvent.click(beginner);
    fireEvent.click(intermediate);

    // Check the stored JSON for tutor_level
    const json = screen.getByTestId("form-json").textContent;
    expect(json).toMatch(/"tutor_level":\["0","1"\]/);
  });

  it("shows validation messages when required fields are missing on submit", async () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    // I only check a representative set to keep this light
    expect(
      await screen.findByText("At least one instrument required.")
    ).toBeInTheDocument();
    expect(screen.getByText("At least one level required.")).toBeInTheDocument();
    expect(screen.getByText("Start date is required.")).toBeInTheDocument();
    expect(screen.getByText("Please indicate if DBS checked.")).toBeInTheDocument();
    expect(
      screen.getByText("Please indicate if you're a qualified teacher.")
    ).toBeInTheDocument();
    expect(screen.getByText("Please indicate SEN experience.")).toBeInTheDocument();
    expect(screen.getByText("Please select your gender.")).toBeInTheDocument();
    expect(screen.getByText("Please select lesson type.")).toBeInTheDocument();
    expect(screen.getByText("Price is required.")).toBeInTheDocument();
  });

  it("submits and calls onNext when the form is valid", async () => {
    const onNext = vi.fn();

    // Provide a complete valid initial state so I don't have to click through every control
    render(
      <Harness
        onNext={onNext}
        initial={{
          tutor_instruments: ["Piano"],
          tutor_level: ["0", "1"],
          tutor_teaching_start_date: "2024-01-01",
          tutor_dbs: 1,
          tutor_qualified: 1,
          tutor_sen: 0,
          tutor_gender: 0,
          tutor_modality: "Online",
          tutor_price: 40,
        }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));
    await waitFor(() => expect(onNext).toHaveBeenCalledTimes(1));
  });

  it("shows take-home and fee breakdown when a price is set", async () => {
    render(
      <Harness
        initial={{
          tutor_price: 50,
        }}
      />
    );

    // I expect the computed text to appear once price is present
    await waitFor(() => {
      expect(
        screen.getByText(/Tutor Take Home \(80%\): £40\.00 \|\| Notely Fee \(20%\): £10\.00/)
      ).toBeInTheDocument();
    });
  });
});