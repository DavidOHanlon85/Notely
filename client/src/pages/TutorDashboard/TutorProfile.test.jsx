import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TutorProfile from "./TutorProfile";
import { vi } from "vitest";
import axios from "axios";

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

const renderWithRouter = (ui) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe("TutorProfile (lean)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows Connect to Stripe when not connected and redirects after POST", async () => {
    // GET /tutor/me -> not connected
    axios.get
      .mockResolvedValueOnce({
        data: { tutor_id: 42, tutor_stripe_account_id: null },
      })
      // GET /tutor/verification/files
      .mockResolvedValueOnce({ data: { files: [] } });

    // POST connect -> returns URL
    axios.post.mockResolvedValueOnce({
      data: { url: "https://stripe.example/connect" },
    });

    // Make window.location.href writable for this test
    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      value: { ...originalLocation, href: "" },
      writable: true,
    });

    renderWithRouter(<TutorProfile />);

    // Button present and enabled
    const connectBtn = await screen.findByRole("button", {
      name: /connect to stripe/i,
    });
    expect(connectBtn).toBeEnabled();

    fireEvent.click(connectBtn);

    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:3002/api/tutor/stripe/connect",
        {},
        { withCredentials: true }
      )
    );
    expect(window.location.href).toBe("https://stripe.example/connect");

    // restore
    Object.defineProperty(window, "location", { value: originalLocation });
  });

  it("shows Stripe Connected when connected (disabled button) and has profile link", async () => {
    // GET /tutor/me -> connected
    axios.get
      .mockResolvedValueOnce({
        data: { tutor_id: 7, tutor_stripe_account_id: "acct_123" },
      })
      // GET /tutor/verification/files
      .mockResolvedValueOnce({ data: { files: [] } });

    renderWithRouter(<TutorProfile />);

    const connectedBtn = await screen.findByRole("button", {
      name: /stripe connected/i,
    });
    expect(connectedBtn).toBeDisabled();

    const profileLink = screen.getByRole("link", { name: /here/i });
    expect(profileLink).toHaveAttribute("href", "/tutor/7");
  });

  it("lists uploaded files and deletes one when confirmed", async () => {
    // GET /tutor/me
    axios.get
      .mockResolvedValueOnce({
        data: { tutor_id: 9, tutor_stripe_account_id: "acct_x" },
      })
      // GET /tutor/verification/files
      .mockResolvedValueOnce({
        data: {
          files: [
            "/uploads/dbs/alice_dbs.pdf",
            { url: "/uploads/qualified/cert.png", field: "qualified" },
          ],
        },
      });

    axios.delete.mockResolvedValueOnce({ data: { ok: true } });

    // confirm dialog
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    renderWithRouter(<TutorProfile />);

    // Both files listed
    const file1 = await screen.findByRole("link", { name: /alice_dbs\.pdf/i });
    const file2 = screen.getByRole("link", { name: /cert\.png/i });
    expect(file1).toBeInTheDocument();
    expect(file2).toBeInTheDocument();

    // Click Remove next to first file
    const removeBtns = screen.getAllByRole("button", { name: /remove/i });
    fireEvent.click(removeBtns[0]);

    await waitFor(() =>
      expect(axios.delete).toHaveBeenCalledWith(
        "http://localhost:3002/api/tutor/verification/file/alice_dbs.pdf",
        { withCredentials: true }
      )
    );
    expect(confirmSpy).toHaveBeenCalled();

    confirmSpy.mockRestore();
  });
});