import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mock the heavy child sections with tiny stubs
vi.mock("../../components/TutorHomePage/TutorHomeNavBar", () => ({
  default: () => <div data-testid="nav">TutorHomeNavBar</div>,
}));
vi.mock("../../components/TutorHomePage/TutorHeroSection", () => ({
  default: () => <div data-testid="hero">TutorHeroSection</div>,
}));
vi.mock("../../components/TutorHomePage/TutorFeaturesSection", () => ({
  default: () => <div data-testid="features">TutorFeaturesSection</div>,
}));
vi.mock("../../components/TutorHomePage/TutorJourneySection", () => ({
  default: () => <div data-testid="journey">TutorJourneySection</div>,
}));

// We want the real footer to verify external links, so don't mock SocialsFooter.

import TutorHomePage from "./TutorHomePage";

describe("TutorHomePage (lean)", () => {
  beforeEach(() => cleanup());

  it("renders sections and shows social links", () => {
    render(
      <MemoryRouter>
        <TutorHomePage />
      </MemoryRouter>
    );

    // Composition stubs present
    expect(screen.getByTestId("nav")).toBeInTheDocument();
    expect(screen.getByTestId("hero")).toBeInTheDocument();
    expect(screen.getByTestId("features")).toBeInTheDocument();
    expect(screen.getByTestId("journey")).toBeInTheDocument();

    // Footer social links exist with expected hrefs
    const footer = screen.getByRole("contentinfo");
    const hrefs = Array.from(footer.querySelectorAll("a")).map((a) =>
      a.getAttribute("href")
    );

    expect(hrefs).toEqual(
      expect.arrayContaining([
        "https://www.twitter.com",
        "https://www.instagram.com",
        "https://www.facebook.com",
      ])
    );
  });
});
