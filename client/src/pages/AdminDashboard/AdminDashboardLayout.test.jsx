import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import AdminDashboardLayout from "./AdminDashboardLayout";
import axios from "axios";

// Mock axios
vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Mock navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (orig) => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (ui) =>
  render(<MemoryRouter initialEntries={["/admin/dashboard"]}>{ui}</MemoryRouter>);

describe("AdminDashboardLayout (lean)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to /admin/login when not authenticated", async () => {
    axios.get.mockRejectedValueOnce(new Error("no auth"));
    renderWithRouter(<AdminDashboardLayout />);

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/admin/login")
    );
  });

  it("renders links when authenticated and toggles sidebar", async () => {
    axios.get.mockResolvedValueOnce({ data: { admin_id: 1 } });
    const { container } = renderWithRouter(<AdminDashboardLayout />);

    // Links present
    expect(await screen.findByRole("link", { name: /overview/i })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /tutors/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /students/i }).length).toBeGreaterThan(0);

    // Sidebar toggles class
    const aside = container.querySelector(".admin-sidebar");
    expect(aside).toHaveClass("expand");

    const toggle = screen.getByRole("button"); // only toggle button present
    fireEvent.click(toggle);
    expect(aside).not.toHaveClass("expand");

    fireEvent.click(toggle);
    expect(aside).toHaveClass("expand");
  });

  it("logs out and navigates to /admin/login", async () => {
    axios.get.mockResolvedValueOnce({ data: { admin_id: 1 } });
    axios.post.mockResolvedValueOnce({ data: { ok: true } });

    renderWithRouter(<AdminDashboardLayout />);

    const logout = await screen.findByRole("link", { name: /logout/i });
    fireEvent.click(logout);

    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:3002/api/admin/logout",
        {},
        { withCredentials: true }
      )
    );
    expect(mockNavigate).toHaveBeenCalledWith("/admin/login");
  });
});