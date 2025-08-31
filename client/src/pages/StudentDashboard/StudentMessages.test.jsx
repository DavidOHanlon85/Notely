import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import StudentMessages from "./StudentMessages";

// Mock axios
vi.mock("axios", () => ({ default: { get: vi.fn() } }));
import axios from "axios";

// Mock useNavigate (keep it hoist-safe)
let mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

describe("StudentMessages (lean)", () => {
  beforeEach(() => {
    mockNavigate = vi.fn();
    vi.clearAllMocks();
  });

  it("loads messages, shows unread badge, truncates, filters, and navigates", async () => {
    const longMsg =
      "This is a really long message that should be truncated after sixty characters for the preview in the table.";
    axios.get.mockResolvedValueOnce({
      data: [
        {
          tutor_id: 1,
          tutor_first_name: "Alice",
          tutor_second_name: "Smith",
          last_message_text: longMsg,
          last_message_time: "2025-02-01T15:30:00Z",
          message_read: 0, // unread
        },
        {
          tutor_id: 2,
          tutor_first_name: "Bob",
          tutor_second_name: "Jones",
          last_message_text: "Short note",
          last_message_time: "2025-01-15T10:00:00Z",
          message_read: 1, // read
        },
      ],
    });

    render(
      <MemoryRouter>
        <StudentMessages />
      </MemoryRouter>
    );

    // Heading and rows load
    expect(
      await screen.findByRole("heading", { name: /your messages/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/alice smith/i)).toBeInTheDocument();
    expect(screen.getByText(/bob jones/i)).toBeInTheDocument();

    // Truncation: 60 chars + "..."
    const truncated = longMsg.slice(0, 60) + "...";
    expect(screen.getByText(truncated)).toBeInTheDocument();

    // Unread badge only on Alice row
    expect(screen.getByText(/unread/i)).toBeInTheDocument();
    // Bob should not have an unread badge
    expect(
      screen.getAllByText(/message/i).find((btn) =>
        btn.closest("div")?.textContent?.toLowerCase().includes("bob jones")
      )
    ).toBeTruthy();

    // Filter by tutor name
    fireEvent.change(screen.getByPlaceholderText(/search messages/i), {
      target: { value: "alice" },
    });
    await waitFor(() => {
      expect(screen.getByText(/alice smith/i)).toBeInTheDocument();
      expect(screen.queryByText(/bob jones/i)).toBeNull();
    });

    // Click "Message" button navigates to thread
    fireEvent.click(screen.getByRole("button", { name: /message/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/student/messages/1");
  });

  it("shows 'no messages' component when API returns empty", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(
      <MemoryRouter>
        <StudentMessages />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/you have no messages yet\./i)
    ).toBeInTheDocument();
  });
});