import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import AdminResetPasswordPage from "./AdminResetPasswordPage";

vi.mock("axios", () => ({
  default: { post: vi.fn() },
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (orig) => {
  const actual = await orig();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderWithRoute() {
  return render(
    <MemoryRouter initialEntries={["/admin/reset-password/T0K3N"]}>
      <Routes>
        <Route
          path="/admin/reset-password/:token"
          element={<AdminResetPasswordPage />}
        />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  axios.post.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("AdminResetPasswordPage (lean)", () => {
  it("shows validation errors for empty/invalid inputs", async () => {
    renderWithRoute();

    // Submit empty form
    await userEvent.click(
      screen.getByRole("button", { name: /reset password/i })
    );

    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    expect(
      screen.getByText(/please confirm your password/i)
    ).toBeInTheDocument();

    // Too-weak password
    await userEvent.type(screen.getByPlaceholderText(/new password/i), "short");
    await userEvent.type(
      screen.getByPlaceholderText(/confirm password/i),
      "short"
    );
    await userEvent.click(
      screen.getByRole("button", { name: /reset password/i })
    );
    expect(
      screen.getByText(/must be at least 8 characters/i)
    ).toBeInTheDocument();

    // Mismatch
    await userEvent.clear(screen.getByPlaceholderText(/new password/i));
    await userEvent.clear(screen.getByPlaceholderText(/confirm password/i));
    await userEvent.type(
      screen.getByPlaceholderText(/new password/i),
      "ValidPass1!"
    );
    await userEvent.type(
      screen.getByPlaceholderText(/confirm password/i),
      "Mismatch1!"
    );
    await userEvent.click(
      screen.getByRole("button", { name: /reset password/i })
    );
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it("submits successfully and shows success message (then navigates)", async () => {
    axios.post.mockResolvedValueOnce({
      data: { status: "success", message: "Password updated." },
    });

    renderWithRoute();

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

    // Let the real 1s timeout fire
    await waitFor(
      () => expect(mockNavigate).toHaveBeenCalledWith("/admin/login"),
      { timeout: 2000 }
    );
  });

  it("shows server error on API failure", async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { message: "Token invalid or expired" } },
    });

    renderWithRoute();

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
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
