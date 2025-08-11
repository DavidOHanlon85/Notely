import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import AdminLoginPage from "./AdminLoginPage";

// Mock axios
vi.mock("axios", () => ({ default: { post: vi.fn() } }));
import axios from "axios";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (orig) => {
  const mod = await orig();
  return { ...mod, useNavigate: () => mockNavigate };
});

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/admin/login"]}>
      <AdminLoginPage />
    </MemoryRouter>
  );

beforeEach(() => {
  vi.clearAllMocks();
});

describe("AdminLoginPage (lean)", () => {
  it("logs in successfully and navigates to dashboard", async () => {
    axios.post.mockResolvedValueOnce({ data: { admin_id: 42 } });

    renderPage();

    await userEvent.type(
      screen.getByPlaceholderText(/username or email/i),
      "admin@example.com"
    );
    await userEvent.type(screen.getByPlaceholderText(/password/i), "secret");
    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/admin/dashboard")
    );
  });

  it("shows server error on API failure", async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { message: "Invalid credentials" } },
    });

    renderPage();

    await userEvent.type(
      screen.getByPlaceholderText(/username or email/i),
      "bad@creds.com"
    );
    await userEvent.type(screen.getByPlaceholderText(/password/i), "nope");
    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/invalid credentials/i);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("lets me toggle remember me", async () => {
    renderPage();
    const checkbox = screen.getByLabelText(/remember me/i);
    expect(checkbox).not.toBeChecked();
    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });
});