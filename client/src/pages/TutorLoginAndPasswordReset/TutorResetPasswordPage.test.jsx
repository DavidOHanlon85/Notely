import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import TutorResetPasswordPage from "./TutorResetPasswordPage";

vi.mock("axios", () => ({
  default: { post: vi.fn() },
}));

const renderWithRoute = (token = "tok123") =>
  render(
    <MemoryRouter initialEntries={[`/tutor/reset-password/${token}`]}>
      <Routes>
        <Route
          path="/tutor/reset-password/:token"
          element={<TutorResetPasswordPage />}
        />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => {
  vi.restoreAllMocks();
  axios.post.mockReset();
});

describe("TutorResetPasswordPage (lean)", () => {
  it("shows validation errors for empty/invalid inputs", async () => {
    renderWithRoute();

    await userEvent.click(
      screen.getByRole("button", { name: /reset password/i })
    );

    expect(
      await screen.findByText(/password is required/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/please confirm your password/i)
    ).toBeInTheDocument();

    await userEvent.type(
      screen.getByPlaceholderText(/new password/i),
      "short"
    );
    await userEvent.type(
      screen.getByPlaceholderText(/confirm password/i),
      "shorter"
    );
    await userEvent.click(
      screen.getByRole("button", { name: /reset password/i })
    );

    expect(
      await screen.findByText(/must be at least 8 characters/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/passwords do not match/i)
    ).toBeInTheDocument();
  });

  it("submits successfully and shows success message", async () => {
    renderWithRoute();

    axios.post.mockResolvedValueOnce({
      data: { status: "success", message: "Password updated." },
    });

    await userEvent.type(
      screen.getByPlaceholderText(/new password/i),
      "ValidPass1!"
    );
    await userEvent.type(
      screen.getByPlaceholderText(/confirm password/i),
      "ValidPass1!"
    );
    await userEvent.click(
      screen.getByRole("button", { name: /reset password/i })
    );

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/password updated/i);
  });

  it("shows server error on API failure", async () => {
    renderWithRoute();

    axios.post.mockRejectedValueOnce({
      response: { data: { message: "Token invalid or expired." } },
    });

    await userEvent.type(
      screen.getByPlaceholderText(/new password/i),
      "ValidPass1!"
    );
    await userEvent.type(
      screen.getByPlaceholderText(/confirm password/i),
      "ValidPass1!"
    );
    await userEvent.click(
      screen.getByRole("button", { name: /reset password/i })
    );

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/token invalid or expired/i);
  });
});