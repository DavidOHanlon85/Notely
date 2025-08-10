import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";

// Mock useNavigate so we can assert navigation without changing code
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock ExploreTutorsButton to avoid pulling its implementation into this test
vi.mock("../../components/UI/ExploreTutorsButton", () => ({
  default: () => <button data-testid="explore-cta">Explore Tutors</button>,
}));

import HomePageHeroSection from "./HomePageHeroSection";

describe("HomePageHeroSection", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it("renders logo, headings, marketing copy, and CTA", () => {
    render(<HomePageHeroSection />);

    // Headline lines
    expect(
      screen.getByRole("heading", { name: /matching talent with teachers/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /one note at a time/i })
    ).toBeInTheDocument();

    // Sub copy
    expect(
      screen.getByText(/notely helps you learn to play/i)
    ).toBeInTheDocument();

    // Explore CTA (mocked)
    expect(screen.getByTestId("explore-cta")).toBeInTheDocument();

    // Tutor CTA link
    const tutorLink = screen.getByRole("link", { name: /tutor\? - click here!/i });
    expect(tutorLink).toHaveAttribute("href", "/home/tutor");
  });

  it("toggles active state on the feature buttons", () => {
    render(<HomePageHeroSection />);

    const lessonsBtn = screen.getByRole("button", { name: /lessons/i });
    const practiceBtn = screen.getByRole("button", { name: /practice/i });

    // Initially not active
    expect(lessonsBtn.className).not.toMatch(/btn-notely-active/);

    // Click to activate
    fireEvent.click(lessonsBtn);
    expect(lessonsBtn.className).toMatch(/btn-notely-active/);

    // Click second button too (multi-select)
    fireEvent.click(practiceBtn);
    expect(practiceBtn.className).toMatch(/btn-notely-active/);

    // Click again to deactivate the first
    fireEvent.click(lessonsBtn);
    expect(lessonsBtn.className).not.toMatch(/btn-notely-active/);
  });

  it("navigates to /tutors?instrument=Guitar when clicking the Guitar tile", () => {
    render(<HomePageHeroSection />);

    const guitarTile = screen.getByRole("button", {
      name: /find guitar tutors/i,
    });

    fireEvent.click(guitarTile);
    expect(mockNavigate).toHaveBeenCalledWith("/tutors?instrument=Guitar");
  });

  it("supports keyboard activation on instrument tiles (Enter/Space)", () => {
    render(<HomePageHeroSection />);

    const pianoTile = screen.getByRole("button", {
      name: /find piano tutors/i,
    });

    // Activate with Enter
    fireEvent.keyDown(pianoTile, { key: "Enter" });
    expect(mockNavigate).toHaveBeenLastCalledWith("/tutors?instrument=Piano");

    // Activate with Space
    fireEvent.keyDown(pianoTile, { key: " " });
    expect(mockNavigate).toHaveBeenLastCalledWith("/tutors?instrument=Piano");
  });

  it("renders all instrument tiles with image and label", () => {
    render(<HomePageHeroSection />);

    const instruments = ["Guitar", "Piano", "Violin", "Drums", "Saxophone", "Voice"];
    instruments.forEach((name) => {
      // Tile exists
      expect(
        screen.getByRole("button", { name: new RegExp(`find ${name} tutors`, "i") })
      ).toBeInTheDocument();
      // Image alt check
      expect(screen.getByAltText(name)).toBeInTheDocument();
      // Label text
      expect(screen.getByText(name)).toBeInTheDocument();
    });
  });
});