import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import TutorMessagePage from "./TutorMessagePage";

vi.mock("axios", () => ({ default: { get: vi.fn(), post: vi.fn() } }));

// Keep the page quiet and fast
vi.mock("../../components/UI/DoubleButtonNavBar", () => ({
  __esModule: true,
  default: () => <div data-testid="nav">nav</div>,
}));
vi.mock("../../components/UI/SocialsFooter", () => ({
  __esModule: true,
  default: () => <footer data-testid="footer">footer</footer>,
}));

// Stub scrollIntoView so effects don't explode in JSDOM
beforeAll(() => {
  if (!HTMLElement.prototype.scrollIntoView) {
    // @ts-ignore
    HTMLElement.prototype.scrollIntoView = vi.fn();
  } else {
    vi.spyOn(HTMLElement.prototype, "scrollIntoView").mockImplementation(() => {});
  }
});

beforeEach(() => {
  vi.clearAllMocks();
  axios.get.mockReset();
  axios.post.mockReset();
});

function renderWithRoute(path = "/tutor/messages/42") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/tutor/messages/:student_id" element={<TutorMessagePage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("TutorMessagePage (lean)", () => {
  it("loads student + messages and displays them", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        student: { student_id: 42, student_first_name: "Alex", student_last_name: "Smith" },
        stats: { avg_rating: 4.8, review_count: 12, total_lessons: 7, member_since: "2023" },
        messages: [
          { sender_role: "student", message_text: "Hi there!" },
          { sender_role: "tutor", message_text: "Hello 👋" },
        ],
      },
    });

    renderWithRoute();

    // Loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Student card & existing messages
    expect(await screen.findByRole("heading", { name: /alex smith/i })).toBeInTheDocument();
    expect(screen.getByText("Hi there!")).toBeInTheDocument();
    expect(screen.getByText("Hello 👋")).toBeInTheDocument();

    // A couple of stats spot checks
    expect(screen.getByText(/\(12 reviews\)/i)).toBeInTheDocument();
  });

  it("sends a new message via button and clears the input", async () => {
    // initial data
    axios.get.mockResolvedValueOnce({
      data: {
        student: { student_id: 42, student_first_name: "Alex", student_last_name: "Smith" },
        stats: {},
        messages: [{ sender_role: "student", message_text: "Hi" }],
      },
    });

    // send response
    axios.post.mockResolvedValueOnce({
      data: { sender_role: "tutor", message_text: "Thanks for reaching out!" },
    });

    renderWithRoute();

    // Wait for page
    await screen.findByRole("heading", { name: /alex smith/i });

    const input = screen.getByPlaceholderText(/type your message/i);
    await userEvent.type(input, "Thanks for reaching out!");
    await userEvent.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() =>
      expect(screen.getByText("Thanks for reaching out!")).toBeInTheDocument()
    );

    expect(input).toHaveValue("");

    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:3002/api/tutor/messages/send",
      { student_id: 42, message_text: "Thanks for reaching out!" },
      { withCredentials: true }
    );
  });

  it("does not send when input is empty", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        student: { student_id: 42, student_first_name: "Alex", student_last_name: "Smith" },
        stats: {},
        messages: [],
      },
    });

    renderWithRoute();
    await screen.findByRole("heading", { name: /alex smith/i });

    // Click send with empty input
    await userEvent.click(screen.getByRole("button", { name: /send/i }));
    expect(axios.post).not.toHaveBeenCalled();

    // Press Enter with empty input
    await userEvent.keyboard("{Enter}");
    expect(axios.post).not.toHaveBeenCalled();
  });
});