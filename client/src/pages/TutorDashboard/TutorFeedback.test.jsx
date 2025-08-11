import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi } from "vitest";

// Mock axios
vi.mock("axios", () => ({ default: { get: vi.fn() } }));
import axios from "axios";

// Stub react-data-table-component with a tiny table
vi.mock("react-data-table-component", () => ({
  __esModule: true,
  default: ({ columns, data }) => (
    <table data-testid="datatable">
      <thead>
        <tr>{columns.map((c, i) => <th key={i}>{c.name}</th>)}</tr>
      </thead>
      <tbody>
        {data.map((row, rIdx) => (
          <tr key={rIdx}>
            {columns.map((col, cIdx) => (
              <td key={cIdx}>
                {col.cell ? col.cell(row) : col.selector ? col.selector(row) : null}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
}));

import TutorFeedback from "./TutorFeedback";

describe("TutorFeedback (lean)", () => {
  afterEach(() => vi.clearAllMocks());

  it("loads reviews, renders rows with stars, and filters by text", async () => {
    const rows = [
      { date: "2025-01-12", student: "Alice Smith", rating: 5, text: "Outstanding lesson!" },
      { date: "2025-01-10", student: "Bob Jones",   rating: 3, text: "Good progress." },
    ];
    axios.get.mockResolvedValueOnce({ data: rows });

    render(<TutorFeedback />);

    // Fetched + rendered
    await waitFor(() => {
      expect(screen.getByText("Alice Smith")).toBeInTheDocument();
      expect(screen.getByText("Bob Jones")).toBeInTheDocument();
    });

    // Stars render from rating (5 → ★★★★★, 3 → ★★★☆☆)
    expect(screen.getByText("★★★★★")).toBeInTheDocument();
    expect(screen.getByText("★★★☆☆")).toBeInTheDocument();

    // Filter by student name
    fireEvent.change(screen.getByPlaceholderText(/search feedback/i), {
      target: { value: "alice" },
    });
    // Alice remains, Bob filtered out
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.queryByText("Bob Jones")).not.toBeInTheDocument();

    // Filter by text content
    fireEvent.change(screen.getByPlaceholderText(/search feedback/i), {
      target: { value: "progress" },
    });
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
    expect(screen.queryByText("Alice Smith")).not.toBeInTheDocument();
  });

  it("handles empty list", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(<TutorFeedback />);

    // Just ensure the table renders with no rows and no crash
    await waitFor(() => {
      expect(screen.getByTestId("datatable")).toBeInTheDocument();
    });
    expect(screen.queryByText(/Student Feedback/i)).toBeInTheDocument();
  });
});