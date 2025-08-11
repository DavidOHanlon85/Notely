import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";

// Mock axios
vi.mock("axios", () => ({ default: { get: vi.fn(), post: vi.fn() } }));
import axios from "axios";

// Mock only useNavigate from react-router-dom, keep the rest real
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import { MemoryRouter, Routes, Route } from "react-router-dom";
import TutorDashboardLayout from "./TutorDashboardLayout";

function renderWithRouter() {
  return render(
    <MemoryRouter initialEntries={["/tutor/dashboard"]}>
      <Routes>
        <Route path="/tutor/dashboard" element={<TutorDashboardLayout />}>
          <Route index element={<div data-testid="outlet" />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe("TutorDashboardLayout (lean)", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to /tutor/login when not authenticated", async () => {
    axios.get.mockRejectedValueOnce(new Error("not authed"));

    renderWithRouter();

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/tutor/login")
    );
  });

  it("renders nav links and toggles sidebar", async () => {
    axios.get.mockResolvedValueOnce({ data: { ok: true } });

    renderWithRouter();

    // Sidebar links present
    expect(await screen.findByRole("link", { name: /Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Bookings/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Reviews/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Messages/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Time Off/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Profile/i })).toBeInTheDocument();

    // Toggle collapses/expands the sidebar class
    const aside = document.querySelector("#tutor-sidebar");
    expect(aside.className).toMatch(/expand/);

    const toggle = screen.getByRole("button");
    fireEvent.click(toggle);
    expect(aside.className).not.toMatch(/expand/);

    fireEvent.click(toggle);
    expect(aside.className).toMatch(/expand/);
  });

  it("logs out and navigates to /tutor/login", async () => {
    axios.get.mockResolvedValueOnce({ data: { ok: true } });
    axios.post.mockResolvedValueOnce({ data: { ok: true } });

    renderWithRouter();

    // Wait until layout rendered
    await screen.findByRole("link", { name: /Dashboard/i });

    fireEvent.click(screen.getByRole("link", { name: /Logout/i }));

    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:3002/api/tutor/logout",
        {},
        expect.objectContaining({ withCredentials: true })
      )
    );

    expect(mockNavigate).toHaveBeenCalledWith("/tutor/login");
  });
});