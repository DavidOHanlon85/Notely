import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NotFoundPage from "./NotFoundPage";

// Stub chrome so we don't drag the whole world in
vi.mock("../../components/UI/DoubleButtonNavBar", () => ({
  default: () => <div data-testid="nav">Nav</div>,
}));
vi.mock("../../components/UI/SocialsFooter", () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

// Mock axios
vi.mock("axios", () => ({
  default: { get: vi.fn() },
}));
import axios from "axios";

describe("NotFoundPage (lean)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows generic CTAs when unauthenticated", async () => {
    // student -> fail, tutor -> fail, admin -> fail
    axios.get
      .mockRejectedValueOnce(new Error("no student"))
      .mockRejectedValueOnce(new Error("no tutor"))
      .mockRejectedValueOnce(new Error("no admin"));

    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

    // Headline
    expect(
      await screen.findByRole("heading", { name: /404 — Page Not Found/i })
    ).toBeInTheDocument();

    // Primary CTA: Find a Tutor -> /tutors
    const primary = screen.getByRole("link", { name: /find a tutor/i });
    expect(primary).toBeInTheDocument();
    expect(primary).toHaveAttribute("href", "/tutors");

    // Secondary CTA: Login -> /student/login
    const secondary = screen.getByRole("link", { name: /login/i });
    expect(secondary).toHaveAttribute("href", "/student/login");
  });

  it("shows dashboard + home CTAs when role is student", async () => {
    // student -> ok (short‑circuit); tutor/admin won't be called, but safe to stub
    axios.get
      .mockResolvedValueOnce({ data: { student_id: 123 } })
      .mockResolvedValue({ data: {} });

    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

    // Primary CTA: Go to Dashboard -> /student/dashboard
    const dash = await screen.findByRole("link", { name: /go to dashboard/i });
    expect(dash).toHaveAttribute("href", "/student/dashboard");

    // Secondary CTA: Back to Home -> /
    const home = screen.getByRole("link", { name: /back to home/i });
    expect(home).toHaveAttribute("href", "/");
  });
});