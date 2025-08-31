import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import FeedbackPage from "./FeedbackPage";
import axios from "axios";

// Stub nav/footer/pagination to keep DOM tiny
vi.mock("../../components/UI/DoubleButtonNavBar", () => ({
  default: () => <div data-testid="nav">Nav</div>,
}));
vi.mock("../../components/UI/SocialsFooter", () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));
vi.mock("../../components/FeedbackForm/PaginationFeedback", () => ({
  default: ({ currentPage, setCurrentPage }) => (
    <button onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
  ),
}));

// Bootstrap tooltip shim
vi.mock("bootstrap", () => ({
  Tooltip: vi.fn().mockImplementation(() => ({ dispose: vi.fn() })),
}));

vi.mock("axios");

const tutorPayload = {
  tutor_id: 123,
  tutor_first_name: "Alice",
  tutor_second_name: "O'Brien",
  tutor_image: "/img.png",
  tutor_price: 30,
  instruments: "Guitar, Piano",
  tutor_qualified: 1,
  tutor_sen: 0,
  tutor_dbs: 1,
  stats: { avg_rating: 4.5, review_count: 3, years_experience: 5, unique_students: 12 },
  rating_summary: [
    { stars: 5, count: 2 },
    { stars: 4, count: 1 },
    { stars: 3, count: 0 },
    { stars: 2, count: 0 },
    { stars: 1, count: 0 },
  ],
  feedbackTotal: 12, // ensure pagination appears
  feedback: [
    {
      student_first_name: "bob",
      student_last_name: "smith",
      feedback_score: 5,
      feedback_text: "Great tutor!",
      feedback_date: new Date().toISOString(),
    },
  ],
};

describe("FeedbackPage (lean)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValue({ data: tutorPayload });
  });

  function mountWithRoute(id = "123") {
    return render(
      <MemoryRouter initialEntries={[`/feedback/${id}`]}>
        <Routes>
          <Route path="/feedback/:id" element={<FeedbackPage />} />
        </Routes>
      </MemoryRouter>
    );
  }

  it("loads tutor, shows key info, supports sort, rating filter, and pagination refetch", async () => {
    mountWithRoute("123");

    // Initial fetch happens with default params
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    // Core header content
    expect(await screen.findByText(/Alice O'Brien/i)).toBeInTheDocument();
    expect(screen.getByText("£30/hr")).toBeInTheDocument();
    expect(screen.getByText(/out of 5/i)).toBeInTheDocument();
    expect(screen.getByText(/guitar/i)).toBeInTheDocument();
    expect(screen.getByText(/piano/i)).toBeInTheDocument();
    expect(screen.getByText(/Qualified Teacher/i)).toBeInTheDocument();
    expect(screen.getByText(/DBS Certified/i)).toBeInTheDocument();

    // Summary percentages (2 of 3 = 67%, 1 of 3 = 33%)
    expect(screen.getByText(/67%/)).toBeInTheDocument();
    expect(screen.getByText(/33%/)).toBeInTheDocument();

    // Sort change triggers refetch
    const sort = screen.getByRole("combobox");
    fireEvent.change(sort, { target: { value: "newest" } });

    // Click a rating row (5-star line shows 67%), which sets min/max to that rating
    fireEvent.click(screen.getByText(/67%/));

    // Pagination "Next" triggers another fetch (page++)
    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    // We don't assert exact call counts (multiple effects fire), but ensure >1 calls
    await waitFor(() => {
      expect(axios.get.mock.calls.length).toBeGreaterThan(1);
    });

    // Inspect the last call for params we care about
    const lastCall = axios.get.mock.calls.at(-1);
    const lastUrl = lastCall?.[0];
    const lastConfig = lastCall?.[1];

    expect(lastUrl).toMatch(/\/api\/tutor\/123$/);
    expect(lastConfig?.params?.minRating).toBe(5);
    expect(lastConfig?.params?.maxRating).toBe(5);
    expect(lastConfig?.params?.feedbackPage).toBeGreaterThanOrEqual(2); // after Next
  });
});