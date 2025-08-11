import { describe, it, beforeEach, vi, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
import StudentForgotPasswordPage from "./StudentForgotPasswordPage";

vi.mock("axios");

const renderPage = () =>
  render(
    <MemoryRouter>
      <StudentForgotPasswordPage />
    </MemoryRouter>
  );

describe("StudentForgotPasswordPage (lean)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows required error, then submits successfully, then shows server error", async () => {
    renderPage();

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const submitBtn = screen.getByRole("button", { name: /send reset link/i });

    // Required
    await userEvent.clear(emailInput);
    await userEvent.click(submitBtn);
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();

    // Success
    axios.post.mockResolvedValueOnce({
      data: { status: "success", message: "Reset link sent to your email." },
    });
    await userEvent.type(emailInput, "test@example.com");
    await userEvent.click(submitBtn);

    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:3002/api/student/forgot-password",
      { email: "test@example.com" },
      { withCredentials: true }
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /reset link sent to your email/i
    );

    // Error (same render)
    axios.post.mockRejectedValueOnce({
      response: { data: { message: "No account found for that email." } },
    });
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, "nouser@example.com");
    await userEvent.click(submitBtn);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /no account found for that email/i
    );
  });
});