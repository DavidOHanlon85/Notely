import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import TutorFeaturesSection from "./TutorFeaturesSection";
import React from "react";

// Helper to render with Router for <Link/>
const renderWithRouter = (ui) =>
  render(<BrowserRouter>{ui}</BrowserRouter>);

describe("TutorFeaturesSection", () => {
  it("renders the section heading and CTA", () => {
    renderWithRouter(<TutorFeaturesSection />);

    // Main section heading
    expect(
      screen.getByRole("heading", { name: /why teach on notely\?/i })
    ).toBeInTheDocument();

    // CTA link goes to /tutor/register
    const cta = screen.getByRole("link", { name: /apply to teach/i });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute("href", "/tutor/register");
  });

  it("renders all four feature tiles with titles and subtitles", () => {
    renderWithRouter(<TutorFeaturesSection />);

    // Titles
    const titles = [
      /Instant Stripe Payouts/i,
      /Smart Scheduling/i,
      /Built‑in Video/i,
      /CRM & Messaging/i,
    ];
    titles.forEach((t) => {
      expect(screen.getByRole("heading", { name: t, level: 4 })).toBeInTheDocument();
    });

    // Subtitles (text content assertions—no role on <h6>)
    [
      /Get paid on time/i,
      /You’re in control/i,
      /Turn up, teach/i,
      /Stay organised/i,
    ].forEach((s) => {
      expect(screen.getByText(s)).toBeInTheDocument();
    });
  });

  it("renders one image per feature", () => {
    renderWithRouter(<TutorFeaturesSection />);
    // There are 4 feature icons (the big section doesn’t render other <img> tags)
    const imgs = screen.getAllByRole("img");
    expect(imgs).toHaveLength(4);
    // Basic sanity: each has an alt that ends with 'Icon'
    imgs.forEach((img) => {
      expect(img.getAttribute("alt")).toMatch(/icon$/i);
    });
  });
});