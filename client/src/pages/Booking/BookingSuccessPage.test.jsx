import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import BookingSuccessPage from "./BookingSuccessPage";

vi.mock("axios", () => ({ default: { get: vi.fn() } }));

// Quiet the chrome
vi.mock("../../components/UI/DoubleButtonNavBar", () => ({
  __esModule: true,
  default: () => <div data-testid="nav">nav</div>,
}));
vi.mock("../../components/UI/SocialsFooter", () => ({
  __esModule: true,
  default: () => <footer data-testid="footer">footer</footer>,
}));

const initUrl = (query) =>
  `/booking/success${query ? `?${query}` : ""}`;

function renderWithQuery(query) {
  return render(
    <MemoryRouter
      initialEntries={[
        initUrl(
          query ??
            "tutor_id=123&booking_date=2025-03-15&booking_time=14:30:00"
        ),
      ]}
    >
      <Routes>
        {/* route path can be anything, we only need the component mounted */}
        <Route path="/booking/success" element={<BookingSuccessPage />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  axios.get.mockReset();
});

describe("BookingSuccessPage (lean)", () => {
  it("shows tutor name after fetch and formats date/time", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        tutor_first_name: "Alice",
        tutor_second_name: "Jones",
      },
    });

    renderWithQuery();

    // Headings render
    expect(
      screen.getByRole("heading", { name: /booking confirmed/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /you're all set/i })
    ).toBeInTheDocument();

    // Date/time formatting: 2025-03-15 -> e.g. "Sat, 15 March 2025" in en-GB
    // We just spot-check parts to avoid locale brittleness
    expect(await screen.findByText(/alice jones/i)).toBeInTheDocument();
    expect(screen.getByText(/15/i)).toBeInTheDocument();
    expect(screen.getByText(/march/i)).toBeInTheDocument();
    expect(screen.getByText(/2025/i)).toBeInTheDocument();
    // Time derived from 14:30:00 -> 14:30
    expect(screen.getByText(/14:30/)).toBeInTheDocument();

    // Links exist and point to the right places
    expect(
      screen.getByRole("link", { name: /view my bookings/i })
    ).toHaveAttribute("href", "/student/dashboard/bookings");
    expect(
      screen.getByRole("link", { name: /book another lesson/i })
    ).toHaveAttribute("href", "/tutors");
  });

  it("falls back to 'Tutor #ID' if fetch fails", async () => {
    axios.get.mockRejectedValueOnce(new Error("boom"));
    renderWithQuery("tutor_id=999&booking_date=2025-01-01&booking_time=09:05:00");

    // While/after the failed fetch, we should still show Tutor #ID
    expect(await screen.findByText(/Tutor #999/i)).toBeInTheDocument();
    // And the time should be trimmed to hh:mm
    expect(screen.getByText(/09:05/)).toBeInTheDocument();
  });
});