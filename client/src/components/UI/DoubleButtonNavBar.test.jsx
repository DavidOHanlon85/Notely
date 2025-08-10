import React from "react";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

// axios + navigate mocks
vi.mock("axios", () => ({ default: { get: vi.fn(), post: vi.fn() } }));
import axios from "axios";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

import DoubleButtonNavBar from "./DoubleButtonNavBar";

const renderFresh = () => {
  cleanup();
  return render(
    <MemoryRouter>
      <DoubleButtonNavBar />
    </MemoryRouter>
  );
};

// Helper to program the 3 /me calls for one mount
function mockRole(role /* 'student' | 'tutor' | 'admin' | null */) {
  axios.get.mockReset();

  if (role === "student") {
    axios.get
      .mockResolvedValueOnce({ data: { student_id: 1 } }) // /student/me
      .mockRejectedValueOnce(new Error("skip"))            // /tutor/me
      .mockRejectedValueOnce(new Error("skip"));           // /admin/me
    return;
  }
  if (role === "tutor") {
    axios.get
      .mockRejectedValueOnce(new Error("skip"))            // /student/me
      .mockResolvedValueOnce({ data: { tutor_id: 99 } })   // /tutor/me
      .mockRejectedValueOnce(new Error("skip"));           // /admin/me
    return;
  }
  if (role === "admin") {
    axios.get
      .mockRejectedValueOnce(new Error("skip"))            // /student/me
      .mockRejectedValueOnce(new Error("skip"))            // /tutor/me
      .mockResolvedValueOnce({ data: { admin_id: 5 } });   // /admin/me
    return;
  }

  // unauthenticated
  axios.get
    .mockRejectedValueOnce(new Error("no student"))
    .mockRejectedValueOnce(new Error("no tutor"))
    .mockRejectedValueOnce(new Error("no admin"));
}

describe("DoubleButtonNavBar (simplified, stable)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
  });

  it("shows Login/Register when unauthenticated", async () => {
    mockRole(null);
    renderFresh();

    expect(await screen.findByRole("link", { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Register/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Dashboard/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Logout/i })).not.toBeInTheDocument();
  });

  it.each([
    ["student", "/student/dashboard"],
    ["tutor", "/tutor/dashboard"],
    ["admin", "/admin/dashboard"],
  ])("shows Dashboard+Logout when %s is logged in", async (role, expectedHref) => {
    mockRole(role);
    renderFresh();

    const dash = await screen.findByRole("link", { name: /Dashboard/i });
    expect(dash).toBeInTheDocument();
    expect(dash.getAttribute("href")).toMatch(new RegExp(`${expectedHref}$`));
    expect(screen.getByRole("button", { name: /Logout/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Register/i })).not.toBeInTheDocument();
  });

  it("logs out tutor and navigates home", async () => {
    // Mount in tutor state
    mockRole("tutor");
    renderFresh();

    const logout = await screen.findByRole("button", { name: /Logout/i });
    axios.post.mockResolvedValueOnce({ data: { ok: true } });

    fireEvent.click(logout);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:3002/api/tutor/logout",
        {},
        { withCredentials: true }
      );
    });
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});