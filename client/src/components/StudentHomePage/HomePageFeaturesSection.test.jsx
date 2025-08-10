import { render, screen, within } from "@testing-library/react";
import React from "react";
import { vi } from "vitest";

// ExploreTutorsButton used by this component
vi.mock("../UI/ExploreTutorsButton", () => ({
  default: () => <button data-testid="explore-cta">Explore Tutors</button>,
}));

import HomePageFeaturesSection from "./HomePageFeaturesSection";

describe("HomePageFeaturesSection", () => {
  it("renders the main heading and subheading text", () => {
    render(<HomePageFeaturesSection />);

    // Main section title
    expect(screen.getByRole("heading", { level: 2, name: /why choose notely\?/i })).toBeInTheDocument();

    // Marketing subheading inside left column
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /music tuition, made for the modern learner/i,
      })
    ).toBeInTheDocument();

    // Confirm the paragraph copy starts correctly (spot check)
    expect(
      screen.getByText(/whether you’re picking up your first instrument/i)
    ).toBeInTheDocument();
  });

  it("renders four feature tiles with titles, subtitles, and icons", () => {
    render(<HomePageFeaturesSection />);

    // Titles we expect (from the component map)
    const titles = [
      /verified tutors/i,
      /music-first design/i,
      /sen-friendly/i,
      /effortless booking/i,
    ];

    // Check each title exists
    titles.forEach((t) => {
      expect(screen.getByRole("heading", { level: 4, name: t })).toBeInTheDocument();
    });

    // There should be exactly 4 feature icon containers
    const iconContainers = screen.getAllByRole("img", { name: /icon$/i });
    expect(iconContainers).toHaveLength(4);

    // Spot-check that each has a meaningful alt (ends with "Icon")
    iconContainers.forEach((img) => {
      expect(img).toHaveAttribute("alt");
      expect(img.getAttribute("alt")).toMatch(/icon$/i);
    });

    // Subtitles (spot-check one or two)
    expect(screen.getByRole("heading", { level: 6, name: /trust built in/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 6, name: /built for musicians/i })).toBeInTheDocument();
  });

  it("renders the Explore Tutors CTA (mocked)", () => {
    render(<HomePageFeaturesSection />);
    expect(screen.getByTestId("explore-cta")).toBeInTheDocument();
    expect(screen.getByTestId("explore-cta")).toHaveTextContent(/explore tutors/i);
  });
});