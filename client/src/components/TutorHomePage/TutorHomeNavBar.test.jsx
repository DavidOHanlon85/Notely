import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import TutorHomeNavBar from "./TutorHomeNavBar";

// Mock image so it doesn't try to load in test
vi.mock("../../assets/images/NotelyRectangle.png", () => ({
  default: "logo-stub.png",
}));

// Mock axios to control API calls
vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));
import axios from "axios";

// Mock router hooks we directly call
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: mockPathname }),
  };
});

let mockNavigate = vi.fn();
let mockPathname = "/";

// Simple helper to wait for state updates after async work
const flush = () => act(() => Promise.resolve());

// Utility to control which role is returned
const mockRole = (role) => {
  axios.get.mockReset();

  if (role === "student") {
    axios.get.mockResolvedValueOnce({ data: { student_id: 1 } }); // student/me
  } else {
    axios.get.mockRejectedValueOnce(new Error("no student"));
  }

  if (role === "tutor") {
    axios.get.mockResolvedValueOnce({ data: { tutor_id: 2 } }); // tutor/me
  } else {
    axios.get.mockRejectedValueOnce(new Error("no tutor"));
  }

  if (role === "admin") {
    axios.get.mockResolvedValueOnce({ data: { admin_id: 3 } }); // admin/me
  } else {
    axios.get.mockRejectedValueOnce(new Error("no admin"));
  }
};

const renderWithRouter = (ui) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe("TutorHomeNavBar", () => {
  beforeEach(() => {
    mockNavigate = vi.fn();
    mockPathname = "/";
    axios.post.mockReset();
  });

  it("shows tutor Login/Register when unauthenticated", async () => {
    mockRole("none");
    renderWithRouter(<TutorHomeNavBar />);
    await flush();

    expect(screen.getByRole("link", { name: /login/i })).toHaveAttribute(
      "href",
      "/tutor/login"
    );
    expect(screen.getByRole("link", { name: /register/i })).toHaveAttribute(
      "href",
      "/tutor/register"
    );
    expect(screen.queryByRole("button", { name: /logout/i })).toBeNull();
  });

  it("shows student Dashboard + Logout", async () => {
    mockRole("student");
    renderWithRouter(<TutorHomeNavBar />);
    await flush();

    expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute(
      "href",
      "/student/dashboard"
    );
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  it("shows tutor Dashboard + Logout", async () => {
    mockRole("tutor");
    renderWithRouter(<TutorHomeNavBar />);
    await flush();

    expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute(
      "href",
      "/tutor/dashboard"
    );
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  it("shows admin Dashboard + Logout", async () => {
    mockRole("admin");
    renderWithRouter(<TutorHomeNavBar />);
    await flush();

    expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute(
      "href",
      "/admin/dashboard"
    );
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  it("refetches role when pathname changes", async () => {
    // First render: none
    mockRole("none");
    renderWithRouter(<TutorHomeNavBar />);
    await flush();
    expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();

    // Change path and mock student role
    mockPathname = "/another";
    mockRole("student");
    renderWithRouter(<TutorHomeNavBar />);
    await flush();

    expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute(
      "href",
      "/student/dashboard"
    );
  });
});