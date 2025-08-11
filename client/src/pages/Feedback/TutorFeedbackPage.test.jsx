import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import TutorLeaveFeedbackPage from "./TutorFeedbackPage";

vi.mock("axios", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

vi.mock("../../components/UI/DoubleButtonNavBar", () => ({
  default: () => <div data-testid="nav">Nav</div>,
}));
vi.mock("../../components/UI/SocialsFooter", () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

function renderWithRoute(path = "/tutor/feedback/BOOK123") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/tutor/feedback/:booking_id" element={<TutorLeaveFeedbackPage />} />
      </Routes>
    </MemoryRouter>
  );
}

const bookingDetails = {
  tutor: { tutor_id: 99, tutor_first_name: "Tom", tutor_second_name: "Reed" },
  student: { student_first_name: "Sam", student_last_name: "Hill" },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("TutorLeaveFeedbackPage (lean)", () => {
  it("validates required fields and minimum lengths", async () => {
    axios.get.mockResolvedValueOnce({ data: bookingDetails });

    renderWithRoute();

    // header shows student name
    expect(await screen.findByText(/for your lesson with/i)).toBeInTheDocument();
    expect(screen.getByText(/sam hill/i)).toBeInTheDocument();

    // Too short values
    await userEvent.type(screen.getByLabelText(/homework task/i), "ok");
    await userEvent.type(screen.getByLabelText(/additional notes/i), "hey");
    await userEvent.click(screen.getByRole("button", { name: /submit feedback/i }));
    expect(screen.getByText(/please enter at least 5 characters in notes/i)).toBeInTheDocument();
    expect(screen.getByText(/please enter homework instructions/i)).toBeInTheDocument();
  });

  it("submits successfully and shows confirmation UI", async () => {
    axios.get.mockResolvedValueOnce({ data: bookingDetails });
    axios.post.mockResolvedValueOnce({ data: { status: "success" } });

    renderWithRoute();

    // Fill form (score defaults to 5★)
    await userEvent.type(await screen.findByLabelText(/homework task/i), "Practice C major scale");
    await userEvent.type(screen.getByLabelText(/additional notes/i), "Great focus today—well done.");
    await userEvent.click(screen.getByRole("button", { name: /submit feedback/i }));

    // Success state
    expect(await screen.findByRole("heading", { name: /feedback submitted/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view dashboard/i })).toHaveAttribute(
      "href",
      "/tutor/dashboard"
    );
    expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute("href", "/");

    // Payload assertions
    expect(axios.post).toHaveBeenCalledTimes(1);
    const [url, body] = axios.post.mock.calls[0];
    expect(url).toBe("http://localhost:3002/api/tutor/feedback");
    expect(body.booking_id).toBe("BOOK123");
    expect(body.tutor_id).toBe(99);
    expect(body.performance_score).toBe(5);
    expect(body.homework).toMatch(/practice c major/i);
    expect(body.notes).toMatch(/great focus/i);
  });

  it("shows 409 already-submitted error", async () => {
    axios.get.mockResolvedValueOnce({ data: bookingDetails });
    axios.post.mockRejectedValueOnce({ response: { status: 409 } });

    renderWithRoute();

    await userEvent.type(await screen.findByLabelText(/homework task/i), "Long tone exercise");
    await userEvent.type(screen.getByLabelText(/additional notes/i), "Solid progress.");
    await userEvent.click(screen.getByRole("button", { name: /submit feedback/i }));

    expect(
      await screen.findByText(/already submitted feedback for this lesson/i)
    ).toBeInTheDocument();
  });

  it("shows generic error on unknown failure", async () => {
    axios.get.mockResolvedValueOnce({ data: bookingDetails });
    axios.post.mockRejectedValueOnce({ response: { status: 500 } });

    renderWithRoute();

    await userEvent.type(await screen.findByLabelText(/homework task/i), "Arpeggios");
    await userEvent.type(screen.getByLabelText(/additional notes/i), "Needs metronome.");
    await userEvent.click(screen.getByRole("button", { name: /submit feedback/i }));

    expect(
      await screen.findByText(/unexpected error occurred/i)
    ).toBeInTheDocument();
  });
});