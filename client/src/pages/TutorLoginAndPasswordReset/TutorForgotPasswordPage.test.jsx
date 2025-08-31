import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";

vi.mock("axios");
import TutorForgotPasswordPage from "./TutorForgotPasswordPage";

const renderPage = () =>
  render(
    <MemoryRouter>
      <TutorForgotPasswordPage />
    </MemoryRouter>
  );

describe("TutorForgotPasswordPage (lean)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows required error, then submits and shows success", async () => {
    renderPage();

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const submitBtn = screen.getByRole("button", { name: /send reset link/i });

    // Required error
    await userEvent.click(submitBtn);
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();

    // Success path
    axios.post.mockResolvedValueOnce({
      data: { status: "success", message: "Reset email sent!" },
    });

    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, "tutor@example.com");
    await userEvent.click(submitBtn);

    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:3002/api/tutor/forgot-password",
      { email: "tutor@example.com" },
      { withCredentials: true }
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(/reset email sent/i);
  });

  it("shows server error when API rejects", async () => {
    renderPage();

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const submitBtn = screen.getByRole("button", { name: /send reset link/i });

    axios.post.mockRejectedValueOnce({
      response: { data: { message: "No tutor account found." } },
    });

    await userEvent.type(emailInput, "tutor@example.com");
    await userEvent.click(submitBtn);

    expect(await screen.findByRole("alert")).toHaveTextContent(/no tutor account found/i);
  });
});