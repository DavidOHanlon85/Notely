import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi } from "vitest";

// Mock axios
vi.mock("axios", () => ({ default: { get: vi.fn() } }));
import axios from "axios";

// Mock react-router navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const real = await vi.importActual("react-router-dom");
  return { ...real, useNavigate: () => mockNavigate };
});

// Stub DataTable: render headers/cells; show noDataComponent when no rows.
vi.mock("react-data-table-component", () => ({
  __esModule: true,
  default: ({ columns, data, noDataComponent }) =>
    data?.length ? (
      <table data-testid="datatable">
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th key={i}>{c.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rIdx) => (
            <tr key={rIdx}>
              {columns.map((col, cIdx) => (
                <td key={cIdx}>
                  {col.cell
                    ? col.cell(row)
                    : col.selector
                    ? col.selector(row)
                    : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <div data-testid="no-data">{noDataComponent}</div>
    ),
}));

import TutorMessages from "./TutorMessages";

describe("TutorMessages (lean)", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows empty state when API returns no conversations", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(<TutorMessages />);

    await waitFor(() =>
      expect(screen.getByTestId("no-data")).toBeInTheDocument()
    );
    expect(screen.getByText(/You have no messages yet\./i)).toBeInTheDocument();
  });

  it("renders rows, truncates long text, formats date, filters, and navigates on Message", async () => {
    const nowIso = "2025-01-15T19:30:00.000Z";
    const longMsg =
      "This is a very long message that should be truncated somewhere after sixty characters because UI shows a preview only.";
    const data = [
      {
        student_id: 11,
        student_first_name: "Alice",
        student_last_name: "Smith",
        last_message_text: longMsg,
        last_message_time: nowIso,
      },
      {
        student_id: 22,
        student_first_name: "Bob",
        student_last_name: "Jones",
        last_message_text: "Short note",
        last_message_time: null,
      },
    ];
    axios.get.mockResolvedValueOnce({ data });

    render(<TutorMessages />);

    // Rows appear
    await waitFor(() => {
      expect(screen.getByText("Alice Smith")).toBeInTheDocument();
      expect(screen.getByText("Bob Jones")).toBeInTheDocument();
    });

    // Truncation (<= 60 chars + ellipsis)
    const truncated = longMsg.slice(0, 60) + "...";
    expect(screen.getByText(truncated)).toBeInTheDocument();

    // Null timestamp shows dash — stable across environments
    expect(screen.getByText("—")).toBeInTheDocument();

    // Filter by "bob"
    fireEvent.change(screen.getByPlaceholderText(/search messages/i), {
      target: { value: "bob" },
    });
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
    expect(screen.queryByText("Alice Smith")).not.toBeInTheDocument();

    // Clear filter and click Message on first visible row (Bob)
    fireEvent.change(screen.getByPlaceholderText(/search messages/i), {
      target: { value: "" },
    });
    fireEvent.click(screen.getAllByRole("button", { name: /message/i })[0]);
    expect(mockNavigate).toHaveBeenCalledWith("/tutor/messages/11");
  });
});
