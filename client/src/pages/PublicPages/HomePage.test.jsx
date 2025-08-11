import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HomePage from "./HomePage";

// Stub heavy children; keep real SocialsFooter so we can check hrefs
vi.mock("../../components/UI/DoubleButtonNavBar", () => ({
  default: () => <div data-testid="nav">DoubleButtonNavBar</div>,
}));
vi.mock("../../components/StudentHomePage/HomePageHeroSection", () => ({
  default: () => <section data-testid="hero">Hero</section>,
}));
vi.mock("../../components/StudentHomePage/HomePageFeaturesSection", () => ({
  default: () => <section data-testid="features">Features</section>,
}));
vi.mock("../../components/StudentHomePage/HomePageJourneySection", () => ({
  default: () => <section data-testid="journey">Journey</section>,
}));
vi.mock("../../components/StudentHomePage/TestimonialCarousel", () => ({
  default: () => <section data-testid="testimonials">Testimonials</section>,
}));

describe("HomePage (lean)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders sections and footer social links", () => {
    const { container } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    // Core sections render
    expect(screen.getByTestId("nav")).toBeInTheDocument();
    expect(screen.getByTestId("hero")).toBeInTheDocument();
    expect(screen.getByTestId("features")).toBeInTheDocument();
    expect(screen.getByTestId("journey")).toBeInTheDocument();
    expect(screen.getByTestId("testimonials")).toBeInTheDocument();

    // Footer exists
    const footer = screen.getByRole("contentinfo");

    // Social links by href (icons have no accessible names)
    const links = within(footer).getAllByRole("link");
    const hrefs = links.map((a) => a.getAttribute("href"));

    expect(hrefs).toContain("https://www.twitter.com");
    expect(hrefs).toContain("https://www.instagram.com");
    expect(hrefs).toContain("https://www.facebook.com");
  });
});