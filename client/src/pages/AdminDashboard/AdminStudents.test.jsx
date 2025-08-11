import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import AdminStudents from "./AdminStudents";
import axios from "axios";

// Mock axios
vi.mock("axios", () => ({ default: { get: vi.fn(), patch: vi.fn() } }));

// Flatten react-data-table-component to simple markup
vi.mock("react-data-table-component", () => ({
  __esModule: true,
  default: ({ columns, data, noDataComponent }) => {
    if (!data?.length) return <div>{noDataComponent}</div>;
    return (
      <table data-testid="dt">
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
              {columns.map((c, cIdx) => (
                <td key={cIdx}>
                  {c.cell ? c.cell(row) : c.selector ? c.selector(row) : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
}));

describe("AdminStudents (lean)", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders rows, filters by search, and toggles verify/revoke via PATCH", async () => {
    // Mock GET payload
    axios.get.mockResolvedValueOnce({
      data: [
        {
          student_id: 1,
          student_first_name: "Alice",
          student_last_name: "Smith",
          name: "Alice Smith",
          student_email: "alice@example.com",
          student_phone: "01234 567890",
          student_registration_date: "2025-01-15T00:00:00.000Z",
          student_verification_date: null, // not verified -> shows 'Verify'
        },
        {
          student_id: 2,
          student_first_name: "Bob",
          student_last_name: "Jones",
          name: "Bob Jones",
          student_email: "bob@example.com",
          student_phone: null,
          student_registration_date: "2025-01-10T00:00:00.000Z",
          student_verification_date: "2025-01-20T00:00:00.000Z", // verified -> shows 'Revoke'
        },
      ],
    });

    render(<AdminStudents />);

    // Wait for data
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        "http://localhost:3002/api/admin/students",
        expect.objectContaining({ withCredentials: true })
      );
    });

    // Names present
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();

    // Verify/Revoke buttons present
    const verifyBtn = screen.getByRole("button", { name: /verify/i });
    const revokeBtn = screen.getByRole("button", { name: /revoke/i });
    expect(verifyBtn).toBeInTheDocument();
    expect(revokeBtn).toBeInTheDocument();

    // Filter: search for "alice" -> bob should disappear
    fireEvent.change(screen.getByPlaceholderText(/search students/i), {
      target: { value: "alice" },
    });
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.queryByText("Bob Jones")).not.toBeInTheDocument();

    // Confirm prompt for toggling
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    axios.patch.mockResolvedValueOnce({ data: { ok: true } });

    // Click Verify on Alice
    fireEvent.click(screen.getByRole("button", { name: /verify/i }));
    expect(confirmSpy).toHaveBeenCalled();

    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith(
        "http://localhost:3002/api/admin/student/1/verify",
        {},
        expect.objectContaining({ withCredentials: true })
      );
    });

    confirmSpy.mockRestore();
  });

  it("shows 'No students found.' when API returns empty", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(<AdminStudents />);

    expect(
      await screen.findByText(/no students found\./i)
    ).toBeInTheDocument();
  });
});