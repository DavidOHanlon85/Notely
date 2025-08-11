import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import LeaveFeedbackPage from "./StudentFeedbackPage";

vi.mock("axios", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

// Keep chrome lean
vi.mock("../../components/UI/DoubleButtonNavBar", () => ({
  default: () => <div data-testid="nav">Nav</div>,
}));
vi.mock("../../components/UI/SocialsFooter", () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

function renderWithRoute(path = "/leave-feedback/BOOK123") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/leave-feedback/:booking_id" element={<LeaveFeedbackPage />} />
      </Routes>
    </MemoryRouter>
  );
}

const tutorPayload = {
  tutor: {
    tutor_id: 42,
    tutor_first_name: "Amy",
    tutor_second_name: "Lee",
  },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("LeaveFeedbackPage (lean)", () => {
  it("validates feedback length before submit", async () => {
    axios.get.mockResolvedValueOnce({ data: tutorPayload });

    renderWithRoute();

    // Tutor name shows
    expect(
      await screen.findByText(/for your lesson with/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/amy lee/i)).toBeInTheDocument();

    // Too short feedback
    await userEvent.type(screen.getByLabelText(/your feedback/i), "Too short");
    await userEvent.click(screen.getByRole("button", { name: /submit feedback/i }));

    expect(
      screen.getByText(/please enter at least 10 characters/i)
    ).toBeInTheDocument();
    // Score defaults to 5★ so no score error expected
  });

  it("submits successfully and shows confirmation UI", async () => {
    axios.get.mockResolvedValueOnce({ data: tutorPayload });
    axios.post.mockResolvedValueOnce({ data: { status: "success" } });

    renderWithRoute();

    // Fill valid feedback (score already default 5)
    await userEvent.type(
      await screen.findByLabelText(/your feedback/i),
      "Great lesson, very clear explanations."
    );
    await userEvent.click(screen.getByRole("button", { name: /submit feedback/i }));

    // Success screen
    expect(
      await screen.findByRole("heading", { name: /feedback submitted/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view dashboard/i })).toHaveAttribute(
      "href",
      "/student/dashboard"
    );
    expect(screen.getByRole("link", { name: /book another lesson/i })).toHaveAttribute(
      "href",
      "/tutors"
    );

    // POST payload included booking_id, tutor_id, date, etc.
    expect(axios.post).toHaveBeenCalledTimes(1);
    const [url, body] = axios.post.mock.calls[0];
    expect(url).toBe("http://localhost:3002/api/feedback");
    expect(body.tutor_id).toBe(42);
    expect(body.booking_id).toBe("BOOK123");
    expect(body.feedback_text).toMatch(/great lesson/i);
    expect(body.feedback_score).toBe(5);
  });

  it("shows 409 already-submitted error", async () => {
    axios.get.mockResolvedValueOnce({ data: tutorPayload });
    axios.post.mockRejectedValueOnce({ response: { status: 409, data: {} } });

    renderWithRoute();

    await userEvent.type(
      await screen.findByLabelText(/your feedback/i),
      "Already posted feedback previously!"
    );
    await userEvent.click(screen.getByRole("button", { name: /submit feedback/i }));

    expect(
      await screen.findByText(/already submitted feedback/i)
    ).toBeInTheDocument();
  });

  it("shows general error on unknown failure", async () => {
    axios.get.mockResolvedValueOnce({ data: tutorPayload });
    axios.post.mockRejectedValueOnce({ response: { status: 500 } });

    renderWithRoute();

    await userEvent.type(
      await screen.findByLabelText(/your feedback/i),
      "Something went wrong path test."
    );
    await userEvent.click(screen.getByRole("button", { name: /submit feedback/i }));

    expect(
      await screen.findByText(/unexpected error occurred/i)
    ).toBeInTheDocument();
  });
});