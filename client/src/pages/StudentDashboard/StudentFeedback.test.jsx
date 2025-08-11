import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import StudentFeedback from "./StudentFeedback";

// Mock axios (top-level, hoisted-safe)
vi.mock("axios", () => ({ default: { get: vi.fn() } }));
import axios from "axios";

describe("StudentFeedback", () => {
  afterEach(() => vi.clearAllMocks());

  const rows = [
    {
      date: "2025-03-10",
      tutor: "Alice Smith",
      tutor_id: 7,
      performance: 4,
      homework: "D major scale, hands together",
      notes: "Great progress on rhythm",
    },
    {
      date: "2025-02-01",
      tutor: "Bob Jones",
      tutor_id: 9,
      performance: 2,
      homework: "Arpeggios in A minor",
      notes: "Work on dynamics",
    },
  ];

  it("loads feedback, shows stars, and filters by text", async () => {
    axios.get.mockResolvedValueOnce({ data: rows });
    const { container } = render(<StudentFeedback />);

    // data loaded
    expect(
      await screen.findByRole("heading", { name: /your feedback/i })
    ).toBeInTheDocument();
    // both tutors visible
    expect(await screen.findByText(/alice smith/i)).toBeInTheDocument();
    expect(screen.getByText(/bob jones/i)).toBeInTheDocument();

    // stars rendered correctly (★★★★☆ for 4, ★★☆☆☆ for 2)
    const starCells = container.querySelectorAll(".stars");
    expect(starCells[0].textContent).toBe("★★★★☆");
    expect(starCells[1].textContent).toBe("★★☆☆☆");

    // filter by tutor
    fireEvent.change(screen.getByPlaceholderText(/search feedback/i), {
      target: { value: "alice" },
    });
    await waitFor(() => {
      expect(screen.getByText(/alice smith/i)).toBeInTheDocument();
      expect(screen.queryByText(/bob jones/i)).toBeNull();
    });

    // filter by notes/homework keyword
    fireEvent.change(screen.getByPlaceholderText(/search feedback/i), {
      target: { value: "dynamics" },
    });
    await waitFor(() => {
      expect(screen.getByText(/bob jones/i)).toBeInTheDocument();
      expect(screen.queryByText(/alice smith/i)).toBeNull();
    });

    // filter by date
    fireEvent.change(screen.getByPlaceholderText(/search feedback/i), {
      target: { value: "2025-03-10" },
    });
    await waitFor(() => {
      expect(screen.getByText(/alice smith/i)).toBeInTheDocument();
      expect(screen.queryByText(/bob jones/i)).toBeNull();
    });
  });
});