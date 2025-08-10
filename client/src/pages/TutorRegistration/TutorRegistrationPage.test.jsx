// pages/TutorRegistration/TutorRegistrationPage.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { vi } from "vitest";

// Hoisted helpers (safe for vi.mock) 
function mkStep(n) {
  return {
    default: ({ onNext, onBack, submissionError }) => (
      <div>
        {submissionError && <div role="alert">{submissionError}</div>}
        {onBack && <button onClick={onBack}>Back</button>}
        <button onClick={() => onNext({ step: n })}>Next {n}</button>
      </div>
    ),
  };
}

// Mocks
vi.mock("axios", () => ({ default: { post: vi.fn() } }));
import axios from "axios";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../../components/TutorRegistration/TutorRegisterStep1", () => mkStep(1));
vi.mock("../../components/TutorRegistration/TutorRegisterStep2", () => mkStep(2));
vi.mock("../../components/TutorRegistration/TutorRegisterStep3", () => mkStep(3));
vi.mock("../../components/TutorRegistration/TutorRegisterStep4", () => mkStep(4));
vi.mock("../../components/TutorRegistration/TutorRegisterStep5", () => mkStep(5));
vi.mock("../../components/TutorRegistration/TutorRegisterStep6", () => mkStep(6));

vi.mock("../../components/TutorRegistration/TutorRegisterStep7", () => ({
  default: ({ onSubmit, onBack, submissionError }) => (
    <div>
      {submissionError && <div role="alert">{submissionError}</div>}
      <button onClick={onBack}>Back</button>
      {/* visual button (ignored) */}
      <button>Confirm & Submit</button>
      {/* hidden button triggers the real submit to avoid duplicate label conflicts */}
      <button aria-label="real-submit" onClick={onSubmit} style={{ display: "none" }} />
    </div>
  ),
}));

import TutorRegistrationPage from "./TutorRegistrationPage";

// Small helper to advance to step 7
function goToStep7() {
  for (let i = 1; i <= 6; i++) {
    fireEvent.click(screen.getByRole("button", { name: new RegExp(`Next ${i}`, "i") }));
  }
  expect(screen.getByText(/Confirm Your Details/i)).toBeInTheDocument();
}

describe("TutorRegistrationPage (integration, light)", () => {
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("success path: walks steps and navigates to /tutor/login?success=true", async () => {
    axios.post.mockResolvedValueOnce({ data: { ok: true } });

    render(<TutorRegistrationPage />);

    // sanity check first title
    expect(screen.getByText(/Create Your Tutor Account/i)).toBeInTheDocument();

    goToStep7();

    // trigger real submit
    fireEvent.click(screen.getByLabelText("real-submit"));

    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:3002/api/tutor/register",
        expect.any(Object)
      )
    );
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/tutor/login?success=true")
    );
  });

  it("error path: shows backend error message on submit failure", async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { errors: ["Email invalid.", "Username taken."] } },
    });

    render(<TutorRegistrationPage />);

    goToStep7();

    fireEvent.click(screen.getByLabelText("real-submit"));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /Email invalid\.\s*Username taken\./i
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});