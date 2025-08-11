// pages/Booking/TutorBookingPage.test.jsx
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import TutorBookingPage from "./TutorBookingPage";

vi.mock("axios", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (orig) => {
  const actual = await orig();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("react-datepicker", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    __esModule: true,
    ...actual,
    registerLocale: vi.fn(),
    default: (props) => (
      <div data-testid="datepicker">
        <button onClick={() => props.onChange(new Date("2025-03-20T00:00:00Z"))}>
          pick date
        </button>
        <div data-testid="highlighted-count">{props.highlightDates?.length ?? 0}</div>
      </div>
    ),
  };
});

function renderWithRoute(path = "/booking/42") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/booking/:id" element={<TutorBookingPage />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  axios.get.mockReset();
  axios.post.mockReset();

  const setHref = vi.fn();
  Object.defineProperty(window, "location", {
    value: {
      get href() { return "http://localhost/"; },
      set href(v) { setHref(v); },
    },
    writable: true,
  });
  // @ts-ignore
  window.__setHrefSpy__ = setHref;
});

describe("TutorBookingPage (lean)", () => {
  it("redirects to student login when not authenticated", async () => {
    axios.get.mockRejectedValueOnce({ response: { status: 401 } });
    renderWithRoute("/booking/42");

    const expectedNext = encodeURIComponent("/booking/42");
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        `/student/login?next=${expectedNext}`,
        { replace: true }
      );
    });
  });

  it("books successfully: fetches data, selects date & slot, posts checkout and redirects", async () => {
    // GET 1: /api/student/me
    axios.get.mockResolvedValueOnce({ data: { student_id: 7 } });

    // GET 2: /api/tutor/:id
    axios.get.mockResolvedValueOnce({
      data: {
        tutor_id: 42,
        tutor_first_name: "Jane",
        tutor_second_name: "Doe",
        tutor_image: "/img.jpg",
        tutor_price: 35,
        instruments: "Guitar, Piano",
        tutor_qualified: 1,
        tutor_sen: 1,
        tutor_dbs: 1,
        stats: { avg_rating: 4.8, review_count: 12, years_experience: 8, unique_students: 25 },
      },
    });

    // GET 3: /api/booking/available-dates
    axios.get.mockResolvedValueOnce({ data: { available_dates: ["2025-03-20"] } });

    renderWithRoute("/booking/42");

    expect(await screen.findByRole("heading", { name: /jane doe/i })).toBeInTheDocument();
    expect(screen.getByText(/£\s*35\/hr/i)).toBeInTheDocument();
    expect(await screen.findByTestId("datepicker")).toBeInTheDocument();
    expect(screen.getByTestId("highlighted-count")).toHaveTextContent("1");

    // IMPORTANT: enqueue availability mock BEFORE clicking (GET 4)
    axios.get.mockResolvedValueOnce({
      data: { available_slots: ["10:00:00", "11:30:00"] },
    });

    // Trigger date selection (fetchAvailability effect will consume the 4th mock above)
    await userEvent.click(screen.getByRole("button", { name: /pick date/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /10:00/i })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: /11:30/i }));

    const notes = screen.getByLabelText(/booking notes/i, { selector: "textarea" });
    await userEvent.type(notes, "Looking for help with scales.");

    axios.post.mockResolvedValueOnce({
      data: { url: "https://checkout.example/session/abc123" },
    });

    await userEvent.click(screen.getByRole("button", { name: /confirm booking/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:3002/api/create-checkout-session",
        expect.objectContaining({
          tutor_id: 42,
          student_id: 7,
          booking_date: "2025-03-20",
          booking_time: "11:30:00",
          booking_notes: "Looking for help with scales.",
          return_url: expect.any(String),
        }),
        { withCredentials: true }
      );
    });

    // @ts-ignore
    expect(window.__setHrefSpy__).toHaveBeenCalledWith("https://checkout.example/session/abc123");
  });
});