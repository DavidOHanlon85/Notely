import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import JoinPage from "./JoinPage";

vi.mock("axios", () => ({
  default: { get: vi.fn() },
}));

// Keep child components simple
vi.mock("../../components/UI/DoubleButtonNavBar", () => ({
  default: () => <div data-testid="nav">Nav</div>,
}));
vi.mock("../../components/UI/SocialsFooter", () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

function renderWithRoute(path = "/join/abc123") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/join/:booking_id" element={<JoinPage />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("JoinPage (lean)", () => {
  it("renders booking details and uses the booking_link in the iframe", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        booking_id: "abc123",
        student_name: "Alice Jones",
        tutor_name: "Bob Smith",
        booking_date: "2025-03-05",
        booking_time: "14:30:00",
        booking_link: "https://meet.jit.si/custom-room-42",
      },
    });

    renderWithRoute();

    // Core headings show
    expect(await screen.findByRole("heading", { name: /join your lesson/i })).toBeInTheDocument();

    // Names and time are mentioned
    expect(screen.getByText(/Alice Jones/i)).toBeInTheDocument();
    expect(screen.getByText(/Bob Smith/i)).toBeInTheDocument();
    expect(screen.getByText(/14:30/)).toBeInTheDocument();

    // Iframe points to provided booking_link
    const frame = screen.getByTitle(/notely jitsi meeting/i);
    expect(frame).toBeInTheDocument();
    expect(frame).toHaveAttribute("src", "https://meet.jit.si/custom-room-42");
  });

  it("falls back to a default Jitsi URL when no booking_link is provided", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        booking_id: "xyz789",
        student_name: "Charlie",
        tutor_name: "Dana",
        booking_date: "2025-04-10",
        booking_time: "09:00:00",
        booking_link: null,
      },
    });

    renderWithRoute("/join/xyz789");

    const frame = await screen.findByTitle(/notely jitsi meeting/i);
    expect(frame).toHaveAttribute("src", "https://meet.jit.si/notely-class-xyz789");
  });

  it("shows an error message if the booking fetch fails", async () => {
    axios.get.mockRejectedValueOnce(new Error("nope"));
    renderWithRoute("/join/bad999");

    expect(
      await screen.findByText(/booking not found or you don’t have permission/i)
    ).toBeInTheDocument();
  });
});