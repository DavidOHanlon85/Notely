import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";
import TutorHeroSection from "./TutorHeroSection";

vi.mock("../../assets/images/NotelyRectangle.png", () => ({
  default: "logo-stub.png",
}));

// Helper: render with router because the component uses <Link>
const renderWithRouter = (ui) =>
  render(<BrowserRouter>{ui}</BrowserRouter>);

describe("TutorHeroSection", () => {
  it("renders logo, headings and lead copy", () => {
    renderWithRouter(<TutorHeroSection />);

    // Logo shows up with correct alt
    expect(screen.getByAltText(/notely logo/i)).toBeInTheDocument();

    // Headings
    expect(screen.getByRole("heading", { name: /teach music\./i })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /get paid\. stay booked\./i })
    ).toBeInTheDocument();

    // Lead paragraph copy (partial match is fine)
    expect(
      screen.getByText(/instant payouts via stripe/i)
    ).toBeInTheDocument();
  });

  it("renders all feature chips and toggles active class on click", () => {
    renderWithRouter(<TutorHeroSection />);

    const labels = ["Stripe Payouts", "Built‑in Video", "CRM & Messaging"];

    // All chips are present
    labels.forEach((label) => {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    });

    // Toggle one chip and assert class toggle
    const chip = screen.getByRole("button", { name: "Stripe Payouts" });

    // Initially not active
    expect(chip.className).not.toMatch(/tutor-btn-active/);

    // First click -> active
    fireEvent.click(chip);
    expect(chip.className).toMatch(/tutor-btn-active/);

    // Second click -> inactive
    fireEvent.click(chip);
    expect(chip.className).not.toMatch(/tutor-btn-active/);
  });

  it("links the CTA to /tutor/register", () => {
    renderWithRouter(<TutorHeroSection />);
    const cta = screen.getByRole("link", { name: /apply to teach/i });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute("href", "/tutor/register");
  });
});