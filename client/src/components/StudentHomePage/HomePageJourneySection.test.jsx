import React from "react";
import { render, screen } from "@testing-library/react";
import HomePageJourneySection from "./HomePageJourneySection";

describe("HomePageJourneySection", () => {
  it("renders the section heading", () => {
    render(<HomePageJourneySection />);
    expect(screen.getByRole("heading", { name: /your journey/i })).toBeInTheDocument();
  });

  it("renders the three journey steps with images, titles, and copy", () => {
    render(<HomePageJourneySection />);

    // Step 1: Pick
    const pickImg = screen.getByAltText(/choose a tutor/i);
    expect(pickImg).toBeInTheDocument();
    expect(pickImg).toHaveAttribute("src", "/assets/images/JourneyImages/Pick.jpg");
    expect(screen.getByRole("heading", { name: /pick/i, level: 5 })).toBeInTheDocument();
    expect(
      screen.getByText(/browse tutors by instrument, level, and sen experience/i)
    ).toBeInTheDocument();

    // Step 2: Practice
    const practiceImg = screen.getByAltText(/book and learn/i);
    expect(practiceImg).toBeInTheDocument();
    expect(practiceImg).toHaveAttribute("src", "/assets/images/JourneyImages/Practice.jpg");
    expect(screen.getByRole("heading", { name: /practice/i, level: 5 })).toBeInTheDocument();
    expect(
      screen.getByText(/book flexible sessions, message your tutor/i)
    ).toBeInTheDocument();

    // Step 3: Perform
    const performImg = screen.getByAltText(/perform your music/i);
    expect(performImg).toBeInTheDocument();
    expect(performImg).toHaveAttribute("src", "/assets/images/JourneyImages/Perform.jpg");
    expect(screen.getByRole("heading", { name: /perform/i, level: 5 })).toBeInTheDocument();
    expect(
      screen.getByText(/preparing for grades or playing for joy/i)
    ).toBeInTheDocument();
  });

  it("includes the decorative divider (hr) below the heading", () => {
    render(<HomePageJourneySection />);
    // There’s only one <hr> in this component
    const hr = screen.getByRole("separator");
    expect(hr).toBeInTheDocument();
  });
});