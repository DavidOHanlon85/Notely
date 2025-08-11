import { describe, it, beforeEach, vi, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
import StudentRegistrationPage from "./StudentRegistrationPage";

vi.mock("axios");

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (orig) => {
  const actual = await orig();
  return { ...actual, useNavigate: () => mockNavigate };
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <StudentRegistrationPage />
    </MemoryRouter>
  );

const fillForm = async () => {
  await userEvent.type(screen.getByPlaceholderText(/first name/i), "Alice");
  await userEvent.type(screen.getByPlaceholderText(/last name/i), "Smith");
  await userEvent.type(screen.getByPlaceholderText(/username/i), "alice1");
  await userEvent.type(screen.getByPlaceholderText(/^email$/i), "alice@example.com");
  await userEvent.type(screen.getByPlaceholderText(/phone/i), "07123456789");
  await userEvent.type(screen.getByPlaceholderText(/^password$/i), "Strong1!");
  await userEvent.type(screen.getByPlaceholderText(/confirm password/i), "Strong1!");
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("StudentRegistrationPage (lean)", () => {
  it(
    "registers successfully, shows toast, then navigates",
    async () => {
      renderPage();

      axios.post.mockResolvedValueOnce({ data: { status: "success" } });

      await fillForm();
      await userEvent.click(screen.getByRole("button", { name: /register/i }));

      // Toast appears
      expect(
        await screen.findByText(/registration successful! redirecting to login/i)
      ).toBeInTheDocument();

      // Redirect happens ~2.5s later — give it a bit of room
      await waitFor(
        () => expect(mockNavigate).toHaveBeenCalledWith("/student/login"),
        { timeout: 5000 }
      );
    },
    10000 // per-test timeout
  );

  it(
    "shows server field errors on failure",
    async () => {
      renderPage();

      axios.post.mockRejectedValueOnce({
        response: {
          data: {
            errors: {
              student_email: "Email already in use.",
              student_username: "Username taken.",
            },
          },
        },
      });

      await fillForm();
      await userEvent.click(screen.getByRole("button", { name: /register/i }));

      await waitFor(() => {
        expect(screen.getByText(/email already in use/i)).toBeInTheDocument();
        expect(screen.getByText(/username taken/i)).toBeInTheDocument();
      });
    },
    10000
  );
});