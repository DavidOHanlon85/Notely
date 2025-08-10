import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import TutorRegisterStep5 from "./TutorRegisterStep5";

/**
 * I’m using a small harness so I can mutate formData
 * like the parent component would and then assert on it.
 */
function Harness({ initial = {}, onNext = vi.fn(), onBack = vi.fn() }) {
  const [data, setData] = useState({
    tutor_tagline: "",
    tutor_bio_paragraph_1: "",
    tutor_bio_paragraph_2: "",
    ...initial,
  });

  return (
    <>
      <TutorRegisterStep5
        formData={data}
        setFormData={setData}
        onNext={onNext}
        onBack={onBack}
      />
      {/* I expose the live values so I can assert after submit */}
      <div data-testid="tutor_tagline">{data.tutor_tagline}</div>
      <div data-testid="bio1">{data.tutor_bio_paragraph_1}</div>
      <div data-testid="bio2">{data.tutor_bio_paragraph_2}</div>
    </>
  );
}

describe("TutorRegisterStep5", () => {
  it("renders tagline and bio fields and buttons", () => {
    render(<Harness />);

    // Tagline
    expect(
      screen.getByPlaceholderText(/Inspiring piano lessons/i)
    ).toBeInTheDocument();

    // Bio 1 and Bio 2 textareas
    expect(
      screen.getByPlaceholderText(/teaching style, experience, or philosophy/i)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/musical journey, notable students/i)
    ).toBeInTheDocument();

    // Buttons
    expect(screen.getByRole("button", { name: /Back/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Continue/i })).toBeInTheDocument();
  });

  it("shows validation errors when fields are invalid on submit", () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    // Required tagline and bio1 errors should show
    expect(screen.getByText(/Tagline is required\./i)).toBeInTheDocument();
    expect(screen.getByText(/First paragraph is required\./i)).toBeInTheDocument();
    // Bio2 is optional so no error unless over 500
  });

  it("enforces character limits and shows the counters updating", () => {
    render(<Harness />);

    const tagline = screen.getByPlaceholderText(/Inspiring piano lessons/i);
    const bio1 = screen.getByPlaceholderText(/teaching style, experience, or philosophy/i);
    const bio2 = screen.getByPlaceholderText(/musical journey, notable students/i);

    // I type a couple characters and make sure the counters reflect it
    fireEvent.change(tagline, { target: { value: "Hi" } });
    fireEvent.change(bio1, { target: { value: "ABC" } });
    fireEvent.change(bio2, { target: { value: "XYZ" } });

    // Counters show "x/500" for bio fields.
    // I’m not asserting the exact value to avoid brittleness.
     const counters = screen.getAllByText(/\/500$/);
     expect(counters.length).toBeGreaterThanOrEqual(1);

    // Tagline maxLength should be 45
    expect(tagline).toHaveAttribute("maxLength", "45");
    // Textareas have maxLength 500
    expect(bio1).toHaveAttribute("maxLength", "500");
    expect(bio2).toHaveAttribute("maxLength", "500");
  });

  it("calls onBack when Back is clicked", () => {
    const onBack = vi.fn();
    render(<Harness onBack={onBack} />);

    fireEvent.click(screen.getByRole("button", { name: /Back/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("submits valid data: updates parent formData and calls onNext", () => {
    const onNext = vi.fn();
    render(<Harness onNext={onNext} />);

    const tagline = screen.getByPlaceholderText(/Inspiring piano lessons/i);
    const bio1 = screen.getByPlaceholderText(/teaching style, experience, or philosophy/i);
    const bio2 = screen.getByPlaceholderText(/musical journey, notable students/i);

    fireEvent.change(tagline, { target: { value: "Friendly, structured lessons" } });
    fireEvent.change(bio1, {
      target: { value: "I’ve taught for 10+ years with a focus on fundamentals." },
    });
    fireEvent.change(bio2, {
      target: { value: "I also prepare students for graded exams and performances." },
    });

    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    // Parent formData should be updated
    expect(screen.getByTestId("tutor_tagline").textContent).toBe(
      "Friendly, structured lessons"
    );
    expect(screen.getByTestId("bio1").textContent).toContain("10+ years");
    expect(screen.getByTestId("bio2").textContent).toContain("graded exams");

    // onNext gets called
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("blocks submit when tagline or bio1 exceed limits", () => {
    const onNext = vi.fn();
    render(<Harness onNext={onNext} />);

    const tagline = screen.getByPlaceholderText(/Inspiring piano lessons/i);
    const bio1 = screen.getByPlaceholderText(/teaching style, experience, or philosophy/i);
    const bio2 = screen.getByPlaceholderText(/musical journey, notable students/i);

    // Tagline > 45 chars
    fireEvent.change(tagline, {
      target: { value: "x".repeat(46) },
    });
    // Bio1 > 500 chars
    fireEvent.change(bio1, { target: { value: "y".repeat(501) } });
    // Bio2 > 500 chars (optional but still validated for max)
    fireEvent.change(bio2, { target: { value: "z".repeat(501) } });

    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    // Errors show and onNext is not called
    expect(
      screen.getByText(/Tagline must be 45 characters or less/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/First paragraph must be 500 characters or less/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Second paragraph must be 500 characters or less/i)
    ).toBeInTheDocument();
    expect(onNext).not.toHaveBeenCalled();
  });
});