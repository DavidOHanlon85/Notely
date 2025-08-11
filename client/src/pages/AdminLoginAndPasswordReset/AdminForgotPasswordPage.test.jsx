import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
import AdminForgotPasswordPage from "./AdminForgotPasswordPage";

// Mock axios
vi.mock("axios", () => ({
  default: { post: vi.fn() },
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <AdminForgotPasswordPage />
    </MemoryRouter>
  );

beforeEach(() => {
  vi.restoreAllMocks();
  axios.post.mockReset();
});

describe("AdminForgotPasswordPage (lean)", () => {
    it("shows client-side validation for empty email", async () => {
        renderPage();
   
        const submitBtn = screen.getByRole("button", { name: /send reset link/i });
   
        // Empty email
        await userEvent.click(submitBtn);
        expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
  });

  it("submits and shows success message", async () => {
    renderPage();

    axios.post.mockResolvedValueOnce({
      data: { status: "success", message: "Reset link sent." },
    });

    await userEvent.type(
      screen.getByPlaceholderText(/enter your email/i),
      "admin@example.com"
    );
    await userEvent.click(screen.getByRole("button", { name: /send reset link/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/reset link sent/i);
  });

  it("shows server error on failure", async () => {
    renderPage();

    axios.post.mockRejectedValueOnce({
      response: { data: { message: "No admin found with that email." } },
    });

    await userEvent.type(
      screen.getByPlaceholderText(/enter your email/i),
      "missing@example.com"
    );
    await userEvent.click(screen.getByRole("button", { name: /send reset link/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/no admin found/i);
  });
});