import { describe, it, beforeEach, vi, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import StudentResetPasswordPage from "./StudentResetPasswordPage";

vi.mock("axios");

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (orig) => {
  const actual = await orig();
  return { ...actual, useNavigate: () => mockNavigate };
});

const renderWithRoute = (token = "tok123") =>
  render(
    <MemoryRouter initialEntries={[`/student/reset-password/${token}`]}>
      <Routes>
        <Route
          path="/student/reset-password/:token"
          element={<StudentResetPasswordPage />}
        />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => {
  vi.clearAllMocks();
});

describe("StudentResetPasswordPage (lean)", () => {
  it(
    "submits successfully, shows success alert, then navigates to login",
    async () => {
      renderWithRoute();

      axios.post.mockResolvedValueOnce({
        data: { status: "success", message: "Password updated." },
      });

      await userEvent.type(
        screen.getByPlaceholderText(/new password/i),
        "StrongP@ss1"
      );
      await userEvent.type(
        screen.getByPlaceholderText(/confirm password/i),
        "StrongP@ss1"
      );

      await userEvent.click(
        screen.getByRole("button", { name: /reset password/i })
      );

      // Success message appears
      expect(
        await screen.findByRole("alert", { name: "" })
      ).toHaveTextContent(/password updated|success/i);

      // Redirect occurs after ~1s; give it a little room
      await waitFor(
        () => expect(mockNavigate).toHaveBeenCalledWith("/student/login"),
        { timeout: 3000 }
      );
    },
    8000
  );

  it(
    "shows simple client-side validation errors when invalid",
    async () => {
      renderWithRoute();

      // Submit with empty fields
      await userEvent.click(
        screen.getByRole("button", { name: /reset password/i })
      );

      expect(
        await screen.findByText(/password is required/i)
      ).toBeInTheDocument();

      // Mismatched passwords
      await userEvent.type(
        screen.getByPlaceholderText(/new password/i),
        "StrongP@ss1"
      );
      await userEvent.type(
        screen.getByPlaceholderText(/confirm password/i),
        "WrongP@ss1"
      );
      await userEvent.click(
        screen.getByRole("button", { name: /reset password/i })
      );

      expect(
        await screen.findByText(/passwords do not match/i)
      ).toBeInTheDocument();
      expect(axios.post).not.toHaveBeenCalled();
    },
    8000
  );
});