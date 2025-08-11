import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import axios from "axios";
import AdminTutors from "./AdminTutors";

// Mock axios
vi.mock("axios", () => ({ default: { get: vi.fn(), patch: vi.fn(), post: vi.fn() } }));

// Flatten react-data-table-component
vi.mock("react-data-table-component", () => ({
  __esModule: true,
  default: ({ columns, data, noDataComponent }) => {
    if (!data?.length) return <div>{noDataComponent}</div>;
    return (
      <table data-testid="dt">
        <thead>
          <tr>{columns.map((c, i) => <th key={i}>{c.name}</th>)}</tr>
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

describe("AdminTutors (lean)", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders rows, filters, toggles verify/revoke, and sends Stripe reminder", async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        {
          tutor_id: 1,
          name: "Alice Smith",
          tutor_email: "alice@example.com",
          tutor_phone: "01234 567890",
          tutor_city: "Belfast",
          tutor_registration_date: "2025-01-15",
          booking_count: 10,
          average_rating: 4.5,
          tutor_approval_date: null, // shows Verify
          tutor_stripe_account_id: null, // shows Send Reminder
        },
        {
          tutor_id: 2,
          name: "Bob Jones",
          tutor_email: "bob@example.com",
          tutor_phone: null,
          tutor_city: "Dublin",
          tutor_registration_date: "2025-01-10",
          booking_count: 3,
          average_rating: 4.0,
          tutor_approval_date: "2025-01-20", // shows Revoke
          tutor_stripe_account_id: "acct_123", // no reminder button
        },
      ],
    });

    render(
      <MemoryRouter>
        <AdminTutors />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        "http://localhost:3002/api/admin/tutors",
        expect.objectContaining({ withCredentials: true })
      );
    });

    // Names present
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();

    // Rating badge renders
    expect(screen.getByText(/★ 4\.5/)).toBeInTheDocument();
    expect(screen.getByText(/★ 4\.0/)).toBeInTheDocument();

    // Verify/Revoke buttons show correctly
    const verifyBtn = screen.getByRole("button", { name: /verify/i });
    const revokeBtn = screen.getByRole("button", { name: /revoke/i });
    expect(verifyBtn).toBeInTheDocument();
    expect(revokeBtn).toBeInTheDocument();

    // Filter: search city
    fireEvent.change(screen.getByPlaceholderText(/search tutors/i), {
      target: { value: "belfast" },
    });
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.queryByText("Bob Jones")).not.toBeInTheDocument();

    // Reset filter
    fireEvent.change(screen.getByPlaceholderText(/search tutors/i), {
      target: { value: "" },
    });

    // Confirm spies
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    // Click Verify on Alice
    axios.patch.mockResolvedValueOnce({ data: { ok: true } });
    fireEvent.click(screen.getByRole("button", { name: /verify/i }));
    expect(confirmSpy).toHaveBeenCalled();
    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith(
        "http://localhost:3002/api/admin/tutor/1/verify",
        {},
        expect.objectContaining({ withCredentials: true })
      );
    });

    // Click Send Reminder on Alice (no stripe)
    axios.post.mockResolvedValueOnce({ data: { ok: true } });
    fireEvent.click(screen.getByRole("button", { name: /send reminder/i }));
    expect(confirmSpy).toHaveBeenCalled();
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:3002/api/admin/tutor/1/stripe-reminder",
        {},
        expect.objectContaining({ withCredentials: true })
      );
    });
    expect(alertSpy).toHaveBeenCalled();

    confirmSpy.mockRestore();
    alertSpy.mockRestore();
  });

  it("shows empty state", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(
      <MemoryRouter>
        <AdminTutors />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/no tutors found\./i)
    ).toBeInTheDocument();
  });
});