import { describe, it, beforeEach, vi, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
import StudentLoginPage from "./StudentLoginPage";

vi.mock("axios");

// mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (orig) => {
  const actual = await orig();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <StudentLoginPage />
    </MemoryRouter>
  );

describe("StudentLoginPage (lean)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("validates, logs in, navigates on success, and shows server error on failure", async () => {
    renderPage();

    const idInput = screen.getByPlaceholderText(/email or username/i);
    const pwdInput = screen.getByPlaceholderText(/password/i);
    const remember = screen.getByLabelText(/remember me/i);
    const submitBtn = screen.getByRole("button", { name: /log in/i });

    // Required errors
    await userEvent.clear(idInput);
    await userEvent.clear(pwdInput);
    await userEvent.click(submitBtn);
    expect(await screen.findByText(/email or username is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();

    // Success path
    axios.post.mockResolvedValueOnce({
      data: { status: "success", student_id: 123 },
    });

    await userEvent.type(idInput, "testuser"); // username allowed
    await userEvent.type(pwdInput, "secret");
    await userEvent.click(remember); // true
    await userEvent.click(submitBtn);

    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:3002/api/student/login",
      { identifier: "testuser", password: "secret", rememberMe: true },
      { withCredentials: true }
    );
    expect(mockNavigate).toHaveBeenCalledWith("/student/dashboard");

    // Error path (same render)
    axios.post.mockRejectedValueOnce({
      response: { data: { message: "Invalid credentials" } },
    });

    await userEvent.clear(idInput);
    await userEvent.clear(pwdInput);
    await userEvent.type(idInput, "wronguser");
    await userEvent.type(pwdInput, "badpass");
    await userEvent.click(submitBtn);

    expect(await screen.findByRole("alert")).toHaveTextContent(/invalid credentials/i);
  });
});