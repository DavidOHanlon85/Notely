// client/src/pages/Messgaing/MessagePage.test.jsx
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import MessagePage from "./MessagePage";

vi.mock("axios", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (orig) => {
  const actual = await orig();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderWithRoute(path = "/student/messages/123") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/student/messages/:tutorId" element={<MessagePage />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeAll(() => {
  // JSDOM doesn’t implement this; make it a no-op so effects don’t blow up
  // (the component already guards it, but this keeps logs clean)
  Element.prototype.scrollIntoView = vi.fn();
});

beforeEach(() => {
  vi.clearAllMocks();
  axios.get.mockReset();
  axios.post.mockReset();
});

describe("MessagePage (lean)", () => {
  it("loads tutor + messages and sends a new message", async () => {
    // 1) Auth OK
    axios.get
      .mockResolvedValueOnce({ data: { student_id: 99 } }) // /api/student/me
      // 2) Tutor data
      .mockResolvedValueOnce({
        data: {
          tutor_id: 123,
          tutor_first_name: "Alice",
          tutor_second_name: "Smith",
          tutor_price: 30,
          tutor_image: "/img.png",
          instruments: "Guitar, Piano",
          tutor_qualified: 1,
          tutor_sen: 0,
          tutor_dbs: 1,
          stats: {
            avg_rating: 4.8,
            review_count: 10,
            years_experience: 6,
            unique_students: 12,
          },
        },
      })
      // 3) Existing messages
      .mockResolvedValueOnce({
        data: [
          { sender_role: "tutor", message_text: "Hi there!" },
          { sender_role: "student", message_text: "Hello!" },
        ],
      });

    axios.post.mockResolvedValueOnce({
      data: { sender_role: "student", message_text: "New message" },
    });

    renderWithRoute();

    // Tutor card shows up
    expect(await screen.findByText(/alice smith/i)).toBeInTheDocument();

    // Existing messages render
    expect(screen.getByText(/hi there!/i)).toBeInTheDocument();
    expect(screen.getByText(/hello!/i)).toBeInTheDocument();

    // Send a message
    await userEvent.type(
      screen.getByPlaceholderText(/type your message/i),
      "New message"
    );
    await userEvent.click(screen.getByRole("button", { name: /send/i }));

    // API called and UI updated
    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:3002/api/messages/send",
      {
        tutor_id: "123",
        message_text: "New message",
        sender_role: "student",
      },
      { withCredentials: true }
    );

    expect(await screen.findByText(/new message/i)).toBeInTheDocument();
  });

  it("redirects to student login when not authenticated", async () => {
    // /api/student/me fails -> redirect branch
    axios.get.mockRejectedValueOnce({ response: { status: 401 } });

    renderWithRoute("/student/messages/123");

    // wait for the effect to call navigate
    await waitFor(() => expect(mockNavigate).toHaveBeenCalled());

    // inspect the call without assuming MemoryRouter updates window.location
    const [dest, opts] = mockNavigate.mock.calls[0];

    // basic shape: we went to /student/login with a next param
    expect(dest).toMatch(/^\/student\/login\?next=/);

    // still ensure replace navigation
    expect(opts).toEqual({ replace: true });
  });
});
