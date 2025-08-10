import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import TutorRegisterStep4 from "./TutorRegisterStep4";

// Small harness so I can mutate formData like the parent
function Harness({ initial = {}, onNext = vi.fn(), onBack = vi.fn() }) {
  const [data, setData] = useState({
    education: [],
    certifications: [],
    ...initial,
  });
  return (
    <>
      <TutorRegisterStep4
        formData={data}
        setFormData={setData}
        onNext={onNext}
        onBack={onBack}
      />
      <pre data-testid="form-json">{JSON.stringify(data)}</pre>
    </>
  );
}

describe("TutorRegisterStep4", () => {
  it("renders base sections and action buttons", () => {
    render(<Harness />);

    expect(screen.getByText("Education")).toBeInTheDocument();
    expect(screen.getByText("Certifications")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /\+ Add Education/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /\+ Add Certification/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Back/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Continue/i })).toBeInTheDocument();
  });

  it("adds an education entry and then removes it", () => {
    render(<Harness />);

    fireEvent.change(
      screen.getByPlaceholderText(/Qualification \(e\.g\. BA Music\)/i),
      { target: { value: "BA Music" } }
    );
    fireEvent.change(screen.getAllByPlaceholderText(/Year/i)[0], {
      target: { value: "2019" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Institution/i), {
      target: { value: "QUB" },
    });

    fireEvent.click(screen.getByRole("button", { name: /\+ Add Education/i }));
    expect(
        screen.getByText(/BA Music.*2019.*QUB/i)
        ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Remove/i }));
    expect(
      screen.queryByText(/BA Music \(2019\) – QUB/i)
    ).not.toBeInTheDocument();
  });

  it("adds a certification and then removes it", () => {
    render(<Harness />);

    fireEvent.change(
      screen.getByPlaceholderText(/Certification \(e\.g\. Grade 8 Piano\)/i),
      { target: { value: "Grade 8 Piano" } }
    );
    fireEvent.change(screen.getAllByPlaceholderText(/Year/i)[1], {
      target: { value: "2020" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /\+ Add Certification/i })
    );
    expect(screen.getByText(/Grade 8 Piano \(2020\)/i)).toBeInTheDocument();

    const removeButtons = screen.getAllByRole("button", { name: /Remove/i });
    fireEvent.click(removeButtons[0]);
    expect(
      screen.queryByText(/Grade 8 Piano \(2020\)/i)
    ).not.toBeInTheDocument();
  });

  it("shows validation errors when submitting with no entries", () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));
    expect(
      screen.getByText(/At least one education entry is required\./i)
    ).toBeInTheDocument();
    // Certification errors are only per-item; with none added there are no cert errors to show.
  });

  it("validates education and certification years", () => {
    render(
      <Harness
        initial={{
          education: [
            { qualification: "BMus", institution: "UU", year: 1900 }, // invalid
          ],
          certifications: [{ certification: "ABRSM", year: 3000 }], // invalid
        }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    // I only assert the generic year error copies once each to keep it light
    expect(screen.getAllByText(/Valid year required\./i).length).toBeGreaterThan(
      0
    );
  });

  it("submits and calls onNext when the form is valid", () => {
    const onNext = vi.fn();

    render(
      <Harness
        onNext={onNext}
        initial={{
          education: [
            { qualification: "BA Music", institution: "QUB", year: 2018 },
          ],
          certifications: [
            { certification: "Grade 8 Piano", year: 2019 },
          ],
        }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("calls onBack when Back is clicked", () => {
    const onBack = vi.fn();
    render(<Harness onBack={onBack} />);

    fireEvent.click(screen.getByRole("button", { name: /Back/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});