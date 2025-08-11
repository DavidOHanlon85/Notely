import React from "react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import StudentDashboardLayout from "./StudentDashboardLayout";

// Mock axios
vi.mock("axios", () => ({ default: { get: vi.fn(), post: vi.fn() } }));
import axios from "axios";

// Simple helpers
const renderWithRoutes = (initialPath = "/student/dashboard") =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/student/login" element={<div>Login Page</div>} />
        <Route
          path="/student/dashboard/*"
          element={<StudentDashboardLayout />}
        >
          {/* minimal child so <Outlet /> renders something */}
          <Route index element={<div>Dashboard Home</div>} />
          <Route path="bookings" element={<div>Bookings Page</div>} />
        </Route>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/tutors" element={<div>Tutors List</div>} />
      </Routes>
    </MemoryRouter>
  );

describe("StudentDashboardLayout", () => {
  afterEach(() => vi.clearAllMocks());

  it("redirects to /student/login when not authenticated", async () => {
    axios.get.mockRejectedValueOnce(new Error("unauth"));
    renderWithRoutes();

    // We should land on the login page after the auth check runs
    expect(await screen.findByText(/login page/i)).toBeInTheDocument();
  });

  it("renders when authenticated and toggles the sidebar expand state", async () => {
    axios.get.mockResolvedValueOnce({ data: { ok: true } });
    const { container } = renderWithRoutes();

    // Wait until the dashboard content shows (auth success)
    expect(await screen.findByText(/dashboard home/i)).toBeInTheDocument();

    const sidebar = container.querySelector("#sidebar");
    expect(sidebar).toBeTruthy();
    expect(sidebar.className).toContain("expand");

    // Toggle button (has .toggle-btn)
    const toggleBtn = container.querySelector(".toggle-btn");
    fireEvent.click(toggleBtn);

    // After toggle, class "expand" should be removed
    expect(container.querySelector("#sidebar").className).not.toContain("expand");
  });

  it("logs out via POST and navigates to /student/login", async () => {
    axios.get.mockResolvedValueOnce({ data: { ok: true } }); // auth ok
    axios.post.mockResolvedValueOnce({ data: { ok: true } });

    renderWithRoutes();

    // Ensure dashboard rendered
    expect(await screen.findByText(/dashboard home/i)).toBeInTheDocument();

    // Click Logout (it's a link with text 'Logout' that prevents default and calls handleLogout)
    fireEvent.click(screen.getByRole("link", { name: /logout/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:3002/api/student/logout",
        {},
        expect.objectContaining({ withCredentials: true })
      );
    });

    // After successful logout, we should be on login page
    expect(await screen.findByText(/login page/i)).toBeInTheDocument();
  });
});