import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import axios from "axios";

// Mock axios
vi.mock("axios");

// Mock react-router-dom: keep real stuff, stub useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (orig) => {
  const actual = await orig();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import TutorLoginPage from "./TutorLoginPage";

const renderPage = () =>
  render(
    <MemoryRouter>
      <TutorLoginPage />
    </MemoryRouter>
  );

describe("TutorLoginPage (lean)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows client validation errors when fields are empty", async () => {
    renderPage();

    const submitBtn = screen.getByRole("button", { name: /log in/i });
    await userEvent.click(submitBtn);

    expect(
      await screen.findByText(/email or username is required/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });

  it("logs in successfully and navigates to dashboard", async () => {
    renderPage();

    axios.post.mockResolvedValueOnce({
      data: { status: "success", tutor_id: 42 },
    });

    await userEvent.type(
      screen.getByPlaceholderText(/email or username/i),
      "tutor@example.com"
    );
    await userEvent.type(
      screen.getByPlaceholderText(/password/i),
      "CorrectHorseBatteryStaple1!"
    );
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));

    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:3002/api/tutor/login",
      {
        identifier: "tutor@example.com",
        password: "CorrectHorseBatteryStaple1!",
        rememberMe: false,
      },
      { withCredentials: true }
    );
    expect(mockNavigate).toHaveBeenCalledWith("/tutor/dashboard");
  });

  it("shows server message on API error", async () => {
    renderPage();

    axios.post.mockRejectedValueOnce({
      response: { data: { message: "Invalid credentials." } },
    });

    await userEvent.type(
      screen.getByPlaceholderText(/email or username/i),
      "tutor@example.com"
    );
    await userEvent.type(screen.getByPlaceholderText(/password/i), "wrong");
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });
});
