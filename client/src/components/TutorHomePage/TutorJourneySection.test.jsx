import { render, screen, within } from "@testing-library/react";
import React from "react";
import TutorJourneySection from "./TutorJourneySection";

describe("TutorJourneySection", () => {
  // I’m asserting the main heading and basic structure render correctly
  it("renders the section heading", () => {
    render(<TutorJourneySection />);
    expect(
      screen.getByRole("heading", { name: /your journey/i })
    ).toBeInTheDocument();
  });

  // I’m checking we render exactly three step columns
  it("renders three journey steps", () => {
    render(<TutorJourneySection />);
    // grab the row then count direct children with role=img + headings inside
    const imgs = screen.getAllByRole("img");
    // Component only has the three step images, so this should be 3
    expect(imgs).toHaveLength(3);

    // Each step title should be present
    expect(screen.getByRole("heading", { name: /apply/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /approve/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /advertise/i })).toBeInTheDocument();
  });

  // I’m asserting the images have the expected alt text (no need to check src)
  it("uses meaningful alt text on step images", () => {
    render(<TutorJourneySection />);
    expect(screen.getByRole("img", { name: /apply to teach/i })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /approval process/i })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /advertise your services/i })).toBeInTheDocument();
  });

  // I’m smoke‑testing the copy so we catch accidental edits
  it("shows the expected copy snippets", () => {
    render(<TutorJourneySection />);
    expect(
      screen.getByText(/only 1 in 4 tutors are accepted/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/verifies your credentials and experience/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/your profile goes live/i)
    ).toBeInTheDocument();
  });
});